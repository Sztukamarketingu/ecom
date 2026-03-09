import { getMicroComment } from '../data/microComments'
import type { AnswersMap, GeneratedReport } from '../types'
import { resolvedConfig } from './config'
import { buildLocalReport } from './report'
import { withRetry } from './retry'

type LlmPayload = {
  type: 'micro-comment' | 'report'
  data: Record<string, unknown>
}

async function callLlmProxy(payload: LlmPayload): Promise<unknown> {
  if (!resolvedConfig.llmProxyUrl) {
    throw new Error('No LLM proxy configured')
  }

  const response = await fetch(resolvedConfig.llmProxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`LLM proxy failed: ${response.status}`)
  }

  return response.json()
}

export async function generateMicroComment(
  questionId: string,
  answerLabel: string,
  questionText?: string,
): Promise<string | null> {
  try {
    const result = (await withRetry(
      () =>
        callLlmProxy({
          type: 'micro-comment',
          data: { questionId, answerLabel, questionText },
        }) as Promise<{ comment?: string }>,
      2,
    )) as { comment?: string }
    return result.comment ?? getMicroComment(questionId, answerLabel)
  } catch {
    return getMicroComment(questionId, answerLabel)
  }
}

export async function generateReport(answers: AnswersMap): Promise<GeneratedReport> {
  try {
    const result = (await withRetry(
      () =>
        callLlmProxy({
          type: 'report',
          data: {
            answers,
            language: resolvedConfig.reportLanguage,
          },
        }) as Promise<GeneratedReport>,
      2,
    )) as GeneratedReport

    if (!result.profile || !result.priorities || !result.areas) {
      throw new Error('Invalid report from LLM proxy')
    }
    return {
      ...result,
      education:
        result.education ??
        'Dobrze zaplanowana optymalizacja (np. CSS, feed i automatyzacje) potrafi realnie poprawić rentowność i obniżyć koszty reklamy. Dziś analizę, wnioskowanie i testowanie hipotez można mocno przyspieszyć dzięki AI, dlatego nawet drobna poprawa jednego elementu bywa kluczowa dla wyniku biznesu.\n\nJeśli interesuje Cię poprawa wyników, umów ze mną konsultację.\nTomasz Szwecki — Sztuka Marketingu',
    }
  } catch {
    return buildLocalReport(answers)
  }
}
