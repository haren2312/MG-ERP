import { useEffect, useState } from 'react';
import { inventoryAPI, posAPI, salesUserAPI } from '../api';

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

function POS() {
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

  return (
    <div>
      <div className="page-header">
        <h1>Point of Sale (POS)</h1>
        <p>Process sales transactions</p>
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
    </div>
  );
}

export default POS;
