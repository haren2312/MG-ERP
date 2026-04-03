import { useEffect, useState } from 'react';
import { reportsAPI } from '../api';
import { useTranslation } from 'react-i18next';
import '../i18n';

function Reports() {
  const [salesReport, setSalesReport] = useState<any>(null);
  const [inventoryReport, setInventoryReport] = useState<any>(null);
  const [ledgerReport, setLedgerReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // days
  const { t, i18n } = useTranslation();
  console.log("Current detected language:", i18n.language);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const days = parseInt(dateRange);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [salesRes, inventoryRes, ledgerRes] = await Promise.all([
        reportsAPI.getSalesReport({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }),
        reportsAPI.getInventoryReport(),
        reportsAPI.getLedgerReport({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        }),
      ]);

      setSalesReport(salesRes.data);
      setInventoryReport(inventoryRes.data);
      setLedgerReport(ledgerRes.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-lg text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">Error Loading Reports</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="page-header">
        <h1>📊 Business Reports & Analytics</h1>
        <p>Comprehensive overview of sales, inventory, and financial performance</p>
      </div>

      <div className="mb-6" style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 220 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>📅 Report Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <div className="value">${salesReport?.total_sales.toFixed(2)}</div>
          <p style={{ color: '#7f8c8d', marginTop: 10 }}>{salesReport?.total_transactions} transactions</p>
        </div>

        <div className="stat-card">
          <h3>Current Balance</h3>
          <div className="value">${ledgerReport?.current_balance.toFixed(2)}</div>
          <p style={{ color: '#27ae60', marginTop: 10 }}>Income: ${ledgerReport?.total_income.toFixed(2)}</p>
        </div>

        <div className="stat-card">
          <h3>Inventory Value</h3>
          <div className="value">${inventoryReport?.total_value.toFixed(2)}</div>
          <p style={{ color: '#7f8c8d', marginTop: 10 }}>{inventoryReport?.total_items} items</p>
        </div>

        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <div className="value" style={{ color: inventoryReport?.low_stock_items > 0 ? '#e74c3c' : '#27ae60' }}>{inventoryReport?.low_stock_items}</div>
          <p style={{ color: '#7f8c8d', marginTop: 10 }}>Out of stock: {inventoryReport?.out_of_stock_items}</p>
        </div>

        <div className="stat-card">
          <h3>Net Profit</h3>
          <div className="value" style={{ color: (ledgerReport?.total_income - ledgerReport?.total_expenses) >= 0 ? '#1abc9c' : '#e74c3c' }}>${((ledgerReport?.total_income || 0) - (ledgerReport?.total_expenses || 0)).toFixed(2)}</div>
          <p style={{ color: '#7f8c8d', marginTop: 10 }}>Income − Expenses</p>
        </div>

        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="value">{ledgerReport?.transaction_count}</div>
          <p style={{ color: '#7f8c8d', marginTop: 10 }}>All ledgers</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Quick Stats</h3>
        <table className="table">
          <tbody>
            <tr>
              <td><strong>Average Transaction</strong></td>
              <td>${salesReport?.average_transaction.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total Tax Collected</strong></td>
              <td>${salesReport?.total_tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total Discounts</strong></td>
              <td>${salesReport?.total_discount.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total Expenses</strong></td>
              <td>${ledgerReport?.total_expenses.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;
