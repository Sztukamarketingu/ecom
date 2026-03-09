import type { AnswersMap, AreaKey, GeneratedReport } from '../types'
import { areaLabel, computeAreaScores } from './scoring'

function areaPriority(score: 'red' | 'yellow' | 'green'): number {
  if (score === 'red') return 2
  if (score === 'yellow') return 1
  return 0
}

function getAnswerText(answers: AnswersMap, id: string): string {
  const value = answers[id]
  if (!value) return ''
  return Array.isArray(value) ? value.join(', ') : value
}

export function buildLocalReport(answers: AnswersMap): GeneratedReport {
  const areas = computeAreaScores(answers)
  const profile = [
    `Budżet reklamowy: ${getAnswerText(answers, 'P1.1') || 'brak danych'}.`,
    `Średnia wartość zamówienia: ${getAnswerText(answers, 'P1.2') || 'brak danych'}.`,
    `Główny problem: ${getAnswerText(answers, 'P1.6') || 'brak danych'}.`,
  ].join(' ')

  const topAreas = (Object.entries(areas) as [AreaKey, 'red' | 'yellow' | 'green'][])
    .sort((a, b) => areaPriority(b[1]) - areaPriority(a[1]))
    .slice(0, 3)

  const priorities = topAreas
    .map(([area, score], index) => {
      const prefix = score === 'red' ? 'Pilny priorytet' : 'Wysoki priorytet'
      return `${index + 1}. ${prefix}: ${areaLabel(area)}. Na podstawie odpowiedzi ten obszar ma największy wpływ na wynik biznesowy i warto go domknąć w pierwszej kolejności. Czy chcesz porozmawiać o tym jak to wdrożyć?`
    })
    .join('\n\n')

  const education =
    'Dobrze zaplanowana optymalizacja potrafi szybko poprawić wyniki: niższy koszt kliknięcia, wyższy CTR i lepszą rentowność kampanii. ' +
    'Wdrożenia takie jak CSS, uporządkowany feed produktowy czy automatyzacje często dają efekt szybciej niż zwiększanie budżetu reklamowego.\n\n' +
    'Dziś analizę, wnioskowanie i testowanie hipotez można mocno przyspieszyć dzięki AI, dlatego nawet drobna poprawa jednego elementu bywa kluczowa dla całego biznesu. ' +
    'Kolejna reklama albo kolejna agencja nie pomoże, jeśli nikt nie poukłada działań strategicznie i nie spojrzy na biznes z lotu ptaka.\n\n' +
    'Jeśli interesuje Cię poprawa wyników, umów ze mną konsultację.\nTomasz Szwecki — Sztuka Marketingu'

  return {
    profile,
    areas,
    priorities,
    education,
  }
}
