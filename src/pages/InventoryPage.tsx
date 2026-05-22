import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { defaultSapCatalog, initialInventoryRows, InventoryRow, InventoryStatus, MovementRow, SapItem, seededUsers, UserRow } from '../data';

const statuses: InventoryStatus[] = ['da_assegnare', 'assegnato', 'installato', 'da_riconsegnare', 'riconsegnato', 'denunciato'];
const labels: Record<InventoryStatus, string> = { da_assegnare: 'Da assegnare', assegnato: 'Assegnato', installato: 'Installato', da_riconsegnare: 'Da riconsegnare', riconsegnato: 'Riconsegnato', denunciato: 'Denunciato' };

export function InventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>(initialInventoryRows);
  const [users, setUsers] = useState<UserRow[]>(seededUsers);
  const [sapCatalog, setSapCatalog] = useState<SapItem[]>(defaultSapCatalog);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [newRow, setNewRow] = useState<Omit<InventoryRow, 'id'>>({ serial: '', model: '', sap: '', status: 'da_assegnare', assignedTo: '-', notes: '', createdAt: new Date().toISOString().slice(0, 10) });
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const pendingEdit = useRef<{id:number; field:keyof InventoryRow; value:string} | null>(null);

  useEffect(() => {
    const inv = localStorage.getItem('inventory_rows');
    const usr = localStorage.getItem('users_registry');
    const sap = localStorage.getItem('sap_catalog');
    const mov = localStorage.getItem('movements_log');
    if (inv) setRows(JSON.parse(inv));
    if (usr) setUsers(JSON.parse(usr));
    if (sap) setSapCatalog(JSON.parse(sap));
    if (mov) setMovements(JSON.parse(mov));
  }, []);

  const persistRows=(next:InventoryRow[])=>{ setRows(next); localStorage.setItem('inventory_rows', JSON.stringify(next)); };
  const logMovement=(row:InventoryRow,action:string)=>{ const d=new Date(); const entry:MovementRow={id:Date.now(),date:d.toLocaleDateString('it-IT'),time:d.toLocaleTimeString('it-IT'),user:'operatore',serial:row.serial,action,technician:row.assignedTo,notes:row.notes,attachmentName:row.attachmentName,attachmentUrl:row.attachmentUrl}; const next=[entry,...movements]; setMovements(next); localStorage.setItem('movements_log', JSON.stringify(next)); };

  const visible = useMemo(()=> rows.filter(r=>['da_assegnare','assegnato'].includes(r.status)).filter(r=>{
    const k=search.toLowerCase();
    const keyOk=!k || [r.serial,r.model,r.sap,r.notes,r.assignedTo,labels[r.status]].join(' ').toLowerCase().includes(k);
    const fromOk=!fromDate || r.createdAt>=fromDate;
    const toOk=!toDate || r.createdAt<=toDate;
    return keyOk && fromOk && toOk;
  }),[rows,search,fromDate,toDate]);

  const onBlurConfirm=(id:number, field:keyof InventoryRow, value:string)=>{ const curr=rows.find(r=>r.id===id); if(!curr||String(curr[field])===value) return; pendingEdit.current={id,field,value}; if(window.confirm('Applicare la modifica?')){ const updated={...curr,[field]:value}; const next=rows.map(r=>r.id===id?updated:r); persistRows(next); logMovement(updated,`Modifica ${String(field)}`);} pendingEdit.current=null; };

  const exportCsv=(list:InventoryRow[],name:string)=>{ const head='seriale,modello,sap,stato,assegnato,note,data\n'; const body=list.map(r=>`${r.serial},${r.model},${r.sap},${labels[r.status]},${r.assignedTo},${r.notes},${r.createdAt}`).join('\n'); const blob=new Blob([head+body],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); };

  const register=(e:FormEvent)=>{e.preventDefault(); if(!newRow.serial) return; const row={...newRow,id:Date.now()}; const next=[row,...rows]; persistRows(next); logMovement(row,'Registrazione modem'); setNewRow({...newRow,serial:'',model:'',sap:'',notes:''});};

  return <section><h2>Seriali modem (da assegnare / assegnati)</h2>
    <form className='new-modem-form' onSubmit={register}><input value={newRow.serial} onChange={e=>setNewRow({...newRow,serial:e.target.value})} placeholder='Seriale'/><input value={newRow.model} onChange={e=>setNewRow({...newRow,model:e.target.value})} placeholder='Descrizione modem'/><input value={newRow.sap} onChange={e=>{const sap=e.target.value; const f=sapCatalog.find(s=>s.sapCode===sap); setNewRow({...newRow,sap,model:f?f.modelName:newRow.model});}} placeholder='SAP'/><select value={newRow.status} onChange={e=>setNewRow({...newRow,status:e.target.value as InventoryStatus})}>{statuses.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select><select value={newRow.assignedTo} onChange={e=>setNewRow({...newRow,assignedTo:e.target.value})}><option value='-'>-</option>{users.map(u=><option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>)}</select><input value={newRow.notes} onChange={e=>setNewRow({...newRow,notes:e.target.value})} placeholder='Note'/><button type='submit'>Registra modem</button></form>
    <div className='filters-row modern-filters'><input className='search-input' value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cerca...' /><input type='date' className='modern-input' value={fromDate} onChange={e=>setFromDate(e.target.value)}/><input type='date' className='modern-input' value={toDate} onChange={e=>setToDate(e.target.value)}/><button className='modern-export-btn' onClick={()=>exportCsv(visible,'magazzino.csv')}>Export Excel/CSV</button></div>
    <table className='compact-table with-separators'><thead><tr><th>Seriale</th><th>Modello</th><th>SAP</th><th>Stato</th><th>Assegnato a</th><th>Note</th></tr></thead><tbody>{visible.map(r=><tr key={r.id}><td>{r.serial}</td><td>{r.model}</td><td>{r.sap}</td><td><select value={r.status} onChange={e=>onBlurConfirm(r.id,'status',e.target.value)}>{statuses.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select></td><td><select value={r.assignedTo} onChange={e=>onBlurConfirm(r.id,'assignedTo',e.target.value)}><option value='-'>-</option>{users.map(u=><option key={u.id} value={`${u.firstName} ${u.lastName}`}>{u.firstName} {u.lastName}</option>)}</select></td><td><input defaultValue={r.notes} onBlur={e=>onBlurConfirm(r.id,'notes',e.target.value)} /></td></tr>)}</tbody></table>
  </section>;
}
