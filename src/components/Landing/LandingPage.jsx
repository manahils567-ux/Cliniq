import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeart, FaPlay, FaChevronRight, FaUserMd, FaCalendarAlt,
  FaStethoscope, FaShieldAlt, FaFlask, FaClock, FaTooth,
  FaBrain, FaEye, FaBone, FaSyringe, FaMapMarkerAlt,
  FaArrowRight, FaCheck, FaStar, FaCamera, FaBell
} from 'react-icons/fa';
import CqHero from '../Home/HeroSection/CqHero';
import CqSiteFooter from '../Shared/CqSiteFooter/CqSiteFooter';
import CqCapabilityRail from '../Service/CqCapabilityRail';
import './Landing.css';

/* The two landing card rows are one scroll-down / swipe-left rail: the three
   process steps, then the three capabilities behind them. Kept as a single
   rail rather than two because consecutive runways leave a long blank stretch
   between them, and six cards give the track enough to travel through at the
   default card width. */
const RAIL_ITEMS = [
  {
    key: 'capture',
    tone: 'ink',
    label: 'Step 01 · Capture',
    title: 'Photograph your documents',
    body: 'Point your phone camera at a prescription, lab report or discharge summary. Photos and PDFs both work — no scanner, no typing.',
    tags: ['Phone camera', 'PDF'],
  },
  {
    key: 'analyse',
    tone: 'accent',
    label: 'Step 02 · Analyse',
    title: 'AI reads every value',
    body: 'Each document is analysed on upload. Measurements are extracted with their reference ranges, and anything outside normal is flagged.',
    tags: ['Lab values', 'Medicines'],
  },
  {
    key: 'act',
    tone: 'greige',
    label: 'Step 03 · Act',
    title: 'Reminders, then the right doctor',
    body: 'A course of medication becomes a daily reminder; a recheck in three months becomes a dated one. When a report points to a speciality, book a verified doctor and share those records in one tap.',
    link: { to: '/login', label: 'Sign in to start' },
  },
  {
    key: 'credentials',
    tone: 'cream',
    label: 'Credentials',
    title: 'Doctor Credentials',
    body: 'Every specialist on our platform is board-certified and verified. View degrees, experience, and patient ratings before booking.',
    tags: ['Verified', 'Board Certified'],
  },
  {
    key: 'scheduling',
    tone: 'ink',
    label: 'Scheduling',
    title: 'Flexible Scheduling',
    body: 'Book same-day or plan weeks ahead. Choose your preferred time slot and receive instant confirmation with reminders.',
    tags: ['Same-Day', 'Reminders'],
  },
  {
    key: 'diagnostics',
    tone: 'accent',
    label: 'Diagnostics',
    title: 'Modern Diagnostics',
    body: 'Access lab results, imaging, and diagnostic reports directly in your patient dashboard — shared securely by your care team.',
    tags: ['Lab Results', 'Imaging'],
  },
];

/* ── small reusable icon-bubble ── */
const Bubble = ({ icon: Icon, bg, color, size = 48 }) => (
  <div
    className="icon-bubble"
    style={{ background: bg, color, width: size, height: size, fontSize: size * 0.38 }}
  >
    <Icon />
  </div>
);

export default function LandingPage() {

  return (
    <div className="landing">

      {/* Navigation lives inside the hero bar — see CqHero. */}

      {/* ══════════════ HERO ══════════════ */}
      <CqHero />

      {/* ══════════════ TRUST STRIP ══════════════ */}
      {/* Fixed marketing figures, not live counts. */}
      <section className="cq-trust" id="trust">
        <div className="cq-trust__item">
          <span className="cq-trust__num">200+</span>
          <span className="cq-trust__label">Specialists</span>
        </div>
        <div className="cq-trust__item">
          <span className="cq-trust__num">50k+</span>
          <span className="cq-trust__label">Patients</span>
        </div>
        <div className="cq-trust__item">
          <span className="cq-trust__num">4.9<FaStar size={14} /></span>
          <span className="cq-trust__label">Rating</span>
        </div>
        <div className="cq-trust__item">
          <span className="cq-trust__num">22</span>
          <span className="cq-trust__label">Specialities</span>
        </div>
      </section>

      {/* ══════════════ CAPABILITY RAIL ══════════════ */}
      <CqCapabilityRail
        items={RAIL_ITEMS}
        eyebrow="How Cliniq works"
        title="From a pile of paperwork to a plan"
        subtitle="Three steps, and the platform behind them."
        runwayVh={260}
      />

      {/* ══════════════ CLOSING CTA ══════════════ */}
      <section className="section section--card-flush" id="get-started">
        <div className="cq-close">
          <div className="cq-close__text">
            <p className="cq-eyebrow" style={{ color: 'var(--d-text-faint)' }}>Get started</p>
            <h2 className="cq-close__title">Start with the report in your hand</h2>
            <p className="cq-close__sub">
              Photograph it, and Cliniq reads the values, explains what they mean and
              schedules whatever needs following up. Free to try, in Urdu or English.
            </p>
            <div className="cq-close__actions">
              <Link to="/login" className="cq-cta">
                Upload a report
                <span className="cq-cta__well" aria-hidden>↙</span>
              </Link>
              <Link to="/login" className="cq-close__link">
                Already have an account? Sign in <FaArrowRight size={11} />
              </Link>
            </div>
          </div>

          <ul className="cq-close__list">
            <li><FaCheck size={11} /> Photos and PDFs, no scanner needed</li>
            <li><FaCheck size={11} /> Values checked against reference ranges</li>
            <li><FaCheck size={11} /> Reminders created from your own reports</li>
            <li><FaCheck size={11} /> Records shared per appointment, not wholesale</li>
          </ul>
        </div>
      </section>

      {/* ══════════════ FOOTER (includes the newsletter band) ══════════════ */}
      <CqSiteFooter newsletter />

    </div>
  );
}
