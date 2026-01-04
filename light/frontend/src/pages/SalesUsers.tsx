import React, { useState, useEffect } from 'react';
import { salesUserAPI } from '../api';

interface SalesUser {
  id: number;
  name: string;
  employee_code?: string;
  phone?: string;
  email?: string;
  position?: string;
  is_active: boolean;
  created_at: string;
}

function SalesUsers() {
  const [users, setUsers] = useState<SalesUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<SalesUser | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    employee_code: '',
    phone: '',
    email: '',
    position: '',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, [showInactive]);

  const fetchUsers = async () => {
    try {
      const response = await salesUserAPI.getAll({ active_only: !showInactive });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching sales users:', error);
      alert('Failed to load sales users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await salesUserAPI.update(editingUser.id, formData);
      } else {
        await salesUserAPI.create(formData);
      }

      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving sales user:', error);
      alert(error.response?.data?.detail || 'Failed to save sales user');
    }
  };

  const handleEdit = (user: SalesUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      employee_code: user.employee_code || '',
      phone: user.phone || '',
      email: user.email || '',
      position: user.position || '',
      is_active: user.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sales user?')) return;

    try {
      await salesUserAPI.delete(id);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting sales user:', error);
      alert(error.response?.data?.detail || 'Failed to delete sales user');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      employee_code: '',
      phone: '',
      email: '',
      position: '',
      is_active: true,
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const activeUsers = users.filter(u => u.is_active);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>👥 Sales Users</h1>
          <p>Manage sales staff and cashiers for POS transactions</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖ Cancel' : '➕ Add User'}
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
          <h3>Total Users</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3498db' }}>
            {users.length}
          </div>
        </div>
        <div className="card">
          <h3>Active Users</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2ecc71' }}>
            {activeUsers.length}
          </div>
        </div>
        <div className="card">
          <h3>Inactive Users</h3>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e74c3c' }}>
            {users.length - activeUsers.length}
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>{editingUser ? 'Edit Sales User' : 'Add New Sales User'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label>Employee Code</label>
                <input
                  type="text"
                  value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                  placeholder="e.g., EMP001"
                />
              </div>

              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., Cashier, Sales Associate"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="button button-primary">
                {editingUser ? '💾 Update User' : '➕ Add User'}
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
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          <span style={{ fontWeight: 'bold' }}>Show inactive users</span>
        </label>
      </div>

      {/* Users Table */}
      <div className="card">
        <h2>Sales Users</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No sales users found. Add your first user to get started.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee Code</th>
                <th>Position</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ opacity: user.is_active ? 1 : 0.6 }}>
                  <td style={{ fontWeight: 'bold' }}>{user.name}</td>
                  <td>
                    {user.employee_code ? (
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#ecf0f1',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'monospace'
                      }}>
                        {user.employee_code}
                      </span>
                    ) : '-'}
                  </td>
                  <td>{user.position || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: user.is_active ? '#d5f4e6' : '#fadbd8',
                      color: user.is_active ? '#0f5132' : '#721c24'
                    }}>
                      {user.is_active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="button button-sm button-secondary"
                      onClick={() => handleEdit(user)}
                      style={{ marginRight: '5px' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="button button-sm button-danger"
                      onClick={() => handleDelete(user.id)}
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

export default SalesUsers;
