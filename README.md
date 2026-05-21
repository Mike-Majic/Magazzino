# Magazzino Modem Web App

Bozza iniziale del gestionale web per sostituire `Giacenza modem.xlsx`.

## Stack
- React + Vite + TypeScript
- Supabase (Auth + PostgreSQL)
- ZXing Browser per scanner barcode/QR mobile

## Avvio locale
```bash
npm install
npm run dev
```

## Documenti
- Analisi funzionale e piano: `docs/analysis-and-plan.md`
- Migration DB iniziale: `supabase/migrations/001_initial.sql`

## Stato attuale
- Struttura progetto frontend con layout responsive e pagine base
- Schema database iniziale con tabelle core e enum ruoli/stati
- Pronto per step successivo: autenticazione e CRUD reali via Supabase
