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
        <>
            <h2>Create Account</h2>

            {/* Social buttons */}
            <div className="auth-social-row">
                <GoogleSignInButton label="Sign up with Google" />
            </div>

            <div className="auth-divider">–OR–</div>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <div className="auth-field-row">
                    <div className="auth-field">
                        <label>First Name</label>
                        <input name="firstName" placeholder="John" value={user.firstName} onChange={handleChange} required />
                    </div>
                    <div className="auth-field">
                        <label>Last Name</label>
                        <input name="lastName" placeholder="Doe" value={user.lastName} onChange={handleChange} required />
                    </div>
                </div>

                <div className="auth-field">
                    <label>Email</label>
                    <input name="email" type="email" placeholder="you@example.com" value={user.email} onChange={handleChange} required />
                </div>

                <div className="auth-field">
                    <label>Password</label>
                    <div className="auth-input-wrap">
                        <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={user.password}
                            onChange={handleChange}
                            required
                        />
                        <span className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    {/* Password hints */}
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

                <div className="auth-field">
                    <label>I am a</label>
                    <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                    </select>
                </div>

                <button className="auth-submit-btn" type="submit" disabled={!isFormValid || isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : 'Create Account'}
                </button>
            </form>

            <div className="auth-footer">
                Already have an account?{' '}
                <span onClick={() => setSignUp(false)}>Log in</span>
            </div>
        </>
    );
};

export default SignUp;
