# Decisions and Contracts (MVP)

This file freezes the blocking decisions for the MVP implementation.

## Integration Decisions

- Data pipeline: `n8n` webhook (`Option B` from requirements).
- Meeting booking: TidyCal embed shown on report screen CTA.
- Emailing: trigger through `n8n` webhook (`send_report` action).
- LLM provider: Claude API-compatible proxy endpoint (server-side or automation node).

## Required Environment Variables

- `VITE_APP_TITLE`
- `VITE_N8N_WEBHOOK_URL`
- `VITE_TIDYCAL_PATH`
- `VITE_LLM_PROXY_URL`
- `VITE_ANALYTICS_ENDPOINT` (optional)
- `VITE_REPORT_LANGUAGE` (default: `pl`)

## Privacy and Consent

- Consent checkbox is required before generating report.
- The app stores only quiz state and anti-spam counters in local storage.
- Personal data is sent only after explicit consent and form submit.

## Payload Contract

- Payload schema version: `v1`
- Canonical schema: `docs/payload-schema.v1.json`
- Required top-level keys:
  - `schema_version`
  - `timestamp`
  - `contact`
  - `answers`
  - `report`
  - `meta`
