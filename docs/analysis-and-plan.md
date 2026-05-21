# Analisi Excel e proposta web app

## 1) Struttura database proposta
Le immagini mostrano fogli separati per stati (`MODEM GIACENTI`, `MODEM INSTALLATI`, `MODEM DA RICONSEGNARE`, `MODEM RICONSEGNATI`) e una panoramica pivot per modello/SAP/tecnico. Per evitare duplicazioni, nel DB si mantiene **un solo record modem** con stato corrente + tabella movimenti storici.

Tabelle chiave:
- `user_profiles`: utente applicativo con ruolo (`admin`, `magazzino`, `tecnico`, `readonly`).
- `technicians`: anagrafica tecnici.
- `modem_models`: master modelli/SAP/gestore (inclusi i codici forniti).
- `modems`: seriali univoci, stato corrente, tecnico assegnato, note, account.
- `modem_movements`: storico transizioni con data, utente, tecnico, stato precedente/nuovo.

Regole:
- `modems.serial` univoco per bloccare duplicati.
- aggiornamento stato solo tramite movimento (audit trail completo).
- RLS su tutte le tabelle (policy da aggiungere nello step sicurezza).

## 2) Schermate web app
1. **Login** (Supabase Auth: email/password).
2. **Dashboard**: KPI per stato, tecnico, modello, SAP; widget “da ordinare”.
3. **Seriali / Magazzino**:
   - inserimento manuale seriale
   - scansione barcode/QR con camera smartphone
   - validazione duplicati realtime
   - filtri per stato/tecnico/modello/SAP
4. **Movimenti**:
   - wizard di cambio stato
   - storico con ricerca e export
5. **Anagrafiche**:
   - tecnici
   - modelli modem (SAP, modello, gestore)
6. **Import/Export**:
   - import iniziale Excel
   - export CSV/Excel
7. **Admin**:
   - ruoli utenti
   - log attività

## 3) Flusso operativo
1. Admin crea utenti e ruoli.
2. Magazzino importa anagrafiche modelli/SAP e tecnici.
3. Import iniziale seriali da Excel nei vari stati.
4. Operatività giornaliera:
   - ricezione modem -> stato `giacente`
   - assegnazione a tecnico -> `assegnato`
   - chiusura intervento -> `installato`
   - rientro -> `da_riconsegnare`/`riconsegnato`
   - KO -> `guasto` o `scaricato`
5. Dashboard e export per controllo stock e acquisti.

## 4) Piano sviluppo step-by-step
1. **Setup base**: React/Vite + routing + layout responsive (fatto).
2. **DB migration**: schema PostgreSQL/Supabase + enum stati/ruoli (fatto).
3. **Auth e ruoli**: login, guard rotte, policy RLS.
4. **CRUD anagrafiche**: tecnici + modelli SAP.
5. **CRUD seriali**: inserimento manuale, controllo duplicati, assegnazione tecnico.
6. **Scanner mobile**: integrazione `@zxing/browser` con fallback input manuale.
7. **Motore movimenti**: transizioni stato + storico completo.
8. **Dashboard analytics**: aggregazioni per tecnico/modello/SAP/stato.
9. **Import Excel iniziale**: parser xlsx + mappatura fogli/stati + deduplica.
10. **Export CSV/XLSX**: dataset filtrati + snapshot dashboard.
11. **QA/UAT**: test ruoli, performance mobile, backup.
12. **Deploy**: Vercel/Netlify + Supabase, monitoraggio errori.

## 5) Note mappatura SAP iniziale
Nel seeding di `modem_models` inserire i SAP condivisi nel brief (es. `100455 NEXXT IAD FW`, `VDF5 VDF Wifi 5`, `VX830V WIND`, `600013 TECHNICOLOR DGM434BFWB5 WIFI7`).
