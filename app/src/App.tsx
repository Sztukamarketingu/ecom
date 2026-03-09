import { useEffect, useMemo, useRef, useState } from 'react'
import { trackEvent } from './lib/analytics'
import { resolvedConfig } from './lib/config'
import { sendPayloadToN8n } from './lib/integrations'
import { generateMicroComment, generateReport } from './lib/llm'
import {
  buildOtherAnswerValue,
  extractOtherAnswerValue,
  shouldApplyCommentResult,
  shouldGenerateMicroComment,
} from './lib/quizUi'
import { getCurrentQuestion, getVisibleQuestions, sanitizeAnswersByVisibility } from './lib/quizEngine'
import { questionBank } from './lib/questionBank'
import { canSubmitNow, isHoneypotClean } from './lib/security'
import { getSessionId, loadAnswers, loadContact, loadReport, saveAnswers, saveContact, saveReport } from './lib/storage'
import type { AnswersMap, ContactData, QuizPayloadV1, View } from './types'

const appVersion = '1.0.0'

function normalizeAnswerKey(id: string): string {
  return id.replace('.', '_')
}

function toWebhookAnswers(answers: AnswersMap): Record<string, string | string[]> {
  return Object.fromEntries(Object.entries(answers).map(([key, value]) => [normalizeAnswerKey(key), value]))
}

function areaMeta(color: 'red' | 'yellow' | 'green'): { icon: string; className: string } {
  if (color === 'red') return { icon: '🔴', className: 'bg-red-100 text-red-700' }
  if (color === 'yellow') return { icon: '🟡', className: 'bg-amber-100 text-amber-700' }
  return { icon: '🟢', className: 'bg-emerald-100 text-emerald-700' }
}

const defaultEducationText =
  'Dobrze zaplanowana optymalizacja potrafi szybko poprawić wyniki: niższy koszt kliknięcia, wyższy CTR i lepszą rentowność kampanii. ' +
  'Wdrożenia takie jak CSS, uporządkowany feed produktowy czy automatyzacje często dają efekt szybciej niż zwiększanie budżetu reklamowego.\n\n' +
  'Dziś analizę, wnioskowanie i testowanie hipotez można mocno przyspieszyć dzięki AI, dlatego nawet drobna poprawa jednego elementu bywa kluczowa dla całego biznesu. ' +
  'Kolejna reklama albo kolejna agencja nie pomoże, jeśli nikt nie poukłada działań strategicznie i nie spojrzy na biznes z lotu ptaka.\n\n' +
  'Jeśli interesuje Cię poprawa wyników, umów ze mną konsultację.\nTomasz Szwecki — Sztuka Marketingu'

