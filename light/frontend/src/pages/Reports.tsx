import { useEffect, useState } from 'react';
import { reportsAPI } from '../api';

function Reports() {
  const [salesReport, setSalesReport] = useState<any>(null);
  const [inventoryReport, setInventoryReport] = useState<any>(null);
  const [ledgerReport, setLedgerReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // days

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
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          📊 Business Reports & Analytics
        </h1>
        <p className="text-lg text-gray-600">
          Comprehensive overview of sales, inventory, and financial performance
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Report Period</h3>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="w-full md:w-auto px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base font-medium"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>
      </div>

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium opacity-90">Total Sales</div>
            <span className="text-3xl">💰</span>
          </div>
          <div className="text-4xl font-bold">${salesReport?.total_sales.toFixed(2)}</div>
          <div className="text-xs opacity-75 mt-2">{salesReport?.total_transactions} transactions</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium opacity-90">Avg Transaction</div>
            <span className="text-3xl">📈</span>
          </div>
          <div className="text-4xl font-bold">${salesReport?.average_transaction.toFixed(2)}</div>
          <div className="text-xs opacity-75 mt-2">Per transaction average</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium opacity-90">Tax Collected</div>
            <span className="text-3xl">🏛️</span>
          </div>
          <div className="text-4xl font-bold">${salesReport?.total_tax.toFixed(2)}</div>
          <div className="text-xs opacity-75 mt-2">Total tax amount</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium opacity-90">Total Discounts</div>
            <span className="text-3xl">🎁</span>
          </div>
          <div className="text-4xl font-bold">${salesReport?.total_discount.toFixed(2)}</div>
          <div className="text-xs opacity-75 mt-2">Customer savings</div>
        </div>
      </div>

      {/* Detailed Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Report */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📦 Inventory Status
            </h2>
          </div>
          <div className="p-6">
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📊</span>
                      <span className="text-base font-semibold text-gray-700">Total Items</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-xl font-bold text-gray-900">{inventoryReport?.total_items}</span>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💵</span>
                      <span className="text-base font-semibold text-gray-700">Total Inventory Value</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-xl font-bold text-green-600">${inventoryReport?.total_value.toFixed(2)}</span>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <span className="text-base font-semibold text-gray-700">Low Stock Items</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className={`text-xl font-bold ${inventoryReport?.low_stock_items > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                      {inventoryReport?.low_stock_items}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🚫</span>
                      <span className="text-base font-semibold text-gray-700">Out of Stock Items</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className={`text-xl font-bold ${inventoryReport?.out_of_stock_items > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {inventoryReport?.out_of_stock_items}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              💼 Financial Summary
            </h2>
          </div>
          <div className="p-6">
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💰</span>
                      <span className="text-base font-semibold text-gray-700">Current Balance</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-xl font-bold text-green-600">${ledgerReport?.current_balance.toFixed(2)}</span>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📈</span>
                      <span className="text-base font-semibold text-gray-700">Total Income</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-xl font-bold text-green-600">${ledgerReport?.total_income.toFixed(2)}</span>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📉</span>
                      <span className="text-base font-semibold text-gray-700">Total Expenses</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-xl font-bold text-red-600">${ledgerReport?.total_expenses.toFixed(2)}</span>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors bg-blue-50">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎯</span>
                      <span className="text-base font-bold text-gray-800">Net Profit</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-2xl font-bold text-blue-600">
                      ${(ledgerReport?.total_income - ledgerReport?.total_expenses).toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-blue-50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔢</span>
                      <span className="text-base font-semibold text-gray-700">Total Transactions</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className="text-xl font-bold text-gray-900">{ledgerReport?.transaction_count}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
