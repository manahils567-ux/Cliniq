import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaChevronRight } from 'react-icons/fa';
import CqNewsletter from '../../Landing/CqNewsletter';
import './CqSiteFooter.css';

/**
 * The site footer — one component replacing the two that existed before:
 *
 *   Shared/Footer     columned (patients / doctors / contact), used by 16 pages
 *   Shared/CqFooter   floating dark card + newsletter, used by the landing page
 *
 * This keeps the floating card treatment and the staggered reveal from CqFooter
 * and the column content from Footer, on a CSS grid rather than the Bootstrap
 * one. Alignment is set explicitly: the old footer inherited text-align:center
 * from an ancestor, which centred each inline-flex link on its own line and
 * made the lists zigzag.
 *
 * The newsletter is opt-in via prop — print surfaces (invoices, prescriptions)
 * should not carry a subscribe form.
 */

const PATIENT_LINKS = [
    { label: 'Find a doctor', to: '/doctors' },
    { label: 'Book appointment', to: '/doctors' },
    { label: 'Track appointment', to: '/track-appointment' },
    { label: 'Patient dashboard', to: '/dashboard' },
    { label: 'Login', to: '/login' },
];

const DOCTOR_LINKS = [
    { label: 'Appointments', to: '/dashboard' },
    { label: 'Doctor dashboard', to: '/dashboard' },
    { label: 'Blog', to: '/blog' },
    { label: 'Login', to: '/login' },
];

const CqSiteFooter = ({ newsletter = false }) => {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const io = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setShown(true); io.disconnect(); } },
            { rootMargin: '0px 0px -100px 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <footer ref={ref} className={`cqfoot${shown ? ' is-shown' : ''}`}>
            {newsletter && <CqNewsletter />}

            <div className="cqfoot__grid">
                <div className="cqfoot__col cqfoot__col--about" style={{ '--i': 0 }}>
                    <Link to="/" className="cqfoot__mark">Cliniq</Link>
                    <p className="cqfoot__about">
                        Quality healthcare with a personal touch. We’re committed to your
                        wellbeing with experienced doctors and modern facilities.
                    </p>
                </div>

                <div className="cqfoot__col" style={{ '--i': 1 }}>
                    <h3 className="cqfoot__title">For patients</h3>
                    <ul className="cqfoot__list">
                        {PATIENT_LINKS.map((l) => (
                            <li key={l.label}>
                                <Link to={l.to}>
                                    <FaChevronRight className="cqfoot__chev" aria-hidden="true" />
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="cqfoot__col" style={{ '--i': 2 }}>
                    <h3 className="cqfoot__title">For doctors</h3>
                    <ul className="cqfoot__list">
                        {DOCTOR_LINKS.map((l) => (
                            <li key={l.label}>
                                <Link to={l.to}>
                                    <FaChevronRight className="cqfoot__chev" aria-hidden="true" />
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="cqfoot__col" style={{ '--i': 3 }}>
                    <h3 className="cqfoot__title">Contact us</h3>
                    <div className="cqfoot__contact">
                        <FaMapMarkerAlt className="cqfoot__cicon" aria-hidden="true" />
                        <p>Korang Town, Sector O9,<br />House No. 69, Street 44</p>
                    </div>
                    <div className="cqfoot__contact">
                        <FaPhoneAlt className="cqfoot__cicon" aria-hidden="true" />
                        <p><a href="tel:+923108112860">+92 310 8112860</a></p>
                    </div>
                    <div className="cqfoot__contact">
                        <FaEnvelope className="cqfoot__cicon" aria-hidden="true" />
                        <p><a href="mailto:contact@cliniq.app">contact@cliniq.app</a></p>
                    </div>
                </div>
            </div>

            <div className="cqfoot__divider" aria-hidden="true" />

            <div className="cqfoot__base" style={{ '--i': 4 }}>
                <p className="cqfoot__copy">
                    &copy; {new Date().getFullYear()} Cliniq. All rights reserved.
                </p>
                <ul className="cqfoot__policy">
                    <li><Link to="/terms">Terms &amp; conditions</Link></li>
                    <li><Link to="/policy">Privacy policy</Link></li>
                </ul>
            </div>
        </footer>
    );
};

export default CqSiteFooter;
