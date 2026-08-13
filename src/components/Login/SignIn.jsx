import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from 'react-router-dom';
import { useResetPasswordMutation, useUserLoginMutation } from '../../redux/api/authApi';
import { message } from 'antd';
import { useMessageEffect } from '../../utils/messageSideEffect';
import { decodeToken } from '../../utils/jwt';
import GoogleSignInButton from './GoogleSignInButton';

const SignIn = ({ setSignUp }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [infoError, setInfoError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [userLogin, { isLoading }] = useUserLoginMutation();
    const [resetPassword, { isError: resetIsError, isSuccess: resetIsSuccess, error: resetError, isLoading: resetIsLoading }] = useResetPasswordMutation();

    useMessageEffect(resetIsLoading, resetIsSuccess, resetIsError, resetError, 'Reset link sent! Please check your email.');

    const onSubmit = async (formData) => {
        setInfoError('');
        try {
            const result = await userLogin(formData).unwrap();
            message.success('Signed in successfully!');
            const payload = decodeToken(result.accessToken);
            navigate(payload.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
        } catch (err) {
            const msg = err?.data?.message || 'Login failed';
            message.error(msg);
            setInfoError(typeof msg === 'string' ? msg : '');
        }
    };

    const onForgotSubmit = async (e) => {
        e.preventDefault();
        resetPassword({ email: forgotEmail });
        setForgotEmail('');
        setShowForgot(false);
    };

    if (showForgot) {
        return (
            <>
                <h2>Forgot Password</h2>
                <p style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Enter your email and we'll send you a reset link.
                </p>
                <form onSubmit={onForgotSubmit} style={{ width: '100%' }}>
                    <div className="auth-field">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button className="auth-submit-btn" type="submit" disabled={resetIsLoading}>
                        {resetIsLoading ? <Spinner animation="border" size="sm" /> : 'Send Reset Link'}
                    </button>
                    <div className="auth-footer">
                        <span onClick={() => setShowForgot(false)}>← Back to Sign In</span>
                    </div>
                </form>
            </>
        );
    }

    return (
        <>
            <h2>Welcome Back</h2>

            {/* Social buttons */}
            <div className="auth-social-row">
                <GoogleSignInButton />
            </div>

            <div className="auth-divider">–OR–</div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                <div className="auth-field">
                    <label>Email</label>
                    <input
                        {...register('email', { required: true })}
                        type="email"
                        placeholder="you@example.com"
                    />
                    {errors.email && <span className="auth-error">Email is required</span>}
                </div>

                <div className="auth-field">
                    <label>Password</label>
                    <div className="auth-input-wrap">
                        <input
                            {...register('password', { required: true })}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                        />
                        <span className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    {errors.password && <span className="auth-error">Password is required</span>}
                </div>

                {infoError && <p className="auth-error">{infoError}</p>}

                <span className="auth-forgot" onClick={() => setShowForgot(true)}>
                    Forgot Password?
                </span>

                <button className="auth-submit-btn" type="submit" disabled={isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : 'Sign In'}
                </button>
            </form>

            <div className="auth-footer">
                Don't have an account?{' '}
                <span onClick={() => setSignUp(true)}>Create Account</span>
            </div>
        </>
    );
};

export default SignIn;
