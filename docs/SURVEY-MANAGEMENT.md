# System zarządzania ankietami (Menedżer Ankiet)

Dokument dla przyszłych osób/agentów. Opisuje **dodatkowy** panel do tworzenia i zarządzania
wieloma ankietami, dobudowany **na wierzchu** istniejącej aplikacji — bez zmiany działającej
ankiety „Ocena pracownika: Krzysztof Wieczorek" i jej panelu.

## Zasada nadrzędna

- **Istniejąca ankieta 360° pozostaje nietknięta 1:1.** Renderują ją oryginalne komponenty:
  `SurveyFillView`, `ReportDashboard`, `TokenManager`, `AdminLoginView` + `src/data/surveyQuestions.ts`.
  Jej dane żyją w top‑levelowych `tokens` / `responses` w `data/survey-store.json` i w istniejących
  endpointach `/api/tokens`, `/api/responses`.
- **Nowe ankiety** są w pełni konfigurowalne i żyją w tablicy `surveys[]` w tym samym magazynie,
  obsługiwane przez nowe endpointy `/api/surveys/*`. Renderują je nowe komponenty w
  `src/components/custom/`.

## Jak wejść

Po zalogowaniu do Panelu Organizatora (hasło jak dotychczas, np. `kubara`) w nagłówku pojawia się
przycisk **„Menedżer Ankiet"**. Otwiera listę wszystkich ankiet:

- „Główna ankieta" (built‑in) → otwiera dotychczasowy panel (Kody i Linki + Raport 4 Filarów) 1:1.
- Ankiety utworzone przez użytkownika → własny panel (Kody i Linki + Raport & Odpowiedzi).
- „Nowa ankieta" → kreator (builder).

## Typy pytań w nowych ankietach

| Typ | Opis |
| --- | --- |
| `section` | Nagłówek/sekcja grupująca pytania. |
| `slider` | Skala o **dowolnym zakresie** (np. 1–3, 1–5, 1–10) z etykietami krańców. |
| `single_choice` | Wybór jednokrotny. |
| `multi_choice` | Wybór wielokrotny. |
| `yes_no` | Tak / Nie. |
| `yes_no_dontknow` | Tak / Nie / Nie wiem. |
| `text` | Odpowiedź otwarta. |

Każde pytanie: `required` (wymagane) oraz opcjonalnie `allowComment` (komentarz).

## Wypełnianie (bez logowania)

Publiczny link do nowej ankiety: `/{?}survey=<slug>` (opcjonalnie `&token=<kod>`).
Respondent nie loguje się i nie widzi wejścia do panelu.

## Zarządzanie odpowiedziami

W panelu nowej ankiety (zakładka „Raport & Odpowiedzi"):
- podsumowanie na żywo (średnie dla suwaków, zliczenia dla wyborów, lista odpowiedzi tekstowych),
- lista wszystkich nadesłanych ankiet z akcjami **„Nie uwzględniaj (Test)" / „Przywróć"** oraz
  **usuń** (usunięcie odblokowuje powiązany kod).

## Endpointy (backend `server.ts`)

```
GET    /api/surveys                       # lista (built-in + custom)
POST   /api/surveys                       # utwórz ankietę
GET    /api/surveys/:id                   # pełna definicja (panel)
GET    /api/surveys/:id/public            # definicja do wypełniania (tylko aktywne)
PUT    /api/surveys/:id                   # aktualizacja (meta + pytania)
DELETE /api/surveys/:id
GET/POST   /api/surveys/:id/tokens        # kody dostępu
DELETE     /api/surveys/:id/tokens/:tid
GET/POST   /api/surveys/:id/responses     # odczyt / zapis (publiczny submit)
DELETE     /api/surveys/:id/responses/:rid
PATCH      /api/surveys/:id/responses/:rid/exclude   # wyklucz/przywróć
```

## Pliki

- Backend: `server.ts` (sekcja „Custom Surveys API").
- Frontend:
  - `src/customTypes.ts`, `src/customApi.ts`
  - `src/components/custom/SurveyManager.tsx` — lista ankiet
  - `src/components/custom/SurveyBuilder.tsx` — kreator/edytor
  - `src/components/custom/CustomSurveyAdmin.tsx` — panel ankiety (kody + raport + odpowiedzi)
  - `src/components/custom/CustomSurveyFill.tsx` — publiczne wypełnianie
  - `src/components/custom/CustomGestureSlider.tsx` — suwak o dowolnym zakresie
- Wpięcie do panelu: `src/App.tsx` (przycisk „Menedżer Ankiet" + widoki `panelView`).

## Uwaga o hostingu

Aplikacja działa na Node (`server.ts`, Express) — tak jak dotychczas. Uruchomienie: `bun run dev`
(dev) lub `bun run build && bun run start` (produkcja). Magazyn danych: plik `data/survey-store.json`.
