import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeart, FaPlay, FaChevronRight, FaUserMd, FaCalendarAlt,
  FaStethoscope, FaShieldAlt, FaFlask, FaClock, FaTooth,
  FaBrain, FaEye, FaBone, FaSyringe, FaMapMarkerAlt,
  FaArrowRight, FaCheck, FaStar, FaCamera, FaBell
} from 'react-icons/fa';
import CqHero from '../Home/HeroSection/CqHero';
import { useGetPlatformStatsQuery } from '../../redux/api/doctorApi';
import './Landing.css';

/* ── small reusable icon-bubble ── */
const Bubble = ({ icon: Icon, bg, color, size = 48 }) => (
  <div
    className="icon-bubble"
    style={{ background: bg, color, width: size, height: size, fontSize: size * 0.38 }}
  >
    <Icon />
  </div>
);

/* Counters read from the live database. An em dash while loading is honest —
   a hardcoded number that never moves is not. */
const fmt = (n) => {
  if (n === null || n === undefined) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
};

export default function LandingPage() {
  const { data: statsData } = useGetPlatformStatsQuery();
  const stats = statsData ?? {};

  return (
    <div className="landing">

      {/* Navigation lives inside the hero bar — see CqHero. */}

      {/* ══════════════ HERO ══════════════ */}
      <CqHero />

      {/* ══════════════ TRUST STRIP ══════════════ */}
      <section className="cq-trust" id="trust">
        <div className="cq-trust__item">
          <span className="cq-trust__num">{fmt(stats.doctors)}</span>
          <span className="cq-trust__label">Specialists</span>
        </div>
        <div className="cq-trust__item">
          <span className="cq-trust__num">{fmt(stats.patients)}</span>
          <span className="cq-trust__label">Patients</span>
        </div>
        <div className="cq-trust__item">
          <span className="cq-trust__num">
            {stats.avgRating ? <>{stats.avgRating}<FaStar size={14} /></> : '—'}
          </span>
          <span className="cq-trust__label">
            {stats.reviews ? `Rating · ${stats.reviews} review${stats.reviews === 1 ? '' : 's'}` : 'Rating'}
          </span>
        </div>
        <div className="cq-trust__item">
          <span className="cq-trust__num">{fmt(stats.specialities)}</span>
          <span className="cq-trust__label">Specialities</span>
        </div>
      </section>

      {/* ══════════════ FEATURE ROW ══════════════ */}
      <section className="section" id="about">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p className="section-label">How Cliniq works</p>
          <h2 className="section-title">From a pile of paperwork to a plan</h2>
        </div>

        <div className="cards-row">

          <article className="cq-panel cq-panel--ink">
            <div className="cq-panel__head">
              <span className="cq-panel__label">Step 01 · Capture</span>
            </div>
            <div className="cq-panel__value">Photograph your documents</div>
            <p className="cq-panel__body">
              Point your phone camera at a prescription, lab report or discharge
              summary. Photos and PDFs both work — no scanner, no typing.
            </p>
            <hr className="cq-panel__rule" />
            <div className="cq-panel__foot">
              <span className="cq-panel__pill">Phone camera</span>
              <span className="cq-panel__pill">PDF</span>
            </div>
          </article>

          <article className="cq-panel cq-panel--accent">
            <div className="cq-panel__head">
              <span className="cq-panel__label">Step 02 · Analyse</span>
            </div>
            <div className="cq-panel__value">AI reads every value</div>
            <p className="cq-panel__body">
              Each document is analysed on upload. Measurements are extracted with
              their reference ranges, and anything outside normal is flagged.
            </p>
            <hr className="cq-panel__rule" />
            <div className="cq-panel__foot">
              <span className="cq-panel__pill">Lab values</span>
              <span className="cq-panel__pill">Medicines</span>
            </div>
          </article>

          <article className="cq-panel cq-panel--greige">
            <div className="cq-panel__head">
              <span className="cq-panel__label">Step 03 · Act</span>
            </div>
            <div className="cq-panel__value">Reminders, then the right doctor</div>
            <p className="cq-panel__body">
              A course of medication becomes a daily reminder; a recheck in three
              months becomes a dated one. When a report points to a speciality,
              book a verified doctor and share those records in one tap.
            </p>
            <hr className="cq-panel__rule" />
            <div className="cq-panel__foot">
              <Link to="/login" className="cq-panel__link">
                Sign in to start <FaArrowRight size={11} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* ══════════════ SERVICES ROW ══════════════ */}
      <section className="section section-bg" id="services">
        <div className="services-header">
          <p className="section-label">What we offer</p>
          <h2 className="section-title">Designed for better care</h2>
        </div>

        <div className="cards-row">

          <article className="cq-panel cq-panel--cream">
            <div className="cq-panel__head">
              <span className="cq-panel__label">Credentials</span>
            </div>
            <div className="cq-panel__value">Doctor Credentials</div>
            <p className="cq-panel__body">
              Every specialist on our platform is board-certified and verified.
              View degrees, experience, and patient ratings before booking.
            </p>
            <hr className="cq-panel__rule" />
            <div className="cq-panel__foot">
              <span className="cq-panel__pill">Verified</span>
              <span className="cq-panel__pill">Board Certified</span>
            </div>
          </article>

          <article className="cq-panel cq-panel--ink">
            <div className="cq-panel__head">
              <span className="cq-panel__label">Scheduling</span>
            </div>
            <div className="cq-panel__value">Flexible Scheduling</div>
            <p className="cq-panel__body">
              Book same-day or plan weeks ahead. Choose your preferred time slot
              and receive instant confirmation with reminders.
            </p>
            <hr className="cq-panel__rule" />
            <div className="cq-panel__foot">
              <span className="cq-panel__pill">Same-Day</span>
              <span className="cq-panel__pill">Reminders</span>
            </div>
          </article>

          <article className="cq-panel cq-panel--accent">
            <div className="cq-panel__head">
              <span className="cq-panel__label">Diagnostics</span>
            </div>
            <div className="cq-panel__value">Modern Diagnostics</div>
            <p className="cq-panel__body">
              Access lab results, imaging, and diagnostic reports directly in your
              patient dashboard — shared securely by your care team.
            </p>
            <hr className="cq-panel__rule" />
            <div className="cq-panel__foot">
              <span className="cq-panel__pill">Lab Results</span>
              <span className="cq-panel__pill">Imaging</span>
            </div>
          </article>
        </div>
      </section>

      {/* ══════════════ CLOSING CTA ══════════════ */}
      <section className="section" id="get-started">
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

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="footer">
        <div className="footer-logo">Cliniq</div>
        <span>© {new Date().getFullYear()} Cliniq. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <Link to="/contact" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Contact</Link>
        </div>
      </footer>

    </div>
  );
}
