# Aplikacja diagnostyczna e-commerce (MVP)

Frontend aplikacji quizowej z raportem LLM, integracją webhook `n8n`, CTA TidyCal i podstawowym trackingiem.

## Uruchomienie lokalne

1. Skopiuj env:
   - `cp .env.example .env`
2. Zainstaluj zależności:
   - `npm install`
3. Odpal development:
   - `npm run dev`

## Weryfikacja jakości

- `npm run lint`
- `npm run test`
- `npm run build`

## Kluczowe funkcje MVP

- Quiz z logiką rozgałęzień i autosave.
- Micro-komentarze (proxy LLM + fallback lokalny).
- Raport końcowy A/B/C (proxy LLM + fallback lokalny).
- Webhook payload `v1` do `n8n` + trigger wysyłki raportu e-mail.
- CTA TidyCal po raporcie.
- Anti-spam (honeypot + rate limit) i event tracking.

## Konfiguracja ENV

- `VITE_N8N_WEBHOOK_URL` - endpoint webhook dla zapisów i wysyłki raportu
- `VITE_TIDYCAL_PATH` - ścieżka embed TidyCal (np. `sztukamarketingu/darmowa-sesja-doradcza`)
- `VITE_LLM_PROXY_URL` - endpoint proxy dla micro-komentarzy i raportu
- `VITE_ANALYTICS_ENDPOINT` - opcjonalny endpoint telemetry
- `VITE_REPORT_LANGUAGE` - domyślny język raportu (`pl`)

## Kontrakty i dokumenty

- Decyzje i kontrakty: `docs/decisions-and-contracts.md`
- Schema webhook payload: `docs/payload-schema.v1.json`
