import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ShareAccess.css';

const ShareAccess = () => {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      console.log('Sending request to generate QR code...');
      console.log('Token available:', !!token);
      console.log('UserId available:', !!userId);
      
      const apiUrl = 'http://localhost:5000/api/users/generate-qr';
      
      console.log('Using API URL:', apiUrl);
      
      const response = await axios({
        method: 'post',
        url: apiUrl,
        data: { patientId: userId },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('QR response received:', response.status);
      
      if (response.data && response.data.qrCode) {
        setQrCode(response.data.qrCode);
        console.log('QR code set successfully');
      } else {
        console.error('Invalid response structure:', response.data);
        throw new Error(response.data?.message || 'Server returned an invalid response structure');
      }
    } catch (err) {
      console.error('QR Code generation error:', err);
      
      let errorMessage;
      
      if (err.response) {
        errorMessage = err.response.data?.message || 
                      `Server error: ${err.response.status}`;
        console.error('Server error details:', err.response.data);
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = err.message || 'Failed to generate QR code. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, []);

  return (
    <div className="share-access-container dashboard-right-component">
      <h3 className="component-title">Access QR Code</h3>
      <p className="component-subtitle">Share this with your doctor</p>
      
      {loading ? (
        <div className="loading">Generating QR code...</div>
      ) : error ? (
        <div className="error">
          {error}
          <button 
            className="retry-button"
            onClick={generateQRCode}
            style={{ marginTop: '10px' }}
          >
            Retry
          </button>
        </div>
      ) : qrCode ? (
        <div className="qr-code-container">
          <img 
            src={qrCode} 
            alt="QR Code for medical records access"
            className="qr-code-image" 
          />
          <p className="expiry-note">Valid for 24 hours</p>
        </div>
      ) : null}

      <button 
        className="refresh-button compact-button"
        onClick={generateQRCode}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate New QR Code'}
      </button>
    </div>
  );
};

export default ShareAccess;