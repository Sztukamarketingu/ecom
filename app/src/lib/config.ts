import { z } from 'zod'

const configSchema = z.object({
  VITE_APP_TITLE: z.string().default('Diagnoza E-commerce'),
  VITE_N8N_WEBHOOK_URL: z.string().url().optional().or(z.literal('')),
  VITE_TIDYCAL_PATH: z.string().optional().or(z.literal('')),
  VITE_LLM_PROXY_URL: z.string().url().optional().or(z.literal('')),
  VITE_ANALYTICS_ENDPOINT: z.string().url().optional().or(z.literal('')),
  VITE_REPORT_LANGUAGE: z.string().default('pl'),
  VITE_REPORT_ONLY_MODE: z
    .string()
    .optional()
    .transform((value) => value === '1' || value?.toLowerCase() === 'true'),
})

export const config = configSchema.parse(import.meta.env)

export const resolvedConfig = {
  appTitle: config.VITE_APP_TITLE,
  n8nWebhookUrl: config.VITE_N8N_WEBHOOK_URL || '',
  tidycalPath: config.VITE_TIDYCAL_PATH || '',
  llmProxyUrl: config.VITE_LLM_PROXY_URL || '',
  analyticsEndpoint: config.VITE_ANALYTICS_ENDPOINT || '',
  reportLanguage: config.VITE_REPORT_LANGUAGE,
  reportOnlyMode: config.VITE_REPORT_ONLY_MODE ?? false,
}
