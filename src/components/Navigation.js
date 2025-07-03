import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';
import {
  HomeGold,
  BlogGold,
  CareersGold,
  DashboardGold,
  UserGold,
  LogoutGold,
  LoginGold,
  RegisterGold
} from './dashboard/GoldIcons';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Wajson Logo Component for Navigation
  const WajsonNavLogo = () => (
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="nav-logo-svg"
    >
      <circle cx="50" cy="50" r="45" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="2"/>
      <path 
        d="M25 30 L35 70 L45 45 L55 70 L65 45 L75 70" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="50" cy="75" r="3" fill="white"/>
    </svg>
  );

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <div className="brand-content">
            <WajsonNavLogo />
            <span className="brand-text">Wajson</span>
          </div>
        </Link>
        <div className={`nav-menu${mobileMenuOpen ? ' open' : ''}`}>
          <Link to="/" className="nav-link">
            <span className="nav-icon"><HomeGold /></span>
            Home
          </Link>
          <Link to="/blog" className="nav-link">
            <span className="nav-icon"><BlogGold /></span>
            Blog
          </Link>
          <Link to="/careers" className="nav-link">
            <span className="nav-icon"><CareersGold /></span>
            Careers
          </Link>
          {!user ? (
            <div className="auth-buttons">
              <Link to="/login" className="nav-link login-link">
                <span className="nav-icon"><LoginGold /></span>
                Login
              </Link>
              <Link to="/register" className="nav-link register-link">
                <span className="nav-icon"><RegisterGold /></span>
                Register
              </Link>
            </div>
          ) : (
            <div className="user-menu">
              {user.role === 'admin' ? (
                <Link to="/admin" className="nav-link dashboard-link">
                  <span className="nav-icon"><DashboardGold /></span>
                  Admin Dashboard
                </Link>
              ) : (
                <Link to="/dashboard" className="nav-link dashboard-link">
                  <span className="nav-icon"><DashboardGold /></span>
                  Dashboard
                </Link>
              )}
              <div className="user-info">
                <span className="user-avatar"><UserGold /></span>
                <span className="username">{user.username}</span>
              </div>
              <button onClick={handleLogout} className="nav-link logout-btn">
                <span className="nav-icon"><LogoutGold /></span>
                Logout
              </button>
            </div>
          )}
        </div>
        <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu" tabIndex={0}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
