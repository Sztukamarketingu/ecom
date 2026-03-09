export type View = 'welcome' | 'quiz' | 'contact' | 'loading' | 'report'

export type ScoreColor = 'red' | 'yellow' | 'green'

export type AreaKey =
  | 'pomiar'
  | 'feed'
  | 'rentownosc'
  | 'automatyzacje'
  | 'oferta'
  | 'strategia'

export type BranchRule = {
  showIf: {
    parentId: string
    mode: 'equals' | 'notEquals' | 'in'
    values: string[]
  }
}

export type QuizQuestion = {
  id: string
  category: string
  text: string
  options: string[]
  isMultiSelect: boolean
  hasOtherField?: boolean
  branchRule?: BranchRule
}

export type AnswerValue = string | string[]
export type AnswersMap = Record<string, AnswerValue>

export type ContactData = {
  name: string
  email: string
  website?: string
  consent: boolean
  honeypot?: string
}

export type AreaScores = Record<AreaKey, ScoreColor>

export type GeneratedReport = {
  profile: string
  areas: AreaScores
  priorities: string
  education: string
}

export type QuizPayloadV1 = {
  schema_version: 'v1'
  timestamp: string
  contact: {
    name: string
    email: string
    website?: string
  }
  answers: Record<string, string | string[]>
  report: GeneratedReport
  meta: {
    idempotency_key: string
    session_id: string
    user_agent: string
    app_version?: string
  }
}
