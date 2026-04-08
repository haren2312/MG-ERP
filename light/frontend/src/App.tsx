import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Ledger from './pages/Ledger';
import Reports from './pages/Reports';
import Expenses from './pages/Expenses';
import TransactionsHistory from './pages/TransactionsHistory';
import Users from './pages/Users';
import SalesUsers from './pages/SalesUsers';
import SalesUserReport from './pages/SalesUserReport';
import './App.css';
import { useTranslation } from 'react-i18next';
import './i18n';
import LanguageSelector from './components/LanguageSelector';

function MainApp() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const { user, logout, hasRole } = useAuth();
  const { t, i18n } = useTranslation();
  console.log("Current detected language:", i18n.language);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>{t('app_name')}</h2>
          {user && (
            <div style={{
              fontSize: '12px',
              color: '#7f8c8d',
              marginTop: '5px'
            }}>
              <div>{user.full_name || user.username}</div>
              <div style={{ color: '#3498db', textTransform: 'capitalize' }}>
                {user.role.toLowerCase().replace('_', ' ')}
              </div>
            </div>
          )}
          <LanguageSelector />
        </div>
        <ul className="nav-menu">
          <li className={activeMenu === 'dashboard' ? 'active' : ''}>
            <Link to="/" onClick={() => setActiveMenu('dashboard')}>
              📊 {t('dashboard_title')}
            </Link>
          </li>
          {hasRole('manager', 'super_admin') && (
            <li className={activeMenu === 'inventory' ? 'active' : ''}>
              <Link to="/inventory" onClick={() => setActiveMenu('inventory')}>
                📦 {t('inventory_title')}
              </Link>
            </li>
          )}
          <li className={activeMenu === 'pos' ? 'active' : ''}>
            <Link to="/pos" onClick={() => setActiveMenu('pos')}>
              🛒 {t('pos_title')}
            </Link>
          </li>
          <li className={activeMenu === 'transactions-history' ? 'active' : ''}>
            <Link to="/transactions-history" onClick={() => setActiveMenu('transactions-history')}>
              🧾 {t('transactions_history_title')}
            </Link>
          </li>
          {hasRole('manager', 'super_admin') && (
            <li className={activeMenu === 'ledger' ? 'active' : ''}>
              <Link to="/ledger" onClick={() => setActiveMenu('ledger')}>
                📝 {t('ledger_title')}
              </Link>
            </li>
          )}
          {hasRole('manager', 'super_admin') && (
            <li className={activeMenu === 'expenses' ? 'active' : ''}>
              <Link to="/expenses" onClick={() => setActiveMenu('expenses')}>
                💰 {t('expenses_title')}
              </Link>
            </li>
          )}
          {hasRole('manager', 'super_admin') && (
            <li className={activeMenu === 'auth-users' ? 'active' : ''}>
              <Link to="/auth-users" onClick={() => setActiveMenu('auth-users')}>
                🔐 {t('user_management_title')}
              </Link>
            </li>
          )}
          {hasRole('manager', 'super_admin') && (
            <li className={activeMenu === 'sales-users' ? 'active' : ''}>
              <Link to="/sales-users" onClick={() => setActiveMenu('sales-users')}>
                👥 {t('sales_users_title')}
              </Link>
            </li>
          )}
          {hasRole('manager', 'super_admin') && (
            <li className={activeMenu === 'reports' ? 'active' : ''}>
              <Link to="/reports" onClick={() => setActiveMenu('reports')}>
                📈 {t('reports_title')}
              </Link>
            </li>
          )}
          {hasRole('manager', 'super_admin') && (
            <li className={activeMenu === 'sales-user-report' ? 'active' : ''}>
              <Link to="/sales-user-report" onClick={() => setActiveMenu('sales-user-report')}>
                👤 {t('sales_user_report_title')}
              </Link>
            </li>
          )}
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              style={{ color: '#e74c3c' }}
            >
              🚪 Logout
            </a>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute requiredRole="manager">
              <Inventory />
            </ProtectedRoute>
          } />
          <Route path="/pos" element={
            <ProtectedRoute>
              <POS />
            </ProtectedRoute>
          } />
          <Route path="/transactions-history" element={
            <ProtectedRoute>
              <TransactionsHistory />
            </ProtectedRoute>
          } />
          <Route path="/ledger" element={
            <ProtectedRoute requiredRole="manager">
              <Ledger />
            </ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute requiredRole="manager">
              <Expenses />
            </ProtectedRoute>
          } />
          <Route path="/auth-users" element={
            <ProtectedRoute requiredRole="super_admin">
              <Users />
            </ProtectedRoute>
          } />
          <Route path="/sales-users" element={
            <ProtectedRoute requiredRole="manager">
              <SalesUsers />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute requiredRole="manager">
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/sales-user-report" element={
            <ProtectedRoute requiredRole="manager">
              <SalesUserReport />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
