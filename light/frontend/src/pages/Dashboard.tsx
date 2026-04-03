import { useEffect, useState } from 'react';
import { reportsAPI } from '../api';
import { useTranslation } from 'react-i18next';
import '../i18n';

interface DashboardStats {
  sales: any;
  inventory: any;
  ledger: any;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { t, i18n } = useTranslation();
  console.log("Current detected language:", i18n.language);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [salesRes, inventoryRes, ledgerRes] = await Promise.all([
        reportsAPI.getSalesReport(),
        reportsAPI.getInventoryReport(),
        reportsAPI.getLedgerReport(),
      ]);

      setStats({
        sales: salesRes.data,
        inventory: inventoryRes.data,
        ledger: ledgerRes.data,
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return null;

  return (
    <div>
      <div className="page-header">
        <h1>{t('dashboard_title')}</h1>
        <p>{t('dashboard_description')}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{t('total_sales')}</h3>
          <div className="value">${stats.sales.total_sales.toFixed(2)}</div>
          <p style={{ color: '#7f8c8d', marginTop: '10px' }}>
            {stats.sales.total_transactions} {t('transactions')}
          </p>
        </div>

        <div className="stat-card">
          <h3>{t('current_balance')}</h3>
          <div className="value">${stats.ledger.current_balance.toFixed(2)}</div>
          <p style={{ color: '#27ae60', marginTop: '10px' }}>
            {t('income')}: ${stats.ledger.total_income.toFixed(2)}
          </p>
        </div>

        <div className="stat-card">
          <h3>{t('inventory_value')}</h3>
          <div className="value">${stats.inventory.total_value.toFixed(2)}</div>
          <p style={{ color: '#7f8c8d', marginTop: '10px' }}>
            {stats.inventory.total_items} {t('items')}
          </p>
        </div>

        <div className="stat-card">
          <h3>{t('low_stock_items')}</h3>
          <div className="value" style={{ color: stats.inventory.low_stock_items > 0 ? '#e74c3c' : '#27ae60' }}>
            {stats.inventory.low_stock_items}
          </div>
          <p style={{ color: '#7f8c8d', marginTop: '10px' }}>
            {t('out_of_stock_items')}: {stats.inventory.out_of_stock_items}
          </p>
        </div>
      </div>

      <div className="card">
        <h3>{t('quick_stats')}</h3>
        <table className="table">
          <tbody>
            <tr>
              <td><strong>{t('average_transaction')}</strong></td>
              <td>${stats.sales.average_transaction.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>{t('total_tax_collected')}</strong></td>
              <td>${stats.sales.total_tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>{t('total_discounts')}</strong></td>
              <td>${stats.sales.total_discount.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>{t('total_expenses')}</strong></td>
              <td>${stats.ledger.total_expenses.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
