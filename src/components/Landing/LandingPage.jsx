import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeart, FaPlay, FaChevronRight, FaUserMd, FaCalendarAlt,
  FaStethoscope, FaShieldAlt, FaFlask, FaClock, FaTooth,
  FaBrain, FaEye, FaBone, FaSyringe, FaMapMarkerAlt,
  FaArrowRight, FaCheck, FaStar
} from 'react-icons/fa';
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

export default function LandingPage() {
  return (
    <div className="landing">

      {/* ══════════════ NAVBAR ══════════════ */}
      <nav className="nav">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">
            <FaHeart />
          </div>
          <span className="nav-logo-text">Clinnic</span>
        </Link>

        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Cardiology</a></li>
          <li><a href="#cases">Cases</a></li>
          <li><a href="#careers">Careers</a></li>
        </ul>

        <Link to="/appointment" className="btn-primary">
          Book Appointment
        </Link>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section className="hero" id="home">
        <div className="hero-left">
          <div className="hero-badge">
            <FaCheck size={10} />
            Trusted by 50,000+ patients
          </div>

          <h1 className="hero-title">
            Your health is<br />
            <span>our priority</span>
          </h1>

          <p className="hero-sub">
            Access world-class care from certified specialists. Book appointments,
            track your health, and get prescriptions — all in one place.
          </p>

          <div className="hero-actions">
            <Link to="/appointment" className="btn-primary">
              Book Appointment <FaArrowRight size={12} />
            </Link>
            <button className="btn-secondary">
              <span className="hero-play-icon"><FaPlay size={10} /></span>
              See how it works
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">200+</span>
              <span className="hero-stat-label">Specialists</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">50k+</span>
              <span className="hero-stat-label">Patients</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">4.9★</span>
              <span className="hero-stat-label">Rating</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-blob" />
          <div className="hero-blob-2" />

          <div className="hero-img-wrap">
            <div className="hero-img-placeholder">
              <FaUserMd style={{ width: 110, height: 110, opacity: 0.35 }} />
            </div>
          </div>

          {/* floating badge bottom-left */}
          <div className="hero-badge-float">
            <div className="hero-badge-float-icon"><FaCalendarAlt /></div>
            <div className="hero-badge-float-text">
              <strong>Next Available</strong>
              <span>Today, 2:30 PM</span>
            </div>
          </div>

          {/* floating badge top-right */}
          <div className="hero-badge-float-2">
            <div className="hero-badge-float-2-icon"><FaCheck /></div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1d3b' }}>Verified Doctor</div>
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURE ROW ══════════════ */}
      <section className="section" id="about">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p className="section-label">Why choose us</p>
          <h2 className="section-title">Healthcare built around you</h2>
        </div>

        <div className="cards-row">

          {/* Card 1 — doctor photo */}
          <div className="card feat-card-photo">
            <div className="feat-card-badge"><FaUserMd /></div>
            <div className="feat-card-photo-inner">
              <FaUserMd />
            </div>
          </div>

          {/* Card 2 — text */}
          <div className="card feat-card-text">
            <div>
              <h3>Your Health is Our Core Focus</h3>
              <p style={{ marginTop: 12 }}>
                We combine experienced specialists with modern technology to deliver
                personalised care. Our doctors collaborate to provide holistic
                treatment plans tailored to your needs.
              </p>
            </div>
            <div>
              <Link to="/doctors" className="btn-mint">
                Our Specialists <FaArrowRight size={11} />
              </Link>
            </div>
          </div>

          {/* Card 3 — icon grid */}
          <div className="card feat-card-icons">
            <h4>Our Services</h4>
            <div className="icon-grid">
              <Bubble icon={FaHeart}       bg="#eef0ff" color="#4F5FFF" />
              <Bubble icon={FaBrain}       bg="#fef3f2" color="#f04438" />
              <Bubble icon={FaStethoscope} bg="#e8faf3" color="#3ecf8e" />
              <Bubble icon={FaEye}         bg="#fff8e6" color="#f79009" />
              <Bubble icon={FaTooth}       bg="#f4f0ff" color="#9b8afb" />
              <Bubble icon={FaBone}        bg="#fef0e6" color="#f97316" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ SERVICES ROW ══════════════ */}
      <section className="section section-bg" id="services">
        <div className="services-header">
          <p className="section-label">What we offer</p>
          <h2 className="section-title">Designed for better care</h2>
        </div>

        <div className="cards-row">

          {/* Service Card 1 */}
          <div className="service-card">
            <div className="service-card-avatar" style={{ background: '#eef0ff' }}>
              <FaShieldAlt style={{ color: '#4F5FFF' }} />
            </div>
            <h3>Credentials</h3>
            <h2>Doctor Credentials</h2>
            <p>
              Every specialist on our platform is board-certified and verified.
              View degrees, experience, and patient ratings before booking.
            </p>
            <div className="service-tags">
              <span className="tag tag-blue">Verified</span>
              <span className="tag tag-mint">Board Certified</span>
            </div>
          </div>

          {/* Service Card 2 */}
          <div className="service-card">
            <div className="service-card-avatar" style={{ background: '#e8faf3' }}>
              <FaClock style={{ color: '#3ecf8e' }} />
            </div>
            <h3>Scheduling</h3>
            <h2>Flexible Scheduling</h2>
            <p>
              Book same-day or plan weeks ahead. Choose your preferred time slot
              and receive instant confirmation with reminders.
            </p>
            <div className="service-tags">
              <span className="tag tag-mint">Same-Day</span>
              <span className="tag tag-lavender">Reminders</span>
            </div>
          </div>

          {/* Service Card 3 */}
          <div className="service-card">
            <div className="service-card-avatar" style={{ background: '#fef3f2' }}>
              <FaFlask style={{ color: '#f04438' }} />
            </div>
            <h3>Diagnostics</h3>
            <h2>Modern Diagnostics</h2>
            <p>
              Access lab results, imaging, and diagnostic reports directly in your
              patient dashboard — shared securely by your care team.
            </p>
            <div className="service-tags">
              <span className="tag tag-blue">Lab Results</span>
              <span className="tag tag-lavender">Imaging</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ INFO + TESTIMONIALS ══════════════ */}
      <section className="section" id="cases">
        <div className="two-col">

          {/* Left — lavender info block */}
          <div className="info-block">
            <p className="section-label" style={{ marginBottom: 0 }}>Patient stories</p>
            <h2>Real care, real results</h2>
            <p>
              Our patients are at the heart of everything we do. From routine
              check-ups to complex treatments, we are committed to outcomes that
              make a genuine difference in everyday life.
            </p>
            <p>
              Join thousands of satisfied patients who trust Clinnic for their
              family's health journey.
            </p>
            <div style={{ marginTop: 8 }}>
              <Link to="/doctors" className="btn-outline">
                <FaArrowRight size={12} /> Meet our doctors
              </Link>
            </div>
          </div>

          {/* Right — two testimonial cards */}
          <div className="testimonials-col">
            <div className="testimonial-card">
              <div className="testimonial-avatar blue">P</div>
              <div className="testimonial-content">
                <h4>Priya Sharma</h4>
                <span>Cardiology Patient</span>
                <p>
                  "The booking process was incredibly smooth and the cardiologist
                  was thorough and reassuring. I felt genuinely cared for throughout."
                </p>
                <div style={{ display: 'flex', gap: 3, marginTop: 8, color: '#f79009' }}>
                  {[...Array(5)].map((_, i) => <FaStar key={i} size={12} />)}
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-avatar green">M</div>
              <div className="testimonial-content">
                <h4>Marcus Lee</h4>
                <span>General Practice</span>
                <p>
                  "Having my prescription and appointment history in one place
                  saves so much time. The reminder system is a game-changer."
                </p>
                <div style={{ display: 'flex', gap: 3, marginTop: 8, color: '#f79009' }}>
                  {[...Array(5)].map((_, i) => <FaStar key={i} size={12} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ APPOINTMENT BOOKING ══════════════ */}
      <section className="section section-bg" id="booking">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p className="section-label">Get started</p>
          <h2 className="section-title">Book your appointment</h2>
          <p className="section-sub" style={{ margin: '12px auto 0' }}>
            Fast, simple, and secure. Choose your doctor, pick a time, and confirm in seconds.
          </p>
        </div>

        <div className="booking-row">
          {/* Doctor image placeholder */}
          <div className="booking-img">
            <FaUserMd />
          </div>

          {/* Booking card */}
          <div className="booking-card">
            <h2>Appointment Booking</h2>
            <p>Fill in the details below to reserve your slot</p>

            <div className="booking-inputs">
              <div className="booking-input-row">
                <div className="booking-input-left">
                  <div className="booking-input-icon"><FaUserMd /></div>
                  <div className="booking-input-text">
                    <label>Specialist</label>
                    <span>Select Doctor</span>
                  </div>
                </div>
                <FaChevronRight className="booking-input-chevron" />
              </div>

              <div className="booking-input-row">
                <div className="booking-input-left">
                  <div className="booking-input-icon"><FaCalendarAlt /></div>
                  <div className="booking-input-text">
                    <label>Date</label>
                    <span>Add Appointment Date</span>
                  </div>
                </div>
                <FaChevronRight className="booking-input-chevron" />
              </div>

              <div className="booking-input-row">
                <div className="booking-input-left">
                  <div className="booking-input-icon"><FaMapMarkerAlt /></div>
                  <div className="booking-input-text">
                    <label>Location</label>
                    <span>Choose Clinic</span>
                  </div>
                </div>
                <FaChevronRight className="booking-input-chevron" />
              </div>
            </div>

            <Link to="/appointment">
              <button className="btn-primary-full">Book Appointment</button>
            </Link>

            <p style={{ fontSize: 12, color: '#8b8fa8', textAlign: 'center', marginTop: 14 }}>
              <FaShieldAlt size={10} style={{ marginRight: 4 }} />
              Your data is secure and private
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="footer">
        <div className="footer-logo">
          <FaHeart style={{ color: '#4F5FFF' }} />
          Clinnic
        </div>
        <span>© {new Date().getFullYear()} Clinnic. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <Link to="/contact" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Contact</Link>
        </div>
      </footer>

    </div>
  );
}
