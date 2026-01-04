import { useEffect, useState } from 'react';
import { ledgerAPI } from '../api';

interface LedgerRecord {
  id: number;
  transaction_date: string;
  transaction_type: string;
  description: string;
  amount: number;
  balance: number;
  payment_method: string;
  notes?: string;
}

function Ledger() {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadRecords();
  }, [filterType]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const params = filterType ? { transaction_type: filterType } : {};
      const response = await ledgerAPI.getRecords(params);
      setRecords(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load ledger records');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return '#27ae60';
      case 'purchase':
        return '#e74c3c';
      case 'return':
        return '#f39c12';
      case 'adjustment':
        return '#3498db';
      default:
        return '#7f8c8d';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Ledger Records</h1>
        <p>View all financial transactions</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px', fontWeight: '500' }}>Filter by Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="">All Types</option>
            <option value="sale">Sales</option>
            <option value="purchase">Purchases</option>
            <option value="return">Returns</option>
            <option value="adjustment">Adjustments</option>
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{formatDate(record.transaction_date)}</td>
                <td>
                  <span
                    style={{
                      padding: '5px 10px',
                      borderRadius: '5px',
                      backgroundColor: getTypeColor(record.transaction_type),
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}
                  >
                    {record.transaction_type}
                  </span>
                </td>
                <td>{record.description}</td>
                <td
                  style={{
                    color: record.transaction_type === 'sale' ? '#27ae60' : '#e74c3c',
                    fontWeight: 'bold',
                  }}
                >
                  {record.transaction_type === 'sale' ? '+' : '-'}${record.amount.toFixed(2)}
                </td>
                <td style={{ fontWeight: 'bold' }}>${record.balance.toFixed(2)}</td>
                <td style={{ textTransform: 'capitalize' }}>
                  {record.payment_method.replace('_', ' ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {records.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
            No ledger records found
          </p>
        )}
      </div>
    </div>
  );
}

export default Ledger;
