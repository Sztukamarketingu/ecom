type EventPayload = Record<string, string | number | boolean | null | undefined>

import { resolvedConfig } from './config'

export async function trackEvent(event: string, payload: EventPayload = {}): Promise<void> {
  const enriched = {
    event,
    timestamp: new Date().toISOString(),
    ...payload,
  }

  if (import.meta.env.DEV) {
    console.info('[analytics]', enriched)
  }

  if (!resolvedConfig.analyticsEndpoint) {
    return
  }

  try {
    await fetch(resolvedConfig.analyticsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enriched),
    })
  } catch (error) {
    console.warn('Analytics request failed', error)
  }
}
