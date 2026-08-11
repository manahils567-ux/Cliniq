import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useGoogleLoginMutation } from '../../redux/api/authApi';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../../utils/jwt';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const GoogleSignInButton = ({ label = 'Sign in with Google' }) => {
    const navigate = useNavigate();
    const [googleLoginApi, { isLoading }] = useGoogleLoginMutation();

    const handleGoogleSignIn = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfoRes = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );
                const result = await googleLoginApi({
                    idToken: tokenResponse.access_token,
                    userInfo: userInfoRes.data,
                }).unwrap();

                console.log('Google login result:', JSON.stringify(result));
                const accessToken = result?.accessToken || result?.data?.accessToken;
                if (!accessToken) throw new Error('No token returned');

                message.success('Signed in with Google!');
                const payload = decodeToken(accessToken);
                // Use hard redirect to avoid COOP interference from Google popup
                window.location.href = payload?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
            } catch {
                message.error('Google sign-in failed. Please try again.');
            }
        },
        onError: () => message.error('Google sign-in was cancelled.'),
    });

    return (
        <button
            type="button"
            className="auth-social-btn"
            onClick={() => !isLoading && handleGoogleSignIn()}
            disabled={isLoading}
            style={{ flex: 'unset', width: '100%' }}
        >
            {isLoading ? <Spinner animation="border" size="sm" /> : <GoogleIcon />}
            {label}
        </button>
    );
};

export default GoogleSignInButton;
