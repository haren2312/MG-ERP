import { useEffect, useState } from 'react';
import { inventoryAPI, posAPI, salesUserAPI } from '../api';
import { useAuth } from '../AuthContext';

interface CartItem {
  inventory_id: number;
  name: string;
  price: number;
  quantity: number;
}

interface SalesUser {
  id: number;
  name: string;
  employee_code?: string;
  position?: string;
}

interface RefundTransaction {
  id: number;
  transaction_number: string;
  total: number;
  transaction_date: string;
  customer_name?: string | null;
}

function POS() {
  const { hasRole } = useAuth();
  const canManageRefunds = hasRole('manager', 'super_admin');
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentReceived, setPaymentReceived] = useState('');
  const [discount, setDiscount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [closureLoading, setClosureLoading] = useState(false);
  const [closureSummary, setClosureSummary] = useState<any | null>(null);
  const [savingClosure, setSavingClosure] = useState(false);
  // Refund states
  const [refundTxId, setRefundTxId] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundRestock, setRefundRestock] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundLookupLoading, setRefundLookupLoading] = useState(false);
  const [verifiedRefundTx, setVerifiedRefundTx] = useState<RefundTransaction | null>(null);
  const [refundCandidates, setRefundCandidates] = useState<RefundTransaction[]>([]);
  const [refundLookupMessage, setRefundLookupMessage] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);

  useEffect(() => {
    loadInventory();
    loadSalesUsers();
  }, [searchTerm]);

  const loadInventory = async () => {
    try {
      const response = await inventoryAPI.getAll({ search: searchTerm });
      setItems(response.data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    }
  };

  const loadSalesUsers = async () => {
    try {
      const response = await salesUserAPI.getAll({ active_only: true });
      setSalesUsers(response.data);
      // Auto-select first user if available
      if (response.data.length > 0 && !selectedUserId) {
        setSelectedUserId(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load sales users:', err);
    }
  };

  const addToCart = (item: any) => {
    const existingItem = cart.find((i) => i.inventory_id === item.id);
    if (existingItem) {
      setCart(
        cart.map((i) =>
          i.inventory_id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          inventory_id: item.id,
          name: item.name,
          price: item.unit_price,
          quantity: 1,
        },
      ]);
    }
  };

  const removeFromCart = (inventory_id: number) => {
    setCart(cart.filter((i) => i.inventory_id !== inventory_id));
  };

  const updateQuantity = (inventory_id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(inventory_id);
    } else {
      setCart(
        cart.map((i) =>
          i.inventory_id === inventory_id ? { ...i, quantity } : i
        )
      );
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - parseFloat(discount || '0');
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const received = parseFloat(paymentReceived || '0');
    return received - total;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const total = calculateTotal();
    const received = parseFloat(paymentReceived || '0');

    if (received < total) {
      alert('Insufficient payment received!');
      return;
    }

    if (!selectedUserId) {
      alert('Please select a sales user!');
      return;
    }

    try {
      setLoading(true);
      const transactionData = {
        items: cart.map((item) => ({
          inventory_id: item.inventory_id,
          quantity: item.quantity,
        })),
        customer_name: customerName || null,
        payment_method: paymentMethod,
        payment_received: received,
        discount: parseFloat(discount || '0'),
        sales_user_id: selectedUserId,
      };

      const response = await posAPI.createTransaction(transactionData);
      
      setLastTransactionId(response.data.id);
      setShowSuccessModal(true);
      setCart([]);
      setCustomerName('');
      setPaymentReceived('');
      setDiscount('0');
      loadInventory();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Transaction failed!');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (closeModalOnSuccess = false) => {
    const txId = verifiedRefundTx?.id;
    const amount = Number.parseFloat(refundAmount);

    if (!txId) {
      alert('Please verify a transaction first');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Invalid refund amount');
      return;
    }

    if (amount > (verifiedRefundTx?.total || 0)) {
      alert(`Refund amount cannot exceed transaction total ($${(verifiedRefundTx?.total || 0).toFixed(2)})`);
      return;
    }

    if (!confirm(`Proceed with refund of $${amount.toFixed(2)} for transaction ${verifiedRefundTx?.transaction_number || txId}?`)) {
      return;
    }

    try {
      setRefundLoading(true);
      const data = {
        amount,
        reason: refundReason || undefined,
        restock: refundRestock,
      };
      const res = await posAPI.refundTransaction(txId, data);
      alert('Refund processed. New balance: ' + (res.data?.new_balance ?? res.data?.newBalance));
      setRefundTxId('');
      setRefundAmount('');
      setRefundReason('');
      setRefundRestock(false);
      setVerifiedRefundTx(null);
      if (closeModalOnSuccess) {
        setShowRefundModal(false);
      }
      loadInventory();
    } catch (err: any) {
      console.error('Refund failed:', err);
      alert(err.response?.data?.detail || 'Refund failed');
    } finally {
      setRefundLoading(false);
    }
  };

  const handleRefundTxInputChange = (value: string) => {
    setRefundTxId(value);
    setVerifiedRefundTx(null);
    setRefundCandidates([]);
    setRefundLookupMessage('');
  };

  const selectRefundTransaction = (tx: RefundTransaction) => {
    setVerifiedRefundTx(tx);
    setRefundTxId(tx.transaction_number || String(tx.id));
    setRefundCandidates([]);
    setRefundLookupMessage(`Verified: ${tx.transaction_number} (Total $${(tx.total || 0).toFixed(2)})`);
  };

  const verifyRefundTransaction = async () => {
    const lookup = refundTxId.trim();
    if (!lookup) {
      alert('Enter invoice/transaction number first');
      return;
    }

    try {
      setRefundLookupLoading(true);
      setVerifiedRefundTx(null);
      setRefundCandidates([]);
      setRefundLookupMessage('');
      let tx: RefundTransaction | null = null;

      if (/^\d+$/.test(lookup)) {
        const res = await posAPI.getTransaction(Number.parseInt(lookup, 10));
        tx = res.data;
      } else {
        const res = await posAPI.getTransactions({ search: lookup, limit: 10 });
        const matches: RefundTransaction[] = res.data || [];
        const exactMatch = matches.find((m) => (m.transaction_number || '').toLowerCase() === lookup.toLowerCase());

        if (exactMatch) {
          tx = exactMatch;
        } else if (matches.length === 1) {
          tx = matches[0];
        } else if (matches.length > 1) {
          setRefundCandidates(matches);
          setRefundLookupMessage(`Found ${matches.length} matches. Select the correct transaction below.`);
          return;
        }
      }

      if (!tx) {
        setRefundLookupMessage('Transaction not found');
        setVerifiedRefundTx(null);
        return;
      }

      selectRefundTransaction(tx);
    } catch (err: any) {
      setVerifiedRefundTx(null);
      setRefundCandidates([]);
      if (err.response?.status === 404) {
        setRefundLookupMessage('Transaction not found');
      } else {
        setRefundLookupMessage(err.response?.data?.detail || 'Failed to verify transaction');
      }
    } finally {
      setRefundLookupLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h1>Point of Sale (POS)</h1>
          <p>Process sales transactions</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={async () => {
              if (!selectedUserId) {
                alert('Please select a sales user to close cashier for.');
                return;
              }
              try {
                setClosureLoading(true);
                const start = new Date();
                start.setHours(0,0,0,0);
                const end = new Date();
                const res = await posAPI.createClosure({ sales_user_id: selectedUserId, start_date: start.toISOString(), end_date: end.toISOString(), save_to_ledger: false });
                setClosureSummary(res.data || res);
                setShowClosureModal(true);
              } catch (err: any) {
                console.error('Failed to compute closure:', err);
                alert(err.response?.data?.detail || 'Failed to compute closure');
              } finally {
                setClosureLoading(false);
              }
            }}
            className="button"
            style={{ padding: '10px 14px', backgroundColor: '#3498db', color: 'white', borderRadius: 6 }}
          >
            {closureLoading ? 'Preparing...' : 'Close Cashier'}
          </button>

          {canManageRefunds && (
            <button
              onClick={() => setShowRefundModal(true)}
              className="button"
              style={{ padding: '10px 14px', backgroundColor: '#e67e22', color: 'white', borderRadius: 6 }}
            >
              Refund
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Products Section */}
        <div className="card">
          <h3>Select Products</h3>
          
          {/* Sales User Selection */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Sales User *
            </label>
            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '5px', 
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="">Select sales user...</option>
              {salesUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.employee_code ? `(${user.employee_code})` : ''}
                  {user.position ? ` - ${user.position}` : ''}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', maxHeight: '500px', overflowY: 'auto' }}>
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => item.quantity > 0 && addToCart(item)}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  cursor: item.quantity > 0 ? 'pointer' : 'not-allowed',
                  opacity: item.quantity > 0 ? 1 : 0.5,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  if (item.quantity > 0) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#3498db';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#ddd';
                }}
              >
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{item.name}</h4>
                <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '14px' }}>{item.sku}</p>
                <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#27ae60', fontSize: '18px' }}>
                  ${item.unit_price.toFixed(2)}
                </p>
                <p style={{ margin: '5px 0', color: item.quantity > 0 ? '#27ae60' : '#e74c3c', fontSize: '12px' }}>
                  Stock: {item.quantity}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="card">
          <h3>Cart</h3>
          
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
              Cart is empty
            </p>
          ) : (
            <>
              <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                {cart.map((item) => (
                  <div
                    key={item.inventory_id}
                    style={{
                      padding: '10px',
                      marginBottom: '10px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '5px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{item.name}</strong>
                        <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '14px' }}>
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.inventory_id, parseInt(e.target.value) || 0)
                          }
                          style={{ width: '60px', padding: '5px' }}
                        />
                        <button
                          onClick={() => removeFromCart(item.inventory_id)}
                          className="button button-danger"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '5px', fontWeight: 'bold' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '2px solid #ddd', paddingTop: '15px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label>Customer Name (Optional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="form-group">
                  <label>Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                  <strong>Subtotal:</strong> ${calculateSubtotal().toFixed(2)}
                </div>
                <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                  <strong>Discount:</strong> -${parseFloat(discount || '0').toFixed(2)}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60', marginBottom: '15px' }}>
                  <strong>Total:</strong> ${calculateTotal().toFixed(2)}
                </div>

                <div className="form-group">
                  <label>Payment Received *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentReceived}
                    onChange={(e) => setPaymentReceived(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                {paymentReceived && (
                  <div style={{ fontSize: '18px', marginBottom: '15px', color: calculateChange() >= 0 ? '#27ae60' : '#e74c3c' }}>
                    <strong>Change:</strong> ${calculateChange().toFixed(2)}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="button button-success"
                  style={{ width: '100%', padding: '15px', fontSize: '16px' }}
                >
                  {loading ? 'Processing...' : 'Complete Sale'}
                </button>
                {/* Refund Section (minimal) */}
                {canManageRefunds && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #ddd' }}>
                  <h4 style={{ marginBottom: '8px' }}>Refund Transaction (minimal)</h4>
                  <div className="form-group">
                    <label>Invoice / Transaction Number</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        value={refundTxId}
                        onChange={(e) => handleRefundTxInputChange(e.target.value)}
                        placeholder="Enter invoice no. or transaction ID"
                        style={{ flex: 1 }}
                      />
                      <button
                        className="button"
                        onClick={verifyRefundTransaction}
                        disabled={refundLookupLoading}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {refundLookupLoading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                  {!!refundLookupMessage && (
                    <div style={{ marginBottom: 10, color: verifiedRefundTx ? '#27ae60' : '#7f8c8d' }}>
                      {refundLookupMessage}
                    </div>
                  )}
                  {refundCandidates.length > 0 && (
                    <div style={{ marginBottom: 10, border: '1px solid #ddd', borderRadius: 6, maxHeight: 180, overflowY: 'auto' }}>
                      {refundCandidates.map((tx) => (
                        <div key={tx.id} style={{ padding: 10, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{tx.transaction_number}</div>
                            <div style={{ fontSize: 12, color: '#7f8c8d' }}>
                              {tx.customer_name || 'Walk-in'} | ${Number(tx.total || 0).toFixed(2)} | {new Date(tx.transaction_date).toLocaleString()}
                            </div>
                          </div>
                          <button className="button" onClick={() => selectRefundTransaction(tx)} style={{ whiteSpace: 'nowrap' }}>
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {verifiedRefundTx && (
                    <div style={{ marginBottom: 10, padding: 10, border: '1px solid #27ae60', borderRadius: 6, backgroundColor: '#ecf9f0' }}>
                      <div><strong>Verified:</strong> {verifiedRefundTx.transaction_number}</div>
                      <div>Total: ${Number(verifiedRefundTx.total || 0).toFixed(2)}</div>
                      <div>Date: {new Date(verifiedRefundTx.transaction_date).toLocaleString()}</div>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Amount</label>
                    <input type="number" step="0.01" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label>Reason (optional)</label>
                    <input type="text" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Refund reason" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <input id="restock" type="checkbox" checked={refundRestock} onChange={(e) => setRefundRestock(e.target.checked)} />
                    <label htmlFor="restock">Restock items</label>
                  </div>
                  <button
                    onClick={() => handleRefund(false)}
                    disabled={refundLoading || !verifiedRefundTx}
                    className="button button-warning"
                    style={{ width: '100%', marginTop: 8, backgroundColor: '#e67e22', color: 'white' }}
                  >
                    {refundLoading ? 'Processing...' : 'Process Refund'}
                  </button>
                </div>
                )}
                <button
                  onClick={async () => {
                    if (!selectedUserId) {
                      alert('Please select a sales user to close cashier for.');
                      return;
                    }
                    // request closure summary from backend
                    try {
                      setClosureLoading(true);
                      const start = new Date();
                      start.setHours(0,0,0,0);
                      const end = new Date();
                      const res = await posAPI.createClosure({ sales_user_id: selectedUserId, start_date: start.toISOString(), end_date: end.toISOString(), save_to_ledger: false });
                      setClosureSummary(res.data || res);
                      setShowClosureModal(true);
                    } catch (err: any) {
                      console.error('Failed to compute closure:', err);
                      alert(err.response?.data?.detail || 'Failed to compute closure');
                    } finally {
                      setClosureLoading(false);
                    }
                  }}
                  className="button"
                  style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '8px', backgroundColor: '#3498db', color: 'white' }}
                >
                  {closureLoading ? 'Preparing...' : 'Close Cashier'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success Modal with Print Options */}
      {showSuccessModal && lastTransactionId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '10px',
              maxWidth: '500px',
              width: '90%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ marginTop: 0, color: '#27ae60' }}>Sale Completed Successfully!</h2>
            <p style={{ color: '#7f8c8d', fontSize: '18px', marginBottom: '30px' }}>
              Transaction has been recorded
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="button button-success"
                onClick={async () => {
                  try {
                    // Check if browser supports Web Serial API
                    if (!('serial' in navigator)) {
                      alert('⚠️ Web Serial API not supported in this browser.\n\nPlease use Chrome, Edge, or Opera browser for direct printing.');
                      return;
                    }

                    const response = await fetch(`http://localhost:8005/api/pos/transactions/${lastTransactionId}/receipt/escpos`);
                    
                    if (response.status === 503) {
                      alert('ESC/POS library not available on server.\n\nThermal printing requires the python-escpos library.');
                      return;
                    }
                    
                    if (!response.ok) {
                      throw new Error('Failed to generate receipt');
                    }
                    
                    const blob = await response.blob();
                    const arrayBuffer = await blob.arrayBuffer();
                    const data = new Uint8Array(arrayBuffer);
                    
                    // Request serial port access
                    const port = await (navigator as any).serial.requestPort();
                    await port.open({ baudRate: 9600 });
                    
                    // Write ESC/POS data to the printer
                    const writer = port.writable.getWriter();
                    await writer.write(data);
                    writer.releaseLock();
                    
                    // Close the port
                    await port.close();
                    
                    alert('✅ Receipt printed successfully!');
                    setShowSuccessModal(false);
                  } catch (error: any) {
                    console.error('Error printing receipt:', error);
                    
                    if (error.name === 'NotFoundError') {
                      alert('❌ No printer selected.\n\nPlease select your thermal printer when prompted.');
                    } else if (error.name === 'NetworkError') {
                      alert('❌ Could not connect to printer.\n\nMake sure the printer is turned on and connected.');
                    } else {
                      alert('❌ Failed to print receipt.\n\nError: ' + error.message);
                    }
                  }
                }}
                style={{ padding: '15px 24px', fontSize: '16px', width: '100%' }}
              >
                🖨️ Print Receipt (Thermal Printer)
              </button>
              <button
                className="button"
                onClick={() => setShowSuccessModal(false)}
                style={{ padding: '15px 24px', fontSize: '16px', backgroundColor: '#95a5a6', color: 'white', width: '100%' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal (accessible from header Refund button) */}
      {canManageRefunds && showRefundModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowRefundModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '10px',
              maxWidth: '480px',
              width: '95%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Process Refund</h2>
            <div className="form-group">
              <label>Invoice / Transaction Number</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={refundTxId}
                  onChange={(e) => handleRefundTxInputChange(e.target.value)}
                  placeholder="Enter invoice no. or transaction ID"
                  style={{ flex: 1 }}
                />
                <button
                  className="button"
                  onClick={verifyRefundTransaction}
                  disabled={refundLookupLoading}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {refundLookupLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
            {!!refundLookupMessage && (
              <div style={{ marginBottom: 10, color: verifiedRefundTx ? '#27ae60' : '#7f8c8d' }}>
                {refundLookupMessage}
              </div>
            )}
            {refundCandidates.length > 0 && (
              <div style={{ marginBottom: 10, border: '1px solid #ddd', borderRadius: 6, maxHeight: 180, overflowY: 'auto' }}>
                {refundCandidates.map((tx) => (
                  <div key={tx.id} style={{ padding: 10, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{tx.transaction_number}</div>
                      <div style={{ fontSize: 12, color: '#7f8c8d' }}>
                        {tx.customer_name || 'Walk-in'} | ${Number(tx.total || 0).toFixed(2)} | {new Date(tx.transaction_date).toLocaleString()}
                      </div>
                    </div>
                    <button className="button" onClick={() => selectRefundTransaction(tx)} style={{ whiteSpace: 'nowrap' }}>
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
            {verifiedRefundTx && (
              <div style={{ marginBottom: 10, padding: 10, border: '1px solid #27ae60', borderRadius: 6, backgroundColor: '#ecf9f0' }}>
                <div><strong>Verified:</strong> {verifiedRefundTx.transaction_number}</div>
                <div>Total: ${Number(verifiedRefundTx.total || 0).toFixed(2)}</div>
                <div>Date: {new Date(verifiedRefundTx.transaction_date).toLocaleString()}</div>
              </div>
            )}
            <div className="form-group">
              <label>Amount</label>
              <input type="number" step="0.01" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Reason (optional)</label>
              <input type="text" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Refund reason" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <input id="restock_modal" type="checkbox" checked={refundRestock} onChange={(e) => setRefundRestock(e.target.checked)} />
              <label htmlFor="restock_modal">Restock items</label>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => handleRefund(true)}
                disabled={refundLoading || !verifiedRefundTx}
                className="button button-warning"
                style={{ padding: '10px 14px', backgroundColor: '#e67e22', color: 'white', borderRadius: 6, flex: 1 }}
              >
                {refundLoading ? 'Processing...' : 'Process Refund'}
              </button>

              <button
                className="button"
                onClick={() => setShowRefundModal(false)}
                style={{ padding: '10px 14px', borderRadius: 6 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cashier Closure Modal */}
      {showClosureModal && closureSummary && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowClosureModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '10px',
              maxWidth: '600px',
              width: '95%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Cashier Closure Summary</h2>
            <p style={{ color: '#7f8c8d' }}>User ID: {selectedUserId}</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: 12 }}>
              <div style={{ flex: '1 1 40%', padding: 12, background: '#f8f9fa', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: '#7f8c8d' }}>Transactions</div>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>{closureSummary.transaction_count}</div>
              </div>
              <div style={{ flex: '1 1 55%', padding: 12, background: '#f8f9fa', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: '#7f8c8d' }}>Total Sales</div>
                <div style={{ fontSize: 20, fontWeight: 'bold' }}>${closureSummary.total_sales.toFixed(2)}</div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <h4 style={{ margin: '8px 0' }}>By Payment Method</h4>
              <ul>
                {Object.entries(closureSummary.by_payment_method || closureSummary.by_method || {}).map(([m, amt]: any) => (
                  <li key={m} style={{ color: '#333' }}>{m}: ${amt.toFixed(2)}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <button
                className="button button-success"
                onClick={async () => {
                  try {
                    setSavingClosure(true);
                    const res = await posAPI.createClosure({ sales_user_id: selectedUserId, start_date: closureSummary.start, end_date: closureSummary.end, save_to_ledger: true });
                    alert('Closure saved to ledger.');
                    setClosureSummary(res.data || res);
                    setShowClosureModal(false);
                  } catch (err: any) {
                    console.error('Failed to save closure:', err);
                    alert(err.response?.data?.detail || 'Failed to save closure');
                  } finally {
                    setSavingClosure(false);
                  }
                }}
                disabled={savingClosure}
                style={{ flex: 1, padding: '12px' }}
              >
                {savingClosure ? 'Saving...' : 'Save Closure'}
              </button>

              <button
                className="button"
                onClick={() => {
                  // simple print of the modal content
                  const w = window.open('', '_blank');
                  if (w) {
                    w.document.write('<pre>' + JSON.stringify(closureSummary, null, 2) + '</pre>');
                    w.document.close();
                    w.print();
                    w.close();
                  }
                }}
                style={{ flex: 1, padding: '12px', backgroundColor: '#95a5a6', color: 'white' }}
              >
                Print Summary
              </button>

              <button
                className="button"
                onClick={() => setShowClosureModal(false)}
                style={{ padding: '12px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default POS;
