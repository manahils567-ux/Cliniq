import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentMedical, FaUserMd, FaMicrophone, FaStop, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ChatWidget.css';

const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'ur', label: 'اردو' },
];

const WELCOME = {
    en: "Hi! I'm Cliniq Assistant 👋 Ask me anything about your health, appointments, or prescriptions.",
    ur: 'السلام علیکم! میں Cliniq اسسٹنٹ ہوں 👋 اپنی صحت، اپوائنٹمنٹ یا نسخے کے بارے میں پوچھیں۔',
};

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api/v1';

const WELCOME_MSG = (lang) => ({
    id: 'welcome',
    text: WELCOME[lang],
    sender: 'bot',
    timestamp: new Date(),
});

export default function ChatWidget() {
    const [isOpen, setIsOpen]       = useState(false);
    const [messages, setMessages]   = useState([]);
    const [input, setInput]         = useState('');
    const [isTyping, setIsTyping]   = useState(false);
    const [language, setLanguage]   = useState('en');
    const [isListening, setIsListening] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const bottomRef  = useRef(null);
    const recognitionRef = useRef(null);
    const navigate   = useNavigate();

    const token = localStorage.getItem('accessToken');

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: token,
    };

    // ── Scroll to bottom ────────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // ── Load history when opened ─────────────────────────────────────
    useEffect(() => {
        if (!isOpen || historyLoaded || !token) return;
        axios.get(`${API_BASE}/ai/history`, { headers: authHeaders })
            .then((res) => {
                const saved = res.data?.data || [];
                if (saved.length > 0) {
                    const mapped = saved.map((m) => ({
                        id: m.id,
                        text: m.text,
                        sender: m.role,
                        specialist: m.specialist || null,
                        timestamp: new Date(m.createdAt),
                    }));
                    setMessages(mapped);
                } else {
                    setMessages([WELCOME_MSG(language)]);
                }
                setHistoryLoaded(true);
            })
            .catch(() => {
                setMessages([WELCOME_MSG(language)]);
                setHistoryLoaded(true);
            });
    }, [isOpen]);

    // ── Update welcome message language ─────────────────────────────
    useEffect(() => {
        setMessages((prev) =>
            prev.map((m) => m.id === 'welcome' ? { ...m, text: WELCOME[language] } : m)
        );
    }, [language]);

    // ── Voice input setup ────────────────────────────────────────────
    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice input is not supported in this browser. Please use Chrome.');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'ur' ? 'ur-PK' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend   = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, [language]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    // ── Clear history ────────────────────────────────────────────────
    const clearHistory = async () => {
        if (!window.confirm('Clear all chat history?')) return;
        try {
            await axios.delete(`${API_BASE}/ai/history`, { headers: authHeaders });
            setMessages([WELCOME_MSG(language)]);
        } catch { }
    };

    // ── Send message ─────────────────────────────────────────────────
    const sendMessage = async (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || isTyping) return;

        const userMsg = { id: Date.now(), text, sender: 'user', timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await axios.post(
                `${API_BASE}/ai/chat`,
                { message: text, language },
                { headers: authHeaders }
            );

            const reply     = res.data?.data?.reply || 'No response received.';
            const specialist = res.data?.data?.specialist || null;

            const botMsg = { id: Date.now() + 1, text: reply, specialist, sender: 'bot', timestamp: new Date() };
            setMessages((prev) => [...prev, botMsg]);

            // Save to DB (fire and forget)
            if (token) {
                axios.post(`${API_BASE}/ai/history`, { userText: text, botText: reply, specialist }, { headers: authHeaders }).catch(() => {});
            }
        } catch (err) {
            const status = err.response?.status;
            let errorText = language === 'ur'
                ? 'معذرت، کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔'
                : "Sorry, I couldn't process that. Please try again.";
            if (status === 429) errorText = language === 'ur' ? 'بہت زیادہ درخواستیں۔ تھوڑی دیر بعد کوشش کریں۔' : 'Too many requests. Please wait a moment.';
            if (status === 503) errorText = language === 'ur' ? 'سروس ابھی دستیاب نہیں۔' : 'Service temporarily unavailable.';

            setMessages((prev) => [...prev, { id: Date.now() + 2, text: errorText, sender: 'bot', isError: true, timestamp: new Date() }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(e); };
    const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            {!isOpen && (
                <button className="cw-toggle" onClick={() => setIsOpen(true)} aria-label="Open Cliniq Assistant">
                    <FaCommentMedical className="cw-toggle-icon" />
                    <span>Ask Cliniq AI</span>
                </button>
            )}

            {isOpen && (
                <div className="cw-panel" role="dialog" aria-label="Cliniq AI Assistant">

                    {/* Header */}
                    <div className="cw-header">
                        <div className="cw-header-left">
                            <div className="cw-avatar"><FaRobot /></div>
                            <div>
                                <p className="cw-header-title">Cliniq Assistant</p>
                                <p className="cw-header-sub">Powered by Gemini AI</p>
                            </div>
                        </div>
                        <div className="cw-header-right">
                            <div className="cw-lang-toggle">
                                {LANGUAGES.map((l) => (
                                    <button key={l.code} className={`cw-lang-btn ${language === l.code ? 'active' : ''}`} onClick={() => setLanguage(l.code)}>
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                            <button className="cw-icon-btn" onClick={clearHistory} title="Clear history" aria-label="Clear history">
                                <FaTrash size={13} />
                            </button>
                            <button className="cw-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="cw-messages" dir={language === 'ur' ? 'rtl' : 'ltr'}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`cw-msg ${msg.sender === 'user' ? 'cw-msg--user' : 'cw-msg--bot'} ${msg.isError ? 'cw-msg--error' : ''}`}>
                                {msg.sender === 'bot' && <div className="cw-msg-avatar"><FaRobot /></div>}
                                <div className="cw-msg-body">
                                    <p className="cw-msg-text">{msg.text}</p>
                                    {msg.specialist && (
                                        <button className="cw-specialist-btn" onClick={() => { setIsOpen(false); navigate(`/doctors?specialization=${encodeURIComponent(msg.specialist)}`); }}>
                                            <FaUserMd style={{ marginRight: 6 }} />
                                            Find {msg.specialist} →
                                        </button>
                                    )}
                                    <span className="cw-msg-time">{formatTime(msg.timestamp)}</span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="cw-msg cw-msg--bot">
                                <div className="cw-msg-avatar"><FaRobot /></div>
                                <div className="cw-typing"><span /><span /><span /></div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <form className="cw-input-row" onSubmit={sendMessage}>
                        {/* Voice button */}
                        <button
                            type="button"
                            className={`cw-voice-btn ${isListening ? 'listening' : ''}`}
                            onClick={isListening ? stopListening : startListening}
                            title={isListening ? 'Stop listening' : 'Speak'}
                            aria-label="Voice input"
                        >
                            {isListening ? <FaStop size={13} /> : <FaMicrophone size={13} />}
                        </button>

                        <input
                            type="text"
                            className="cw-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening ? '🎤 Listening...' : (language === 'ur' ? 'یہاں لکھیں...' : 'Ask about your health...')}
                            disabled={isTyping}
                            dir={language === 'ur' ? 'rtl' : 'ltr'}
                            autoFocus
                        />
                        <button type="submit" className="cw-send" disabled={!input.trim() || isTyping} aria-label="Send">
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
