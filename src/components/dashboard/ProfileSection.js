import React, { useState } from 'react';
import { profileAPI } from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import './ProfileSection.css';
import { UserGold } from './GoldIcons';

function ProfileSection({ profile, onUpdate, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
    dateOfBirth: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
      portfolio: ''
    }
  });

  // Update form data when profile changes
  React.useEffect(() => {
    if (profile?.profile) {
      setFormData({
        firstName: profile.profile.firstName || '',
        lastName: profile.profile.lastName || '',
        bio: profile.profile.bio || '',
        location: profile.profile.location || '',
        website: profile.profile.website || '',
        phone: profile.profile.phone || '',
        dateOfBirth: profile.profile.dateOfBirth ? profile.profile.dateOfBirth.split('T')[0] : '',
        socialLinks: {
          linkedin: profile.profile.socialLinks?.linkedin || '',
          twitter: profile.profile.socialLinks?.twitter || '',
          github: profile.profile.socialLinks?.github || '',
          portfolio: profile.profile.socialLinks?.portfolio || ''
        }
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1];
      setFormData({
        ...formData,
        socialLinks: {
          ...formData.socialLinks,
          [socialKey]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const response = await profileAPI.updateProfile({
        profile: formData
      });
      
      if (response.success) {
        onUpdate(response.profile);
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (type) => {
    try {
      setLoading(true);
      setError('');
      
      const file = type === 'avatar' ? selectedAvatarFile : selectedCoverFile;
      
      if (!file) {
        setError('Please select an image file');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      const response = type === 'avatar' 
        ? await profileAPI.uploadAvatar(file)
        : await profileAPI.uploadCover(file);
      
      if (response.success) {
        if (type === 'avatar') {
          setSelectedAvatarFile(null);
        } else {
          setSelectedCoverFile(null);
        }
        onRefresh();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = async (type) => {
    try {
      setLoading(true);
      setError('');
      
      const url = type === 'avatar' ? imageUrl : coverUrl;
      
      if (!url) {
        setError('Please enter a valid image URL');
        return;
      }
      
      const response = type === 'avatar' 
        ? await profileAPI.updateAvatar(url)
        : await profileAPI.updateCover(url);
      
      if (response.success) {
        if (type === 'avatar') {
          setImageUrl('');
        } else {
          setCoverUrl('');
        }
        onRefresh();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      if (type === 'avatar') {
        setSelectedAvatarFile(file);
      } else {
        setSelectedCoverFile(file);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.removeAvatar();
      if (response.success) {
        onRefresh();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter = profile.profile?.firstName
    ? profile.profile.firstName.charAt(0).toUpperCase()
    : profile.username.charAt(0).toUpperCase();
  const memberSince = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '';

  if (!profile) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-section">
      {/* Facebook-style Banner: only one at the top */}
      <div className="profile-banner">
        {profile.profile?.coverImage ? (
          <img className="cover-img" src={getImageUrl(profile.profile.coverImage)} alt="Cover" />
        ) : (
          <div className="cover-placeholder">Cover</div>
        )}
        <div className="banner-content">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {profile.profile?.profileImage ? (
                <img src={getImageUrl(profile.profile.profileImage)} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">{avatarLetter}</div>
              )}
            </div>
          </div>
          <div className="profile-banner-info">
            <div className="profile-banner-username">@{profile.username}</div>
            <div className="profile-banner-member">Member since {memberSince}</div>
          </div>
        </div>
      </div>
      {/* Edit Profile button always visible */}
      <div className="profile-edit-bar">
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="edit-btn"
          disabled={loading}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      {/* Only show image upload/edit controls when editing */}
      {isEditing && (
        <div className="image-management">
          <div className="image-upload-section">
            <h3>Profile Picture</h3>
            {/* Removed current avatar preview, only show upload fields */}
            <div className="image-actions">
              <div className="upload-section">
                <label className="file-input-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect('avatar', e)}
                    className="file-input"
                  />
                  Choose File
                </label>
                {selectedAvatarFile && (
                  <span className="file-name">{selectedAvatarFile.name}</span>
                )}
                <button 
                  onClick={() => handleFileUpload('avatar')}
                  disabled={!selectedAvatarFile || loading}
                  className="upload-btn"
                >
                  Upload Avatar
                </button>
              </div>
              <div className="url-section">
                <input
                  type="url"
                  placeholder="Or enter image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="image-input"
                />
                <button 
                  onClick={() => handleImageUpdate('avatar')}
                  disabled={!imageUrl || loading}
                  className="upload-btn secondary"
                >
                  Use URL
                </button>
              </div>
              {profile.profile?.profileImage && (
                <button 
                  onClick={handleRemoveAvatar}
                  disabled={loading}
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <div className="image-upload-section">
            <h3>Cover Image</h3>
            {/* Removed current cover preview, only show upload fields */}
            <div className="image-actions">
              <div className="upload-section">
                <label className="file-input-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect('cover', e)}
                    className="file-input"
                  />
                  Choose File
                </label>
                {selectedCoverFile && (
                  <span className="file-name">{selectedCoverFile.name}</span>
                )}
                <button 
                  onClick={() => handleFileUpload('cover')}
                  disabled={!selectedCoverFile || loading}
                  className="upload-btn"
                >
                  Upload Cover
                </button>
              </div>
              <div className="url-section">
                <input
                  type="url"
                  placeholder="Or enter image URL..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="image-input"
                />
                <button 
                  onClick={() => handleImageUpdate('cover')}
                  disabled={!coverUrl || loading}
                  className="upload-btn secondary"
                >
                  Use URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-grid">
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
            </div>

            <div className="form-group">
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
            </div>

            <div className="form-group full-width">
              <label>Bio:</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows="3"
                maxLength="500"
              />
              <small>{formData.bio.length}/500 characters</small>
            </div>

            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </div>

            <div className="form-group">
              <label>Website:</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://your-website.com"
              />
            </div>

            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </div>

            <div className="form-group">
              <label>Date of Birth:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="social-links-section">
            <h3>Social Links</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>LinkedIn:</label>
                <input
                  type="url"
                  name="social.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="form-group">
                <label>Twitter:</label>
                <input
                  type="url"
                  name="social.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div className="form-group">
                <label>GitHub:</label>
                <input
                  type="url"
                  name="social.github"
                  value={formData.socialLinks.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="form-group">
                <label>Portfolio:</label>
                <input
                  type="url"
                  name="social.portfolio"
                  value={formData.socialLinks.portfolio}
                  onChange={handleChange}
                  placeholder="https://your-portfolio.com"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="save-btn"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-display">
          <div className="info-grid">
            <div className="overview-card personal-info-card">
              <div className="card-icon"><UserGold /></div>
              <div className="card-content">
                <h3>Personal Information</h3>
                <div className="info-item"><strong>Full Name:</strong> {profile.profile?.firstName || profile.profile?.lastName ? `${profile.profile.firstName} ${profile.profile.lastName}`.trim() : 'Not specified'}</div>
                <div className="info-item"><strong>Username:</strong> {profile.username}</div>
                <div className="info-item"><strong>Email:</strong> {profile.email}</div>
                <div className="info-item"><strong>Phone:</strong> {profile.profile?.phone || 'Not specified'}</div>
                <div className="info-item"><strong>Location:</strong> {profile.profile?.location || 'Not specified'}</div>
                <div className="info-item"><strong>Date of Birth:</strong> {profile.profile?.dateOfBirth ? new Date(profile.profile.dateOfBirth).toLocaleDateString() : 'Not specified'}</div>
              </div>
            </div>

            <div className="overview-card about-card">
              <div className="card-icon"><UserGold /></div>
              <div className="card-content">
                <h3>About</h3>
                <p className="bio">
                  {profile.profile?.bio || 'No bio available. Click "Edit Profile" to add your bio.'}
                </p>
                {profile.profile?.website && (
                  <div className="website">
                    <strong>Website:</strong> 
                    <a href={profile.profile.website} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                      {profile.profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="overview-card social-card">
              <div className="card-icon"><UserGold /></div>
              <div className="card-content">
                <h3>Social Links</h3>
                <div className="social-links">
                  {profile.profile?.socialLinks?.linkedin && (
                    <a href={profile.profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin" style={{ wordBreak: 'break-all' }}>
                      LinkedIn
                    </a>
                  )}
                  {profile.profile?.socialLinks?.twitter && (
                    <a href={profile.profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter" style={{ wordBreak: 'break-all' }}>
                      Twitter
                    </a>
                  )}
                  {profile.profile?.socialLinks?.github && (
                    <a href={profile.profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link github" style={{ wordBreak: 'break-all' }}>
                      GitHub
                    </a>
                  )}
                  {profile.profile?.socialLinks?.portfolio && (
                    <a href={profile.profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="social-link portfolio" style={{ wordBreak: 'break-all' }}>
                      Portfolio
                    </a>
                  )}
                  {!profile.profile?.socialLinks?.linkedin && 
                   !profile.profile?.socialLinks?.twitter && 
                   !profile.profile?.socialLinks?.github && 
                   !profile.profile?.socialLinks?.portfolio && (
                    <p>No social links added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSection;
