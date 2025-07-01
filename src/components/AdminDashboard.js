import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, applicationsAPI } from '../services/api';
import PostsManager from './PostsManager';
import JobsManager from './JobsManager';
import ApplicationsManager from './ApplicationsManager';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    users: 0,
    recentRegistrations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        usersAPI.getUsers(),
        usersAPI.getStats()
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.users);
      }

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await usersAPI.deleteUser(userId);
        if (response.success) {
          await fetchData(); // Refresh data
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const response = await usersAPI.toggleUserStatus(userId);
      if (response.success) {
        await fetchData(); // Refresh data
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'posts':
        return <PostsManager />;
      case 'jobs':
        return <JobsManager />;
      case 'applications':
        return <ApplicationsManager />;
      case 'users':
        return renderUsersTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <>
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-number">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <div className="stat-number">{stats.active}</div>
        </div>
        <div className="stat-card">
          <h3>Admin Users</h3>
          <div className="stat-number">{stats.admins}</div>
        </div>
        <div className="stat-card">
          <h3>Regular Users</h3>
          <div className="stat-number">{stats.users}</div>
        </div>
      </div>
      
      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => setActiveTab('posts')} className="action-btn">
            Manage Posts
          </button>
          <button onClick={() => setActiveTab('jobs')} className="action-btn">
            Manage Jobs
          </button>
          <button onClick={() => setActiveTab('users')} className="action-btn">
            Manage Users
          </button>
          <button className="action-btn">System Settings</button>
        </div>
      </div>
    </>
  );

  const renderUsersTab = () => (
    <>
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-number">{stats.total}</div>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <div className="stat-number">{stats.active}</div>
        </div>
        <div className="stat-card">
          <h3>Admin Users</h3>
          <div className="stat-number">{stats.admins}</div>
        </div>
        <div className="stat-card">
          <h3>Regular Users</h3>
          <div className="stat-number">{stats.users}</div>
        </div>
      </div>
      
      <div className="users-section">
        <h2>User Management</h2>
        
        {users.length === 0 ? (
          <div className="no-users">
            <p>No registered users yet. Users will appear here after registration.</p>
          </div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(userData => (
                  <tr key={userData._id}>
                    <td>{userData._id.slice(-6)}</td>
                    <td>{userData.username}</td>
                    <td>{userData.email}</td>
                    <td>
                      <span className={`role-badge ${userData.role}`}>
                        {userData.role}
                      </span>
                    </td>
                    <td>{new Date(userData.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => toggleUserStatus(userData._id)}
                        className={`status-btn ${userData.isActive ? 'active' : 'inactive'}`}
                      >
                        {userData.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => deleteUser(userData._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.username}! Manage your company portal here.</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button 
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Jobs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default AdminDashboard;
