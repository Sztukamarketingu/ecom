# QA i Go-Live (MVP)

## Wynik walidacji technicznej

- `npm run lint` - PASS
- `npm run test` - PASS
- `npm run build` - PASS

## Scenariusze smoke test (manual)

1. Start quizu z ekranu welcome.
2. Single-select: wybór odpowiedzi i przejście dalej.
3. Multi-select: możliwość zaznaczenia wielu opcji.
4. Rozgałęzienia:
   - P2.3 -> P2.3a tylko dla odpowiedzi "Tak, aktywnie analizuję dane".
   - P5.1 -> P5.1a/P5.1b tylko dla odpowiedzi "Tak..." lub "Mam coś...".
5. Formularz kontaktowy:
   - blokada bez zgody,
   - walidacja e-mail.
6. Ekran loading i raport końcowy.
7. CTA:
   - "Umów bezpłatną konsultację",
   - "Wyślij raport na mój e-mail".

## Go-Live checklist

- [ ] Uzupełnione realne wartości w `.env`.
- [ ] Potwierdzone działanie endpointu `VITE_N8N_WEBHOOK_URL`.
- [ ] Potwierdzone działanie `VITE_LLM_PROXY_URL`.
- [ ] Potwierdzony URL Calendly.
- [ ] Potwierdzony consent text i link do polityki prywatności.
- [ ] Włączony monitoring endpointu telemetry (opcjonalnie).
