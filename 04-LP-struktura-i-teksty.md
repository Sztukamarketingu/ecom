# Landing Page — Struktura i teksty

> **Cel strony:** Przekonać właściciela sklepu internetowego do wypełnienia quizu diagnostycznego jako pierwszego kroku do współpracy
> **Odbiorca:** Uczestnik konferencji e-commerce, właściciel/manager sklepu, budżet 10–100k PLN/mc na reklamy
> **Główna konwersja:** Wypełnienie quizu + zostawienie e-maila

---

## SEKCJA 1 — HERO

**Element główny:** Wideo (90–120 sek.) — patrz plik `01-skrypt-wideo.md`

**Nagłówek pod wideo:**
*[DO UZUPEŁNIENIA — propozycja:]*
> "Zanim znowu zwiększysz budżet reklamowy — sprawdź, czy Twój sklep jest na to gotowy."

**Podnagłówek:**
*[DO UZUPEŁNIENIA]*

**CTA:**
> Przycisk: "Zrób bezpłatną analizę swojego sklepu (2 min)" → scroll do sekcji z quizem

---

## SEKCJA 2 — PROBLEM AGITATION

**Nagłówek sekcji:**
*[DO UZUPEŁNIENIA — propozycja:]*
> "Czy brzmi Ci to znajomo?"

**Scenariusze bólu (3–4 kafelki lub krótkie paragrafy):**

- 📉 *Zwiększasz budżet, a ROAS stoi w miejscu albo spada*
  *[DO UZUPEŁNIENIA — rozwinięcie 2–3 zdania]*

- 🔀 *Meta pokazuje inne wyniki niż GA4 i nie wiesz komu ufać*
  *[DO UZUPEŁNIENIA]*

- 🎯 *Reklamy dynamiczne wyświetlają przypadkowe produkty zamiast tych, które sprzedają*
  *[DO UZUPEŁNIENIA]*

- 📦 *Sklep nie rośnie mimo dobrego produktu i rosnących wydatków*
  *[DO UZUPEŁNIENIA]*

---

## SEKCJA 3 — REFRAME / DIAGNOZA

**Nagłówek:**
*[DO UZUPEŁNIENIA — propozycja:]*
> "Kolejna reklama nie rozwiąże problemu, jeśli fundamenty są słabe."

**Treść:**
*[DO UZUPEŁNIENIA — wyjaśnienie 3 fundamentów:]*

1. **Tracking** — bez server-side algorytm nie dostaje pełnych sygnałów
2. **Feed produktowy** — bez segmentacji i optymalizacji reklamy dynamiczne działają losowo
3. **Segmentacja** — bez podziału na kategorie/marże/bestsellery budżet idzie na wszystko równo

**Element wizualny:** diagram lub ikonki pokazujące lejek: Tracking → Feed → Segmentacja → Reklamy

---

## SEKCJA 4 — QUIZ / DARMOWA ANALIZA

**Nagłówek:**
*[DO UZUPEŁNIENIA — propozycja:]*
> "Sprawdź w 2 minuty, gdzie Twój sklep traci pieniądze"

**Podnagłówek:**
*[DO UZUPEŁNIENIA]*

**Element:** Osadzona aplikacja quiz — patrz plik `02-formularz-interaktywny.md` i `03-PRD-aplikacja-quiz.md`

---

## SEKCJA 5 — JAK TO DZIAŁA

**Nagłówek:**
*[DO UZUPEŁNIENIA — propozycja:]*
> "Trzy kroki do tego, żeby Twój sklep zaczął rosnąć"

**Kroki:**

1. **Wypełniasz quiz** — 5 pytań o Twoim ekosystemie reklamowym
2. **Dostajesz analizę** — konkretne wskazówki, co warto sprawdzić i poprawić
3. **Rozmawiamy** — jeśli chcesz, umawiamy 30 minut, żeby omówić szczegóły i kolejny krok

---

## SEKCJA 6 — ZAKRES WSPÓŁPRACY

**Nagłówek:**
*[DO UZUPEŁNIENIA]*

**Warianty współpracy:**

### Jednorazowe zlecenia
- Konfiguracja server-side trackingu (GTM SS + Conversion API)
- Optymalizacja feedu produktowego + Feed Optimize
- Audyt e-commerce (analiza, raport, wskazówki)
- *[inne — DO UZUPEŁNIENIA]*

### Kompleksowa współpraca (retainer)
- Stała opieka nad ekosystemem reklamowym
- Analiza, optymalizacja, skalowanie
- *[opis — DO UZUPEŁNIENIA]*
- Cena od: *[DO UZUPEŁNIENIA]*

---

## SEKCJA 7 — DLACZEGO TO MA ZNACZENIE (edukacja)

**Nagłówek:**
*[DO UZUPEŁNIENIA]*

**Bloki edukacyjne (3 tematy):**

### Server-side tracking
*[DO UZUPEŁNIENIA — krótkie, zrozumiałe wyjaśnienie dla właściciela sklepu, nie technikaliów]*

### Feed produktowy i Feed Optimize
*[DO UZUPEŁNIENIA]*

### Segmentacja produktów w kampaniach
*[DO UZUPEŁNIENIA]*

---

## SEKCJA 8 — SPOŁECZNY DOWÓD

**Nagłówek:**
*[DO UZUPEŁNIENIA]*

**Case studies / testimoniale:**
*[DO UZUPEŁNIENIA — wyniki z konkretnych współprac, liczby]*

---

## SEKCJA 9 — O TOMASZU

**Nagłówek:**
*[DO UZUPEŁNIENIA]*

**Treść:**
*[DO UZUPEŁNIENIA — doświadczenie, specjalizacja, z jakimi sklepami pracuje, co wyróżnia podejście]*

**Zdjęcie / wideo uzupełniające:** *[opcjonalnie]*

---

## SEKCJA 10 — KOŃCOWE CTA

**Nagłówek:**
*[DO UZUPEŁNIENIA — propozycja:]*
> "Gotowy żeby sprawdzić, co hamuje Twój sklep?"

**CTA główny:** Przycisk do quizu

**CTA alternatywny:** Bezpośredni link do kalendarza dla tych, którzy chcą pominąć quiz

---

## Metadane SEO / strony

- **Title tag:** *[DO UZUPEŁNIENIA]*
- **Meta description:** *[DO UZUPEŁNIENIA]*
- **OG image (dla social media):** *[DO UZUPEŁNIENIA]*

---

## Notatki techniczne i wdrożeniowe

*[DO UZUPEŁNIENIA — na jakiej platformie będzie LP: WordPress, Webflow, własny kod HTML, inne?]*

### Snippet osadzenia aplikacji quiz (MVP)

Poniższy snippet można wkleić w sekcji 4 LP (wariant iframe na osobnej subdomenie, np. `quiz.twojadomena.pl`):

```html
<section id="quiz-diagnostyczny" style="margin: 48px 0;">
  <iframe
    src="https://quiz.twojadomena.pl"
    title="Quiz diagnostyczny e-commerce"
    width="100%"
    height="980"
    style="border:0; border-radius:16px; background:#fff;"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
  ></iframe>
</section>
```

Alternatywnie (lepsze SEO i analityka) można osadzić aplikację jako podstronę i linkować CTA do `/quiz`.

### Snippet osadzenia konsultacji (TidyCal)

W miejscach CTA konsultacji użyj osadzenia:

```html
<div class="tidycal-embed" data-path="sztukamarketingu/darmowa-sesja-doradcza"></div>
<script src="https://asset-tidycal.b-cdn.net/js/embed.js" async></script>
```
