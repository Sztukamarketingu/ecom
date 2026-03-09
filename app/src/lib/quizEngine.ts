import type { AnswersMap, QuizQuestion } from '../types'
import { isQuestionVisible, questionBank } from './questionBank'

export function getVisibleQuestions(answers: AnswersMap): QuizQuestion[] {
  return questionBank.filter((question) => isQuestionVisible(question, answers))
}

export function getCurrentQuestion(answers: AnswersMap, index: number): QuizQuestion | null {
  const visible = getVisibleQuestions(answers)
  return visible[index] ?? null
}

export function sanitizeAnswersByVisibility(answers: AnswersMap): AnswersMap {
  const visibleIds = new Set(getVisibleQuestions(answers).map((question) => question.id))
  return Object.fromEntries(Object.entries(answers).filter(([id]) => visibleIds.has(id)))
}

export function answerToWebhookValue(value: string | string[]): string | string[] {
  return value
}
