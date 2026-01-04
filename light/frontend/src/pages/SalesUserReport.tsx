import React, { useState, useEffect } from 'react';
import { api } from '../api';

interface ProductBreakdown {
  product_name: string;
  quantity: number;
  total_amount: number;
}

interface SalesUserPerformance {
  sales_user_id: number;
  sales_user_name: string;
  employee_code: string | null;
  total_transactions: number;
  total_pieces: number;
  total_revenue: number;
  product_breakdown: ProductBreakdown[];
}

interface SalesUserPerformanceReport {
  report_date: string;
  start_date: string;
  end_date: string;
  sales_users: SalesUserPerformance[];
  total_transactions: number;
  total_pieces: number;
  total_revenue: number;
}

const SalesUserReport: React.FC = () => {
  const [report, setReport] = useState<SalesUserPerformanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<SalesUserPerformanceReport>(
        '/reports/sales-users',
        {
          params: {
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate + 'T23:59:59').toISOString(),
          },
        }
      );
      console.log('Sales User Report Response:', response.data);
      setReport(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch report');
      console.error('Error fetching sales user report:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpanded = (userId: number) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          📊 Sales User Performance Report
        </h1>
        <p className="text-lg text-gray-600">
          Track individual sales performance and product breakdown
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Select Date Range</h3>
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-md"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              '🔍 Generate Report'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg mb-6 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {report && (
        <>
          {/* Summary Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-6">
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                📋 Summary Overview
              </h2>
            </div>
            <div className="p-6">
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🛒</span>
                        <span className="text-base font-semibold text-gray-700">Total Transactions</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-xl font-bold text-gray-900">{report.total_transactions}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm text-gray-500">Complete sales records</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📦</span>
                        <span className="text-base font-semibold text-gray-700">Total Pieces Sold</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-xl font-bold text-blue-600">{report.total_pieces}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm text-gray-500">Individual items sold</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors bg-blue-50">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💰</span>
                        <span className="text-base font-bold text-gray-800">Total Revenue</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(report.total_revenue)}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm text-gray-500">Gross sales amount</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales Users Performance Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                👥 Performance by Sales User
              </h2>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <span>📅</span>
                <span className="font-medium">{formatDate(report.start_date)}</span>
                <span>→</span>
                <span className="font-medium">{formatDate(report.end_date)}</span>
              </p>
            </div>

            {!report.sales_users || report.sales_users.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl text-gray-500 font-medium">No transactions found</p>
                <p className="text-sm text-gray-400 mt-2">Try selecting a different date range</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Rank & Sales User
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Employee Code
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Total Pieces
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Total Revenue
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.sales_users.map((user, index) => (
                      <React.Fragment key={user.sales_user_id}>
                        <tr className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-gradient-to-br from-blue-400 to-blue-600'
                              }`}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                              </div>
                              <div>
                                <div className="text-base font-bold text-gray-900">
                                  {user.sales_user_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {index === 0 ? 'Top Performer' : index === 1 ? 'Runner Up' : index === 2 ? 'Third Place' : 'Sales Team'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-center">
                            <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.employee_code || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-center">
                            <div className="text-lg font-bold text-gray-900">{user.total_transactions}</div>
                            <div className="text-xs text-gray-500">sales</div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-center">
                            <div className="text-lg font-bold text-blue-600">{user.total_pieces}</div>
                            <div className="text-xs text-gray-500">pieces</div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right">
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(user.total_revenue)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {report.total_revenue > 0 ? `${((user.total_revenue / report.total_revenue) * 100).toFixed(1)}% of total` : ''}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-center">
                            <button
                              onClick={() => toggleUserExpanded(user.sales_user_id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm shadow-sm"
                            >
                              {expandedUsers.has(user.sales_user_id) ? (
                                <>
                                  <span>▼</span> Hide
                                </>
                              ) : (
                                <>
                                  <span>▶</span> Show
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedUsers.has(user.sales_user_id) && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-6 py-6">
                              <div className="ml-16">
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                  <span>📊</span> Product Breakdown
                                </h4>
                                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm">
                                  <table className="min-w-full">
                                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                                      <tr>
                                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">
                                          Product Name
                                        </th>
                                        <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">
                                          Quantity Sold
                                        </th>
                                        <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">
                                          Total Amount
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {user.product_breakdown.map((product, idx) => (
                                        <tr
                                          key={product.product_name}
                                          className="hover:bg-blue-50 transition-colors"
                                        >
                                          <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                              <span className="text-lg">{idx === 0 ? '⭐' : '📦'}</span>
                                              <span className="text-sm font-medium text-gray-900">
                                                {product.product_name}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                              {product.quantity} pcs
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                            <span className="text-base font-bold text-gray-900">
                                              {formatCurrency(product.total_amount)}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SalesUserReport;
