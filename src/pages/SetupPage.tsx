import { FormEvent, useState } from 'react';
import { Role, seededUsers, UserRow } from '../data';

const roles: Role[] = ['Admin', 'Magazzino', 'Tecnico', 'Sola lettura'];

export function SetupPage() {
  const [users, setUsers] = useState<UserRow[]>(seededUsers);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<Role>('Tecnico');

  const addUser = (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setUsers((prev) => [
      ...prev,
      { id: Date.now(), firstName: firstName.trim(), lastName: lastName.trim(), role }
    ]);
    setFirstName('');
    setLastName('');
    setRole('Tecnico');
  };

  return (
    <section>
      <h2>Setup progetto</h2>
      <ol>
        <li>Creare progetto Supabase e impostare variabili VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</li>
        <li>Eseguire la migration SQL in supabase/migrations/001_initial.sql.</li>
        <li>Importare i dati Excel tramite script ETL (step documentato in docs/analysis-and-plan.md).</li>
      </ol>

      <h3>Utenti</h3>
      <form className="users-form" onSubmit={addUser}>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nome" />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Cognome" />
        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button type="submit">Registra utente</button>
      </form>

      <table className="compact-table with-separators">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Mansione</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.firstName}</td>
              <td>{u.lastName}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
