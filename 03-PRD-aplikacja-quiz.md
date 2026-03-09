# PRD — Aplikacja diagnostyczna e-commerce

> **Typ dokumentu:** Product Requirements Document (dla sesji vibe coding)
> **Wersja:** 1.0
> **Decyzja technologiczna:** custom aplikacja (vibe coding) — nie Typeform / Mark Quiz
> **Cel:** Ten dokument opisuje wszystko, czego potrzebuje aplikacja — od flow użytkownika przez logikę LLM po architekturę danych. Stanowi kompletny brief do sesji vibe codingu.

---

## 1. Cel produktu

Interaktywna aplikacja diagnostyczna osadzona na landing page Tomasza. Właściciel sklepu internetowego przechodzi przez quiz złożony z pytań kafelkowych, po czym otrzymuje spersonalizowany raport tekstowy wskazujący obszary wymagające uwagi w jego e-commerce. Na końcu może umówić bezpłatną konsultację z Tomaszem lub zostawić dane kontaktowe w celu otrzymania raportu na e-mail.

**Aplikacja realizuje trzy cele jednocześnie:**
- Dla użytkownika: uświadamia mu luki i daje konkretną wartość (raport) za darmo
- Dla Tomasza: kwalifikuje leady i dostarcza szczegółowy profil klienta przed rozmową
- Dla konwersji: buduje zaufanie i obniża próg wejścia do współpracy

---

## 2. Pełny flow użytkownika

```
[Start]
    │
    ▼
Ekran powitalny
— krótki nagłówek: "Sprawdź, co warto poprawić w Twoim sklepie"
— przycisk "Rozpocznij (2 min)"
    │
    ▼
Quiz — 7 kategorii pytań (kafelki)
— po każdym pytaniu: opcjonalny micro-komentarz LLM + przycisk "Dalej"
— jeśli brak komentarza: automatyczne przejście
— pasek postępu widoczny przez cały czas
    │
    ▼
Ekran zbierania danych kontaktowych
— Imię i nazwisko
— Adres e-mail
— URL sklepu internetowego (opcjonalne)
— przycisk "Wygeneruj mój raport"
    │
    ▼
Ekran ładowania raportu
— animacja (np. koszyk, przetwarzanie danych)
— "Analizuję odpowiedzi..."
    │
    ▼
Ekran raportu
— Część A: profil sklepu (2–3 zdania)
— Część B: mapa obszarów (🔴🟡🟢 dla każdej kategorii)
— Część C: Top 3 priorytety (tekst narracyjny, ~300–500 słów)
    │
    ▼
CTA po raporcie (dwa przyciski)
— Główny: "Umów bezpłatną konsultację"  → Calendly
— Drugorzędny: "Wyślij raport na mój e-mail" → trigger wysyłki
    │
    ▼
[Koniec]
```

---

## 3. Wymagania funkcjonalne

### 3.1 Ekran powitalny
- Nagłówek: *"Sprawdź, co warto poprawić w Twoim sklepie"*
- Krótki opis (1–2 zdania): wartość quizu, czas wypełnienia
- Jeden przycisk CTA: "Rozpocznij"
- Opcjonalnie: licznik pytań lub szacowany czas ("~2 minuty")

### 3.2 Quiz — pytania i kafelki
- Pytania podzielone na 7 kategorii (patrz: `02-formularz-interaktywny.md`)
- Każde pytanie na osobnym ekranie — jedno pytanie na raz
- Format odpowiedzi: klikalne kafelki (single-select lub multi-select zależnie od pytania)
- Rozgałęzienia logiczne: niektóre pytania pojawiają się tylko jeśli poprzednia odpowiedź to uzasadnia
- Brak możliwości przejścia bez zaznaczenia odpowiedzi
- Przycisk "Wstecz" — możliwość powrotu do poprzedniego pytania
- Pasek postępu: widoczny na każdym ekranie (np. "Pytanie 8 z 39" lub procentowy)

### 3.3 Micro-komentarze LLM
- Po kliknięciu kafelka: sprawdzenie czy dla tej odpowiedzi przewidziany jest komentarz
- Jeśli TAK: wyświetlenie dymku / notki z komentarzem + przycisk "Dalej →"
- Jeśli NIE: automatyczne przejście do następnego pytania
- Komentarze generowane przez LLM na podstawie odpowiedzi i wytycznych z `02-formularz-interaktywny.md` (sekcja "Wytyczne dla LLM — micro-komentarze")
- Ton: ekspercki, bez oceniania, 1–2 zdania

