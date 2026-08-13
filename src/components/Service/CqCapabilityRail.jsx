import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import './CqCapabilityRail.css';

/*
 * Scroll-down / swipe-left rail — the GrainHero HorizontalFAQ pattern.
 *
 * A tall section acts as the scroll runway; the inner container is sticky, so
 * vertical scrolling inside the runway drives the track horizontally.
 *
 * Two additions over the original: scrollYProgress is passed through a spring
 * so the track eases instead of tracking the wheel 1:1, and each card gets its
 * own depth transforms keyed to when it crosses the centre of the viewport.
 */

const RUNWAY_VH = 340;   // taller runway = same travel over more scroll = slower

/* Travel is measured rather than declared. It used to be a fixed ['6%','-74%'],
   which only held for the seven cards this was built with — at three cards the
   track is narrower than the stage and there is nothing to travel through at
   all. Measuring stage vs track means any card count lands the last card flush
   with the right edge instead of overshooting or stalling. */
const useTravel = (stageRef, trackRef, deps) => {
    const [maxX, setMaxX] = useState(0);

    useLayoutEffect(() => {
        const measure = () => {
            const stage = stageRef.current;
            const track = trackRef.current;
            if (!stage || !track) return;
            setMaxX(Math.min(0, stage.clientWidth - track.scrollWidth));
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (stageRef.current) ro.observe(stageRef.current);
        if (trackRef.current) ro.observe(trackRef.current);
        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return maxX;
};

/* Cards can end in tags or in a single call to action — the landing page's
   third step is a link, not pills. */
const CardFoot = ({ item }) => {
    if (item.link) {
        return (
            <Link to={item.link.to} className="cq-panel__link">
                {item.link.label} <span aria-hidden="true">→</span>
            </Link>
        );
    }
    return (
        <>
            {(item.tags || []).map((t) => (
                <span key={t} className="cq-panel__pill">{t}</span>
            ))}
        </>
    );
};

/* Travel finishes at this fraction of the runway; the rest is a hold on the
   last card. See the x/bar transforms below. */
const TRAVEL_SPAN = 0.82;

const RailCard = ({ item, index, count, progress }) => {
    const reduce = useReducedMotion();

    // Where in the scroll this card is centred — scaled to the travel span so
    // a card is at full focus when it is actually centred on screen.
    const center = (count > 1 ? index / (count - 1) : 0.5) * TRAVEL_SPAN;

    const rotateY = useTransform(progress, [center - 0.28, center, center + 0.28], [18, 0, -18]);
    const scale = useTransform(progress, [center - 0.34, center, center + 0.34], [0.88, 1, 0.88]);
    const opacity = useTransform(progress, [center - 0.5, center, center + 0.5], [0.4, 1, 0.4]);
    const z = useTransform(progress, [center - 0.34, center, center + 0.34], [-140, 0, -140]);

    const style = reduce ? undefined : { rotateY, scale, z, opacity };

    return (
        <motion.article
            className={`cq-rail__card cq-panel cq-panel--${item.tone}`}
            style={style}
        >
            <div className="cq-panel__head">
                <span className="cq-panel__label">{item.label}</span>
            </div>
            <div className="cq-panel__value">{item.title}</div>
            <p className="cq-panel__body">{item.body}</p>
            <hr className="cq-panel__rule" />
            <div className="cq-panel__foot">
                <CardFoot item={item} />
            </div>
        </motion.article>
    );
};

const CqCapabilityRail = ({
    items,
    eyebrow,
    title,
    subtitle,
    runwayVh = RUNWAY_VH,
}) => {
    const ref = useRef(null);
    const stageRef = useRef(null);
    const trackRef = useRef(null);
    const reduce = useReducedMotion();
    const maxX = useTravel(stageRef, trackRef, [items.length]);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end end'],
    });

    /* Smoothing only — the sense of pace comes from runwayVh, not from here.
       The first pass (55 / 26 / 0.7) was a damping ratio of ~2.1 and a natural
       frequency of ~8.9 rad/s: so slow that a brisk scroll outran it. The
       track was still at -385px of its -781px travel when the section
       unpinned, so the last cards never arrived going down, and going back up
       it lurched to the end and unwound. This settles in about a tenth of a
       second, which reads as smooth without ever lagging the scroll. */
    const smooth = useSpring(scrollYProgress, {
        stiffness: 150,
        damping: 32,
        mass: 0.5,
        restDelta: 0.0005,
    });

    /* The track finishes travelling at 82% of the runway, not 100%. The spring
       lags the raw scroll by design, so mapping travel across the full runway
       means progress reaches 1 while the track is still catching up — the
       section unpins and scrolls away before the last cards arrive. The last
       fifth is a settle-and-hold: the track is already at its end, and the
       final card stays on screen while the reader finishes with it. */
    const x = useTransform(smooth, [0, TRAVEL_SPAN], [0, maxX]);
    const bar = useTransform(smooth, [0, TRAVEL_SPAN], ['0%', '100%']);

    /* Held, not flashed. Clearing it at 7% meant it vanished the moment the
       track moved — so anyone already scrolling never saw it, which is
       exactly when knowing the gesture is useful. It now stays up while
       there is travel left and fades as the last card arrives. */
    const hint = useTransform(smooth, [TRAVEL_SPAN - 0.18, TRAVEL_SPAN], [1, 0]);

    // Reduced motion: fall back to a normal horizontal scroller, no pinning.
    if (reduce) {
        return (
            <section className="cq-rail cq-rail--static">
                <div className="cq-rail__head">
                    <p className="cq-eyebrow">{eyebrow}</p>
                    <h2 className="cq-page-title">{title}</h2>
                    {subtitle && <p className="cq-page-sub">{subtitle}</p>}
                </div>
                {/* Reduced motion gets a real horizontal scroller, so the cue
                    has to name that gesture instead of scrolling down. */}
                <p className="cq-rail__hint cq-rail__hint--static">
                    Swipe to move through
                    <span className="cq-rail__hint-arrow" aria-hidden="true">→</span>
                </p>

                <div className="cq-rail__track cq-rail__track--scroll">
                    {items.map((item) => (
                        <article key={item.key} className={`cq-rail__card cq-panel cq-panel--${item.tone}`}>
                            <div className="cq-panel__head">
                                <span className="cq-panel__label">{item.label}</span>
                            </div>
                            <div className="cq-panel__value">{item.title}</div>
                            <p className="cq-panel__body">{item.body}</p>
                            <hr className="cq-panel__rule" />
                            <div className="cq-panel__foot">
                                <CardFoot item={item} />
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="cq-rail" ref={ref} style={{ height: `${runwayVh}vh` }}>
            <div className="cq-rail__sticky">
                <div className="cq-rail__head">
                    <p className="cq-eyebrow">{eyebrow}</p>
                    <h2 className="cq-page-title">{title}</h2>
                    {subtitle && <p className="cq-page-sub">{subtitle}</p>}
                </div>

                <div className="cq-rail__stage" ref={stageRef}>
                    <motion.div className="cq-rail__track" ref={trackRef} style={{ x }}>
                        {items.map((item, i) => (
                            <RailCard
                                key={item.key}
                                item={item}
                                index={i}
                                count={items.length}
                                progress={smooth}
                            />
                        ))}
                    </motion.div>
                </div>

                <motion.p className="cq-rail__hint" style={{ opacity: hint }}>
                    Scroll down to move through
                    <span className="cq-rail__hint-arrow" aria-hidden="true">↓</span>
                </motion.p>

                <div className="cq-rail__progress">
                    <motion.div className="cq-rail__progress-fill" style={{ width: bar }} />
                </div>
            </div>
        </section>
    );
};

export default CqCapabilityRail;
