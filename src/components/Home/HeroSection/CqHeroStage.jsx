import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './CqHeroStage.css';

/**
 * The hero's explainer animation, as DOM.
 *
 * This replaces public/hero.mp4 — a 15.6s loop whose six cards were baked
 * into the frames at 140kbps for 1920x1080. That is roughly 30x under a
 * normal encode for the size, and the content is the worst case for it:
 * flat fills, rounded rectangles and small text, all of which an encoder
 * discards first. It was also being upscaled ~1.6x on a 2x display.
 *
 * Rendering it as elements means it is crisp at any resolution, costs no
 * download, and the copy is real text — selectable, translatable and
 * reachable by assistive tech. It is also the only version that can carry
 * the depth the flat video could not.
 *
 * Motion: each slide swings in on its own Z axis inside a shared
 * perspective, so the deck reads as physical cards rather than a
 * crossfade. Springs rather than durations, deliberately slack.
 */

/* ── Visuals ──────────────────────────────────────────────────────────── */

const Line = ({ w }) => <span className="cqstage__line" style={{ width: w }} />;

const PhoneVisual = () => (
    <div className="cqstage__phone">
        <span className="cqstage__phone-notch" />
        <div className="cqstage__phone-screen">
            <div className="cqstage__doc">
                <Line w="46%" /><Line w="88%" /><Line w="72%" />
                <Line w="90%" /><Line w="54%" />
            </div>
        </div>
    </div>
);

const LABS = [
    { name: 'Hemoglobin', value: '9.4 g/dL', flag: 'Low', tone: 'danger' },
    { name: 'HbA1c', value: '7.8 %', flag: 'High', tone: 'danger' },
    { name: 'Platelets', value: '2.6 lakh', flag: 'Normal', tone: 'positive' },
];

const LabsVisual = () => (
    <div className="cqstage__sheet">
        <span className="cqstage__rule" />
        {LABS.map((l) => (
            <div className="cqstage__lab" key={l.name}>
                <span className="cqstage__lab-name">{l.name}</span>
                <span className="cqstage__lab-value">{l.value}</span>
                <span className={`cqstage__flag cqstage__flag--${l.tone}`}>{l.flag}</span>
            </div>
        ))}
    </div>
);

const InsightVisual = () => (
    <div className="cqstage__insight">
        <p className="cqstage__insight-eyebrow">Needs attention</p>
        <p className="cqstage__insight-title">Low haemoglobin</p>
        <p className="cqstage__insight-body">
            Suggests anaemia. Confirm with your doctor before changing anything.
        </p>
    </div>
);

const REMINDERS = [
    { title: 'Iron tablet', when: 'Every day, 8:00' },
    { title: 'Repeat CBC', when: 'In 90 days' },
    { title: 'Vitamin D recheck', when: 'In 90 days' },
];

const RemindersVisual = () => (
    <div className="cqstage__reminders">
        {REMINDERS.map((r, i) => (
            <div className="cqstage__reminder" key={r.title} style={{ '--i': i }}>
                <span className="cqstage__dot" />
                <span>
                    <span className="cqstage__reminder-title">{r.title}</span>
                    <span className="cqstage__reminder-when">{r.when}</span>
                </span>
            </div>
        ))}
    </div>
);

const ShareVisual = () => (
    <div className="cqstage__share">
        <div className="cqstage__stack" aria-hidden="true">
            <span className="cqstage__page cqstage__page--back" />
            <span className="cqstage__page cqstage__page--mid" />
            <div className="cqstage__page cqstage__page--front">
                <Line w="70%" /><Line w="88%" /><Line w="60%" /><Line w="82%" />
            </div>
        </div>
        <div className="cqstage__visit">
            <span className="cqstage__visit-tab" aria-hidden="true" />
            <div className="cqstage__visit-card">
                <Line w="58%" /><Line w="84%" /><Line w="66%" /><Line w="78%" />
            </div>
            <span className="cqstage__visit-label">This visit</span>
        </div>
    </div>
);

const SLOTS = ['09:00', '11:30', '14:00', '16:30'];

const BookingVisual = () => (
    <div className="cqstage__sheet cqstage__sheet--booking">
        <p className="cqstage__speciality">Cardiology</p>
        <p className="cqstage__doctor">Dr. A. Rahman</p>
        <div className="cqstage__slots">
            {SLOTS.map((s, i) => (
                <span
                    key={s}
                    className={`cqstage__slot${i === 0 ? ' is-picked' : ''}`}
                >
                    {s}
                </span>
            ))}
        </div>
    </div>
);

/* ── Slides ───────────────────────────────────────────────────────────── */

