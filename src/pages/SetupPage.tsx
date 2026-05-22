import { FormEvent, useEffect, useState } from 'react';
import { defaultSapCatalog, JobRole, SapItem, seededUsers, UserRow } from '../data';

const roles: JobRole[] = ['Tecnico', 'Assistente', 'Magazziniere', 'Admin'];

export function SetupPage() {
  const [users, setUsers] = useState<UserRow[]>(seededUsers);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobRole, setJobRole] = useState<JobRole>('Tecnico');
  const [sapCatalog, setSapCatalog] = useState<SapItem[]>(defaultSapCatalog);
  const [sapCode, setSapCode] = useState('');
  const [modelName, setModelName] = useState('');
  const [provider, setProvider] = useState('FW');

  useEffect(() => { const u=localStorage.getItem('users_registry'); const s=localStorage.getItem('sap_catalog'); if(u) setUsers(JSON.parse(u)); if(s) setSapCatalog(JSON.parse(s)); }, []);
  const persistUsers=(next:UserRow[])=>{setUsers(next); localStorage.setItem('users_registry',JSON.stringify(next));};
  const addUser=(e:FormEvent)=>{e.preventDefault(); if(!firstName||!lastName) return; persistUsers([...users,{id:Date.now(),firstName,lastName,role: jobRole==='Admin'?'Admin':'Tecnico',jobRole}]); setFirstName('');setLastName('');setJobRole('Tecnico');};
  const updateUser=(id:number,patch:Partial<UserRow>)=>{const c=users.find(u=>u.id===id); if(!c||c.locked) return; persistUsers(users.map(u=>u.id===id?{...u,...patch}:u));};
  const removeUser=(id:number)=>{const c=users.find(u=>u.id===id); if(!c||c.locked) return; persistUsers(users.filter(u=>u.id!==id));};
  const addSap=(e:FormEvent)=>{e.preventDefault(); if(!sapCode||!modelName) return; const next=[...sapCatalog,{id:Date.now(),sapCode,modelName,provider}]; setSapCatalog(next); localStorage.setItem('sap_catalog',JSON.stringify(next)); setSapCode('');setModelName('');setProvider('FW');};

  return <section><h2>Setup progetto</h2><h3>Utenze (aggiungi / modifica / elimina)</h3>
  <form className='users-form' onSubmit={addUser}><input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder='Nome'/><input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder='Cognome'/><select value={jobRole} onChange={e=>setJobRole(e.target.value as JobRole)}>{roles.map(r=><option key={r}>{r}</option>)}</select><button type='submit'>Registra utente</button></form>
  <table className='compact-table with-separators'><thead><tr><th>Nome</th><th>Cognome</th><th>Mansione</th><th>Azioni</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><input disabled={u.locked} value={u.firstName} onChange={e=>updateUser(u.id,{firstName:e.target.value})}/></td><td><input disabled={u.locked} value={u.lastName} onChange={e=>updateUser(u.id,{lastName:e.target.value})}/></td><td><select disabled={u.locked} value={u.jobRole ?? (u.role==='Admin'?'Admin':'Tecnico')} onChange={e=>updateUser(u.id,{jobRole:e.target.value as JobRole})}>{roles.map(r=><option key={r}>{r}</option>)}</select></td><td>{u.locked?<span className='locked-badge'>Protetto</span>:<button type='button' className='icon-btn danger' onClick={()=>removeUser(u.id)}>Elimina</button>}</td></tr>)}</tbody></table>
  <h3>Codici SAP / Modelli</h3><form className='sap-form' onSubmit={addSap}><input value={sapCode} onChange={e=>setSapCode(e.target.value)} placeholder='Codice SAP'/><input value={modelName} onChange={e=>setModelName(e.target.value)} placeholder='Descrizione modem'/><input value={provider} onChange={e=>setProvider(e.target.value)} placeholder='Gestore'/><button type='submit'>Aggiungi codice</button></form>
  <table className='compact-table with-separators'><thead><tr><th>SAP</th><th>Descrizione</th><th>Gestore</th><th>Azione</th></tr></thead><tbody>{sapCatalog.map(item=><tr key={item.id}><td>{item.sapCode}</td><td>{item.modelName}</td><td>{item.provider}</td><td><button className='icon-btn danger' type='button' onClick={()=>{const n=sapCatalog.filter(x=>x.id!==item.id); setSapCatalog(n); localStorage.setItem('sap_catalog',JSON.stringify(n));}}>Rimuovi</button></td></tr>)}</tbody></table>
  </section>;
}
