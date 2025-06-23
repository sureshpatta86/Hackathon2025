'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminOnly } from '@/components/AdminOnly';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/form';
import { useNotification } from '@/components/ui/notification';
import { PaginatedTable, TableColumn } from '@/components/ui/PaginatedTable';
import { Plus, Edit2, Trash2, X, Check, Settings, Users, Cog } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsTab } from '@/components/dashboard';
import type { User } from '@/types';

interface UserFormData {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

function AdminPanelPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    role: 'user'
  });
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<{
    messagingMode: string;
    twilioConfigured: boolean;
    twilioPhoneNumber: string | null;
  } | null>(null);

  const { addNotification } = useNotification();

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
      });

      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      } else {
        addNotification('error', 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      addNotification('error', 'Failed to fetch users');
    }
  }, [addNotification]);

  // Settings actions
  const fetchSettingsAction = useCallback(async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchSettingsAction(); // Load settings on mount

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      fetchSettingsAction();
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate);
    };
  }, [fetchUsers, fetchSettingsAction]);

  // Table columns
  const userColumns: TableColumn<User>[] = [
    {
      key: 'username',
      header: 'Username',
      render: (user) => (
        <div className="font-medium text-gray-900">{user.username}</div>
      ),
      width: '30%'
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      ),
      width: '20%'
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (user) => (
        <div className="text-sm text-gray-500">
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        </div>
      ),
      width: '25%'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleEditUser(user);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          {user.role === 'user' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteUser(user)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      width: '25%'
    }
  ];

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      addNotification('error', 'Username and password are required');
      return;
    }

    try {
      setSaving(true);
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        addNotification('success', editingUser ? 'User updated successfully' : 'User created successfully');
        setShowCreateModal(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', role: 'user' });
        fetchUsers();
      } else {
        const error = await response.json();
        addNotification('error', error.error || 'Failed to save user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      addNotification('error', 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't pre-fill password
      role: user.role
    });
    setShowCreateModal(true);
  };

  // Handle delete user
  const handleDeleteUser = async (user: User) => {
    if (user.role === 'admin') {
      addNotification('error', 'Cannot delete admin users');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        addNotification('success', 'User deleted successfully');
        fetchUsers();
      } else {
        const error = await response.json();
        addNotification('error', error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      addNotification('error', 'Failed to delete user');
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'user' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation variant="admin" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Welcome back, {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1) : 'Administrator'}! 👋
                </h2>
                <p className="text-purple-100 mt-1">
                  Manage your users and oversee system operations from here.
                </p>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-white text-sm font-medium">Total Users</div>
                <div className="text-2xl font-bold text-white">{users.length}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Manage users and system settings</p>
          </div>
          {activeTab === 'users' && (
            <Button onClick={() => setShowCreateModal(true)} variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                User Management
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Cog className="h-4 w-4 inline mr-2" />
                System Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Input
                  type="text"
                  placeholder="Search users by username or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            <PaginatedTable<User>
              data={users}
              columns={userColumns}
              title={`Users (${users.length})`}
              searchQuery={searchQuery}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            settings={settings}
            fetchSettingsAction={fetchSettingsAction}
            setActiveTabAction={setActiveTab}
          />
        )}

        {/* User Management - Legacy content (to be removed) */}
        <div style={{ display: 'none' }}>
        </div>

        {/* Create/Edit User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{editingUser ? 'Edit User' : 'Create New User'}</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCloseModal}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <Input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      placeholder="Enter username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {editingUser && '(leave blank to keep current)'}
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      placeholder="Enter password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <Select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          {editingUser ? 'Update' : 'Create'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <AdminOnly>
      <AdminPanelPage />
    </AdminOnly>
  );
}
