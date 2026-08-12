import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Editorial hero for the landing page. Styled entirely by styles/base.css
 * (.cq-hero and friends) — no stylesheet of its own.
 *
 * Background media, in order of preference:
 *   1. public/hero.mp4  — looping ambient video
 *   2. public/hero.jpg  — still portrait, also the video's poster
 *   3. nothing          — flat espresso ground
 *
 * Both are referenced through PUBLIC_URL rather than imported, so a missing
 * file simply does not paint instead of failing the build. base.css applies
 * the grayscale + contrast filter, so supply colour originals.
 *
 * The video is decorative: muted, looping, inert to assistive tech, and
 * skipped entirely when the visitor prefers reduced motion.
 */
const HERO_IMG = `${process.env.PUBLIC_URL}/hero.jpg`;
const HERO_VIDEO = `${process.env.PUBLIC_URL}/hero.mp4`;

const CqHero = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [stuck, setStuck] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [allowMotion, setAllowMotion] = useState(true);

    // Float the bar over the page: give it a ground once it leaves the hero,
    // and hide it while scrolling down so it never covers what you are reading.
    // It comes straight back on the first upward scroll.
    useEffect(() => {
        let lastY = window.scrollY;
        let ticking = false;

        const update = () => {
            const y = window.scrollY;
            const delta = y - lastY;

            setStuck(y > 24);

            // Ignore sub-pixel jitter and rubber-banding at the very top.
            if (Math.abs(delta) > 6) {
                setHidden(delta > 0 && y > 140);
                lastY = y;
            }
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Some browsers will not start a muted autoplaying video that was mounted
    // by React until it is explicitly told to. Kick it once it can play.
    useEffect(() => {
        const v = videoRef.current;
        if (!v || !allowMotion) return;
        v.load();
        const start = () => v.play().catch(() => {});
        start();
        v.addEventListener('canplay', start, { once: true });
        return () => v.removeEventListener('canplay', start);
    }, [allowMotion]);

    // Respect the OS "reduce motion" setting — fall back to the still frame.
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const apply = () => setAllowMotion(!mq.matches);
        apply();
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
    }, []);

    return (
        <section className="cq-hero">
            <div className="cq-hero__media">
                {allowMotion && (
                    <video
                        ref={videoRef}
                        className="cq-hero__video"
                        src={HERO_VIDEO}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        poster={HERO_IMG}
                        aria-hidden="true"
                        tabIndex={-1}
                    />
                )}
            </div>

            <div className={`cq-hero__bar${stuck ? ' is-stuck' : ''}${hidden ? ' is-hidden' : ''}`}>
                <Link to="/" className="cq-hero__mark">Cliniq</Link>

                <nav className="cq-hero__nav">
                    <Link to="/doctors">Doctors</Link>
                    <Link to="/service">Services</Link>
                    <Link to="/blog">Blog</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/login">Login</Link>
                </nav>

                <a className="cq-hero__tel" href="tel:+923108112860">+92 310 8112860</a>
            </div>

            <div className="cq-hero__body">
                <h1 className="cq-hero__title">Because your health deserves the record</h1>
                <p className="cq-hero__lede">
                    Every prescription, lab result and X-ray in one place. Ask questions in
                    Urdu or English. Find the nearest hospital in one tap.
                </p>
            </div>
        </section>
    );
};

export default CqHero;
