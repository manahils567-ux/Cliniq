import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function Register() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    role: 'patient' // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      // Use the full server URL for the API call
      const response = await axios.post('http://localhost:5000/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber
      });

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">👤</div>
          <h2>{t('auth.register', 'Create Account')}</h2>
          <p className="auth-subtitle">{t('auth.joinMessage', 'Join us for secure healthcare management')}</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('auth.name', 'Full Name')}</label>
            <div className="input-group">
              <input
                type="text"
                id="name"
                className="auth-input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
                required
              />
              <span className="input-icon">👤</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('auth.email', 'Email Address')}</label>
            <div className="input-group">
              <input
                type="email"
                id="email"
                className="auth-input"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email address"
                required
              />
              <span className="input-icon">📧</span>
            </div>
          </div>
            <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">{t('auth.password', 'Password')}</label>
              <div className="input-group">
                <input
                  type="password"
                  id="password"
                  className="auth-input"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Choose a secure password"
                  required
                  minLength="6"
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('auth.confirmPassword', 'Confirm Password')}</label>
              <div className="input-group">
                <input
                  type="password"
                  id="confirmPassword"
                  className="auth-input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Confirm your password"
                  required
                  minLength="6"
                />
                <span className="input-icon">🔒</span>
              </div>
            </div>
          </div><div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">{t('auth.dateOfBirth', 'Date of Birth')}</label>
              <div className="input-group">
                <input
                  type="date"
                  id="dateOfBirth"
                  className="auth-input"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  required
                />
                <span className="input-icon">📅</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="gender">{t('auth.gender', 'Gender')}</label>
              <div className="input-group">
                <select
                  id="gender"
                  className="auth-input"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  required
                >
                  <option value="">{t('auth.selectGender', 'Select Gender')}</option>
                  <option value="male">{t('auth.male', 'Male')}</option>
                  <option value="female">{t('auth.female', 'Female')}</option>
                  <option value="other">{t('auth.other', 'Other')}</option>
                </select>
                <span className="input-icon">⚧</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">{t('auth.phoneNumber', 'Phone Number')}</label>
            <div className="input-group">
              <input
                type="tel"
                id="phoneNumber"
                className="auth-input"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="Enter your phone number"
                required
              />
              <span className="input-icon">📱</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                {t('auth.registering', 'Creating Account...')}
              </>
            ) : (
              t('auth.registerButton', 'Create Account')
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch">
            {t('auth.hasAccount', 'Already have an account?')}
            <Link to="/login" className="switch-link">
              {t('auth.loginButton', 'Sign In')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;