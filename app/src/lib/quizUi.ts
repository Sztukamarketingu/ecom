type CommentResultGuardInput = {
  requestId: number
  activeRequestId: number
  requestQuestionId: string
  currentQuestionId: string | null
}

const skipMicroCommentQuestions = new Set(['P1.1', 'P1.1b'])

export function buildOtherAnswerValue(rawValue: string): string {
  return rawValue.length > 0 ? `Inne: ${rawValue}` : 'Inne:'
}

export function extractOtherAnswerValue(answerValue: string): string {
  if (!answerValue.startsWith('Inne:')) {
    return ''
  }
  if (answerValue.startsWith('Inne: ')) {
    return answerValue.slice('Inne: '.length)
  }
  return answerValue.slice('Inne:'.length)
}

export function shouldApplyCommentResult(input: CommentResultGuardInput): boolean {
  return (
    input.requestId === input.activeRequestId &&
    input.currentQuestionId !== null &&
    input.requestQuestionId === input.currentQuestionId
  )
}

export function shouldGenerateMicroComment(questionId: string): boolean {
  return !skipMicroCommentQuestions.has(questionId)
}
