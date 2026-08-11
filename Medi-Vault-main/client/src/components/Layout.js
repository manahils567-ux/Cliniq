import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaCog, FaShieldAlt, FaSignInAlt, FaSignOutAlt, FaMedkit, FaUser, FaTachometerAlt, FaBars, FaTimes, FaTwitter, FaFacebookF, FaLinkedinIn, FaInstagram, FaEnvelope } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import Chatbot from './Chatbot';
import logo from '../logo.svg'; // Import the logo SVG file

function Layout({ children }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <nav className="navbar">
          <button className="logo" onClick={() => handleNavigation('/')}>
            <img src={logo} alt="MediVault Logo" className="logo-image" />
            MediVault
          </button>
          
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
            <li>
              <button onClick={() => handleNavigation('/')} className="nav-link">
                <FaHome className="nav-icon" />
                <span>{t('common.home')}</span>
              </button>
            </li>
            
            {isAuthenticated ? (
              // Authenticated navigation
              <>
                <li>
                  <button onClick={() => handleNavigation('/dashboard')} className="nav-link">
                    <FaTachometerAlt className="nav-icon" />
                    <span>{t('common.dashboard')}</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/contact')} className="nav-link">
                    <FaEnvelope className="nav-icon" />
                    <span>{t('common.contact')}</span>
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout} className="nav-link login">
                    <FaSignOutAlt className="nav-icon" />
                    <span>{t('common.logout')}</span>
                  </button>
                </li>
                <li>
                  <div className="user-info">
                    <FaUser className="nav-icon" />
                    <span>{user?.name || 'User'}</span>
                  </div>
                </li>
              </>
            ) : (
              // Public navigation
              <>
                <li>
                  <button onClick={() => handleNavigation('/features')} className="nav-link">
                    <FaCog className="nav-icon" />
                    <span>{t('common.features')}</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('/security')} className="nav-link">
                    <FaShieldAlt className="nav-icon" />
                    <span>{t('common.security')}</span>
                  </button>
                </li>
                <li className="login-btn">
                  <button onClick={() => handleNavigation('/login')} className="nav-link login">
                    <FaSignInAlt className="nav-icon" />
                    <span>{t('common.login')}</span>
                  </button>
                </li>
              </>
            )}
            <li>
              <LanguageSwitcher />
            </li>
          </ul>
        </nav>
      </header>

      <main className="main-content">
        {children}
      </main>

      {isAuthenticated && <Chatbot />}

      <footer className="App-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>MediVault</h4>
            <p>Secure Healthcare Management Platform</p>
            <p>Your trusted solution for managing medical records with enterprise-grade security and privacy.</p>
            <div className="social-icons">
              <a href="#" className="social-icon"><FaTwitter /></a>
              <a href="#" className="social-icon"><FaFacebookF /></a>
              <a href="#" className="social-icon"><FaLinkedinIn /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>{t('common.quickLinks', 'Quick Links')}</h4>
            <ul>
              <li><button onClick={() => handleNavigation('/')}>{t('common.home')}</button></li>
              {isAuthenticated ? (
                <>
                  <li><button onClick={() => handleNavigation('/dashboard')}>{t('common.dashboard')}</button></li>
                  <li><button onClick={() => handleNavigation('/reminders')}>Reminders</button></li>
                </>
              ) : (
                <>
                  <li><button onClick={() => handleNavigation('/features')}>{t('common.features')}</button></li>
                  <li><button onClick={() => handleNavigation('/security')}>{t('common.security')}</button></li>
                  <li><button onClick={() => handleNavigation('/register')}>Register</button></li>
                </>
              )}
              <li><button onClick={() => handleNavigation('/contact')}>{t('common.contact')}</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>{t('common.contact')}</h4>
            <p><strong>Email:</strong> support@medivault.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Address:</strong><br />123 Health Street<br />Medical District<br />New York, NY 10001</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 MediVault. All rights reserved. | <button onClick={() => handleNavigation('/privacy')}>Privacy Policy</button> | <button onClick={() => handleNavigation('/terms')}>Terms of Service</button></p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;