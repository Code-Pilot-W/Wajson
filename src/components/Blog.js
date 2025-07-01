import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import './Blog.css';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchPosts();
  }, [filters, pagination.current]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPosts({
        page: pagination.current,
        limit: 9,
        ...filters
      });
      
      if (response.success) {
        setPosts(response.posts);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="blog-container">
      <div className="blog-hero">
        <div className="hero-content">
          <h1>Our Blog</h1>
          <p>Insights, tutorials, and updates from our development team</p>
        </div>
      </div>

      <div className="blog-content">
        <div className="blog-filters">
          <div className="filter-group">
            <label>Search Posts:</label>
            <input
              type="text"
              placeholder="Search by title or content..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="tutorial">Tutorial</option>
              <option value="news">News</option>
              <option value="technology">Technology</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : posts.length === 0 ? (
          <div className="no-posts">
            <h3>No posts found</h3>
            <p>Try adjusting your filters or check back later for new content.</p>
          </div>
        ) : (
          <>
            <div className="posts-grid">
              {posts.map(post => (
                <article key={post._id} className="post-card">
                  {post.featuredImage && (
                    <div className="post-image">
                      <img src={post.featuredImage} alt={post.title} />
                    </div>
                  )}
                  <div className="post-content">
                    <div className="post-meta">
                      <span className={`category-badge ${post.category}`}>
                        {post.category}
                      </span>
                      <span className="post-date">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2>
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="post-excerpt">{post.excerpt}</p>
                    <div className="post-footer">
                      <div className="post-author">
                        <span>By {post.author?.username || 'Anonymous'}</span>
                      </div>
                      <div className="post-stats">
                        <span>{post.views || 0} views</span>
                      </div>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="read-more-btn">
                      Read More
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                
                <div className="pagination-pages">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`pagination-btn ${pagination.current === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}

            <div className="blog-info">
              <p>
                Showing {posts.length} of {pagination.total} posts
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Blog;
