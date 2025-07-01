import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>Sorry, the page you are looking for doesn't exist or has been moved.</p>
        
        <div className="suggested-links">
          <h3>Try these instead:</h3>
          <div className="links-grid">
            <Link to="/" className="suggestion-link">
              🏠 Home
            </Link>
            <Link to="/blog" className="suggestion-link">
              📝 Blog
            </Link>
            <Link to="/careers" className="suggestion-link">
              💼 Careers
            </Link>
            <Link to="/login" className="suggestion-link">
              🔐 Login
            </Link>
          </div>
        </div>
        
        <Link to="/" className="back-home-btn">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