const SLIDES = [
    { step: 'Step 01', title: 'Photograph it', sub: 'Prescription, lab report or discharge summary', Visual: PhoneVisual },
    { step: 'Step 02', title: 'AI reads every value', sub: 'Checked against the reference range printed on the report', Visual: LabsVisual },
    { step: 'Step 03', title: 'Told what it means', sub: 'Plain language, never a diagnosis', Visual: InsightVisual },
    { step: 'Step 04', title: 'Reminders scheduled', sub: 'Taken straight from what the report asks for', Visual: RemindersVisual },
    { step: 'Step 05', title: 'Shared, not surrendered', sub: 'Only the records that visit needs — nothing else', Visual: ShareVisual },
    { step: 'Step 06', title: 'Book the right specialist', sub: 'Matched to what the report actually points at', Visual: BookingVisual },
];

const HOLD_MS = 4200;

/* All six slides stay mounted and the deck animates between two poses.
   The obvious build is AnimatePresence with an exit variant, but then a node
   only unmounts once its exit animation reports completion — one stalled
   animation and retired slides pile up in the DOM, ghosting through each
   other. Holding every slide mounted has no such failure mode: presence is
   never in question, only the pose. It costs six small subtrees and is
   closer to what the effect is pretending to be anyway — a deck of cards,
   one forward and the rest set back. */
const FRONT = { opacity: 1, rotateY: 0, z: 0, scale: 1, y: 0 };
const BACK = { opacity: 0, rotateY: 16, z: -170, scale: 0.88, y: 22 };

/* Damping ratio just under 1 (~0.95): unhurried and soft at the finish, but
   it actually arrives. The first pass at stiffness 58 / mass 1.15 was
   overdamped at ~1.16 and took nearly three seconds to settle, which reads
   as lag rather than weight. */
const spring = { type: 'spring', stiffness: 92, damping: 18, mass: 1 };

const CqHeroStage = () => {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const reduced = useReducedMotion();
    const timer = useRef(null);

    const go = useCallback((n) => setIndex(((n % SLIDES.length) + SLIDES.length) % SLIDES.length), []);

    // Auto-advance, but never while hovered/focused or while the tab is in the
    // background — a carousel ticking away unseen is just wasted work.
    useEffect(() => {
        if (paused) return undefined;
        const tick = () => setIndex((i) => (i + 1) % SLIDES.length);
        timer.current = setTimeout(tick, HOLD_MS);
        return () => clearTimeout(timer.current);
    }, [index, paused]);

    useEffect(() => {
        const onVis = () => setPaused(document.hidden);
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, []);

    const slide = SLIDES[index];

    return (
        <div
            className="cqstage"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            aria-roledescription="carousel"
            aria-label="How Cliniq works"
        >
            <div className="cqstage__deck">
                {SLIDES.map((s, i) => {
                    const active = i === index;
                    const { Visual } = s;
                    return (
                        <motion.div
                            key={s.step}
                            className="cqstage__slide"
                            aria-hidden={!active}
                            initial={false}
                            animate={
                                reduced
                                    ? { opacity: active ? 1 : 0 }
                                    : (active ? FRONT : BACK)
                            }
                            transition={reduced ? { duration: 0.25 } : spring}
                            style={{ pointerEvents: active ? 'auto' : 'none' }}
                        >
                            <div className="cqstage__art">
                                <Visual />
                            </div>

                            {/* A beat behind the card it sits on, so the two
                                read as separate planes rather than one sheet. */}
                            <motion.div
                                className="cqstage__caption"
                                initial={false}
                                animate={
                                    reduced
                                        ? { opacity: active ? 1 : 0 }
                                        : (active
                                            ? { opacity: 1, y: 0, z: 0 }
                                            : { opacity: 0, y: 18, z: -70 })
                                }
                                transition={
                                    reduced
                                        ? { duration: 0.25 }
                                        : { ...spring, delay: active ? 0.09 : 0 }
                                }
                            >
                                <p className="cqstage__step">{s.step}</p>
                                <p className="cqstage__title">{s.title}</p>
                                <p className="cqstage__sub">{s.sub}</p>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Announced separately so the swap is one polite update, not six. */}
            <p className="cqstage__sr" aria-live="polite">
                {`${slide.step}: ${slide.title}. ${slide.sub}`}
            </p>

            <div className="cqstage__pager">
                {SLIDES.map((s, i) => (
                    <button
                        key={s.step}
                        type="button"
                        className={`cqstage__pip${i === index ? ' is-active' : ''}`}
                        aria-label={`${s.step}: ${s.title}`}
                        aria-current={i === index}
                        onClick={() => go(i)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CqHeroStage;
