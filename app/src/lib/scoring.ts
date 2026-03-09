import type { AnswersMap, AreaKey, AreaScores, ScoreColor } from '../types'

const areaPrefixes: Record<AreaKey, string> = {
  pomiar: 'P2.',
  feed: 'P3.',
  rentownosc: 'P4.',
  automatyzacje: 'P5.',
  oferta: 'P6.',
  strategia: 'P7.',
}

const mediumPatterns = [/mniej więcej/i, /sporadycznie/i, /częściowo/i, /mam, ale/i, /chyba/i]
const positivePatterns = [/^tak\b/i, /aktywnie/i, /automatycznie/i, /regularnie/i, /dokładnie/i]

function classifyLabel(label: string): number {
  const lower = label.toLowerCase()
  const hasPositiveKnowledge = lower.includes('dokładnie wiem') || lower.includes('mniej więcej wiem')
  const isNegative =
    lower.startsWith('nie') ||
    lower.includes('nie mam') ||
    lower.includes('nie monitoruję') ||
    lower.includes('reaktywnie') ||
    (lower.includes('nie wiem') && !hasPositiveKnowledge)

  if (isNegative) {
    return -1
  }

  if (mediumPatterns.some((pattern) => pattern.test(label))) {
    return 0
  }
  if (positivePatterns.some((pattern) => pattern.test(label))) {
    return 1
  }
  return 0
}

function normalizeScore(raw: number): ScoreColor {
  if (raw <= -0.35) {
    return 'red'
  }
  if (raw >= 0.35) {
    return 'green'
  }
  return 'yellow'
}

export function computeAreaScores(answers: AnswersMap): AreaScores {
  const output: Partial<AreaScores> = {}

  for (const [area, prefix] of Object.entries(areaPrefixes) as [AreaKey, string][]) {
    const relevant = Object.entries(answers).filter(([id]) => id.startsWith(prefix))
    if (relevant.length === 0) {
      output[area] = 'yellow'
      continue
    }

    const values = relevant.flatMap(([, answer]) => (Array.isArray(answer) ? answer : [answer]))
    const total = values.reduce((sum, value) => sum + classifyLabel(value), 0)
    const normalized = total / Math.max(values.length, 1)
    output[area] = normalizeScore(normalized)
  }

  return output as AreaScores
}

export function areaLabel(area: AreaKey): string {
  const labels: Record<AreaKey, string> = {
    pomiar: 'Pomiar danych',
    feed: 'Feed produktowy',
    rentownosc: 'Rentowność',
    automatyzacje: 'Automatyzacje',
    oferta: 'Oferta i doświadczenie zakupowe',
    strategia: 'Strategia',
  }
  return labels[area]
}
