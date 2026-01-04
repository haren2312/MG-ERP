import React, { useState, useEffect } from 'react';
import { expenseAPI } from '../api';

interface Expense {
  id: number;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  vendor?: string;
  receipt_number?: string;
  notes?: string;
  recorded_by?: number;
  created_at: string;
}

const CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: 'other',
    description: '',
    amount: '',
    payment_method: 'cash',
    vendor: '',
    receipt_number: '',
    notes: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll({ category: categoryFilter || undefined });
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      alert('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        expense_date: new Date(formData.expense_date).toISOString(),
      };

      if (editingExpense) {
        await expenseAPI.update(editingExpense.id, expenseData);
      } else {
        await expenseAPI.create(expenseData);
      }

      resetForm();
      fetchExpenses();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      alert(error.response?.data?.detail || 'Failed to save expense');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      expense_date: expense.expense_date.split('T')[0],
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      payment_method: expense.payment_method,
      vendor: expense.vendor || '',
      receipt_number: expense.receipt_number || '',
      notes: expense.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expenseAPI.delete(id);
      fetchExpenses();
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      alert(error.response?.data?.detail || 'Failed to delete expense');
    }
  };

  const resetForm = () => {
    setFormData({
      expense_date: new Date().toISOString().split('T')[0],
      category: 'other',
      description: '',
      amount: '',
      payment_method: 'cash',
      vendor: '',
      receipt_number: '',
      notes: '',
    });
    setEditingExpense(null);
    setShowForm(false);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>💰 Expenses</h1>
          <p>Track and manage business expenses</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖ Cancel' : '➕ Add Expense'}
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div className="card">
          <h3>Total Expenses</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e74c3c' }}>
            ${totalExpenses.toFixed(2)}
          </div>
        </div>
        <div className="card">
          <h3>Total Records</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3498db' }}>
            {expenses.length}
          </div>
        </div>
        <div className="card">
          <h3>Average Expense</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9b59b6' }}>
            ${expenses.length ? (totalExpenses / expenses.length).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter expense description"
                />
              </div>

              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  required
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                >
                  {PAYMENT_METHODS.map(pm => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Vendor</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Vendor name"
                />
              </div>

              <div className="form-group">
                <label>Receipt Number</label>
                <input
                  type="text"
                  value={formData.receipt_number}
                  onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                  placeholder="Receipt #"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="button button-primary">
                {editingExpense ? '💾 Update Expense' : '➕ Add Expense'}
              </button>
              <button type="button" className="button button-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold' }}>Filter by Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              fetchExpenses();
            }}
            style={{ maxWidth: '200px' }}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <h2>Expense Records</h2>
        {loading ? (
          <p>Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses found. Add your first expense to get started.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Vendor</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Receipt #</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                  <td>
                    <span className="badge" style={{ 
                      backgroundColor: getCategoryColor(expense.category),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {expense.category}
                    </span>
                  </td>
                  <td>{expense.description}</td>
                  <td>{expense.vendor || '-'}</td>
                  <td style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {expense.payment_method.replace('_', ' ')}
                  </td>
                  <td>{expense.receipt_number || '-'}</td>
                  <td>
                    <button
                      className="button button-sm button-secondary"
                      onClick={() => handleEdit(expense)}
                      style={{ marginRight: '5px' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="button button-sm button-danger"
                      onClick={() => handleDelete(expense.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    rent: '#e74c3c',
    utilities: '#3498db',
    salaries: '#2ecc71',
    supplies: '#f39c12',
    maintenance: '#9b59b6',
    marketing: '#1abc9c',
    transportation: '#34495e',
    other: '#95a5a6',
  };
  return colors[category] || '#95a5a6';
}

export default Expenses;
