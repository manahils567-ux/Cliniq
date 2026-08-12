import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './CqNavbar.css';

/**
 * Floating pill navigation.
 *
 * Ported from a Next.js + Tailwind + TypeScript component into this project's
 * stack (CRA, plain JSX, no Tailwind, no motion library), keeping the same
 * behaviour: a fixed centred pill that squares off while the mobile menu is
 * open, nav links whose label slides up on hover, and a soft glow behind the
 * primary action. The transitions are CSS rather than framer-motion so no new
 * dependency is added.
 *
 * It also retracts on scroll-down and returns on scroll-up.
 */

const NAV_LINKS = [
    { label: 'Services', to: '/service' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
];

/** Label rendered twice and slid up on hover — the effect from the original. */
const AnimatedNavLink = ({ to, children, onClick }) => (
    <Link to={to} className="cqnav__link" onClick={onClick}>
        <span className="cqnav__link-slide">
            <span className="cqnav__link-a">{children}</span>
            <span className="cqnav__link-b">{children}</span>
        </span>
    </Link>
);

const CqNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [squared, setSquared] = useState(false);
    const [hidden, setHidden] = useState(false);
    const shapeTimeout = useRef(null);

    // Square off immediately when opening, but round back only after the menu
    // has finished collapsing — same 300ms handoff as the original.
    useEffect(() => {
        if (shapeTimeout.current) clearTimeout(shapeTimeout.current);
        if (isOpen) {
            setSquared(true);
        } else {
            shapeTimeout.current = setTimeout(() => setSquared(false), 300);
        }
        return () => { if (shapeTimeout.current) clearTimeout(shapeTimeout.current); };
    }, [isOpen]);

    // Retract while scrolling down; return on the first upward scroll.
    useEffect(() => {
        let lastY = window.scrollY;
        let ticking = false;
        const update = () => {
            const y = window.scrollY;
            const delta = y - lastY;
            if (Math.abs(delta) > 6) {
                setHidden(delta > 0 && y > 140 && !isOpen);
                lastY = y;
            }
            ticking = false;
        };
        const onScroll = () => {
            if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [isOpen]);

    const close = () => setIsOpen(false);

    return (
        <header
            className={[
                'cqnav',
                squared ? 'cqnav--squared' : '',
                hidden ? 'cqnav--hidden' : '',
            ].join(' ').trim()}
        >
            <div className="cqnav__row">
                <Link to="/" className="cqnav__mark" onClick={close}>Cliniq</Link>

                <nav className="cqnav__links">
                    {NAV_LINKS.map((l) => (
                        <AnimatedNavLink key={l.to} to={l.to}>{l.label}</AnimatedNavLink>
                    ))}
                </nav>

                <div className="cqnav__actions">
                    <Link to="/login" className="cqnav__btn cqnav__btn--ghost">Log in</Link>
                    <div className="cqnav__cta-wrap">
                        <span className="cqnav__cta-glow" aria-hidden />
                        <Link to="/login" className="cqnav__btn cqnav__btn--solid">Sign up</Link>
                    </div>
                </div>

                <button
                    type="button"
                    className="cqnav__burger"
                    onClick={() => setIsOpen((v) => !v)}
                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isOpen}
                >
                    {isOpen ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            <div className={`cqnav__drawer${isOpen ? ' is-open' : ''}`}>
                <nav className="cqnav__drawer-links">
                    {NAV_LINKS.map((l) => (
                        <Link key={l.to} to={l.to} onClick={close}>{l.label}</Link>
                    ))}
                </nav>
                <div className="cqnav__drawer-actions">
                    <Link to="/login" className="cqnav__btn cqnav__btn--ghost" onClick={close}>Log in</Link>
                    <Link to="/login" className="cqnav__btn cqnav__btn--solid" onClick={close}>Sign up</Link>
                </div>
            </div>
        </header>
    );
};

export default CqNavbar;
