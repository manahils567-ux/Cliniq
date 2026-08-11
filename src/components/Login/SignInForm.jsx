import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import SignIn from './SignIn';
import SignUp from './SignUp';
import './SignInForm.css';
import stethoscope from '../../images/doc/info.svg';

const SignInForm = () => {
    const [isSignUp, setSignUp] = useState(false);

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Close */}
                <Link to="/" className="auth-close" title="Back to home">
                    <FaTimes size={12} />
                </Link>

                {/* Left panel */}
                <div className="auth-left">
                    <div className="auth-left-logo">🏥</div>
                    <h2>We at Cliniq are always fully focused on your health.</h2>
                    <img src={stethoscope} alt="cliniq" className="auth-left-img" />
                </div>

                {/* Right panel */}
                <div className="auth-right">
                    <span className="auth-lang">English(US) ▾</span>
                    {isSignUp
                        ? <SignUp setSignUp={setSignUp} />
                        : <SignIn setSignUp={setSignUp} />
                    }
                </div>
            </div>
        </div>
    );
};

export default SignInForm;
