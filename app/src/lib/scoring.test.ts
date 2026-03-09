import { describe, expect, it } from 'vitest'
import { computeAreaScores } from './scoring'

describe('computeAreaScores', () => {
  it('marks weak areas as red when answers are negative', () => {
    const scores = computeAreaScores({
      'P2.1': 'Nie',
      'P2.2': 'Nie wiem co to jest',
      'P3.1': 'Nie mam feedu produktowego',
      'P4.1': 'Nie wiem czym się różnią',
      'P5.1': 'Nie mam',
      'P6.3': 'Nie wiem',
      'P7.3': 'Działam reaktywnie — reaguję na bieżące sytuacje',
    })

    expect(scores.pomiar).toBe('red')
    expect(scores.feed).toBe('red')
    expect(scores.rentownosc).toBe('red')
    expect(scores.automatyzacje).toBe('red')
    expect(scores.oferta).toBe('red')
    expect(scores.strategia).toBe('red')
  })

  it('marks strong areas as green when answers are positive', () => {
    const scores = computeAreaScores({
      'P2.1': 'Tak',
      'P3.2': 'Tak',
      'P4.2': 'Tak — dokładnie wiem',
      'P5.1': 'Tak, działa automatycznie',
      'P6.1': 'Tak',
      'P7.1': 'Tak — mam stały monitoring konkurencji',
    })

    expect(scores.pomiar).toBe('green')
    expect(scores.feed).toBe('green')
    expect(scores.rentownosc).toBe('green')
    expect(scores.automatyzacje).toBe('green')
    expect(scores.oferta).toBe('green')
    expect(scores.strategia).toBe('green')
  })
})
