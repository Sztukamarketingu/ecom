import sourceMarkdown from '../../data/02-formularz-interaktywny.md?raw'
import type { BranchRule, QuizQuestion } from '../types'

const branchRules: Record<string, BranchRule> = {
  'P1.4a': {
    showIf: {
      parentId: 'P1.4',
      mode: 'notEquals',
      values: ['Jednorazowo — produkt kupuje się raz'],
    },
  },
  'P2.3a': {
    showIf: {
      parentId: 'P2.3',
      mode: 'equals',
      values: ['Tak, aktywnie analizuję dane'],
    },
  },
  'P3.3a': {
    showIf: {
      parentId: 'P3.3',
      mode: 'equals',
      values: ['Tak — etykiety są przypisywane automatycznie na podstawie wyników'],
    },
  },
  'P5.1a': {
    showIf: {
      parentId: 'P5.1',
      mode: 'in',
      values: ['Tak, działa automatycznie', 'Mam coś, ale nie wiem dokładnie jak to działa'],
    },
  },
  'P5.1b': {
    showIf: {
      parentId: 'P5.1',
      mode: 'in',
      values: ['Tak, działa automatycznie', 'Mam coś, ale nie wiem dokładnie jak to działa'],
    },
  },
  'P5.2a': {
    showIf: {
      parentId: 'P5.2',
      mode: 'in',
      values: ['Tak, regularnie (min. 1–2 razy w tygodniu)', 'Sporadycznie'],
    },
  },
  'P6.1a': {
    showIf: {
      parentId: 'P6.1',
      mode: 'equals',
      values: ['Tak'],
    },
  },
}

function extractQuestionText(rawLine: string): string {
  return rawLine.replace(/\*\*(P\d+\.\d+[a-z]?)\*\*/, '').trim()
}

function extractQuestionId(rawLine: string): string | null {
  const match = rawLine.match(/\*\*(P\d+\.\d+[a-z]?)\*\*/)
  return match ? match[1] : null
}

function parseQuestionBlocks(markdown: string): QuizQuestion[] {
  const lines = markdown.split('\n')
  const questions: QuizQuestion[] = []
  let currentCategory = 'Pozostałe'

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()

    if (line.startsWith('## KATEGORIA')) {
      currentCategory = line.replace(/^##\s+/, '').replace(/^KATEGORIA\s+\d+\s+—\s+/, '').trim()
      continue
    }

    const id = extractQuestionId(line)
    if (!id) {
      continue
    }

    const text = extractQuestionText(line)
    const options: string[] = []
    let isMultiSelect = false
    let hasOtherField = false

    for (let j = i + 1; j < lines.length; j += 1) {
      const next = lines[j].trim()

      if (extractQuestionId(next) || next.startsWith('## KATEGORIA') || next.startsWith('## PODSUMOWANIE')) {
        break
      }

      if (next.includes('(multi-select)')) {
        isMultiSelect = true
      }

      if (next.includes('Inne:')) {
        hasOtherField = true
      }

      if (next.startsWith('|') && !next.includes('---') && !next.includes('Kafelek')) {
        const cell = next.split('|').map((part) => part.trim())[1]
        if (cell) {
          options.push(cell)
        }
      }
    }

    if (options.length > 0) {
      questions.push({
        id,
        category: currentCategory,
        text,
        options,
        isMultiSelect,
        hasOtherField,
        branchRule: branchRules[id],
      })
    }
  }

  return questions
}

export const questionBank: QuizQuestion[] = parseQuestionBlocks(sourceMarkdown)

export function isQuestionVisible(question: QuizQuestion, answers: Record<string, string | string[]>): boolean {
  if (!question.branchRule) {
    return true
  }

  const parentAnswer = answers[question.branchRule.showIf.parentId]
  if (!parentAnswer) {
    return false
  }

  const selected = Array.isArray(parentAnswer) ? parentAnswer : [parentAnswer]
  const { mode, values } = question.branchRule.showIf

  if (mode === 'equals') {
    return selected.some((item) => values.includes(item))
  }
  if (mode === 'notEquals') {
    return selected.every((item) => !values.includes(item))
  }
  return selected.some((item) => values.includes(item))
}
