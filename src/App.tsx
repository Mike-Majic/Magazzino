import { NavLink, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { MovementsPage } from './pages/MovementsPage';
import { InstalledModemsPage } from './pages/InstalledModemsPage';
import { ToReturnModemsPage } from './pages/ToReturnModemsPage';
import { SetupPage } from './pages/SetupPage';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/inventory', label: 'Magazzino' },
  { to: '/movements', label: 'Movimenti' },
  { to: '/installed', label: 'Modem installati' },
  { to: '/to-return', label: 'Modem da riconsegnare' },
  { to: '/setup', label: 'Setup' }
];

export function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Magazzino Modem</h1>
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
          <Route path="/installed" element={<InstalledModemsPage />} />
          <Route path="/to-return" element={<ToReturnModemsPage />} />
          <Route path="/setup" element={<SetupPage />} />
        </Routes>
      </main>
    </div>
  );
}
