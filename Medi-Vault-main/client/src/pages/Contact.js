import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ContactUs from '../components/ContactUs';
import './Contact.css';

function Contact() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect unauthenticated users to login if they try to access protected pages
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Don't render anything while checking authentication
  }

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1 className="contact-header">Contact Support</h1>
        <p className="contact-intro">
          Need help with your MediVault account? Our support team is here to assist you.
          Please fill out the form below, and we'll get back to you as soon as possible.
        </p>
        <div className="contact-form-container">
          <ContactUs />
        </div>
      </div>
    </div>
  );
}

export default Contact;