### 3.4 Formularz kontaktowy
- Pola:
  - Imię i nazwisko (wymagane)
  - Adres e-mail (wymagane, z walidacją formatu)
  - URL sklepu internetowego (opcjonalne)
- Przycisk: "Wygeneruj mój raport"
- Nie można pominąć — raport generowany dopiero po podaniu danych

### 3.5 Generowanie raportu
- Po wypełnieniu formularza: ekran ładowania (~2–4 sek.) z animacją
- LLM generuje raport na podstawie wszystkich zebranych odpowiedzi
- Format raportu: tekst (nie PDF, nie prezentacja)
- Struktura raportu:
  - **Część A** — Profil sklepu: 2–3 zdania na podstawie P1.x
  - **Część B** — Mapa obszarów: każda z 6 kategorii otrzymuje ocenę 🔴 / 🟡 / 🟢
  - **Część C** — Top 3 priorytety: narracyjny opis 3 kluczowych obszarów do poprawy
- Wytyczne dla LLM do generowania raportu: patrz `02-formularz-interaktywny.md` (sekcja "Raport końcowy — wytyczne dla LLM")

### 3.6 CTA i umawianie spotkań
- Po raporcie — dwa przyciski:
  - **"Umów bezpłatną konsultację"** → link lub embed Calendly (do podania przy wdrożeniu)
  - **"Wyślij raport na e-mail"** → trigger wysyłki raportu na podany wcześniej adres
- Raport wysyłany jako tekst w treści e-maila (nie załącznik)

---

## 4. Architektura danych i integracje

### 4.1 Przepływ danych po wypełnieniu formularza

```
Aplikacja (frontend)
        │
        │  POST webhook
        ▼
    n8n (webhook endpoint)
        │
        ├──→ Airtable / Google Sheets
        │    (wszystkie odpowiedzi + dane kontaktowe + timestamp)
        │
        ├──→ System mailingowy
        │    (dodanie do listy + trigger sekwencji follow-up)
        │
        ├──→ Powiadomienie dla Tomasza
        │    (e-mail lub Slack: imię, URL sklepu, główne luki z raportu)
        │
        └──→ Trigger wysyłki raportu
             (tekst raportu wysyłany na e-mail użytkownika)
```

### 4.2 Struktura danych wysyłanych webhookiem

```json
{
  "timestamp": "2025-03-07T10:30:00",
  "contact": {
    "name": "Jan Kowalski",
    "email": "jan@sklep.pl",
    "website": "https://sklep.pl"
  },
  "answers": {
    "P1_1_budzet": "10000-30000",
    "P1_2_aov": "300-800",
    "P1_3_sku": "50-500",
    "P1_4_czestotliwosc": "co_kilka_miesiecy",
    "P1_4a_ltv": "nie_mierzę",
    "P1_5_cac": "nie_liczę",
    "P1_6_problem": "skalowanie",
    "P2_1_api_konwersji": "nie",
    "P2_2_server_side": "nie_wiem",
    ...
  },
  "report": {
    "profile": "Tekst części A...",
    "areas": {
      "pomiar": "red",
      "feed": "red",
      "rentownosc": "yellow",
      "automatyzacje": "yellow",
      "oferta": "green",
      "strategia": "yellow"
    },
    "priorities": "Tekst części C..."
  }
}
```

### 4.3 Integracje zewnętrzne
- **n8n:** webhook do obsługi przepływu danych (URL do skonfigurowania przy wdrożeniu)
- **Calendly:** link lub embed do umawiania konsultacji (URL do podania)
- **System mailingowy:** do ustalenia (Mailchimp / ActiveCampaign / inne) — podłączenie przez n8n
- **LLM API:** Claude API (Anthropic) — do generowania micro-komentarzy i raportu

---

## 5. Wymagania niefunkcjonalne

### 5.1 Wydajność
- Czas ładowania aplikacji: < 2 sek.
- Czas generowania raportu (LLM): < 5 sek. (z ekranem ładowania)
- Aplikacja działa bez odświeżania strony (SPA)

