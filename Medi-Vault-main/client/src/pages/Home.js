import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-icon">🩺</span>
          <span className="hero-badge-text">Secure & Private Health Records</span>
        </div>
        
        <h1 className="hero-title">
          Your Health Records,
          <span className="hero-title-highlight"> Simplified</span>
        </h1>
        <p className="hero-subtitle">
          Keep your medical records safe, accessible, and organized. Share with healthcare providers 
          securely when you need care. Take control of your health journey.
        </p>
        
        <div className="hero-features">
          <div className="hero-feature">
            <span className="hero-feature-icon">🔒</span>
            <span>Bank-level Security</span>
          </div>
          <div className="hero-feature">
            <span className="hero-feature-icon">📱</span>
            <span>Access Anywhere</span>
          </div>
          <div className="hero-feature">
            <span className="hero-feature-icon">⚡</span>
            <span>Quick Sharing</span>
          </div>
        </div>
        
        <div className="cta-buttons">
          {isAuthenticated ? (
            <button className="get-started-btn primary" onClick={() => navigate('/dashboard')}>
              <span className="btn-icon">📋</span>
              View My Records
            </button>
          ) : (
            <>
              <button className="get-started-btn primary" onClick={() => navigate('/register')}>
                <span className="btn-icon">🚀</span>
                Get Started Free
              </button>
              <button className="learn-more-btn secondary" onClick={() => navigate('/features')}>
                <span className="btn-icon">💡</span>
                Learn More
              </button>
            </>
          )}
        </div>
        
        <div className="hero-trust">
          <p className="trust-text">Trusted by patients and healthcare providers</p>
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-icon">👥</span>
              <div className="trust-content">
                <span className="trust-number">5,000+</span>
                <span className="trust-label">Active Users</span>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🏥</span>
              <div className="trust-content">
                <span className="trust-number">200+</span>
                <span className="trust-label">Partner Clinics</span>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">📄</span>
              <div className="trust-content">
                <span className="trust-number">50K+</span>
                <span className="trust-label">Records Stored</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-features-preview">
        <div className="features-preview-header">
          <h2>Everything You Need for Better Health Management</h2>
          <p>Simple, powerful tools designed with your privacy and convenience in mind</p>
        </div>
        
        <div className="features-preview-grid">
          <div className="feature-preview-card">
            <div className="feature-preview-icon">📁</div>
            <h3>Organize Records</h3>
            <p>Upload medical documents, test results, and prescriptions. Keep everything organized with smart categorization and search.</p>
            <ul className="feature-benefits">
              <li>✓ Automatic categorization</li>
              <li>✓ OCR text recognition</li>
              <li>✓ Secure cloud storage</li>
            </ul>
          </div>
          
          <div className="feature-preview-card">
            <div className="feature-preview-icon">🔍</div>
            <h3>Smart Search</h3>
            <p>Find any document instantly with our intelligent search. Filter by date, doctor, condition, or treatment type.</p>
            <ul className="feature-benefits">
              <li>✓ Full-text search</li>
              <li>✓ Advanced filters</li>
              <li>✓ Quick access history</li>
            </ul>
          </div>
          
          <div className="feature-preview-card">
            <div className="feature-preview-icon">🤝</div>
            <h3>Secure Sharing</h3>
            <p>Share records with doctors safely. Generate temporary access links or QR codes for appointments and emergencies.</p>
            <ul className="feature-benefits">
              <li>✓ Time-limited access</li>
              <li>✓ QR code generation</li>
              <li>✓ Access audit trail</li>
            </ul>
          </div>
          
          <div className="feature-preview-card">
            <div className="feature-preview-icon">⏰</div>
            <h3>Health Reminders</h3>
            <p>Never miss important health tasks. Set reminders for medications, appointments, tests, and follow-ups.</p>
            <ul className="feature-benefits">
              <li>✓ Medication schedules</li>
              <li>✓ Appointment alerts</li>
              <li>✓ Test reminders</li>
            </ul>
          </div>
        </div>

        <div className="features-cta">
          <h3>Ready to take control of your health records?</h3>
          <p>Join thousands of users who trust MediVault with their most important health information.</p>
          <button className="get-started-btn primary large" onClick={() => navigate('/register')}>
            <span className="btn-icon">🎯</span>
            Start Your Health Journey
          </button>
        </div>
      </section>
    </>
  );
}

export default Home;