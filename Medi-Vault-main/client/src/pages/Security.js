import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Security() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard if they try to access public pages
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="page-container">
      <h1>Security & Privacy</h1>
      
      <section className="security-section">
        <h2>Enterprise-Grade Security</h2>
        <div className="security-features">
          <div className="security-item">
            <h3>AES-256 Encryption</h3>
            <p>Military-grade encryption for all stored data</p>
            <ul className="feature-list">
              <li>End-to-end encryption for all medical records</li>
              <li>Secure data transmission using TLS 1.3</li>
              <li>Encrypted backups with zero-knowledge architecture</li>
            </ul>
          </div>
          
          <div className="security-item">
            <h3>Two-Factor Authentication</h3>
            <p>Enhanced security with OTP verification</p>
            <ul className="feature-list">
              <li>OTP-based login verification</li>
              <li>Biometric authentication support</li>
              <li>Device-based authentication</li>
            </ul>
          </div>
          
          <div className="security-item">
            <h3>HIPAA Compliance</h3>
            <p>Following healthcare data protection standards</p>
            <ul className="feature-list">
              <li>Regular security audits and assessments</li>
              <li>Compliance with international healthcare standards</li>
              <li>Data breach notification protocols</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="privacy-section">
        <h2>Privacy Features</h2>
        <div className="privacy-features">
          <div className="privacy-item">
            <h3>Data Control</h3>
            <ul className="feature-list">
              <li>Complete control over your medical data</li>
              <li>Granular permission settings</li>
              <li>Data access logs and history</li>
            </ul>
          </div>
          
          <div className="privacy-item">
            <h3>Secure Sharing</h3>
            <ul className="feature-list">
              <li>Time-limited access tokens</li>
              <li>Revocable sharing permissions</li>
              <li>Encrypted data sharing</li>
            </ul>
          </div>
          
          <div className="privacy-item">
            <h3>Compliance</h3>
            <ul className="feature-list">
              <li>GDPR compliance</li>
              <li>Data residency options</li>
              <li>Regular compliance audits</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Security; 