### 5.2 Responsywność
- **Mobile first** — projekt zaczyna się od widoku telefonu
- Kafelki: minimum 48px wysokości, wygodne do klikania kciukiem
- Działa na: iOS Safari, Android Chrome, desktop Chrome/Firefox/Safari

### 5.3 Dostępność
- Wyraźny kontrast kolorów
- Czytelna typografia (minimum 16px dla treści)
- Stany fokusa widoczne dla nawigacji klawiaturą

---

## 6. UX i design

### 6.1 Styl wizualny
- Profesjonalny, minimalistyczny, zaufanie > kreatywność
- Kolory i typografia: do ustalenia zgodnie z marką Tomasza (do podania przy wdrożeniu)
- Ikonki kategorii przy pytaniach (np. wykres dla rentowności, koszyk dla oferty, antena dla trackingu)

### 6.2 Animacje i micro-interakcje
- Przejście między pytaniami: slide lub fade (subtelne, ~200ms)
- Zaznaczony kafelek: wyraźna zmiana stanu (kolor, obramowanie, checkmark)
- Micro-animacje tematyczne: np. przejeżdżający koszyk zakupowy na ekranie ładowania
- Micro-komentarz: pojawia się z animacją (fade-in z dołu lub z boku)
- Raport: sekcje pojawiają się kolejno (staggered animation)

### 6.3 Ekran raportu
- Nie ściana tekstu — wizualna hierarchia
- Mapa obszarów: kolorowe kafelki / tagi (🔴🟡🟢) dla każdej kategorii
- Top 3 priorytety: wyraźnie oddzielone sekcje z ikonkami
- Raport powinien wyglądać jak profesjonalny dokument, nie jak odpowiedź chatbota

---

## 7. Stack technologiczny (propozycja do omówienia przy vibe codingu)

| Warstwa | Technologia | Uzasadnienie |
|---------|-------------|--------------|
| Frontend | React (Vite) | Komponentowy, łatwa obsługa stanu quizu |
| Styling | Tailwind CSS | Szybkie prototypowanie, mobile-first |
| LLM | Claude API (Anthropic) | Micro-komentarze i raport |
| Hosting | Vercel lub Netlify | Darmowy tier, CI/CD z GitHub |
| Dane | Webhook → n8n | Elastyczna obsługa przepływu danych |
| Spotkania | Calendly | Embed lub link |
| Email | Przez n8n → system mailingowy | Do ustalenia |

---

## 8. Fazy realizacji

| Faza | Zakres | Status |
|------|--------|--------|
| 1 | Specyfikacja pytań, logiki i LLM (ten dokument) | ✅ Gotowe |
| 2 | Sesja vibe codingu — scaffold aplikacji, quiz bez LLM | ⏳ Do zrobienia |
| 3 | Integracja LLM — micro-komentarze | ⏳ Do zrobienia |
| 4 | Integracja LLM — generowanie raportu | ⏳ Do zrobienia |
| 5 | Webhook n8n + integracje (email, Calendly) | ⏳ Do zrobienia |
| 6 | Testy, poprawki UX, osadzenie na LP | ⏳ Do zrobienia |

---

## 9. Otwarte decyzje (do podjęcia przy vibe codingu)

- [ ] Kolory i typografia marki Tomasza
- [ ] URL Calendly do konsultacji
- [ ] System mailingowy (Mailchimp / ActiveCampaign / inne)
- [ ] URL endpointu n8n (webhook)
- [ ] Klucz API Claude (Anthropic)
- [ ] Hosting: Vercel vs Netlify vs własny serwer
- [ ] Czy aplikacja jest osadzona jako iframe w LP, czy jako osobna podstrona / subdomena
- [ ] Język raportu: zawsze po polsku, czy wykrywany automatycznie

---

## 10. Pliki referencyjne

| Plik | Zawartość |
|------|-----------|
| `02-formularz-interaktywny.md` | Pełna lista pytań z kafelkami, logika rozgałęzień, wytyczne LLM dla micro-komentarzy i raportu |
| `01-skrypt-wideo.md` | Ton i narracja Tomasza — pomocne przy kalibracji tonu LLM |
| `04-LP-struktura-i-teksty.md` | Kontekst LP — gdzie aplikacja jest osadzona i jaki ma cel w całej ścieżce |

