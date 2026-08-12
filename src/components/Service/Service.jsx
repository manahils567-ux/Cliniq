import React from 'react';
import { Link } from 'react-router-dom';
import { Spin } from 'antd';
import { FaArrowRight, FaUserMd } from 'react-icons/fa';
import Header from '../Shared/Header/Header';
import SubHeader from '../Shared/SubHeader';
import Footer from '../Shared/Footer/Footer';
import { useGetSpecialitiesQuery, useGetPlatformStatsQuery } from '../../redux/api/doctorApi';

/* Every entry here maps to something the product actually does today. */
const CAPABILITIES = [
  {
    key: 'capture',
    tone: 'ink',
    label: 'Records',
    title: 'Capture any document',
    body: 'Photograph a prescription, lab report, imaging result or discharge summary with your phone, or upload a PDF. No scanner and no typing.',
    tags: ['Phone camera', 'PDF'],
    to: '/dashboard',
  },
  {
    key: 'analyse',
    tone: 'accent',
    label: 'AI analysis',
    title: 'Every value read and checked',
    body: 'Each upload is analysed automatically. Measurements are extracted with their reference ranges, and anything outside normal is flagged with an explanation.',
    tags: ['Lab values', 'Medicines', 'Findings'],
    to: '/dashboard',
  },
  {
    key: 'reminders',
    tone: 'greige',
    label: 'Follow-through',
    title: 'Reminders that come from your reports',
    body: 'A prescribed course becomes a daily reminder. A recheck in three months becomes a dated one. You accept a suggestion and it is scheduled for you.',
    tags: ['Alerts', 'Follow-ups'],
    to: '/dashboard',
  },
  {
    key: 'vault',
    tone: 'cream',
    label: 'Sharing',
    title: 'Share only what a visit needs',
    body: 'Your records stay private by default. Release specific documents to a specific appointment, so a doctor sees what is relevant rather than everything.',
    tags: ['Per-appointment', 'Revocable'],
    to: '/dashboard',
  },
  {
    key: 'assistant',
    tone: 'cream',
    label: 'Assistant',
    title: 'Ask questions in Urdu or English',
    body: 'The assistant answers with your own records for context, by typing or by voice, and points you to the right kind of specialist when it matters.',
    tags: ['Urdu', 'English', 'Voice'],
    to: '/dashboard',
  },
  {
    key: 'nearby',
    tone: 'greige',
    label: 'Nearby',
    title: 'Find the nearest hospital',
    body: 'Hospitals and clinics near your current location, on a map, for the moment you need one quickly.',
    tags: ['Map', 'Location'],
    to: '/dashboard',
  },
  {
    key: 'appointments',
    tone: 'ink',
    label: 'Appointments',
    title: 'Book, track and pay',
    body: 'Pick a doctor and a time slot, get confirmation, follow the appointment through to prescription and invoice — all in one thread.',
    tags: ['Booking', 'Prescriptions', 'Invoices'],
    to: '/doctors',
  },
];

const Service = () => {
  const { data: specialities = [], isLoading: loadingSpecs } = useGetSpecialitiesQuery();
  const { data: stats = {} } = useGetPlatformStatsQuery();

  return (
    <>
      <Header />
      <SubHeader
        title="What Cliniq does"
        subtitle="Your medical paperwork, read and organised — then turned into reminders, insights and the right appointment."
      />

      {/* ── Capabilities ─────────────────────────────────────────────── */}
      <section className="cq-page" style={{ padding: '72px 60px' }}>
        <div className="cq-page-head" style={{ textAlign: 'center' }}>
          <p className="cq-eyebrow">Services</p>
          <h2 className="cq-page-title">Everything from one photograph</h2>
          <p className="cq-page-sub" style={{ maxWidth: '58ch', margin: '12px auto 0' }}>
            Cliniq is built around the pile of paper you walk out of a hospital with.
            Capture it once, and the rest follows.
          </p>
        </div>

        <div className="cq-service-grid">
          {CAPABILITIES.map((c) => (
            <article key={c.key} className={`cq-panel cq-panel--${c.tone}`}>
              <div className="cq-panel__head">
                <span className="cq-panel__label">{c.label}</span>
              </div>
              <div className="cq-panel__value">{c.title}</div>
              <p className="cq-panel__body">{c.body}</p>
              <hr className="cq-panel__rule" />
              <div className="cq-panel__foot">
                {c.tags.map((t) => (
                  <span key={t} className="cq-panel__pill">{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Specialities, live from the database ─────────────────────── */}
      <section className="cq-page" style={{ padding: '0 60px 72px' }}>
        <div className="cq-page-head" style={{ textAlign: 'center' }}>
          <p className="cq-eyebrow">Specialities</p>
          <h2 className="cq-page-title">Browse by what you need</h2>
        </div>

        {loadingSpecs ? (
          <div className="text-center py-4"><Spin /></div>
        ) : specialities.length === 0 ? (
          <div className="cq-empty">
            <div className="cq-empty__title">No specialities listed yet</div>
            <p className="cq-empty__body">
              Specialities appear here as soon as doctors set one on their profile.
              {stats.doctors ? ` ${stats.doctors} doctor${stats.doctors === 1 ? '' : 's'} registered so far.` : ''}
            </p>
            <Link to="/login" className="cq-panel__link" style={{ color: 'var(--c-accent)' }}>
              Sign in to browse doctors <FaArrowRight size={11} />
            </Link>
          </div>
        ) : (
          <div className="cq-spec-grid">
            {specialities.map((s) => (
              <Link
                key={s.name}
                to={`/login?next=${encodeURIComponent(`/doctors?specialization=${s.name}`)}`}
                className="cq-spec"
              >
                <span className="cq-spec__icon"><FaUserMd /></span>
                <span className="cq-spec__name">{s.name}</span>
                <span className="cq-spec__count">
                  {s.doctors} doctor{s.doctors === 1 ? '' : 's'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Closing call to action ───────────────────────────────────── */}
      <section className="cq-cta-band">
        <div>
          <p className="cq-eyebrow" style={{ color: 'var(--d-text-faint)' }}>Get started</p>
          <h2 className="cq-cta-band__title">Upload your first report</h2>
          <p className="cq-cta-band__sub">
            It is analysed within seconds, and anything that needs following up becomes a reminder.
          </p>
        </div>
        <Link to="/login" className="cq-cta">
          Sign in to get started
          <span className="cq-cta__well" aria-hidden>↙</span>
        </Link>
      </section>

      <Footer />
    </>
  );
};

export default Service;
