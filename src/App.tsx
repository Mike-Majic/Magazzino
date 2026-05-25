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
  const existing = useMemo(() => users.find((u) => (u.email ?? '').toLowerCase() === email.trim().toLowerCase()), [users, email]);
  const canShowRegistration = authReady && email.trim().length > 0 && !existing;

  const login = async (e: FormEvent) => {
    e.preventDefault();
    if (!existing) return;
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return window.alert(error.message);
    } else if (existing.password !== password) return window.alert('Password errata');
    if (existing.locked) return window.alert('Utente bloccato');
    setSessionId(existing.id); localStorage.setItem('session_user_id', String(existing.id)); setPassword('');
  };

  const register = async () => {
    if (!email || !password || !firstName || !lastName || existing) return;
    if (supabase) {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) return window.alert(error.message);
    }
    const newUser: UserRow = { id: Date.now(), firstName, lastName, role: 'Tecnico', jobRole: 'Tecnico', email: email.trim(), password, locked: false };
    const next = [...users, newUser];
    setUsers(next); localStorage.setItem('users_registry', JSON.stringify(next));
    if (supabase) await supabase.from('users_registry').upsert(newUser);
    window.alert('Registrazione completata');
  };

  const resetPassword = async () => {
    if (!email) return;
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) return window.alert(error.message);
      return window.alert('Email reset inviata');
    }
    window.alert('Reset disponibile solo con Supabase configurato.');
  };

  const logout = () => { setSessionId(null); localStorage.removeItem('session_user_id'); if (supabase) supabase.auth.signOut(); };

  if (!activeUser) return <main className='login-shell'><header className='app-banner'>GESTIONE MAGAZZINO</header><div className='login-page'><div className='login-card dark-login'><h2>Accesso</h2><form onSubmit={login} className='login-form'><label>Email</label><input placeholder='nome@email.it' type='email' value={email} onChange={(e)=>setEmail(e.target.value)} /><label>Password</label><div className='password-wrap'><input placeholder='Password' type='password' value={password} onChange={(e)=>setPassword(e.target.value)} /></div>{canShowRegistration && <><input placeholder='Nome' value={firstName} onChange={e=>setFirstName(e.target.value)} /><input placeholder='Cognome' value={lastName} onChange={e=>setLastName(e.target.value)} /></>}<div className='login-grid'><button type='submit' className='btn-green' disabled={!authReady}>{authReady ? 'Login' : 'Caricamento...'}</button>{canShowRegistration && <button type='button' className='btn-orange' onClick={register}>Compila registrazione</button>}<button type='button' className='btn-blue' onClick={resetPassword}>Richiedi reset password</button><button type='button' className='btn-gray' onClick={()=>window.alert('Contatta admin di sistema')}>AIUTO</button></div></form></div></div></main>;

  return <div><header className='app-banner'>GESTIONE MAGAZZINO</header><div className='layout'><aside className='sidebar'><div className='sidebar-top'><BrandLogo compact /><div className='user-inline'><span>{activeUser.firstName} {activeUser.lastName}</span><button className='icon-btn' onClick={logout}>Logout</button></div></div><button type='button' className='sidebar-toggle' onClick={() => setMenuOpen((v) => !v)}>Magazzino <span>{menuOpen ? '▾' : '▸'}</span></button>{menuOpen && <nav>{navItems.map((item)=><NavLink key={item.to} to={item.to} className={({isActive})=>(isActive?'active':'')}>{item.label}</NavLink>)}</nav>}</aside><main className='content'><Routes><Route path='/' element={<DashboardPage />} /><Route path='/inventory' element={<InventoryPage />} /><Route path='/movements' element={<MovementsPage />} /><Route path='/installed' element={<InstalledModemsPage />} /><Route path='/to-return' element={<ToReturnModemsPage />} /><Route path='/reported' element={<ReportedMaterialsPage />} /><Route path='/setup' element={<SetupPage />} /></Routes></main></div></div>;
}
