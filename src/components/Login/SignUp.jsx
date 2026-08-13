import React, { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import Spinner from 'react-bootstrap/Spinner';
import swal from 'sweetalert';
import { useDoctorSignUpMutation, usePatientSignUpMutation } from '../../redux/api/authApi';
import { message } from 'antd';
import GoogleSignInButton from './GoogleSignInButton';

const SignUp = ({ setSignUp }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [userType, setUserType] = useState('patient');
    const [wantsUpdates, setWantsUpdates] = useState(false);
    const [user, setUser] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [passwordValidation, setPasswordValidation] = useState({
        carLength: false, specailChar: false, upperLowerCase: false, numeric: false,
    });
    const [emailValid, setEmailValid] = useState(false);

    const [doctorSignUp, { isSuccess: dIsSuccess, isError: dIsError, error: dError, isLoading: dIsLoading }] = useDoctorSignUpMutation();
    const [patientSignUp, { isSuccess: pIsSuccess, isError: pIsError, error: pError, isLoading: pIsLoading }] = usePatientSignUpMutation();
    const isLoading = dIsLoading || pIsLoading;

    useEffect(() => {
        if (dIsError || pIsError) {
            const errorMsg = pError?.data?.message || dError?.data?.message || 'Email already exists!';
            message.error(errorMsg);
        }
        if (dIsSuccess) {
            swal({ icon: 'success', text: 'Account created! Please verify your email.', timer: 4000 });
            setUser({ firstName: '', lastName: '', email: '', password: '' });
        }
        if (pIsSuccess) {
            swal({ icon: 'success', text: 'Account created! You can now sign in.', timer: 2000 });
            setUser({ firstName: '', lastName: '', email: '', password: '' });
            setSignUp(false);
        }
    }, [dIsError, pIsError, dIsSuccess, pIsSuccess, dError, pError, setSignUp]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
        if (name === 'email') setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
        if (name === 'password') {
            setPasswordValidation({
                carLength: value.length >= 8,
                specailChar: /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(value),
                upperLowerCase: /(?=.*[a-z])(?=.*[A-Z])/.test(value),
                numeric: /(?=.*\d)/.test(value),
            });
        }
    };

    const isFormValid = emailValid &&
        passwordValidation.carLength &&
        passwordValidation.specailChar &&
        passwordValidation.upperLowerCase &&
        passwordValidation.numeric;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userType === 'doctor') doctorSignUp(user);
        else patientSignUp(user);
    };

    const hints = [
        { key: 'carLength',      label: '8+ characters' },
        { key: 'specailChar',    label: 'Special character' },
        { key: 'upperLowerCase', label: 'Upper & lower case' },
        { key: 'numeric',        label: 'Number' },
    ];

    return (
        <div className="su">
            <h1 className="su-title">Create an account</h1>

            <div className="su-social">
                <GoogleSignInButton label="Sign up with Google" />
            </div>

            <div className="su-or"><span>or</span></div>

            <form onSubmit={handleSubmit} className="su-form">
                <div className="su-row">
                    <label className="su-box">
                        <input
                            name="firstName"
                            placeholder="John"
                            value={user.firstName}
                            onChange={handleChange}
                            required
                        />
                        <span className="su-box__label">First Name</span>
                    </label>
                    <label className="su-box">
                        <input
                            name="lastName"
                            placeholder="Doe"
                            value={user.lastName}
                            onChange={handleChange}
                            required
                        />
                        <span className="su-box__label">Last Name</span>
                    </label>
                </div>

                <label className="su-box">
                    <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={user.email}
                        onChange={handleChange}
                        required
                    />
                    <span className="su-box__label">Email</span>
                </label>

                <div>
                    <label className="su-box">
                        <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={user.password}
                            onChange={handleChange}
                            required
                        />
                        <span className="su-box__label">Password</span>
                        <button
                            type="button"
                            className="su-box__eye"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </label>

                    {user.password.length > 0 && (
                        <div className="auth-pass-hints">
                            {hints.map(({ key, label }) => (
                                <span key={key} className={`auth-pass-hint ${passwordValidation[key] ? 'ok' : 'bad'}`}>
                                    {passwordValidation[key] ? <FaCheck size={9} /> : <FaTimes size={9} />} {label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <label className="su-box">
                    <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                    </select>
                    <span className="su-box__label">I am a</span>
                </label>

                <div className="su-fine">
                    <label className="su-check">
                        <span className="su-check__box">
                            <input
                                type="checkbox"
                                checked={wantsUpdates}
                                onChange={(e) => setWantsUpdates(e.target.checked)}
                            />
                            <svg viewBox="0 0 12 12" aria-hidden="true" fill="none">
                                <path d="M3 6.2 5 8.1 9 3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span>Email me occasional product updates from Cliniq</span>
                    </label>

                    <p className="su-terms">
                        By creating an account, you agree to our{' '}
                        <a href="/about">Terms and Services</a> and <a href="/about">Privacy Policy</a>
                    </p>
                </div>

                <button className="su-submit" type="submit" disabled={!isFormValid || isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : 'Create Account'}
                </button>
            </form>

            <div className="auth-footer">
                Already have an account?{' '}
                <span onClick={() => setSignUp(false)}>Log in</span>
            </div>
        </div>
    );
};

export default SignUp;
