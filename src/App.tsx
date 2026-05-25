import { FormEvent, useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { seededUsers, UserRow } from './data';
import { BrandLogo } from './components/BrandLogo';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { MovementsPage } from './pages/MovementsPage';
import { InstalledModemsPage } from './pages/InstalledModemsPage';
import { ToReturnModemsPage } from './pages/ToReturnModemsPage';
import { ReportedMaterialsPage } from './pages/ReportedMaterialsPage';
import { SetupPage } from './pages/SetupPage';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/inventory', label: 'Magazzino' },
  { to: '/installed', label: 'Materiali installati' },
  { to: '/to-return', label: 'Materiali da riconsegnare' },
  { to: '/reported', label: 'Materiali denunciati' },
  { to: '/movements', label: 'Movimenti' },
  { to: '/setup', label: 'Setup' }
];

export function App() {
  const [users, setUsers] = useState<UserRow[]>(seededUsers);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    const savedUsers = localStorage.getItem('users_registry');
    const savedSession = localStorage.getItem('session_user_id');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedSession) setSessionId(Number(savedSession));
  }, []);

  const activeUser = useMemo(() => users.find((u) => u.id === sessionId) ?? null, [users, sessionId]);

  const login = (e: FormEvent) => {
    e.preventDefault();
    const found = users.find((u) => (u.email ?? '').toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!found) return window.alert('Credenziali non valide');
    if (found.locked) return window.alert('Utente bloccato');
    setSessionId(found.id);
    localStorage.setItem('session_user_id', String(found.id));
    setPassword('');
  };

  const logout = () => {
    setSessionId(null);
    localStorage.removeItem('session_user_id');
  };

  if (!activeUser) {
    return <main className="login-page"><div className="login-card"><BrandLogo /><h2>Accesso Magazzino</h2><form onSubmit={login} className="login-form"><input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /><input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="submit" className="action-green">Accedi</button></form></div></main>;
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <BrandLogo compact />
        <h1>Magazzino</h1>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <div className="top-userbar"><span>{activeUser.firstName} {activeUser.lastName}</span><button className="icon-btn" onClick={logout}>Logout</button></div>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route path="/installed" element={<InstalledModemsPage />} />
          <Route path="/to-return" element={<ToReturnModemsPage />} />
          <Route path="/reported" element={<ReportedMaterialsPage />} />
          <Route path="/setup" element={<SetupPage />} />
        </Routes>
      </main>
    </div>
  );
}
