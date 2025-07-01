import React from 'react';
import './StatsSection.css';
import {
  CalendarGold,
  FireGold,
  EyeGold,
  NewsGold,
  BriefcaseGold,
  CameraGold,
  LinkGold
} from './GoldIcons';

function StatsSection({ stats, profile }) {
  if (!stats || !profile) {
    return <div className="loading">Loading statistics...</div>;
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getActivityLevel = () => {
    const totalActivity = stats.postsViewed + stats.jobsViewed + stats.loginCount;
    if (totalActivity >= 100) return { level: 'High', color: '#27ae60' };
    if (totalActivity >= 50) return { level: 'Medium', color: '#f39c12' };
    if (totalActivity >= 10) return { level: 'Low', color: '#e74c3c' };
    return { level: 'New', color: '#95a5a6' };
  };

  const activityLevel = getActivityLevel();

  return (
    <div className="stats-section">
      <div className="stats-header">
        <h2>Your Statistics</h2>
        <div className="activity-badge" style={{ backgroundColor: activityLevel.color }}>
          {activityLevel.level} Activity
        </div>
      </div>

      <div className="stats-overview">
        <div className="overview-grid">
          <div className="overview-card primary">
            <div className="card-icon"><CalendarGold /></div>
            <div className="card-content">
              <h3>Member Since</h3>
              <p>{new Date(stats.memberSince).toLocaleDateString()}</p>
              <small>{stats.accountAge}</small>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon"><FireGold /></div>
            <div className="card-content">
              <h3>Login Streak</h3>
              <p>{formatNumber(stats.loginCount)} times</p>
              <small>Total logins</small>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon"><EyeGold /></div>
            <div className="card-content">
              <h3>Profile Views</h3>
              <p>{formatNumber(stats.profileViews)}</p>
              <small>People viewed your profile</small>
            </div>
          </div>
        </div>
      </div>

      <div className="detailed-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3><NewsGold /> Content Engagement</h3>
            </div>
            <div className="stat-items">
              <div className="stat-item">
                <span className="stat-label">Posts Viewed</span>
                <span className="stat-value">{formatNumber(stats.postsViewed)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Jobs Viewed</span>
                <span className="stat-value">{formatNumber(stats.jobsViewed)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Content Views</span>
                <span className="stat-value highlight">
                  {formatNumber(stats.postsViewed + stats.jobsViewed)}
                </span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3><LinkGold /> Profile Metrics</h3>
            </div>
            <div className="stat-items">
              <div className="stat-item">
                <span className="stat-label">Profile Completeness</span>
                <span className="stat-value">
                  {(() => {
                    let completeness = 20; // Base for having an account
                    if (profile.profile?.firstName) completeness += 10;
                    if (profile.profile?.lastName) completeness += 10;
                    if (profile.profile?.bio) completeness += 15;
                    if (profile.profile?.location) completeness += 10;
                    if (profile.profile?.profileImage) completeness += 15;
                    if (profile.profile?.socialLinks?.linkedin || 
                        profile.profile?.socialLinks?.twitter || 
                        profile.profile?.socialLinks?.github) completeness += 20;
                    return Math.min(completeness, 100);
                  })()}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Account Status</span>
                <span className="stat-value">{profile.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Member Type</span>
                <span className="stat-value">{profile.role === 'admin' ? 'Admin' : 'User'}</span>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3><BriefcaseGold /> Activity Timeline</h3>
            </div>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>Account Created</h4>
                  <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {stats.lastLogin && (
                <div className="timeline-item">
                  <div className="timeline-dot active"></div>
                  <div className="timeline-content">
                    <h4>Last Login</h4>
                    <p>{new Date(stats.lastLogin).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              <div className="timeline-item">
                <div className="timeline-dot current"></div>
                <div className="timeline-content">
                  <h4>Current Session</h4>
                  <p>Active now</p>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3><FireGold /> Goals & Achievements</h3>
            </div>
            <div className="achievements">
              <div className={`achievement ${stats.loginCount >= 1 ? 'unlocked' : 'locked'}`}>
                <span className="achievement-icon"><FireGold /></span>
                <div className="achievement-info">
                  <h4>Welcome Aboard</h4>
                  <p>Complete your first login</p>
                </div>
              </div>
              <div className={`achievement ${stats.postsViewed >= 5 ? 'unlocked' : 'locked'}`}>
                <span className="achievement-icon"><NewsGold /></span>
                <div className="achievement-info">
                  <h4>Content Explorer</h4>
                  <p>Read 5 blog posts</p>
                </div>
              </div>
              <div className={`achievement ${stats.jobsViewed >= 3 ? 'unlocked' : 'locked'}`}>
                <span className="achievement-icon"><BriefcaseGold /></span>
                <div className="achievement-info">
                  <h4>Job Seeker</h4>
                  <p>View 3 job postings</p>
                </div>
              </div>
              <div className={`achievement ${profile.profile?.profileImage ? 'unlocked' : 'locked'}`}>
                <span className="achievement-icon"><CameraGold /></span>
                <div className="achievement-info">
                  <h4>Picture Perfect</h4>
                  <p>Upload a profile picture</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsSection;
