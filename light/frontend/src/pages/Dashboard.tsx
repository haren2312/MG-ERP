import { useEffect, useState } from 'react';
import { reportsAPI } from '../api';

interface DashboardStats {
  sales: any;
  inventory: any;
  ledger: any;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return null;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your business</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales (30 days)</h3>
          <div className="value">${stats.sales.total_sales.toFixed(2)}</div>
          <p style={{ color: '#7f8c8d', marginTop: '10px' }}>
            {stats.sales.total_transactions} transactions
          </p>
        </div>

        <div className="stat-card">
          <h3>Current Balance</h3>
          <div className="value">${stats.ledger.current_balance.toFixed(2)}</div>
          <p style={{ color: '#27ae60', marginTop: '10px' }}>
            Income: ${stats.ledger.total_income.toFixed(2)}
          </p>
        </div>

        <div className="stat-card">
          <h3>Inventory Value</h3>
          <div className="value">${stats.inventory.total_value.toFixed(2)}</div>
          <p style={{ color: '#7f8c8d', marginTop: '10px' }}>
            {stats.inventory.total_items} items
          </p>
        </div>

        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <div className="value" style={{ color: stats.inventory.low_stock_items > 0 ? '#e74c3c' : '#27ae60' }}>
            {stats.inventory.low_stock_items}
          </div>
          <p style={{ color: '#7f8c8d', marginTop: '10px' }}>
            Out of stock: {stats.inventory.out_of_stock_items}
          </p>
        </div>
      </div>

      <div className="card">
        <h3>Quick Stats</h3>
        <table className="table">
          <tbody>
            <tr>
              <td><strong>Average Transaction</strong></td>
              <td>${stats.sales.average_transaction.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total Tax Collected</strong></td>
              <td>${stats.sales.total_tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total Discounts</strong></td>
              <td>${stats.sales.total_discount.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total Expenses (30 days)</strong></td>
              <td>${stats.ledger.total_expenses.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
