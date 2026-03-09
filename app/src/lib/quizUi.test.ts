import { describe, expect, it } from 'vitest'
import {
  buildOtherAnswerValue,
  extractOtherAnswerValue,
  shouldApplyCommentResult,
  shouldGenerateMicroComment,
} from './quizUi'

describe('quizUi helpers', () => {
  it('preserves inner and trailing spaces in "Inne" value', () => {
    expect(buildOtherAnswerValue('Brak klientów')).toBe('Inne: Brak klientów')
    expect(buildOtherAnswerValue('Brak klientów ')).toBe('Inne: Brak klientów ')
  })

  it('extracts "Inne" text without trimming user input', () => {
    expect(extractOtherAnswerValue('Inne: Brak klientów ')).toBe('Brak klientów ')
    expect(extractOtherAnswerValue('Inne:')).toBe('')
  })

  it('accepts only latest comment request for current question', () => {
    expect(
      shouldApplyCommentResult({
        requestId: 2,
        activeRequestId: 2,
        requestQuestionId: 'P1.2',
        currentQuestionId: 'P1.2',
      }),
    ).toBe(true)

    expect(
      shouldApplyCommentResult({
        requestId: 1,
        activeRequestId: 2,
        requestQuestionId: 'P1.2',
        currentQuestionId: 'P1.2',
      }),
    ).toBe(false)

    expect(
      shouldApplyCommentResult({
        requestId: 2,
        activeRequestId: 2,
        requestQuestionId: 'P1.2',
        currentQuestionId: 'P1.3',
      }),
    ).toBe(false)
  })

  it('skips micro-comment only for P1.1 budget question', () => {
    expect(shouldGenerateMicroComment('P1.1')).toBe(false)
    expect(shouldGenerateMicroComment('P1.2')).toBe(true)
    expect(shouldGenerateMicroComment('P1.3')).toBe(true)
    expect(shouldGenerateMicroComment('P2.1')).toBe(true)
    expect(shouldGenerateMicroComment('P3.2')).toBe(true)
  })
})
