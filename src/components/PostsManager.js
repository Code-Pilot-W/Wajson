import React, { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import './PostsManager.css';

function PostsManager() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'blog',
    tags: '',
    featuredImage: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsResponse, statsResponse] = await Promise.all([
        postsAPI.getAdminPosts(filters),
        postsAPI.getStats()
      ]);

      if (postsResponse.success) {
        setPosts(postsResponse.posts);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingPost) {
        const response = await postsAPI.updatePost(editingPost._id, postData);
        if (response.success) {
          setError('');
          resetForm();
          fetchData();
        }
      } else {
        const response = await postsAPI.createPost(postData);
        if (response.success) {
          setError('');
          resetForm();
          fetchData();
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags.join(', '),
      featuredImage: post.featuredImage || '',
      status: post.status
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await postsAPI.deletePost(postId);
        if (response.success) {
          fetchData();
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'blog',
      tags: '',
      featuredImage: '',
      status: 'draft'
    });
    setEditingPost(null);
    setShowCreateForm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  return (
    <div className="posts-manager">
      <div className="manager-header">
        <h2>Posts Management</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="create-btn"
        >
          Create New Post
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Posts</h3>
          <div className="stat-number">{stats.total || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Published</h3>
          <div className="stat-number">{stats.published || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Drafts</h3>
          <div className="stat-number">{stats.draft || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Views</h3>
          <div className="stat-number">{stats.totalViews || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search posts..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="news">News</option>
            <option value="blog">Blog</option>
            <option value="announcement">Announcement</option>
            <option value="tutorial">Tutorial</option>
            <option value="case-study">Case Study</option>
          </select>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingPost ? 'Edit Post' : 'Create New Post'}</h3>
              <button onClick={resetForm} className="close-btn">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="post-form">
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Excerpt:</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Content:</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="8"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category:</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="blog">Blog</option>
                    <option value="news">News</option>
                    <option value="announcement">Announcement</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="case-study">Case Study</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status:</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tags (comma separated):</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="react, javascript, tutorial"
                />
              </div>

              <div className="form-group">
                <label>Featured Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const formDataUpload = new FormData();
                      formDataUpload.append('image', file);
                      try {
                        const backendUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
                        // Get token if available
                        const token = localStorage.getItem('token');
                        const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
                        const res = await fetch(`${backendUrl}/api/upload`, {
                          method: 'POST',
                          headers,
                          body: formDataUpload
                        });
                        const data = await res.json();
                        if (data.success && data.url) {
                          const imageUrl = data.url.startsWith('http') ? data.url : `${backendUrl}${data.url}`;
                          setFormData(prev => ({ ...prev, featuredImage: imageUrl }));
                        } else {
                          alert('Image upload failed');
                        }
                      } catch (err) {
                        alert('Image upload error');
                      }
                    }
                  }}
                />
                {formData.featuredImage && (
                  <div className="image-preview">
                    <img src={formData.featuredImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, marginTop: 8, borderRadius: 8, border: '1.5px solid #e6c200' }} />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="posts-table">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found. Create your first post!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Views</th>
                <th>Author</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post._id}>
                  <td>
                    <div className="post-title">
                      <strong>{post.title}</strong>
                      <div className="post-excerpt">{post.excerpt.substring(0, 100)}...</div>
                    </div>
                  </td>
                  <td>
                    <span className={`category-badge ${post.category}`}>
                      {post.category}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${post.status}`}>
                      {post.status}
                    </span>
                  </td>
                  <td>{post.views}</td>
                  <td>{post.author.username}</td>
                  <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(post)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(post._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
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

export default PostsManager;
