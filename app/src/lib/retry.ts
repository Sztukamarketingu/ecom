export async function withRetry<T>(
  operation: () => Promise<T>,
  attempts = 2,
  baseDelayMs = 400,
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt === attempts) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * attempt))
    }
  }

  throw lastError
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        controller.signal.addEventListener('abort', () => reject(new Error('Request timeout')))
      }),
    ])
  } finally {
    clearTimeout(timeout)
  }
}
