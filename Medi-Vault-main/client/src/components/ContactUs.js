import React, { useState } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/contact',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setStatus({ submitting: false, success: true, error: null });
        setFormData({ name: '', email: '', message: '' });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setStatus(prev => ({ ...prev, success: false }));
        }, 5000);
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setStatus({ 
        submitting: false, 
        success: false, 
        error: error.response?.data?.message || 'Failed to send message. Please try again.'
      });
    }
  };

  return (
    <div className="contact-us-container">
      <h3 className="contact-title">Contact Support</h3>
      
      {status.success ? (
        <div className="success-message">
          Your message has been sent! We'll get back to you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="How can we help you?"
              rows="3"
              required
            ></textarea>
          </div>
          
          {status.error && <div className="error-message">{status.error}</div>}
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={status.submitting}
          >
            {status.submitting ? (
              <>
                <FaSpinner className="spinner" /> Sending...
              </>
            ) : (
              <>
                Send Message <FaPaperPlane />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactUs; 