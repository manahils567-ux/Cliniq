import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import SignIn from './SignIn';
import SignUp from './SignUp';
import AuthShowcase from './AuthShowcase';
import './SignInForm.css';
import './SignUp.css';

const SignInForm = () => {
    const [isSignUp, setSignUp] = useState(false);

    /* Sign-up uses the full-bleed split layout; sign-in keeps the card. */
    if (isSignUp) {
        return (
            <div className="auth-split">
                <Link to="/" className="auth-close" title="Back to home">
                    <FaTimes size={12} />
                </Link>
                <AuthShowcase />
                <div className="auth-split__form">
                    <SignUp setSignUp={setSignUp} />
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Close */}
                <Link to="/" className="auth-close" title="Back to home">
                    <FaTimes size={12} />
                </Link>

                {/* Left panel */}
                <div className="auth-left">
                    <div className="auth-left-logo">Cliniq</div>
                    <h2>We at Cliniq are always fully focused on your health.</h2>
                </div>

                {/* Right panel */}
                <div className="auth-right">
                    <span className="auth-lang">English(US) ▾</span>
                    <SignIn setSignUp={setSignUp} />
                </div>
            </div>
        </div>
    );
};

export default SignInForm;
