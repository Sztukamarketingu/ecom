const RATE_LIMIT_KEY = 'quiz_submit_rate_v1'
const MAX_SUBMISSIONS_PER_HOUR = 4

export function isHoneypotClean(value?: string): boolean {
  return !value || value.trim().length === 0
}

export function canSubmitNow(): { allowed: boolean; retryInSec?: number } {
  const now = Date.now()
  const hourAgo = now - 60 * 60 * 1000

  const raw = localStorage.getItem(RATE_LIMIT_KEY)
  const timestamps = raw ? ((JSON.parse(raw) as number[]).filter((item) => item >= hourAgo)) : []

  if (timestamps.length >= MAX_SUBMISSIONS_PER_HOUR) {
    const oldest = Math.min(...timestamps)
    const retryInSec = Math.ceil((oldest + 60 * 60 * 1000 - now) / 1000)
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps))
    return { allowed: false, retryInSec: Math.max(retryInSec, 1) }
  }

  timestamps.push(now)
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps))
  return { allowed: true }
}
