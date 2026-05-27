import { FormEvent, useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { seededUsers, UserRow } from './data';
import { BrandLogo } from './components/BrandLogo';
import { supabase } from './lib/supabase';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { MovementsPage } from './pages/MovementsPage';
import { InstalledModemsPage } from './pages/InstalledModemsPage';
import { ToReturnModemsPage } from './pages/ToReturnModemsPage';
import { ReportedMaterialsPage } from './pages/ReportedMaterialsPage';
import { SetupPage } from './pages/SetupPage';

const navItems = [
  { to: '/', label: 'Dashboard' }, { to: '/inventory', label: 'Magazzino' }, { to: '/installed', label: 'Materiali installati' },
  { to: '/to-return', label: 'Materiali da riconsegnare' }, { to: '/reported', label: 'Materiali denunciati' }, { to: '/movements', label: 'Movimenti' }, { to: '/setup', label: 'Setup' }
];

export function App() {
  const [users, setUsers] = useState<UserRow[]>(seededUsers);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpName, setHelpName] = useState('');
  const [helpEmail, setHelpEmail] = useState('');
  const [helpNotes, setHelpNotes] = useState('');
  const [helpMessage, setHelpMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        const { data } = await supabase.from('users_registry').select('*');
        if (data?.length) { setUsers(data as UserRow[]); localStorage.setItem('users_registry', JSON.stringify(data)); }
      } else {
        const savedUsers = localStorage.getItem('users_registry');
        if (savedUsers) setUsers(JSON.parse(savedUsers));
      }
      const savedSession = localStorage.getItem('session_user_id');
      if (savedSession) setSessionId(Number(savedSession));
      setAuthReady(true);
    };
    init();
  }, []);

  const activeUser = useMemo(() => users.find((u) => u.id === sessionId) ?? null, [users, sessionId]);
  const isAdmin = activeUser?.role === 'Admin' || activeUser?.jobRole === 'Admin';
  const existing = useMemo(() => users.find((u) => (u.email ?? '').toLowerCase() === email.trim().toLowerCase()), [users, email]);
  const canShowRegistration = authReady && email.trim().length > 0 && !existing;

  const login = async (e: FormEvent) => {
    e.preventDefault();
    if (!existing) return setAuthMessage('Email non trovata: se è la prima volta usa registrazione.');
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        if (error.message.toLowerCase().includes('security purposes')) {
          return setAuthMessage('Troppi tentativi: attendi ~20 secondi e riprova.');
        }
        return setAuthMessage(error.message);
      }
    } else if (existing.password !== password) return setAuthMessage('Password errata');
    if (existing.locked) return setAuthMessage('Utente bloccato: contatta admin.');
    setSessionId(existing.id); localStorage.setItem('session_user_id', String(existing.id)); setPassword(''); setAuthMessage('');
  };

  const register = async () => {
    if (!email || !password || !firstName || !lastName || existing) return;
    if (supabase) {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) {
        if (error.message.toLowerCase().includes('security purposes')) {
          return setAuthMessage('Troppi tentativi: attendi ~20 secondi e riprova.');
        }
        return setAuthMessage(error.message);
      }
    }
    const newUser: UserRow = { id: Date.now(), firstName, lastName, role: 'Tecnico', jobRole: 'Tecnico', email: email.trim(), password, locked: false };
    const next = [...users, newUser];
    setUsers(next); localStorage.setItem('users_registry', JSON.stringify(next));
    if (supabase) await supabase.from('users_registry').upsert(newUser);
    setAuthMessage('Registrazione completata. Ora fai login.');
  };

  const resetPassword = async () => {
    const targetEmail = 'm.colurci@gmail.com';
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail);
      if (error) {
        if (error.message.toLowerCase().includes('security purposes')) {
          return setAuthMessage('Troppi tentativi: attendi ~20 secondi e riprova.');
        }
        return setAuthMessage(error.message);
      }
      return window.alert(`Email reset inviata a ${targetEmail}`);
    }
    setAuthMessage('Reset disponibile solo con Supabase configurato.');
  };

  const sendHelpRequest = async () => {
    if (!helpName.trim() || !helpEmail.trim() || !helpNotes.trim()) {
      setHelpMessage('Compila tutti i campi della richiesta aiuto.');
      return;
    }
    const helpPayload = {
      id: Date.now(),
      fullName: helpName.trim(),
      email: helpEmail.trim(),
      notes: helpNotes.trim(),
      createdAt: new Date().toISOString()
    };
    if (supabase) {
      const { error } = await supabase.from('help_requests').insert(helpPayload);
      if (error) {
        setHelpMessage(`Errore invio richiesta: ${error.message}`);
        return;
      }
    } else {
      const prev = localStorage.getItem('help_requests');
      const list = prev ? JSON.parse(prev) : [];
      localStorage.setItem('help_requests', JSON.stringify([...list, helpPayload]));
    }
    setHelpMessage('Richiesta inviata con successo.');
    setShowHelpModal(false);
    setHelpName('');
    setHelpEmail('');
    setHelpNotes('');
    setTimeout(() => setHelpMessage(''), 2500);
  };

  const logout = () => { setSessionId(null); localStorage.removeItem('session_user_id'); if (supabase) supabase.auth.signOut(); };

  if (!activeUser) return <main className='login-shell'><header className='app-banner'>GESTIONE MAGAZZINO</header><div className='login-page'><div className='login-card dark-login'><h2>Accesso</h2><form onSubmit={login} className='login-form'><label>Email</label><input placeholder='nome@email.it' type='email' value={email} onChange={(e)=>setEmail(e.target.value)} /><label>Password</label><div className='password-wrap'><input placeholder='Password' type={showPassword ? 'text' : 'password'} value={password} onChange={(e)=>setPassword(e.target.value)} /><button type='button' className='password-toggle' onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}>{showPassword ? '🙈' : '👁️'}</button></div>{canShowRegistration && <><input placeholder='Nome' value={firstName} onChange={e=>setFirstName(e.target.value)} /><input placeholder='Cognome' value={lastName} onChange={e=>setLastName(e.target.value)} /></>}{authMessage && <p className='auth-message'>{authMessage}</p>}{helpMessage && <p className='auth-message'>{helpMessage}</p>}<div className='login-grid'><button type='submit' className='btn-green' disabled={!authReady}>{authReady ? 'Login' : 'Caricamento...'}</button>{canShowRegistration && <button type='button' className='btn-orange' onClick={register}>Compila registrazione</button>}<button type='button' className='btn-blue' onClick={resetPassword}>Richiedi reset password</button><button type='button' className='btn-gray' onClick={()=>setShowHelpModal(true)}>AIUTO</button></div></form></div>{showHelpModal && <div className='help-overlay'><div className='help-card'><h3>Richiesta aiuto</h3><label>Nome e cognome</label><input value={helpName} onChange={(e)=>setHelpName(e.target.value)} placeholder='Nome e cognome' /><label>Mail</label><input type='email' value={helpEmail} onChange={(e)=>setHelpEmail(e.target.value)} placeholder='nome@email.it' /><label>Note</label><textarea value={helpNotes} onChange={(e)=>setHelpNotes(e.target.value)} placeholder='Scrivi qui il problema o la richiesta' rows={3} /><div className='help-actions'><button type='button' className='btn-green' onClick={sendHelpRequest}>Invia richiesta</button><button type='button' className='btn-gray' onClick={()=>setShowHelpModal(false)}>Chiudi</button></div></div></div>}</div></main>;

  return <div><header className='app-banner'>GESTIONE MAGAZZINO</header><div className='layout'><aside className='sidebar'><div className='sidebar-top'><BrandLogo compact /><div className='user-inline'><span>{activeUser.firstName} {activeUser.lastName}</span><button className='icon-btn' onClick={logout}>Logout</button></div></div><button type='button' className='sidebar-toggle' onClick={() => setMenuOpen((v) => !v)}>Magazzino <span>{menuOpen ? '▾' : '▸'}</span></button>{menuOpen && <nav>{navItems.filter((item) => item.to !== '/setup' || isAdmin).map((item)=><NavLink key={item.to} to={item.to} className={({isActive})=>(isActive?'active':'')}>{item.label}</NavLink>)}</nav>}</aside><main className='content'><Routes><Route path='/' element={<DashboardPage />} /><Route path='/inventory' element={<InventoryPage />} /><Route path='/movements' element={<MovementsPage />} /><Route path='/installed' element={<InstalledModemsPage />} /><Route path='/to-return' element={<ToReturnModemsPage />} /><Route path='/reported' element={<ReportedMaterialsPage />} /><Route path='/setup' element={isAdmin ? <SetupPage /> : <DashboardPage />} /></Routes></main></div></div>;
}