---

## 11. Ryzyka i mitigacje

| Obszar | Ryzyko | Prawdopodobieństwo | Wpływ | Mitigacja (co robimy) | Właściciel |
|--------|--------|--------------------|-------|------------------------|------------|
| Dane osobowe / RODO | Niepełna zgodność z RODO (brak podstawy prawnej, retencji, obsługi usunięcia danych) | Średnie | Wysoki | Dodać checkbox zgody + link do polityki prywatności, zdefiniować retencję (np. 12 miesięcy), przygotować proces usunięcia danych, potwierdzić DPA z dostawcami | Tomasz + wdrożenie |
| Niezawodność integracji | Awaria jednego elementu flow (`n8n`, LLM, mailing) zatrzymuje całość | Średnie | Wysoki | Timeouty, retry z backoff, kolejka błędów (dead-letter), idempotency key dla webhooków, fallback komunikatu dla użytkownika | Wdrożenie |
| LLM koszt i stabilność | Wysoki koszt tokenów lub niestabilny czas odpowiedzi | Średnie | Wysoki | Limity długości promptu i raportu, cache wyników, monitoring kosztu per lead, fallback skróconego raportu przy timeout | Wdrożenie |
| Jakość raportu | Raporty niespójne lub zbyt ogólne (brak zaufania użytkownika) | Średnie | Wysoki | Jawna macierz scoringu odpowiedzi, szablon raportu, walidacja długości/tonu, testy na min. 20 scenariuszach odpowiedzi | Tomasz + wdrożenie |
| Kontrakt danych | Zmiany w payloadzie łamią automatyzacje downstream | Średnie | Średni | Wersjonowanie schemy (`schema_version`), walidacja JSON Schema na wejściu, logowanie błędów mapowania | Wdrożenie |
| Antyspam / abuse | Boty generują leady i koszty LLM | Średnie | Średni | Honeypot + rate limiting + CAPTCHA, blokada wielokrotnych żądań z jednego IP/e-maila | Wdrożenie |
| UX / drop-off | Użytkownik porzuca quiz na mobile | Wysokie | Średni | Autozapis postępu, prosty pasek postępu, skrócenie mikrocopy, analiza miejsc porzucenia i iteracje co 2 tygodnie | Tomasz + UX |
| Dostarczalność e-mail | Raport nie dociera (SPF/DKIM/DMARC, spam folder) | Średnie | Średni | Konfiguracja domeny nadawczej, monitor bounce rate, opcja ponownej wysyłki raportu | Wdrożenie |
| Vendor lock-in | Zależność od jednego dostawcy LLM/mailingu | Niskie | Średni | Warstwa adaptera dla LLM i mailingu, trzymanie promptów i szablonów poza kodem aplikacji | Wdrożenie |
| Brak telemetry | Brak danych o konwersji i jakości leadów | Średnie | Wysoki | Event tracking (`quiz_start`, `question_answered`, `form_submitted`, `report_generated`, `cta_clicked`) + dashboard KPI | Tomasz + wdrożenie |

### 11.1 Kryteria gotowości do startu (Go-Live Checklist)

- [ ] Zdefiniowana i opublikowana polityka prywatności + zgody formularza
- [ ] Skonfigurowany i przetestowany webhook `n8n` (happy path + błędy)
- [ ] Potwierdzona schema payloadu `v1` + walidacja wejścia
- [ ] Skonfigurowane logowanie i alerty (błędy LLM, błędy webhook, bounce e-mail)
- [ ] Wdrożone zabezpieczenia antyspam (rate limit, honeypot/CAPTCHA)
- [ ] Przetestowane min. 20 scenariuszy raportu i micro-komentarzy
- [ ] Podłączony Calendly + przetestowane CTA po raporcie
- [ ] Skonfigurowane eventy analityczne i dashboard KPI

### 11.2 KPI i progi alarmowe po starcie

- **Completion rate quizu:** cel >= 45%, alert < 30%
- **Czas generowania raportu:** cel <= 5 s (p95 <= 8 s), alert p95 > 10 s
- **CTR CTA "Umów konsultację":** cel >= 8%, alert < 4%
- **Skuteczność wysyłki raportu e-mail:** cel >= 98% dostarczeń, alert < 95%
- **Koszt LLM na 1 lead:** cel i limit do ustalenia przed startem (wymagany monitoring od dnia 1)

