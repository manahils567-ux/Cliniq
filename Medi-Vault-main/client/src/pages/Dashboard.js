import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaUser, FaPowerOff } from 'react-icons/fa';
import Reminders from '../components/Reminders';
import ShareAccess from '../components/ShareAccess';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

function Dashboard() {
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Other');
  const categories = ['Prescription', 'Lab Report', 'Vaccination', 'Surgery', 'Other'];
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        // Fetch medical records using our API utility
        const recordsResponse = await api.get('/medical-records');
        setRecords(recordsResponse.data);
      } catch (err) {
        setError(t('dashboard.errorLoadingData'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, [t]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('description', t('dashboard.uploadedRecordDescription'));
    formData.append('date', new Date().toISOString());
    formData.append('category', selectedCategory);

    try {
      setUploading(true);
      // Use our API utility with the multipart/form-data content type override
      const response = await api.post('/medical-records/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.record) {
        // Add the new record to the records list
        setRecords(prevRecords => [response.data.record, ...prevRecords]);
        setError('');
      }
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      setError(t('dashboard.errorUploadingFile'));
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleDownload = async (fileUrl, title) => {
    try {
      // Use our API utility with blob response type
      const response = await api.get(fileUrl, {
        responseType: 'blob'
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
      setError(t('dashboard.errorDownloadingFile'));
      console.error('Download error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('dashboard.confirmDelete'))) {
      try {
        setError(''); // Clear any existing errors
        
        // Ensure we have a valid ID
        if (!id) {
          throw new Error('Record ID is missing');
        }
        
        console.log('Attempting to delete record with ID:', id);
        
        // Use our API utility
        const response = await api.delete(`/medical-records/${id}`);
        console.log('Delete response:', response.data);

        // Update the records state by filtering out the deleted record
        setRecords(prevRecords => prevRecords.filter(record => record._id !== id));
      } catch (err) {
        console.error('Delete error details:', err.response?.data || err.message);
        setError(err.response?.data?.message || t('dashboard.errorDeletingFile'));
      }
    }
  };

  const handleView = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return <div className="loading">{t('dashboard.loading')}</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="welcome-user">
          Welcome to MediVault, <span className="user-name">{user && user.name ? user.name : "User"}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <FaPowerOff style={{ marginRight: '8px' }} />
          {t('dashboard.logout')}
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-grid">
        <section className="dashboard-item medical-records">
          <h2>{t('dashboard.medicalRecords')}</h2>
          <div className="upload-area">
            <select
              className="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={uploading}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {t(`dashboard.categories.${category.toLowerCase()}`)}
                </option>
              ))}
            </select>
            <div className="upload-button-container">
              <button 
                className="upload-record-btn"
                onClick={() => document.getElementById('fileUploadInput').click()}
                disabled={uploading}
              >
                {uploading ? t('dashboard.uploading') : t('dashboard.uploadRecord')}
              </button>
              <input
                id="fileUploadInput"
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </div>
            <p className="upload-info">{t('dashboard.supportedFormats')}</p>
          </div>
          <div className="records-list">
            {records.length === 0 ? (
              <p className="no-records">{t('dashboard.noRecords')}</p>
            ) : (
              <div className="records-grid">
                {records.map((record) => (
                  <div key={record._id} className="record-card" onClick={() => handleView(record.fileUrl)}>
                    <div 
                      className="record-category" 
                      data-category={record.category.toLowerCase()}
                    >
                      {t(`dashboard.categories.${record.category.toLowerCase()}`)}
                    </div>
                    <div className="record-info">
                      <h3>{record.title}</h3>
                      <p>{record.description}</p>
                      <p className="record-date">
                        {t('dashboard.uploadedDate', { date: new Date(record.date).toLocaleDateString() })}
                      </p>
                    </div>
                    <div className="record-actions">
                      <button
                        className="action-btn download-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(record.fileUrl, record.title);
                        }}
                      >
                        {t('dashboard.download')}
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(record._id);
                        }}
                      >
                        {t('dashboard.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-item quick-actions">
          <h2>{t('dashboard.quickActions')}</h2>
          <ShareAccess />
        </section>
        
        <section className="dashboard-item reminders-section">
          <h2>{t('dashboard.reminders')}</h2>
          <Reminders />
        </section>
      </div>
    </div>
  );
}

export default Dashboard;