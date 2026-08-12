import React, { useEffect, useRef, useState } from 'react';

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
    const videoRef = useRef(null);
    const [allowMotion, setAllowMotion] = useState(true);

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