function App() {
  const [view, setView] = useState<View>('welcome')
  const [answers, setAnswers] = useState<AnswersMap>(() => loadAnswers())
  const [questionIndex, setQuestionIndex] = useState(0)
  const [comment, setComment] = useState<string | null>(null)
  const [commentLoading, setCommentLoading] = useState(false)
  const [contact, setContact] = useState<ContactData>(
    () =>
      loadContact() ?? {
        name: '',
        email: '',
        website: '',
        consent: false,
        honeypot: '',
      },
  )
  const [report, setReport] = useState(() => loadReport())
  const [error, setError] = useState<string | null>(null)
  const [otherValue, setOtherValue] = useState('')
  const [showTidycal, setShowTidycal] = useState(false)
  const commentRequestIdRef = useRef(0)
  const currentQuestionIdRef = useRef<string | null>(null)

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers])
  const safeQuestionIndex = Math.min(questionIndex, Math.max(visibleQuestions.length - 1, 0))
  const currentQuestion = useMemo(() => getCurrentQuestion(answers, safeQuestionIndex), [answers, safeQuestionIndex])
  const progress = visibleQuestions.length > 0 ? ((safeQuestionIndex + 1) / visibleQuestions.length) * 100 : 0

  useEffect(() => {
    currentQuestionIdRef.current = currentQuestion?.id ?? null
  }, [currentQuestion])

  async function handleSingleAnswer(option: string): Promise<void> {
    if (!currentQuestion) return

    const normalizedOption =
      currentQuestion.hasOtherField && option.startsWith('Inne:') && otherValue.length > 0
        ? buildOtherAnswerValue(otherValue)
        : option
    const nextAnswers = { ...answers, [currentQuestion.id]: normalizedOption }
    setAnswers(nextAnswers)
    saveAnswers(nextAnswers)
    const shouldGenerate = shouldGenerateMicroComment(currentQuestion.id)
    if (!shouldGenerate) {
      setComment(null)
      setCommentLoading(false)
      goNextQuestion()
      return
    }

    setCommentLoading(true)
    const requestId = commentRequestIdRef.current + 1
    commentRequestIdRef.current = requestId
    const requestQuestionId = currentQuestion.id

    trackEvent('question_answered', { questionId: currentQuestion.id, answer: normalizedOption }).catch(
      () => undefined,
    )

    const maybeComment = await generateMicroComment(currentQuestion.id, normalizedOption, currentQuestion.text)
    if (
      !shouldApplyCommentResult({
        requestId,
        activeRequestId: commentRequestIdRef.current,
        requestQuestionId,
        currentQuestionId: currentQuestionIdRef.current,
      })
    ) {
      return
    }

    setCommentLoading(false)
    if (maybeComment) {
      setComment(maybeComment)
      return
    }
    goNextQuestion()
  }

  function handleMultiAnswer(option: string): void {
    if (!currentQuestion) return
    const current = answers[currentQuestion.id]
    const selected = Array.isArray(current) ? current : []
    const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]
    const nextAnswers = { ...answers, [currentQuestion.id]: next }
    setAnswers(nextAnswers)
    saveAnswers(nextAnswers)
    setComment(null)
  }

  function goNextQuestion(): void {
    commentRequestIdRef.current += 1
    setCommentLoading(false)
    setComment(null)
    if (safeQuestionIndex >= visibleQuestions.length - 1) {
      setView('contact')
      trackEvent('form_viewed').catch(() => undefined)
      return
    }
    setQuestionIndex((prev) => prev + 1)
  }

  function goBackQuestion(): void {
    commentRequestIdRef.current += 1
    setCommentLoading(false)
    setComment(null)
    setQuestionIndex((prev) => Math.max(prev - 1, 0))
  }

  async function handleGenerateReport(): Promise<void> {
    setError(null)

    if (!isHoneypotClean(contact.honeypot)) {
      setError('Nie udało się wysłać formularza. Spróbuj ponownie.')
      return
    }

    if (!contact.name || !contact.email || !contact.consent) {
      setError('Uzupełnij wymagane pola i zgodę.')
      return
    }

    const limit = canSubmitNow()
    if (!limit.allowed) {
      setError(`Przekroczony limit prób. Spróbuj ponownie za ok. ${limit.retryInSec} sek.`)
      return
    }

    setView('loading')
    saveContact(contact)
    trackEvent('form_submitted').catch(() => undefined)

    try {
      const filteredAnswers = sanitizeAnswersByVisibility(answers)
      const generated = await generateReport(filteredAnswers)
      setReport(generated)
      saveReport(generated)

      const idempotencyKey = crypto.randomUUID()
      const webhookPayload: QuizPayloadV1 = {
        schema_version: 'v1',
        timestamp: new Date().toISOString(),
        contact: {
          name: contact.name,
          email: contact.email,
          website: contact.website,
        },
        answers: toWebhookAnswers(filteredAnswers),
        report: generated,
        meta: {
          idempotency_key: idempotencyKey,
          session_id: getSessionId(),
          user_agent: navigator.userAgent,
          app_version: appVersion,
        },
      }

      await sendPayloadToN8n(webhookPayload)
      trackEvent('report_generated').catch(() => undefined)
      setView('report')
    } catch (submitError) {
      console.error(submitError)
      setError('Nie udało się wygenerować raportu. Spróbuj ponownie.')
      setView('contact')
    }
  }

  useEffect(() => {
    if (view !== 'report' || !showTidycal || !resolvedConfig.tidycalPath) {
      return
    }

    const existing = document.querySelector('script[src="https://asset-tidycal.b-cdn.net/js/embed.js"]')
    if (existing) {
      return
    }

    const script = document.createElement('script')
    script.src = 'https://asset-tidycal.b-cdn.net/js/embed.js'
    script.async = true
    document.body.appendChild(script)
  }, [showTidycal, view])

  if (view === 'welcome') {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-8">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">Diagnoza sklepu</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Sprawdź, co warto poprawić w Twoim sklepie</h1>
          <p className="mt-4 text-slate-600">
            Interaktywny quiz (ok. 2 min) pokaże Ci najważniejsze luki oraz wygeneruje raport z priorytetami działań.
          </p>
          <button
            type="button"
            className="mt-8 w-full rounded-xl bg-indigo-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700"
            onClick={() => {
              setView('quiz')
              trackEvent('quiz_start', { questions: questionBank.length }).catch(() => undefined)
            }}
          >
            Rozpocznij (2 min)
          </button>
        </div>
      </main>
    )
  }

  if (view === 'loading') {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4">
        <div className="w-full rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl">🛒</p>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">Analizuję odpowiedzi...</h2>
          <p className="mt-2 text-slate-600">Tworzę spersonalizowany raport dla Twojego sklepu.</p>
          <div className="mx-auto mt-6 h-2 w-full max-w-xs overflow-hidden rounded bg-slate-200">
            <div className="h-full w-1/2 animate-pulse rounded bg-indigo-500" />
          </div>
        </div>
      </main>
    )
  }

  if (view === 'report' && report) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <header>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">Twój raport</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Diagnoza e-commerce</h2>
          </header>

          <section className="rounded-xl bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Część A: Profil sklepu</h3>
            <p className="mt-2 leading-relaxed text-slate-700">{report.profile}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Część B: Mapa obszarów</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(report.areas).map(([key, color]) => {
                const meta = areaMeta(color)
                return (
                  <div key={key} className={`rounded-xl px-4 py-3 font-medium ${meta.className}`}>
                    <span className="mr-2">{meta.icon}</span>
                    {key}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Część C: Top 3 priorytety</h3>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{report.priorities}</p>
          </section>

          <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-800">
              Część D: Edukacja i kierunek wdrożenia
            </h3>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-indigo-900">
              {report.education || defaultEducationText}
            </p>
          </section>

          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Raport został wysłany na Twój adres e-mail. Sprawdź skrzynkę (oraz folder spam).
          </p>
          <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-xl bg-indigo-600 px-5 py-3 text-center font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!resolvedConfig.tidycalPath}
              onClick={() => {
                setShowTidycal(true)
                trackEvent('cta_clicked', { cta: 'book_consultation_tidycal' }).catch(() => undefined)
              }}
            >
              Umów bezpłatną konsultację
            </button>
          </section>
          {showTidycal && resolvedConfig.tidycalPath && (
            <section id="tidycal-booking" className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Umów konsultację</h3>
              <div className="mt-3">
                <div className="tidycal-embed" data-path={resolvedConfig.tidycalPath} />
              </div>
            </section>
          )}
        </div>
      </main>
    )
  }

  if (view === 'contact') {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">Wygeneruj mój raport</h2>
          <p className="mt-2 text-slate-600">Podaj dane kontaktowe — raport zostanie wygenerowany i wysłany na Twój e-mail. Zapisuję Cię też na listę, żebyś otrzymywał wartościowe treści.</p>

          <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-200">
            <div className="select-none blur-sm">
              <div className="bg-slate-50 p-6">
                <p className="text-sm font-medium text-slate-500">Część A: Profil sklepu</p>
                <p className="mt-1 text-slate-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p className="mt-4 text-sm font-medium text-slate-500">Część B: Mapa obszarów</p>
                <p className="mt-1 text-slate-400">pomiar • feed • rentowność • automatyzacje • oferta • strategia</p>
                <p className="mt-4 text-sm font-medium text-slate-500">Część C: Top 3 priorytety</p>
                <p className="mt-1 text-slate-400">1. Priorytet pierwszy 2. Priorytet drugi 3. Priorytet trzeci</p>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
              <p className="text-center text-sm font-medium text-slate-600">Wypełnij formularz poniżej — raport wyślemy na Twój e-mail</p>
            </div>
          </div>

          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              handleGenerateReport().catch(() => undefined)
            }}
          >
            <label className="block text-sm font-medium text-slate-700">
              Imię i nazwisko
              <input
                type="text"
                required
                value={contact.name}
                onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Adres e-mail
              <input
                type="email"
                required
                value={contact.email}
                onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              URL sklepu (opcjonalnie)
              <input
                type="url"
                value={contact.website}
                onChange={(event) => setContact((prev) => ({ ...prev, website: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={contact.honeypot}
              onChange={(event) => setContact((prev) => ({ ...prev, honeypot: event.target.value }))}
              className="hidden"
              aria-hidden="true"
            />
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={contact.consent}
                onChange={(event) => setContact((prev) => ({ ...prev, consent: event.target.checked }))}
                className="mt-1"
              />
              Wyrażam zgodę na przetwarzanie moich danych osobowych przez Tomasza Szweckiego, w celu otrzymania
              raportu diagnostycznego oraz kontaktu w sprawie współpracy. Wiem, że mogę wycofać zgodę w dowolnym
              momencie, pisząc na kontakt@sztukamarketingu.pl.
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setView('quiz')}
                className="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700"
              >
                Wstecz
              </button>
              <button type="submit" className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white">
                Wygeneruj mój raport
              </button>
            </div>
          </form>
        </div>
      </main>
    )
  }

  if (!currentQuestion) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center justify-center px-4">
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-slate-700">Brak pytań do wyświetlenia.</p>
        </div>
      </main>
    )
  }

  const selected = answers[currentQuestion.id]
  const selectedList = Array.isArray(selected) ? selected : []
  const selectedSingle = typeof selected === 'string' ? selected : ''
  const isOtherSelected = currentQuestion.hasOtherField && selectedSingle.startsWith('Inne:')
  const selectedOtherText = extractOtherAnswerValue(selectedSingle)
  const selectedOtherLooksLikePlaceholder = /^_+$/.test(selectedOtherText)
  const otherInputValue =
    isOtherSelected && selectedOtherText && !selectedOtherLooksLikePlaceholder ? selectedOtherText : otherValue

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-slate-600">Pytanie {safeQuestionIndex + 1} z {visibleQuestions.length}</p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-200">
          <div className="h-full rounded bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <h2 className="mt-6 text-xl font-semibold text-slate-900">{currentQuestion.text}</h2>
        <p className="mt-1 text-sm text-slate-500">{currentQuestion.category}</p>

        <div className="mt-6 grid gap-3">
          {currentQuestion.options.map((option) => {
            const isSelected = currentQuestion.isMultiSelect
              ? selectedList.includes(option)
              : typeof selected === 'string' && selected === option

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  if (currentQuestion.isMultiSelect) {
                    handleMultiAnswer(option)
                    return
                  }
                  handleSingleAnswer(option).catch(() => undefined)
                }}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>

        {currentQuestion.hasOtherField && (
          <label className="mt-4 block text-sm text-slate-600">
            Jeśli wybrałeś/aś „Inne”, doprecyzuj:
            <input
              type="text"
              value={otherInputValue}
              onChange={(event) => {
                const value = event.target.value
                setOtherValue(value)
                if (isOtherSelected) {
                  const normalized = buildOtherAnswerValue(value)
                  const nextAnswers = { ...answers, [currentQuestion.id]: normalized }
                  setAnswers(nextAnswers)
                  saveAnswers(nextAnswers)
                }
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Opisz krótko problem"
            />
          </label>
        )}

        {commentLoading && <p className="mt-4 text-sm text-slate-500">Analizuję odpowiedź...</p>}

        {comment && (
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            {comment}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={goBackQuestion} className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700">
            Wstecz
          </button>

          {currentQuestion.isMultiSelect && (
            <button
              type="button"
              onClick={goNextQuestion}
              disabled={selectedList.length === 0}
              className="ml-auto rounded-xl bg-indigo-600 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Dalej
            </button>
          )}

          {!currentQuestion.isMultiSelect && comment && (
            <button
              type="button"
              onClick={goNextQuestion}
              className="ml-auto rounded-xl bg-indigo-600 px-5 py-2 font-medium text-white"
            >
              Dalej
            </button>
          )}

          {!currentQuestion.isMultiSelect && isOtherSelected && !comment && (
            <button
              type="button"
              onClick={goNextQuestion}
              className="ml-auto rounded-xl bg-indigo-600 px-5 py-2 font-medium text-white"
            >
              Dalej
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

export default App
