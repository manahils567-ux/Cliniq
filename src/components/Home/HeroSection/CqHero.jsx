import React from 'react';
import CqHeroStage from './CqHeroStage';

/**
 * Editorial hero for the landing page. Styled entirely by styles/base.css
 * (.cq-hero and friends) — no stylesheet of its own.
 *
 * The explainer used to be public/hero.mp4, a looping video with its six
 * cards baked into the frames. It is <CqHeroStage /> now — see that file for
 * why. The scrim in .cq-hero__media still paints the directional ground, so
 * the hero keeps its depth without any media to download.
 */
const CqHero = () => (
    <section className="cq-hero">
        <div className="cq-hero__media" />

        <div className="cq-hero__body">
            <h1 className="cq-hero__title">Because your health deserves the record</h1>
            <p className="cq-hero__lede">
                Every prescription, lab result and X-ray in one place. Ask questions in
                Urdu or English. Find the nearest hospital in one tap.
            </p>
        </div>

        <CqHeroStage />
    </section>
);

export default CqHero;
