import { NavLink, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { MovementsPage } from './pages/MovementsPage';
import { SetupPage } from './pages/SetupPage';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/inventory', label: 'Magazzino' },
  { to: '/movements', label: 'Movimenti' },
  { to: '/setup', label: 'Setup' }
];

export function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Magazzino Modem</h1>
        <p>Bozza iniziale React + Supabase</p>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route path="/setup" element={<SetupPage />} />
        </Routes>
      </main>
    </div>
  );
}