---

## 12. Plan pracy (operacyjny)

### 12.1 Założenia planu

- Czas realizacji MVP: **3 tygodnie**
- Zespół minimalny: **1 dev + Tomasz (biznes/treść)**
- Priorytet: najpierw działający end-to-end flow, potem polish UX

### 12.2 Plan tygodniowy

| Tydzień | Cel | Zakres prac | Deliverable | Kryterium zakończenia |
|---------|-----|-------------|-------------|------------------------|
| 1 | Fundament aplikacji | Scaffold frontendu, routing ekranów, stan quizu, logika pytań/rozgałęzień, walidacja formularza kontaktowego | Działający quiz bez LLM i bez integracji | Użytkownik przechodzi cały flow od startu do ekranu "raport placeholder" na mobile i desktop |
| 2 | Inteligencja i dane | Integracja LLM (micro-komentarze + raport), kontrakt webhook `v1`, zapis danych do `n8n`, obsługa błędów i retry | End-to-end: odpowiedzi -> raport -> payload do `n8n` | Raport generuje się poprawnie w >= 90% testowych scenariuszy, webhook odbiera dane zgodnie ze schemą |
| 3 | Konwersja i go-live | CTA z Calendly, wysyłka raportu e-mail, tracking eventów, antyspam, testy E2E, poprawki UX | Wersja produkcyjna gotowa do osadzenia na LP | Spełniona checklista z sekcji 11.1 + brak blockerów w testach krytycznych |

### 12.3 Plan zadań (kolejność wykonania)

1. **Decyzje blokujące (D0)**  
   Domknąć: Calendly URL, mailing provider, endpoint `n8n`, politykę prywatności i zgody.

2. **Frontend MVP (D1-D4)**  
   Zbudować ekrany: welcome, quiz, kontakt, loading, raport; dodać pasek postępu i przycisk "Wstecz".

3. **Silnik quizu i scoring (D3-D6)**  
   Zaimplementować logikę rozgałęzień oraz jawne mapowanie odpowiedzi do kategorii (pod mapę 🔴🟡🟢).

4. **LLM: micro-komentarze (D5-D7)**  
   Integracja promptu dla krótkich komentarzy, limity długości i fallback przy timeout.

5. **LLM: raport końcowy (D6-D8)**  
   Integracja struktury A/B/C, walidacja formatu odpowiedzi i fallback "raport skrócony".

6. **Integracja `n8n` i mailing (D7-D10)**  
   Wysyłka pełnego payloadu, wersjonowanie `schema_version`, retry i logowanie błędów.

7. **Analityka i antyspam (D9-D11)**  
   Eventy KPI + rate limit + honeypot/CAPTCHA.

8. **QA i optymalizacja konwersji (D11-D14)**  
   Testy E2E, poprawki copy/micro-interakcji, finalne dopięcie CTA.

### 12.4 Definicja "Done" dla MVP

- [ ] Użytkownik może przejść pełen quiz bez błędów na mobile i desktop
- [ ] Raport A/B/C generuje się i renderuje poprawnie
- [ ] Payload `v1` jest poprawnie zapisany po stronie `n8n`
- [ ] E-mail z raportem dochodzi do użytkownika
- [ ] CTA do Calendly działa i jest mierzone analitycznie
- [ ] Zaimplementowane podstawowe zabezpieczenia antyspam
- [ ] Spełnione minimalne KPI techniczne (czas, dostarczalność, stabilność)

### 12.5 Rytm pracy i przeglądy

- **Daily (15 min):** status, blokery, priorytet dnia
- **Review tygodniowe (45 min):** demo postępu + decyzje produktowe
- **Checkpoint jakości (koniec tyg. 2):** decyzja "go/no-go" dla startu tygodnia 3

### 12.6 Backlog po MVP (faza 2)

- Personalizacja raportu pod branżę sklepu
- Wersja angielska i automatyczny wybór języka
- Panel admin do podglądu leadów i jakości raportów
- A/B testy ekranu startowego i CTA po raporcie
