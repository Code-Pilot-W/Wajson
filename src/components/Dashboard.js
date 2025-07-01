import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import ProfileSection from './dashboard/ProfileSection';
import StatsSection from './dashboard/StatsSection';
import ActivitySection from './dashboard/ActivitySection';
import SettingsSection from './dashboard/SettingsSection';
import { NewsGold, LinkGold, CameraGold, BriefcaseGold } from './dashboard/GoldIcons';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [profileResponse, statsResponse] = await Promise.all([
        profileAPI.getProfile(),
        profileAPI.getStats()
      ]);

      if (profileResponse.success) {
        setProfile(profileResponse.profile);
      } else {
        setError('Failed to load profile data');
      }

      if (statsResponse.success) {
        setStats(statsResponse.stats);
      } else {
        console.warn('Failed to load stats, using defaults');
        setStats({
          loginCount: 0,
          postsViewed: 0,
          jobsViewed: 0,
          profileViews: 0,
          memberSince: user?.createdAt || new Date(),
          lastLogin: user?.lastLogin,
          accountAge: '0 years, 0 months'
        });
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileSection 
            profile={profile} 
            onUpdate={handleProfileUpdate}
            onRefresh={fetchDashboardData}
          />
        );
      case 'stats':
        return <StatsSection stats={stats} profile={profile} />;
      case 'activity':
        return <ActivitySection profile={profile} />;
      case 'settings':
        return (
          <SettingsSection 
            profile={profile} 
            onUpdate={handleProfileUpdate}
          />
        );
      default:
        return (
          <ProfileSection 
            profile={profile} 
            onUpdate={handleProfileUpdate}
            onRefresh={fetchDashboardData}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header with Profile Banner */}
      <div className="dashboard-header">
        <div className="cover-section">
          {profile?.profile?.coverImage && (
            <img src={getImageUrl(profile.profile.coverImage)} alt="Cover" className="cover-image" />
          )}
          <div className="cover-overlay">
            <div className="profile-banner">
              <div className="profile-avatar">
              {profile?.profile?.profileImage ? (
              <img src={getImageUrl(profile.profile.profileImage)} alt="Profile" />
              ) : (
              <div className="avatar-placeholder">
              {profile?.profile?.firstName ? 
              profile.profile.firstName.charAt(0).toUpperCase() : 
              (user?.username ? user.username.charAt(0).toUpperCase() : 'U')
              }
              </div>
              )}
              </div>
              <div className="profile-info">
                <h1>
                  {profile?.profile?.firstName && profile?.profile?.lastName 
                    ? `${profile.profile.firstName} ${profile.profile.lastName}`
                    : (user?.username || 'User')
                  }
                </h1>
                <p className="username">@{user?.username || 'user'}</p>
                {profile?.profile?.bio && (
                  <p className="bio">{profile.profile.bio}</p>
                )}
                <div className="profile-meta">
                  {profile?.profile?.location && (
                    <span className="meta-item">
                      📍 {profile.profile.location}
                    </span>
                  )}
                  {stats?.memberSince && (
                    <span className="meta-item">
                      📅 Member since {new Date(stats.memberSince).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="tab-icon"><CameraGold /></span>
          Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <span className="tab-icon"><BriefcaseGold /></span>
          Statistics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <span className="tab-icon"><NewsGold /></span>
          Activity
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span className="tab-icon"><LinkGold /></span>
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default Dashboard;
