import { FormEvent, useEffect, useState } from 'react';
import { defaultSapCatalog, Role, SapItem, seededUsers, UserRow } from '../data';

const roles: Role[] = ['Admin', 'Magazzino', 'Tecnico', 'Sola lettura'];

export function SetupPage() {
  const [users, setUsers] = useState<UserRow[]>(seededUsers);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<Role>('Tecnico');

  const [sapCatalog, setSapCatalog] = useState<SapItem[]>(defaultSapCatalog);
  const [sapCode, setSapCode] = useState('');
  const [modelName, setModelName] = useState('');
  const [provider, setProvider] = useState('FW');

  useEffect(() => {
    const storedUsers = localStorage.getItem('users_registry');
    const storedSap = localStorage.getItem('sap_catalog');
    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedSap) setSapCatalog(JSON.parse(storedSap));
  }, []);

  const persistUsers = (next: UserRow[]) => {
    setUsers(next);
    localStorage.setItem('users_registry', JSON.stringify(next));
  };

  const addUser = (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;
    persistUsers([...users, { id: Date.now(), firstName: firstName.trim(), lastName: lastName.trim(), role }]);
    setFirstName(''); setLastName(''); setRole('Tecnico');
  };

  const updateUser = (id: number, patch: Partial<UserRow>) => {
    const next = users.map((u) => (u.id === id ? { ...u, ...patch } : u));
    persistUsers(next);
  };

  const removeUser = (id: number) => persistUsers(users.filter((u) => u.id !== id));

  const addSap = (event: FormEvent) => {
    event.preventDefault();
    if (!sapCode.trim() || !modelName.trim()) return;
    const next = [...sapCatalog, { id: Date.now(), sapCode: sapCode.trim(), modelName: modelName.trim(), provider: provider.trim() }];
    setSapCatalog(next);
    localStorage.setItem('sap_catalog', JSON.stringify(next));
    setSapCode(''); setModelName(''); setProvider('FW');
  };

  const removeSap = (id: number) => {
    const next = sapCatalog.filter((item) => item.id !== id);
    setSapCatalog(next);
    localStorage.setItem('sap_catalog', JSON.stringify(next));
  };


  return (
    <section>
      <h2>Setup progetto</h2>
      <ol>
        <li>Creare progetto Supabase e impostare variabili VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.</li>
        <li>Eseguire la migration SQL in supabase/migrations/001_initial.sql.</li>
        <li>Importare i dati Excel tramite script ETL (step documentato in docs/analysis-and-plan.md).</li>
      </ol>

      <h3>Utenze (aggiungi / modifica / elimina)</h3>
      <form className="users-form" onSubmit={addUser}>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nome" />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Cognome" />
        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>{roles.map((r) => <option key={r} value={r}>{r}</option>)}</select>
        <button type="submit">Registra utente</button>
      </form>
      <table className="compact-table with-separators">
        <thead><tr><th>Nome</th><th>Cognome</th><th>Mansione</th><th>Azioni</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td><input value={u.firstName} onChange={(e) => updateUser(u.id, { firstName: e.target.value })} /></td>
              <td><input value={u.lastName} onChange={(e) => updateUser(u.id, { lastName: e.target.value })} /></td>
              <td><select value={u.role} onChange={(e) => updateUser(u.id, { role: e.target.value as Role })}>{roles.map((r) => <option key={r} value={r}>{r}</option>)}</select></td>
              <td><button type="button" className="icon-btn danger" onClick={() => removeUser(u.id)}>Elimina</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Codici SAP / Modelli</h3>
      <form className="sap-form" onSubmit={addSap}>
        <input value={sapCode} onChange={(e) => setSapCode(e.target.value)} placeholder="Codice SAP" />
        <input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="Descrizione modem" />
        <input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Gestore" />
        <button type="submit">Aggiungi codice</button>
      </form>
      <table className="compact-table with-separators">
        <thead><tr><th>SAP</th><th>Descrizione</th><th>Gestore</th><th>Azione</th></tr></thead>
        <tbody>
          {sapCatalog.map((item) => (
            <tr key={item.id}><td>{item.sapCode}</td><td>{item.modelName}</td><td>{item.provider}</td><td><button type="button" className="icon-btn danger" onClick={() => removeSap(item.id)}>Rimuovi</button></td></tr>
          ))}
        </tbody>
      </table>

    </section>
  );
}
