import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import './BlogPost.css';

function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getPost(slug);
      if (response.success) {
        setPost(response.post);
      } else {
        setError('Post not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-post-container">
        <div className="loading">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-post-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/blog')} className="back-btn">
          Back to Blog
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-post-container">
        <div className="error-message">Post not found</div>
        <button onClick={() => navigate('/blog')} className="back-btn">
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="blog-post-container">
      <div className="blog-post-header">
        <button onClick={() => navigate('/blog')} className="back-btn">
          ← Back to Blog
        </button>
        
        {post.featuredImage && (
          <div className="featured-image">
            <img src={post.featuredImage} alt={post.title} />
          </div>
        )}
        
        <div className="post-header-content">
          <div className="post-meta">
            <span className={`category-badge ${post.category}`}>
              {post.category}
            </span>
            <span className="post-date">
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
            </span>
            <span className="post-views">{post.views} views</span>
          </div>
          
          <h1>{post.title}</h1>
          
          <div className="post-author-info">
            <span>By {post.author?.username || 'Anonymous'}</span>
          </div>
        </div>
      </div>

      <div className="blog-post-content">
        <article className="post-article">
          <div className="post-content">
            {post.content.split('\n').map((paragraph, index) => {
              if (paragraph.trim() === '') return null;
              
              // Simple markdown-like formatting
              if (paragraph.startsWith('# ')) {
                return <h2 key={index}>{paragraph.substring(2)}</h2>;
              }
              if (paragraph.startsWith('## ')) {
                return <h3 key={index}>{paragraph.substring(3)}</h3>;
              }
              if (paragraph.startsWith('### ')) {
                return <h4 key={index}>{paragraph.substring(4)}</h4>;
              }
              
              return <p key={index}>{paragraph}</p>;
            })}
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              <h4>Tags:</h4>
              <div className="tags-list">
                {post.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </article>
        
        <aside className="post-sidebar">
          <div className="post-info-card">
            <h3>Post Information</h3>
            <div className="info-item">
              <strong>Published:</strong>
              <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <strong>Author:</strong>
              <span>{post.author?.username || 'Anonymous'}</span>
            </div>
            <div className="info-item">
              <strong>Category:</strong>
              <span>{post.category}</span>
            </div>
            <div className="info-item">
              <strong>Views:</strong>
              <span>{post.views}</span>
            </div>
            {post.updatedAt !== post.createdAt && (
              <div className="info-item">
                <strong>Last Updated:</strong>
                <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          <div className="share-section">
            <h3>Share this post</h3>
            <div className="share-buttons">
              <button 
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="share-btn"
              >
                📋 Copy Link
              </button>
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn twitter"
              >
                🐦 Twitter
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn linkedin"
              >
                💼 LinkedIn
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default BlogPost;
