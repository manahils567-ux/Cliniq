import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaChevronDown, FaChevronUp, FaClock } from 'react-icons/fa';
import './Reminders.css';

// Server base URL
const API_BASE_URL = 'http://localhost:5000';

function Reminders() {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const checkTimerRef = useRef(null);
  const processedRemindersRef = useRef(new Set());
  const remindersRef = useRef([]);
  
  // Update the ref whenever reminders state changes
  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);
  
  // Format current date to YYYY-MM-DDThh:mm format for datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  // Setup request headers with authentication
  const getRequestHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'medicine',
    startDate: getCurrentDateTime(),
    endDate: '',
    frequency: 'once',
    times: [{ hour: new Date().getHours(), minute: new Date().getMinutes() }],
    notificationMethod: 'push'
  });

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/reminders`, getRequestHeaders());
      setReminders(response.data);
      setError(null);
    } catch (error) {
      console.error(t('reminders.errorFetching'), error);
      setError(`${t('reminders.errorFetching')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Check for due reminders - uses remindersRef instead of reminders state
  const checkDueReminders = useCallback(() => {
    const now = new Date();
    
    remindersRef.current.forEach(reminder => {
      const reminderTime = new Date(reminder.startDate);
      const reminderKey = `${reminder._id}-${reminderTime.getTime()}`;
      
      // If this reminder hasn't been processed yet
      if (!processedRemindersRef.current.has(reminderKey)) {
        // Check if the reminder time has passed and is within the checking interval (30 seconds)
        const timeDiff = now.getTime() - reminderTime.getTime();
        
        // Trigger if reminder time has passed and is within the last 30 seconds
        // This ensures we catch reminders that occurred since the last check
        if (timeDiff >= 0 && timeDiff <= 30000) {
          // Show alert for the reminder
          alert(`${t('reminders.alert')}: ${reminder.title}\n${reminder.description}`);
          
          // Mark this reminder as processed to avoid duplicate alerts
          processedRemindersRef.current.add(reminderKey);
          
          // For recurring reminders, we'll need to handle the next occurrence separately
        }
      }
    });
  }, [t]); // Only depends on t now, not reminders

  useEffect(() => {
    // Fetch reminders when component mounts
    fetchReminders();
    
    // Start the checking timer only once when component mounts
    if (checkTimerRef.current === null) {
      checkTimerRef.current = setInterval(() => {
        checkDueReminders();
      }, 30000); // Check every 30 seconds
    }
    
    // Clean up timer when component unmounts
    return () => {
      if (checkTimerRef.current) {
        clearInterval(checkTimerRef.current);
        checkTimerRef.current = null;
      }
    };
  }, [fetchReminders, checkDueReminders]); // These dependencies should be more stable now

  // Update times array when start date changes
  const updateTimesFromStartDate = (startDateStr) => {
    const startDate = new Date(startDateStr);
    return [{ hour: startDate.getHours(), minute: startDate.getMinutes() }];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const startDate = new Date(formData.startDate);
      
      const submitData = {
        ...formData,
        startDate: startDate.toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        // Ensure times array is properly formatted with the hour and minute from the start date
        times: [{ hour: startDate.getHours(), minute: startDate.getMinutes() }]
      };

      // Log the data to verify it's correct
      console.log("Creating reminder with data:", submitData);

      const response = await axios.post(`${API_BASE_URL}/api/reminders`, submitData, getRequestHeaders());
      console.log("Server response:", response.data);
      
      await fetchReminders();
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        type: 'medicine',
        startDate: getCurrentDateTime(),
        endDate: '',
        frequency: 'once',
        times: [{ hour: new Date().getHours(), minute: new Date().getMinutes() }],
        notificationMethod: 'push'
      });
    } catch (error) {
      console.error(t('reminders.errorCreating'), error);
      setError(t('reminders.errorCreating') + ': ' + (error.response?.data?.error || error.message));
      alert(t('reminders.errorCreating') + ': ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setFormData({
      ...formData, 
      startDate: newStartDate,
      times: updateTimesFromStartDate(newStartDate)
    });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/api/reminders/${id}`, getRequestHeaders());
      await fetchReminders();
    } catch (error) {
      console.error(t('reminders.errorDeleting'), error);
      setError(t('reminders.errorDeleting') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reminders-container">
      <div className="reminders-header">
        <h2>{t('reminders.title')}</h2>
        <button 
          className="toggle-form-btn"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? (
            <>
              <FaChevronUp /> {t('reminders.hideForm')}
            </>
          ) : (
            <>
              <FaChevronDown /> {t('reminders.addReminder')}
            </>
          )}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showForm && (
        <div className="reminder-form-container">
          <form onSubmit={handleSubmit} className="reminder-form">
            <div className="form-grid">
              <div className="form-group">
                <label>{t('reminders.title')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('reminders.type')}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="medicine">{t('reminders.medicine')}</option>
                  <option value="checkup">{t('reminders.checkup')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('reminders.startDate')}</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleStartDateChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('reminders.endDate')} ({t('reminders.optional')})</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>{t('reminders.frequency')}</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                >
                  <option value="once">{t('reminders.once')}</option>
                  <option value="daily">{t('reminders.daily')}</option>
                  <option value="weekly">{t('reminders.weekly')}</option>
                  <option value="monthly">{t('reminders.monthly')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('reminders.notificationMethod')}</label>
                <select
                  value={formData.notificationMethod}
                  onChange={(e) => setFormData({...formData, notificationMethod: e.target.value})}
                >
                  <option value="push">{t('reminders.pushNotification')}</option>
                  <option value="sms">{t('reminders.sms')}</option>
                  <option value="both">{t('reminders.both')}</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>{t('reminders.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="primary-btn"
              disabled={loading}
            >
              {loading ? t('reminders.creating') : t('reminders.createReminder')}
            </button>
          </form>
        </div>
      )}

      <div className="reminders-grid">
        {loading && reminders.length === 0 ? (
          <div className="loading-message">
            {t('reminders.loading')}
          </div>
        ) : reminders.length === 0 ? (
          <div className="no-reminders">
            <FaClock className="no-reminders-icon" />
            <p>{t('reminders.noReminders')}</p>
          </div>
        ) : (
          reminders.map(reminder => (
            <div key={reminder._id} className="reminder-card">
              <div className="reminder-content">
                <div className="reminder-card-header">
                  <h4>{reminder.title}</h4>
                  <span className={`reminder-type ${reminder.type}`}>
                    {t(`reminders.${reminder.type}`)}
                  </span>
                </div>
                <p className="reminder-description">{reminder.description}</p>
                <div className="reminder-details">
                  <span className="reminder-time">
                    {new Date(reminder.startDate).toLocaleString()}
                  </span>
                  <span className="reminder-frequency">
                    {t(`reminders.${reminder.frequency}`)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(reminder._id)}
                className="delete-btn"
                disabled={loading}
              >
                {t('reminders.delete')}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Reminders;