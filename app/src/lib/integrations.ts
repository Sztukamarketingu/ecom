import type { QuizPayloadV1 } from '../types'
import { resolvedConfig } from './config'
import { withRetry } from './retry'

function buildHeaders(idempotencyKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Idempotency-Key': idempotencyKey,
  }
}

export async function sendPayloadToN8n(payload: QuizPayloadV1): Promise<void> {
  if (!resolvedConfig.n8nWebhookUrl) {
    return
  }

  await withRetry(async () => {
    const response = await fetch(resolvedConfig.n8nWebhookUrl, {
      method: 'POST',
      headers: buildHeaders(payload.meta.idempotency_key),
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`)
    }
  }, 3)
}

export async function triggerEmailReport(payload: QuizPayloadV1): Promise<void> {
  if (!resolvedConfig.n8nWebhookUrl) {
    return
  }

  await withRetry(async () => {
    const response = await fetch(resolvedConfig.n8nWebhookUrl, {
      method: 'POST',
      headers: buildHeaders(payload.meta.idempotency_key),
      body: JSON.stringify({
        ...payload,
        action: 'send_report',
      }),
    })
    if (!response.ok) {
      throw new Error(`Email trigger failed: ${response.status}`)
    }
  }, 2)
}
