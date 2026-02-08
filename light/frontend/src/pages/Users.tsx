import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { useAuth } from '../AuthContext';

interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    role: 'cashier',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUsers();
  }, [showInactive]);

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Password validation
    if (!editingUser && !formData.password.trim()) {
      // Password is required for new users
      newErrors.password = 'Password is required for new users';
    } else if (formData.password.trim() && formData.password.trim().length < 6) {
      // Password must be at least 6 characters if provided
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData: any = {
        username: formData.username,
        email: formData.email || null,
        full_name: formData.full_name || null,
        role: formData.role,
      };

      if (editingUser) {
        // For edit, include password only if provided
        const updateData: any = {
          email: submitData.email,
          full_name: submitData.full_name,
          role: submitData.role,
          is_active: formData.is_active,
        };
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        await authAPI.updateUser(editingUser.id, updateData);
      } else {
        // Include password for new users
        submitData.password = formData.password;
        await authAPI.createUser(submitData);
      }

      resetForm();
      fetchUsers();
      alert(editingUser ? 'User updated successfully' : 'User created successfully');
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.detail || 'Failed to save user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't pre-fill password
      email: user.email || '',
      full_name: user.full_name || '',
      role: user.role,
      is_active: user.is_active,
    });
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
      alert('Cannot delete your own account');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await authAPI.deleteUser(id);
      fetchUsers();
      alert('User deleted successfully');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      full_name: '',
      role: 'cashier',
      is_active: true,
    });
    setEditingUser(null);
    setShowForm(false);
    setErrors({});
  };

  const activeUsers = users.filter(u => u.is_active);
  const displayedUsers = showInactive ? users : activeUsers;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>👥 Users Management</h1>
          <p>Manage system users and their roles</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✖ Cancel' : '➕ Add User'}
        </button>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
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
          <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    if (errors.username) {
                      setErrors({ ...errors, username: '' });
                    }
                  }}
                  placeholder="Enter username"
                  disabled={!!editingUser}
                />
                {errors.username && (
                  <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.username}</span>
                )}
              </div>

              <div className="form-group">
                <label>Password {editingUser ? '(optional to change)' : '*'}</label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) {
                      setErrors({ ...errors, password: '' });
                    }
                  }}
                  placeholder={editingUser ? 'Leave empty to keep current password' : 'Enter password'}
                />
                {errors.password && (
                  <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <span style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="super_admin">Super Admin</option>
                </select>
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
        <h2>Users</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : displayedUsers.length === 0 ? (
          <p>No users found. Add your first user to get started.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr key={user.id} style={{ opacity: user.is_active ? 1 : 0.6 }}>
                  <td style={{ fontWeight: 'bold' }}>
                    {user.id === currentUser?.id && (
                      <span style={{ marginRight: '5px', color: '#3498db' }}>👤</span>
                    )}
                    {user.username}
                  </td>
                  <td>{user.full_name || '-'}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor:
                          user.role === 'super_admin'
                            ? '#fadbd8'
                            : user.role === 'manager'
                              ? '#fce4b6'
                              : '#d5f4e6',
                        color:
                          user.role === 'super_admin'
                            ? '#721c24'
                            : user.role === 'manager'
                              ? '#7d6608'
                              : '#0f5132',
                      }}
                    >
                      {user.role.toUpperCase().replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: user.is_active ? '#d5f4e6' : '#fadbd8',
                        color: user.is_active ? '#0f5132' : '#721c24',
                      }}
                    >
                      {user.is_active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td>{user.last_login ? new Date(user.last_login).toLocaleString() : '-'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    
                      <>
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
                      </>
                    {user.id !== currentUser?.id ? (<span></span>) : (
                      <span style={{ color: '#95a5a6', fontSize: '12px' }}>Current user</span>
                    )}
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

export default Users;
