import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Features() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard if they try to access public pages
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <section className="features">
        <h2>What MediVault Offers</h2>
        <div className="feature-cards">
          <div className="card">
            <div className="card-icon">📋</div>
            <h3>Store Medical Records</h3>
            <ul className="feature-list">
              <li>Upload documents and images</li>
              <li>Organize by categories</li>
              <li>View history anytime</li>
              <li>Download when needed</li>
            </ul>
          </div>

          <div className="card">
            <div className="card-icon">⏰</div>
            <h3>Set Reminders</h3>
            <ul className="feature-list">
              <li>Medicine reminder alerts</li>
              <li>Appointment notifications</li>
              <li>Custom health checkups</li>
            </ul>
          </div>

          <div className="card">
            <div className="card-icon">💬</div>
            <h3>Health Assistant</h3>
            <ul className="feature-list">
              <li>Ask basic health questions</li>
              <li>Get medication information</li>
              <li>Quick health tips</li>
            </ul>
          </div>

          <div className="card">
            <div className="card-icon">�‍⚕️</div>
            <h3>Share with Doctors</h3>
            <ul className="feature-list">
              <li>Generate access codes</li>
              <li>Control what they see</li>
              <li>Temporary access options</li>
            </ul>
          </div>

          <div className="card">
            <div className="card-icon">�</div>
            <h3>Easy Access</h3>
            <ul className="feature-list">
              <li>Works on any device</li>
              <li>Simple interface</li>
              <li>Fast search and filters</li>
            </ul>
          </div>

          <div className="card">
            <div className="card-icon">�</div>
            <h3>Privacy & Security</h3>
            <ul className="feature-list">
              <li>Encrypted storage</li>
              <li>Secure login</li>
              <li>You control your data</li>
              <li>Regular security updates</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="security-section">
        <h2>Your Data is Safe</h2>
        <div className="security-features">
          <div className="security-item">
            <h3>Secure Storage</h3>
            <p>We use encryption to protect your medical records and personal information</p>
          </div>
          
          <div className="security-item">
            <h3>Privacy First</h3>
            <p>Only you decide who can access your health information. We never share without permission</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Features;