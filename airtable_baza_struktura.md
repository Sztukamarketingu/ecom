# Airtable - docelowa struktura bazy (quiz e-commerce)

## Dlaczego Airtable nie jest "tool" w obecnym workflow

W obecnym przepływie Airtable działa jako klasyczny krok zapisu danych (po webhooku), a nie jako narzędzie AI agenta.
W n8n są dwie różne ścieżki:

- `n8n-nodes-base.airtable` - zwykły node integracyjny (zapis/odczyt w pipeline)
- `n8n-nodes-base.airtableTool` - wariant "tool" dla AI Agentów (`ai_tool`)

Tu cel był: zapis odpowiedzi użytkownika po submitcie formularza, więc poprawny był zwykły node Airtable.

## Proponowana struktura bazy

Minimalnie 3 tabele:

1. `quiz_submissions` (główna)
   - 1 rekord = 1 wypełniony quiz
   - zawiera kontakt, wynik raportu, snapshot JSON

2. `quiz_answers` (long format)
   - wiele rekordów na submission (1 rekord = 1 odpowiedź)
   - najlepsze do filtrowania po `question_id`, trendów, analizy LLM

3. `quiz_events` (telemetria)
   - eventy typu `quiz_start`, `form_submitted`, `report_generated`, `cta_clicked`
   - do analizy lejka i drop-off

## CSV do importu

Pliki przygotowane do importu:

- `airtable_quiz_submissions.csv`
- `airtable_quiz_answers.csv`
- `airtable_quiz_events.csv`

## Relacje

W Airtable po imporcie:

- ustaw `submission_id` jako klucz logiczny we wszystkich tabelach
- (opcjonalnie) dodaj pole Link to another record:
  - `quiz_answers.submission_id -> quiz_submissions.submission_id`
  - `quiz_events.submission_id -> quiz_submissions.submission_id`

## Dlaczego ta struktura jest dobra pod LLM

- LLM może pobierać:
  - pełny kontekst z `quiz_submissions.answers_json`,
  - albo precyzyjnie wybrane odpowiedzi z `quiz_answers` (np. tylko P2/P3).
- Daje to zarówno szybki fallback (JSON snapshot), jak i analitykę granularną (long format).
