import { describe, expect, it } from 'vitest'
import { isQuestionVisible, questionBank } from './questionBank'

describe('questionBank parser', () => {
  it('loads full question pool from markdown', () => {
    expect(questionBank.length).toBeGreaterThanOrEqual(46)
    expect(questionBank.some((question) => question.id === 'P1.1')).toBe(true)
    expect(questionBank.some((question) => question.id === 'P7.3')).toBe(true)
  })

  it('supports branching for follow-up question', () => {
    const branchQuestion = questionBank.find((question) => question.id === 'P2.3a')
    expect(branchQuestion).toBeDefined()

    if (!branchQuestion) return

    expect(
      isQuestionVisible(branchQuestion, {
        'P2.3': 'Tak, aktywnie analizuję dane',
      }),
    ).toBe(true)
    expect(
      isQuestionVisible(branchQuestion, {
        'P2.3': 'Mam, ale rzadko zaglądam',
      }),
    ).toBe(false)
  })
})
