import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentMedical } from 'react-icons/fa';
import axios from 'axios';
import './ChatWidget.css';

const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'ur', label: 'اردو' },
];

const WELCOME = {
    en: "Hi! I'm Cliniq Assistant 👋 Ask me anything about your health, appointments, or prescriptions.",
    ur: 'السلام علیکم! میں Cliniq اسسٹنٹ ہوں 👋 اپنی صحت، اپوائنٹمنٹ یا نسخے کے بارے میں پوچھیں۔',
};

const API_BASE =
    process.env.REACT_APP_API_URL || 'http://localhost:5050/api/v1';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [language, setLanguage] = useState('en');
    const bottomRef = useRef(null);

    // Token is stored in localStorage under 'accessToken' by auth.service.js
    const token = localStorage.getItem('accessToken');

    // Scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Reset with welcome message when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 0,
                    text: WELCOME[language],
                    sender: 'bot',
                    timestamp: new Date(),
                },
            ]);
        }
    }, [isOpen]);

    // Update welcome message language without clearing chat
    useEffect(() => {
        setMessages((prev) =>
            prev.map((m) =>
                m.id === 0 ? { ...m, text: WELCOME[language] } : m
            )
        );
    }, [language]);

    const sendMessage = async (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || isTyping) return;

        const userMsg = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await axios.post(
                `${API_BASE}/ai/chat`,
                { message: text, language },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: token,
                    },
                }
            );

            const botMsg = {
                id: Date.now() + 1,
                text: res.data?.data?.reply || 'No response received.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            const status = err.response?.status;
            let errorText =
                language === 'ur'
                    ? 'معذرت، کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔'
                    : "Sorry, I couldn't process that. Please try again.";

            if (status === 429)
                errorText =
                    language === 'ur'
                        ? 'بہت زیادہ درخواستیں۔ تھوڑی دیر بعد کوشش کریں۔'
                        : 'Too many requests. Please wait a moment.';
            if (status === 503)
                errorText =
                    language === 'ur'
                        ? 'سروس ابھی دستیاب نہیں۔ بعد میں آزمائیں۔'
                        : 'Service temporarily unavailable. Try again later.';

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 2,
                    text: errorText,
                    sender: 'bot',
                    isError: true,
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) sendMessage(e);
    };

    const formatTime = (date) =>
        new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <>
            {/* ── Floating toggle button ── */}
            {!isOpen && (
                <button
                    className="cw-toggle"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Cliniq Assistant"
                >
                    <FaCommentMedical className="cw-toggle-icon" />
                    <span>Ask Cliniq AI</span>
                </button>
            )}

            {/* ── Chat panel ── */}
            {isOpen && (
                <div className="cw-panel" role="dialog" aria-label="Cliniq AI Assistant">

                    {/* Header */}
                    <div className="cw-header">
                        <div className="cw-header-left">
                            <div className="cw-avatar">
                                <FaRobot />
                            </div>
                            <div>
                                <p className="cw-header-title">Cliniq Assistant</p>
                                <p className="cw-header-sub">Powered by Gemini AI</p>
                            </div>
                        </div>
                        <div className="cw-header-right">
                            {/* Language toggle */}
                            <div className="cw-lang-toggle">
                                {LANGUAGES.map((l) => (
                                    <button
                                        key={l.code}
                                        className={`cw-lang-btn ${language === l.code ? 'active' : ''}`}
                                        onClick={() => setLanguage(l.code)}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="cw-close"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close chat"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="cw-messages" dir={language === 'ur' ? 'rtl' : 'ltr'}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`cw-msg ${msg.sender === 'user' ? 'cw-msg--user' : 'cw-msg--bot'} ${msg.isError ? 'cw-msg--error' : ''}`}
                            >
                                {msg.sender === 'bot' && (
                                    <div className="cw-msg-avatar">
                                        <FaRobot />
                                    </div>
                                )}
                                <div className="cw-msg-body">
                                    <p className="cw-msg-text">{msg.text}</p>
                                    <span className="cw-msg-time">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="cw-msg cw-msg--bot">
                                <div className="cw-msg-avatar">
                                    <FaRobot />
                                </div>
                                <div className="cw-typing">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <form className="cw-input-row" onSubmit={sendMessage}>
                        <input
                            type="text"
                            className="cw-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                language === 'ur'
                                    ? 'یہاں لکھیں...'
                                    : 'Ask about your health...'
                            }
                            disabled={isTyping}
                            dir={language === 'ur' ? 'rtl' : 'ltr'}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="cw-send"
                            disabled={!input.trim() || isTyping}
                            aria-label="Send"
                        >
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
