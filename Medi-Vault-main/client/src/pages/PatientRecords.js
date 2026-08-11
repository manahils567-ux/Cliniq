import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PatientRecords.css';

function PatientRecords() {
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get token from URL params or query string
  const getToken = () => {
    // Try to get from params first, then from query string
    if (token) return token;
    
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get('token');
  };

  useEffect(() => {
    const verifyQRCodeAndFetchRecords = async () => {
      try {
        setLoading(true);
        const accessToken = getToken();
        
        if (!accessToken) {
          setError('Invalid or missing access token');
          setLoading(false);
          return;
        }

        // Verify QR code token
        const verifyResponse = await axios.post('http://localhost:5000/api/users/verify-qr', {
          qrCode: accessToken
        });

        if (!verifyResponse.data || !verifyResponse.data.patientData) {
          throw new Error('Failed to verify access token');
        }

        // Set patient data
        setPatient(verifyResponse.data.patientData);

        // Fetch patient's medical records if needed
        if (!verifyResponse.data.patientData.medicalRecords || 
            verifyResponse.data.patientData.medicalRecords.length === 0) {
          
          // If medical records weren't included in the response, fetch them separately
          const recordsResponse = await axios.get(
            `http://localhost:5000/api/medical-records/patient/${verifyResponse.data.patientData.id}`, 
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          
          setRecords(recordsResponse.data);
        } else {
          // Use the records from the verify response
          setRecords(verifyResponse.data.patientData.medicalRecords);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error verifying QR code:', err);
        
        let errorMessage = 'Failed to verify access';
        
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 400) {
            errorMessage = err.response.data.message || 'Invalid or expired QR code';
          } else {
            errorMessage = err.response.data.message || 'Server error';
          }
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    verifyQRCodeAndFetchRecords();
  }, [location.search, token, getToken]);

  const handleViewRecord = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  const handleDownload = async (fileUrl, title) => {
    try {
      const accessToken = getToken();
      
      const response = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Error downloading file');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="patient-records-container">
        <div className="loading">Verifying access and loading patient records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-records-container">
        <div className="error-container">
          <h2>Access Error</h2>
          <p className="error-message">{error}</p>
          <button onClick={handleBack} className="back-button">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-records-container">
      {patient && (
        <>
          <div className="patient-header">
            <button onClick={handleBack} className="back-button">← Back</button>
            <h1>Patient Records</h1>
          </div>
          
          <div className="patient-info">
            <h2>{patient.name}</h2>
            <p className="access-note">Temporary access granted for 24 hours</p>
          </div>

          <div className="records-section">
            <h3>Medical Records</h3>
            
            {records.length === 0 ? (
              <p className="no-records">No medical records found for this patient.</p>
            ) : (
              <div className="records-grid">
                {records.map((record) => (
                  <div 
                    key={record._id} 
                    className="record-card" 
                    onClick={() => handleViewRecord(record.fileUrl)}
                  >
                    <div className="record-category">
                      {record.category || 'Other'}
                    </div>
                    <div className="record-info">
                      <h3>{record.title}</h3>
                      <p>{record.description}</p>
                      <p className="record-date">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="record-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRecord(record.fileUrl);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="action-btn download-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(record.fileUrl, record.title);
                        }}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default PatientRecords;