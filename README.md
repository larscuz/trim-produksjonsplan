# TRiM Produksjonsplan (mal) – Next.js + PDF

Dette er en **nettbasert planleggingsmal** for TRiM-elever som trener på planleggingsdelen i fagprøven.
Elevene fyller inn kunde, ønsker, strategi, verktøy (Freepik), ukeplan frem til **1. juni**, locations, utstyr, risiko og leveranser.

✅ Lagrer automatisk lokalt i nettleseren (LocalStorage)  
✅ Eksporter/importer JSON (for deling mellom maskiner)  
✅ Last ned PDF (A4) fra `/preview`

## Kom i gang lokalt

```bash
npm install
npm run dev
```

Åpne: http://localhost:3000

## Deploy til Vercel

1. Push repo til GitHub
2. Import i Vercel
3. Build command: `npm run build`
4. Output: standard Next.js

## Bruk i klassen

- Elevene fyller ut alt i detalje
- Bruk ukeplanen som “produksjonslogikk” med konkrete leveranser per uke
- PDF leveres som dokumentasjon sammen med annet materiale

## Notat

Ukeplanen genereres som standard frem til **2026-06-01**. Du kan endre deadline i skjemaet, men ukeplanen re-genereres ikke automatisk (for å unngå tap av data). Hvis dere vil generere nytt sett uker: trykk **Nullstill**.
