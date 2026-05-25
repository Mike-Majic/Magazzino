import { FormEvent, useEffect, useState } from 'react';
import { defaultSapCatalog, JobRole, SapItem, seededCompanies, seededUsers, UserRow } from '../data';
import { loadTable, saveTable } from '../lib/repo';

const roles: JobRole[] = ['Tecnico', 'Assistente', 'Magazziniere', 'Admin'];

export function SetupPage() {
  const [users, setUsers] = useState<UserRow[]>(seededUsers);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobRole, setJobRole] = useState<JobRole>('Tecnico');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sapCatalog, setSapCatalog] = useState<SapItem[]>(defaultSapCatalog);
  const [sapCode, setSapCode] = useState('');
  const [modelName, setModelName] = useState('');
  const [provider, setProvider] = useState('FW');
  const [companies, setCompanies] = useState(seededCompanies);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => { (async () => { setUsers(await loadTable('users_registry','users_registry',seededUsers)); setSapCatalog(await loadTable('sap_catalog','sap_catalog',defaultSapCatalog)); setCompanies(await loadTable('companies_registry','companies_registry',seededCompanies)); })(); }, []);
  const persistUsers=(next:UserRow[])=>{setUsers(next); void saveTable('users_registry','users_registry',next);};
  const addUser=(e:FormEvent)=>{e.preventDefault(); if(!firstName||!lastName||!email||!password) return; persistUsers([...users,{id:Date.now(),firstName,lastName,email,password,role: jobRole==='Admin'?'Admin':'Tecnico',jobRole,locked:false}]); setFirstName('');setLastName('');setEmail('');setPassword('');setJobRole('Tecnico');};
  const updateUser=(id:number,patch:Partial<UserRow>)=>{const c=users.find(u=>u.id===id); if(!c||c.locked) return; persistUsers(users.map(u=>u.id===id?{...u,...patch}:u));};
  const removeUser=(id:number)=>{const c=users.find(u=>u.id===id); if(!c||c.locked) return; persistUsers(users.filter(u=>u.id!==id));};
  const resetPassword=(id:number)=>{const next=prompt('Nuova password'); if(!next) return; updateUser(id,{password:next});};
  const toggleLock=(id:number)=>{const c=users.find(u=>u.id===id); if(!c) return; persistUsers(users.map(u=>u.id===id?{...u,locked:!u.locked}:u));};
  const addSap=(e:FormEvent)=>{e.preventDefault(); if(!sapCode||!modelName) return; const next=[...sapCatalog,{id:Date.now(),sapCode,modelName,provider}]; setSapCatalog(next); void saveTable('sap_catalog','sap_catalog',next); setSapCode('');setModelName('');setProvider('FW');};
  const addCompany=(e:FormEvent)=>{e.preventDefault(); if(!companyName.trim()) return; const next=[...companies,{id:Date.now(),name:companyName.trim()}]; setCompanies(next); void saveTable('companies_registry','companies_registry',next); setCompanyName('');};
  const updateCompany=(id:number,name:string)=>{const next=companies.map(c=>c.id===id?{...c,name}:c); setCompanies(next); void saveTable('companies_registry','companies_registry',next);};
  const removeCompany=(id:number)=>{const next=companies.filter(c=>c.id!==id); setCompanies(next); void saveTable('companies_registry','companies_registry',next);};

  return <section><h2>Setup progetto</h2><h3>Utenze (aggiungi / modifica / elimina)</h3>
  <form className='users-form users-auth-form' onSubmit={addUser}><input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder='Nome'/><input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder='Cognome'/><input type='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='Email'/><input type='text' value={password} onChange={e=>setPassword(e.target.value)} placeholder='Password'/><select value={jobRole} onChange={e=>setJobRole(e.target.value as JobRole)}>{roles.map(r=><option key={r}>{r}</option>)}</select><button className='action-green' type='submit'>Registra utente</button></form>
  <div className='table-wrap'><table className='compact-table with-separators data-wide-table'><thead><tr><th>Nome</th><th>Cognome</th><th>Email</th><th>Mansione</th><th>Azioni</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><input disabled={u.locked} value={u.firstName} onChange={e=>updateUser(u.id,{firstName:e.target.value})}/></td><td><input disabled={u.locked} value={u.lastName} onChange={e=>updateUser(u.id,{lastName:e.target.value})}/></td><td><input disabled={u.locked} value={u.email ?? ''} onChange={e=>updateUser(u.id,{email:e.target.value})}/></td><td><select disabled={u.locked} value={u.jobRole ?? (u.role==='Admin'?'Admin':'Tecnico')} onChange={e=>updateUser(u.id,{jobRole:e.target.value as JobRole})}>{roles.map(r=><option key={r}>{r}</option>)}</select></td><td><button type='button' className='icon-btn' onClick={()=>resetPassword(u.id)}>Reset pwd</button><button type='button' className='icon-btn' onClick={()=>toggleLock(u.id)}>{u.locked?'Sblocca':'Blocca'}</button>{!u.locked&&<button type='button' className='icon-btn danger' onClick={()=>removeUser(u.id)}>Elimina</button>}</td></tr>)}</tbody></table></div>
  <h3>Imprese / Provenienza</h3><form className='sap-form' onSubmit={addCompany}><input value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder='Nome impresa'/><button className='action-green' type='submit'>Aggiungi impresa</button></form>
  <table className='compact-table with-separators'><thead><tr><th>Impresa</th><th>Azione</th></tr></thead><tbody>{companies.map(c=><tr key={c.id}><td><input value={c.name} onChange={e=>updateCompany(c.id,e.target.value)} /></td><td><button type='button' className='icon-btn danger' onClick={()=>removeCompany(c.id)}>Elimina</button></td></tr>)}</tbody></table>
  <h3>Codici SAP / Modelli</h3><form className='sap-form' onSubmit={addSap}><input value={sapCode} onChange={e=>setSapCode(e.target.value)} placeholder='Codice SAP'/><input value={modelName} onChange={e=>setModelName(e.target.value)} placeholder='Descrizione modem'/><input value={provider} onChange={e=>setProvider(e.target.value)} placeholder='Gestore'/><button className='action-green' type='submit'>Aggiungi codice</button></form>
  <table className='compact-table with-separators'><thead><tr><th>SAP</th><th>Descrizione</th><th>Gestore</th><th>Azione</th></tr></thead><tbody>{sapCatalog.map(item=><tr key={item.id}><td>{item.sapCode}</td><td>{item.modelName}</td><td>{item.provider}</td><td><button className='icon-btn danger' type='button' onClick={()=>{const n=sapCatalog.filter(x=>x.id!==item.id); setSapCatalog(n); void saveTable('sap_catalog','sap_catalog',n);}}>Rimuovi</button></td></tr>)}</tbody></table>
  </section>;
}
