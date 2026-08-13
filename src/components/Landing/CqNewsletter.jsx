import React, { useState } from 'react';
import { FaArrowRight, FaLock } from 'react-icons/fa';
import { message } from 'antd';
import Spinner from 'react-bootstrap/Spinner';
import { useSubscribeNewsletterMutation } from '../../redux/api/newsletterApi';
import './CqNewsletter.css';

const CqNewsletter = () => {
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const canSubmit = emailValid && agreed && !isLoading;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        try {
            await subscribe({ email }).unwrap();
            message.success('You are on the list. Thanks for subscribing!');
            setEmail('');
            setAgreed(false);
        } catch (err) {
            message.error(err?.data?.message || 'Could not subscribe right now.');
        }
    };

    return (
        <section className="cq-news">
            <div className="cq-news__panel">
                <div className="cq-news__copy">
                    <p className="cq-news__eyebrow">Cliniq Weekly</p>
                    <h2 className="cq-news__title">Health, explained in plain language</h2>
                    <p className="cq-news__sub">
                        Short reads on understanding test results, managing prescriptions and
                        getting more out of your appointments — written by the Cliniq team.
                    </p>
                </div>

                <form className="cq-news__form" onSubmit={handleSubmit}>
                    <div className="cq-news__row">
                        <input
                            type="email"
                            className="cq-news__input"
                            placeholder="you@example.com"
                            aria-label="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="cq-news__btn" disabled={!canSubmit}>
                            {isLoading
                                ? <Spinner animation="border" size="sm" />
                                : <>Subscribe <FaArrowRight size={12} /></>}
                        </button>
                    </div>

                    <label className="cq-news__check">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <span>I agree to receive the Cliniq newsletter.</span>
                    </label>

                    <p className="cq-news__fine">
                        <FaLock size={11} aria-hidden="true" />
                        Your data stays private. Unsubscribe any time, no questions asked.
                    </p>
                </form>
            </div>
        </section>
    );
};

export default CqNewsletter;
