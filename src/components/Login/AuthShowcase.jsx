import React, { useEffect, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import './AuthShowcase.css';

import shotTall from '../../images/doc/doctor 3.jpg';
import shotOne from '../../images/doc/doc1.jpg';
import shotTwo from '../../images/doc/doc4.jpg';
import shotWide from '../../images/doc/doctor chair 2.jpg';

/* Each tile pairs with the line shown in the caption card below it. The four
   captions describe modules that actually exist: booking, the prescription
   scanner, the records vault and reminders. */
const slides = [
    {
        src: shotTall,
        eyebrow: 'Appointments',
        caption: 'See a doctor’s real availability before you book, and track the visit end to end.',
    },
    {
        src: shotOne,
        eyebrow: 'Prescription scanner',
        caption: 'Photograph a paper prescription and have it read back to you in plain language.',
    },
    {
        src: shotWide,
        eyebrow: 'Record vault',
        caption: 'Every report, scan and result in one place — shared with a doctor only when you say so.',
    },
    {
        src: shotTwo,
        eyebrow: 'Reminders',
        caption: 'Reminders that follow what you were actually prescribed, not a generic schedule.',
    },
];

const ROTATE_MS = 2600;

const FocusCorners = ({ active }) => (
    <>
        <span className={`shx-corner shx-corner--tl ${active ? 'is-on' : ''}`} />
        <span className={`shx-corner shx-corner--tr ${active ? 'is-on' : ''}`} />
        <span className={`shx-corner shx-corner--bl ${active ? 'is-on' : ''}`} />
        <span className={`shx-corner shx-corner--br ${active ? 'is-on' : ''}`} />
    </>
);

const Tile = ({ src, active, className }) => (
    <div className={`shx-tile ${className} ${active ? 'is-active' : ''}`}>
        <img src={src} alt="" aria-hidden="true" />
        <FocusCorners active={active} />
    </div>
);

const AuthShowcase = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        // An auto-advancing carousel is exactly what this query is for.
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reduced.matches) return undefined;

        const id = window.setInterval(
            () => setActiveIndex((current) => (current + 1) % slides.length),
            ROTATE_MS
        );
        return () => window.clearInterval(id);
    }, []);

    const current = slides[activeIndex];

    return (
        <aside className="shx">
            <div className="shx-inner">
                <div className="shx-brand">Cliniq</div>

                <div className="shx-grid">
                    <span className="shx-fade shx-fade--top" />
                    <span className="shx-fade shx-fade--bottom" />
                    <Tile src={slides[0].src} active={activeIndex === 0} className="shx-tile--tall" />
                    <Tile src={slides[1].src} active={activeIndex === 1} className="shx-tile--sm" />
                    <Tile src={slides[3].src} active={activeIndex === 3} className="shx-tile--sm" />
                    <Tile src={slides[2].src} active={activeIndex === 2} className="shx-tile--wide" />
                </div>

                <div className="shx-caption">
                    <p>
                        <span className="shx-caption__eyebrow">{current.eyebrow}</span>{' '}
                        {current.caption}
                    </p>
                    <button
                        type="button"
                        className="shx-caption__next"
                        onClick={() => setActiveIndex((c) => (c + 1) % slides.length)}
                        aria-label="Next highlight"
                    >
                        <FaArrowRight size={12} />
                    </button>
                </div>

                <p className="shx-tagline">Your care, gathered in one calm place.</p>

                <div className="shx-dots">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.eyebrow}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`shx-dot ${activeIndex === index ? 'is-active' : ''}`}
                            aria-label={`Show ${slide.eyebrow}`}
                            aria-current={activeIndex === index}
                        />
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default AuthShowcase;
