import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI, jobsAPI } from '../../services/api';
import './ActivitySection.css';
import { NewsGold, BriefcaseGold, CameraGold, LinkGold } from './GoldIcons';

function ActivitySection({ profile }) {
  const navigate = useNavigate();
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const [postsResponse, jobsResponse] = await Promise.all([
        postsAPI.getPosts({ limit: 5 }),
        jobsAPI.getJobs({ limit: 5 })
      ]);

      if (postsResponse.success) {
        setRecentPosts(postsResponse.posts);
      } else {
        console.warn('Failed to fetch posts:', postsResponse.message);
      }

      if (jobsResponse.success) {
        setRecentJobs(jobsResponse.jobs);
      } else {
        console.warn('Failed to fetch jobs:', jobsResponse.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch recent activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityItems = () => {
    const allItems = [];

    // Add recent posts
    recentPosts.forEach(post => {
      allItems.push({
        type: 'post',
        id: post._id,
        slug: post.slug,
        title: post.title,
        description: post.excerpt || 'No description available',
        date: post.publishedAt || post.createdAt,
        author: post.author?.username || 'Unknown',
        category: post.category || 'General',
        views: post.views || 0,
        icon: <NewsGold />
      });
    });

    // Add recent jobs
    recentJobs.forEach(job => {
      allItems.push({
        type: 'job',
        id: job._id,
        slug: job.slug,
        title: job.title,
        description: `${job.department || 'General'} • ${job.location || 'Remote'} • ${job.type || 'Full-time'}`,
        date: job.createdAt,
        author: job.postedBy?.username || 'HR Team',
        department: job.department || 'General',
        applications: job.applications || 0,
        icon: <BriefcaseGold />
      });
    });

    // Sort by date (newest first)
    allItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter based on active filter
    if (activeFilter === 'posts') {
      return allItems.filter(item => item.type === 'post');
    } else if (activeFilter === 'jobs') {
      return allItems.filter(item => item.type === 'job');
    }
    
    return allItems;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleViewItem = (item) => {
    if (item.type === 'post') {
      if (item.slug) {
        navigate(`/blog/${item.slug}`);
      } else {
        // Fallback to blog page if no slug
        navigate('/blog');
      }
    } else if (item.type === 'job') {
      if (item.slug) {
        navigate(`/careers/${item.slug}`);
      } else {
        // Fallback to careers page if no slug
        navigate('/careers');
      }
    }
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (!profile?.profile?.profileImage) {
      recommendations.push({
        type: 'profile',
        title: 'Add a profile picture',
        description: 'Make your profile stand out with a professional photo',
        action: 'Upload Photo',
        icon: <CameraGold />, // SVG icon
        priority: 'high'
      });
    }
    
    if (!profile?.profile?.bio) {
      recommendations.push({
        type: 'profile',
        title: 'Write your bio',
        description: 'Tell others about yourself and your interests',
        action: 'Add Bio',
        icon: <NewsGold />, // SVG icon
        priority: 'medium'
      });
    }
    
    if (!profile?.profile?.socialLinks?.linkedin && !profile?.profile?.socialLinks?.github) {
      recommendations.push({
        type: 'social',
        title: 'Connect your social accounts',
        description: 'Link your LinkedIn and GitHub profiles',
        action: 'Add Links',
        icon: <LinkGold />, // SVG icon
        priority: 'medium'
      });
    }
    
    return recommendations;
  };

  const AnimatedCounter = ({ value, duration = 1500 }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = 0;
      const end = parseInt(value);
      if (isNaN(end)) return;
      const increment = Math.max(1, Math.ceil(end / (duration / 16)));
      let current = start;
      let frame;
      function animate() {
        current += increment;
        if (current < end) {
          setDisplay(current);
          frame = requestAnimationFrame(animate);
        } else {
          setDisplay(end);
        }
      }
      animate();
      return () => frame && cancelAnimationFrame(frame);
    }, [value, duration]);
    return <span>{display}+</span>;
  };

  if (loading) {
    return <div className="loading">Loading activity...</div>;
  }

  const activityItems = getActivityItems();
  const recommendations = getRecommendations();

  return (
    <div className="activity-section">
      <div className="activity-header">
        <h2>Recent Activity</h2>
        <div className="activity-filters">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveFilter('posts')}
          >
            Posts
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveFilter('jobs')}
          >
            Jobs
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="activity-content">
        <div className="activity-feed">
          <div className="feed-section">
            <h3>Latest Updates</h3>
            {activityItems.length === 0 ? (
              <div className="no-activity">
                <p>No recent activity to show.</p>
              </div>
            ) : (
              <div className="activity-list">
                {activityItems.map(item => (
                  <div key={`${item.type}-${item.id}`} className="activity-item">
                    <div className="activity-icon">
                      {item.icon}
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <h4>{item.title}</h4>
                        <span className="activity-time">{formatDate(item.date)}</span>
                      </div>
                      <p className="activity-description">{item.description}</p>
                      <div className="activity-meta">
                        <span className="activity-author">By {item.author}</span>
                        {item.type === 'post' && (
                          <>
                            <span className="activity-category">{item.category}</span>
                            <span className="activity-views">{item.views} views</span>
                          </>
                        )}
                        {item.type === 'job' && (
                          <>
                            <span className="activity-department">{item.department}</span>
                            <span className="activity-applications">{item.applications} applications</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="activity-actions">
                      <button 
                        className="view-btn"
                        onClick={() => handleViewItem(item)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="recommendations">
            <h3>Recommended for You</h3>
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <div key={index} className={`recommendation-item ${rec.priority}`}>
                  <div className="rec-icon">{rec.icon}</div>
                  <div className="rec-content">
                    <h4>{rec.title}</h4>
                    <p>{rec.description}</p>
                  </div>
                  <button className="rec-action">{rec.action}</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="activity-stats">
        <div className="stats-summary">
          <div className="summary-item">
            <span className="summary-number"><AnimatedCounter value={100} /></span>
            <span className="summary-label">Projects Completed</span>
          </div>
          <div className="summary-item">
            <span className="summary-number"><AnimatedCounter value={50} /></span>
            <span className="summary-label">Happy Clients</span>
          </div>
          <div className="summary-item">
            <span className="summary-number"><AnimatedCounter value={5} /></span>
            <span className="summary-label">Years Experience</span>
          </div>
          <div className="summary-item">
            <span className="summary-number">24/7</span>
            <span className="summary-label">Support Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivitySection;
