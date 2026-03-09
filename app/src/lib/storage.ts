import type { AnswersMap, ContactData, GeneratedReport } from '../types'

const ANSWERS_KEY = 'quiz_answers_v1'
const CONTACT_KEY = 'quiz_contact_v1'
const REPORT_KEY = 'quiz_report_v1'
const SESSION_KEY = 'quiz_session_v1'

export function getSessionId(): string {
  const existing = localStorage.getItem(SESSION_KEY)
  if (existing) {
    return existing
  }
  const id = crypto.randomUUID()
  localStorage.setItem(SESSION_KEY, id)
  return id
}

export function saveAnswers(answers: AnswersMap): void {
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
}

export function loadAnswers(): AnswersMap {
  try {
    const value = localStorage.getItem(ANSWERS_KEY)
    return value ? (JSON.parse(value) as AnswersMap) : {}
  } catch {
    return {}
  }
}

export function saveContact(contact: ContactData): void {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(contact))
}

export function loadContact(): ContactData | null {
  try {
    const value = localStorage.getItem(CONTACT_KEY)
    return value ? (JSON.parse(value) as ContactData) : null
  } catch {
    return null
  }
}

export function saveReport(report: GeneratedReport): void {
  localStorage.setItem(REPORT_KEY, JSON.stringify(report))
}

export function loadReport(): GeneratedReport | null {
  try {
    const value = localStorage.getItem(REPORT_KEY)
    return value ? (JSON.parse(value) as GeneratedReport) : null
  } catch {
    return null
  }
}
