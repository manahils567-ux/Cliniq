import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './CqFooter.css';

/**
 * Floating footer.
 *
 * Ported from a Next.js + Tailwind + motion/react component into this stack
 * (CRA, plain JSX, no Tailwind, no motion library). The staggered reveal is
 * done with IntersectionObserver plus CSS transitions rather than
 * framer-motion, so no dependency is added; the diagonal hatched divider is
 * the same repeating-linear-gradient, animated on background-position.
 *
 * The original's social row is intentionally left out — the accounts it
 * pointed at belonged to the template author, and Cliniq has none to link yet.
 */

const LINKS = [
    { label: 'Services', to: '/service' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
    { label: 'Log in', to: '/login' },
];

const CqFooter = () => {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setShown(true); io.disconnect(); } },
            { rootMargin: '0px 0px -100px 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <footer ref={ref} className={`cqfoot${shown ? ' is-shown' : ''}`}>
            <div className="cqfoot__top">
                <Link to="/" className="cqfoot__mark" style={{ '--i': 0 }}>Cliniq</Link>

                <nav className="cqfoot__nav" style={{ '--i': 1 }}>
                    {LINKS.map((l) => (
                        <Link key={l.to} to={l.to} className="cqfoot__link">
                            <span className="cqfoot__link-bg" aria-hidden />
                            <span className="cqfoot__link-text">{l.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="cqfoot__divider" aria-hidden />

            <div className="cqfoot__base" style={{ '--i': 2 }}>
                <p>&copy; {new Date().getFullYear()} Cliniq. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default CqFooter;
