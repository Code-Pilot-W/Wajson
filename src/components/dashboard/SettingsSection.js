import React, { useState, useEffect } from 'react';
import { profileAPI } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import './SettingsSection.css';
import { NewsGold, LinkGold, CameraGold, BriefcaseGold } from './GoldIcons';

function SettingsSection({ profile, onProfileUpdate }) {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: {
      newPosts: true,
      newJobs: true,
      comments: true,
      mentions: false,
      newsletter: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showSocialLinks: true,
      allowMessaging: true
    },
    appearance: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    },
    account: {
      twoFactorEnabled: false,
      sessionTimeout: 30
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    if (profile?.preferences) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...profile.preferences
      }));
    }
  }, [profile]);

  // Sync theme setting with actual theme
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme: theme
      }
    }));
  }, [theme]);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));

    // Handle theme change immediately
    if (category === 'appearance' && key === 'theme') {
      setTheme(value);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await profileAPI.updatePreferences(settings);
      
      if (response.success) {
        setMessage('Settings saved successfully!');
        if (onProfileUpdate) {
          onProfileUpdate({ ...profile, preferences: settings });
        }
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await profileAPI.deleteAccount();
        
        if (response.success) {
          localStorage.removeItem('token');
          window.location.href = '/';
        } else {
          setMessage('Failed to delete account. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        setMessage('Error deleting account. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderNotificationsTab = () => (
    <div className="settings-tab-content">
      <h3>Email Notifications</h3>
      <div className="settings-group">
        {Object.entries(settings.emailNotifications).map(([key, value]) => (
          <div key={key} className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleSettingChange('emailNotifications', key, e.target.checked)}
              />
              <span className="setting-text">
                {key === 'newPosts' && 'New Posts'}
                {key === 'newJobs' && 'New Job Listings'}
                {key === 'comments' && 'Comments on My Posts'}
                {key === 'mentions' && 'Mentions'}
                {key === 'newsletter' && 'Weekly Newsletter'}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="settings-tab-content">
      <h3>Privacy Settings</h3>
      <div className="settings-group">
        <div className="setting-item">
          <label className="setting-label">
            Profile Visibility
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
              className="setting-select"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </label>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.privacy.showEmail}
              onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
            />
            <span className="setting-text">Show Email Address</span>
          </label>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.privacy.showSocialLinks}
              onChange={(e) => handleSettingChange('privacy', 'showSocialLinks', e.target.checked)}
            />
            <span className="setting-text">Show Social Links</span>
          </label>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.privacy.allowMessaging}
              onChange={(e) => handleSettingChange('privacy', 'allowMessaging', e.target.checked)}
            />
            <span className="setting-text">Allow Direct Messages</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="settings-tab-content">
      <h3>Appearance & Language</h3>
      <div className="settings-group">
        <div className="setting-item">
          <label className="setting-label">
            Theme
            <select
              value={settings.appearance.theme}
              onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
              className="setting-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </label>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">
            Language
            <select
              value={settings.appearance.language}
              onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
              className="setting-select"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </label>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">
            Timezone
            <select
              value={settings.appearance.timezone}
              onChange={(e) => handleSettingChange('appearance', 'timezone', e.target.value)}
              className="setting-select"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="settings-tab-content">
      <h3>Security Settings</h3>
      <div className="settings-group">
        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.account.twoFactorEnabled}
              onChange={(e) => handleSettingChange('account', 'twoFactorEnabled', e.target.checked)}
            />
            <span className="setting-text">Two-Factor Authentication</span>
          </label>
          <p className="setting-description">
            Add an extra layer of security to your account
          </p>
        </div>
        
        <div className="setting-item">
          <label className="setting-label">
            Session Timeout (minutes)
            <input
              type="number"
              min="5"
              max="120"
              value={settings.account.sessionTimeout}
              onChange={(e) => handleSettingChange('account', 'sessionTimeout', parseInt(e.target.value))}
              className="setting-input"
            />
          </label>
        </div>
        
        <div className="danger-zone">
          <h4>Danger Zone</h4>
          <div className="setting-item">
            <button 
              className="danger-btn"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </button>
            <p className="setting-description">
              Permanently delete your account and all associated data
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h2>Settings</h2>
        {message && (
          <div className={`message ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <NewsGold /> Notifications
          </button>
          <button
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <LinkGold /> Privacy
          </button>
          <button
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <CameraGold /> Appearance
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <BriefcaseGold /> Security
          </button>
        </div>

        <div className="settings-panel">
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>
      </div>

      <div className="settings-actions">
        <button
          className="save-btn"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

export default SettingsSection;
