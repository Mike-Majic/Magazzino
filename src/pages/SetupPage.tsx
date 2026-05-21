export function SetupPage() {
  return (
    <section>
      <h2>Setup progetto</h2>
      <ol>
        <li>Creare progetto Supabase e impostare variabili VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</li>
        <li>Eseguire la migration SQL in supabase/migrations/001_initial.sql.</li>
        <li>Importare i dati Excel tramite script ETL (step documentato in docs/analysis-and-plan.md).</li>
      </ol>
    </section>
  );
}
