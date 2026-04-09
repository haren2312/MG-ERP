import { Fragment, useEffect, useMemo, useState } from 'react';
import { posAPI } from '../api';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext';
import '../i18n';

interface TransactionItem {
  id: number;
  inventory_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface TransactionRecord {
  id: number;
  transaction_number: string;
  transaction_date: string;
  customer_name?: string | null;
  payment_method: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_received: number;
  change_returned: number;
  notes?: string | null;
  items: TransactionItem[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function toIsoDateStart(date: string): string | undefined {
  if (!date) {
    return undefined;
  }
  return new Date(`${date}T00:00:00`).toISOString();
}

function toIsoDateEnd(date: string): string | undefined {
  if (!date) {
    return undefined;
  }
  return new Date(`${date}T23:59:59`).toISOString();
}

function TransactionsHistory() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const canRefund = hasRole('manager', 'super_admin');
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [refundQtyByItem, setRefundQtyByItem] = useState<Record<number, string>>({});
  const [refundReasonByItem, setRefundReasonByItem] = useState<Record<number, string>>({});
  const [refundRestockByItem, setRefundRestockByItem] = useState<Record<number, boolean>>({});
  const [refundingItemId, setRefundingItemId] = useState<number | null>(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await posAPI.getTransactions({
        search: searchText.trim() || undefined,
        start_date: toIsoDateStart(startDate),
        end_date: toIsoDateEnd(endDate),
        limit: 200,
      });

      setTransactions(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load transactions history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (paymentMethod === 'all') {
      return transactions;
    }

    return transactions.filter(
      (tx) => (tx.payment_method || '').toLowerCase() === paymentMethod.toLowerCase()
    );
  }, [paymentMethod, transactions]);

  const totalAmount = useMemo(
    () => filteredTransactions.reduce((sum, tx) => sum + (tx.total || 0), 0),
    [filteredTransactions]
  );

  const totalItemsSold = useMemo(
    () =>
      filteredTransactions.reduce(
        (sum, tx) => sum + tx.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0),
        0
      ),
    [filteredTransactions]
  );

  const toggleTransactionDetails = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleItemRefund = async (tx: TransactionRecord, item: TransactionItem) => {
    const qtyValue = refundQtyByItem[item.id] || '';
    const refundQty = Number.parseInt(qtyValue, 10);

    if (!Number.isFinite(refundQty) || refundQty <= 0) {
      alert('Enter a valid refund quantity');
      return;
    }

    if (refundQty > item.quantity) {
      alert(`Refund quantity cannot exceed purchased quantity (${item.quantity})`);
      return;
    }

    const shouldProceed = confirm(
      `Refund ${refundQty} unit(s) of ${item.product_name} from ${tx.transaction_number}?`
    );
    if (!shouldProceed) {
      return;
    }

    try {
      setRefundingItemId(item.id);
      await posAPI.refundTransactionItem(tx.id, {
        pos_item_id: item.id,
        quantity: refundQty,
        reason: (refundReasonByItem[item.id] || '').trim() || undefined,
        restock: refundRestockByItem[item.id] ?? true,
      });

      alert('Item refund processed successfully');
      setRefundQtyByItem((prev) => ({ ...prev, [item.id]: '' }));
      setRefundReasonByItem((prev) => ({ ...prev, [item.id]: '' }));
      setRefundRestockByItem((prev) => ({ ...prev, [item.id]: true }));
      await loadTransactions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Refund failed');
    } finally {
      setRefundingItemId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🧾 {t('transactions_history_title')}</h1>
        <p>Review old transactions with full item-level details</p>
      </div>

      <div className="card">
        <h3>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Search</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Transaction # or ID"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="all">All</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_payment">Mobile Payment</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button className="button button-primary" onClick={() => void loadTransactions()}>
            Apply Filters
          </button>
          <button
            className="button"
            onClick={() => {
              setSearchText('');
              setStartDate('');
              setEndDate('');
              setPaymentMethod('all');
              setExpandedIds(new Set());
              void loadTransactions();
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="value">{filteredTransactions.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Sales Amount</h3>
          <div className="value" style={{ fontSize: 28 }}>{formatCurrency(totalAmount)}</div>
        </div>
        <div className="stat-card">
          <h3>Total Units Sold</h3>
          <div className="value">{totalItemsSold}</div>
        </div>
      </div>

      {loading && <div className="loading">Loading transactions history...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="card">
          <h3>Transactions</h3>

          {filteredTransactions.length === 0 ? (
            <p style={{ color: '#7f8c8d' }}>No transactions found for the selected filters.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const isExpanded = expandedIds.has(tx.id);
                  return (
                    <Fragment key={tx.id}>
                      <tr>
                        <td>{tx.transaction_number}</td>
                        <td>{new Date(tx.transaction_date).toLocaleString()}</td>
                        <td>{tx.customer_name || 'Walk-in'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{(tx.payment_method || '').replace('_', ' ')}</td>
                        <td>{formatCurrency(tx.total)}</td>
                        <td>
                          <button className="button" onClick={() => toggleTransactionDetails(tx.id)}>
                            {isExpanded ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={6} style={{ background: '#f9fbff' }}>
                            <div style={{ padding: '8px 0' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, marginBottom: 10 }}>
                                <div><strong>Subtotal:</strong> {formatCurrency(tx.subtotal)}</div>
                                <div><strong>Tax:</strong> {formatCurrency(tx.tax)}</div>
                                <div><strong>Discount:</strong> {formatCurrency(tx.discount)}</div>
                                <div><strong>Paid:</strong> {formatCurrency(tx.payment_received)}</div>
                                <div><strong>Change:</strong> {formatCurrency(tx.change_returned)}</div>
                                <div><strong>Total:</strong> {formatCurrency(tx.total)}</div>
                              </div>

                              {tx.notes && (
                                <div style={{ marginBottom: 10 }}>
                                  <strong>Notes:</strong> {tx.notes}
                                </div>
                              )}

                              <table className="table" style={{ background: '#fff', borderRadius: 6, overflow: 'hidden' }}>
                                <thead>
                                  <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Subtotal</th>
                                    {canRefund && <th>Refund Qty</th>}
                                    {canRefund && <th>Reason</th>}
                                    {canRefund && <th>Restock</th>}
                                    {canRefund && <th>Action</th>}
                                  </tr>
                                </thead>
                                <tbody>
                                  {tx.items.map((item) => (
                                    <tr key={item.id}>
                                      <td>{item.product_name}</td>
                                      <td>{item.quantity}</td>
                                      <td>{formatCurrency(item.unit_price)}</td>
                                      <td>{formatCurrency(item.subtotal)}</td>
                                      {canRefund && (
                                      <td style={{ minWidth: 110 }}>
                                        <input
                                          type="number"
                                          min="1"
                                          max={item.quantity}
                                          step="1"
                                          value={refundQtyByItem[item.id] ?? ''}
                                          onChange={(e) =>
                                            setRefundQtyByItem((prev) => ({ ...prev, [item.id]: e.target.value }))
                                          }
                                          placeholder="Qty"
                                          disabled={refundingItemId === item.id}
                                          style={{ width: '100%' }}
                                        />
                                      </td>
                                      )}
                                      {canRefund && (
                                      <td style={{ minWidth: 180 }}>
                                        <input
                                          type="text"
                                          value={refundReasonByItem[item.id] ?? ''}
                                          onChange={(e) =>
                                            setRefundReasonByItem((prev) => ({ ...prev, [item.id]: e.target.value }))
                                          }
                                          placeholder="Optional"
                                          disabled={refundingItemId === item.id}
                                          style={{ width: '100%' }}
                                        />
                                      </td>
                                      )}
                                      {canRefund && (
                                      <td>
                                        <input
                                          type="checkbox"
                                          checked={refundRestockByItem[item.id] ?? true}
                                          onChange={(e) =>
                                            setRefundRestockByItem((prev) => ({ ...prev, [item.id]: e.target.checked }))
                                          }
                                          disabled={refundingItemId === item.id}
                                        />
                                      </td>
                                      )}
                                      {canRefund && (
                                      <td>
                                        <button
                                          className="button button-danger"
                                          onClick={() => void handleItemRefund(tx, item)}
                                          disabled={refundingItemId === item.id}
                                        >
                                          {refundingItemId === item.id ? 'Processing...' : 'Refund Item'}
                                        </button>
                                      </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default TransactionsHistory;
