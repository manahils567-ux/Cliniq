import React from 'react';
import img from '../../images/avatar.jpg';
import './DashboardSidebar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthCheck from '../../redux/hooks/useAuthCheck';
import { loggedOut, getUserInfo } from '../../service/auth.service';
import { useGetDoctorQuery } from '../../redux/api/doctorApi';
import { getDoctorProfileProgress } from '../../utils/doctorProfileCompletion';
import {
    FaFolderOpen,
    FaTable,
    FaCalendarCheck,
    FaUserInjured,
    FaFileInvoiceDollar,
    FaStar,
    FaUserCog,
    FaBlog,
    FaSignOutAlt,
    FaLock,
    FaHeart,
    FaClock,
    FaFileAlt,
    FaSearch,
    FaPills
} from "react-icons/fa";

const DashboardSidebar = () => {
    const { data, role } = useAuthCheck();
    const navigate = useNavigate();
    const auth = getUserInfo();
    const { data: doctorForStatus } = useGetDoctorQuery(auth?.userId, {
        skip: role !== 'doctor' || !auth?.userId,
    });
    const doctorProfile = role === 'doctor' ? getDoctorProfileProgress(doctorForStatus || data) : null;

    const handleLogout = (e) => {
        e.preventDefault();
        loggedOut();
        navigate('/login', { replace: true });
    };

    const doctorMenuItems = [
        { path: '/dashboard', icon: <FaTable />, label: 'Dashboard', exact: true },
        { path: '/dashboard/appointments', icon: <FaCalendarCheck />, label: 'Appointments' },
        { path: '/dashboard/my-patients', icon: <FaUserInjured />, label: 'My Patients' },
        { path: '/dashboard/prescription', icon: <FaFileAlt />, label: 'Prescriptions' },
        { path: '/dashboard/schedule', icon: <FaClock />, label: 'Schedule Timings' },
        { path: '/dashboard/invoices', icon: <FaFileInvoiceDollar />, label: 'Invoices' },
        { path: '/dashboard/reviews', icon: <FaStar />, label: 'Reviews' },
        { path: '/dashboard/blogs', icon: <FaBlog />, label: 'Blogs' },
    ];

    const patientMenuItems = [
        { path: '/dashboard', icon: <FaTable />, label: 'Dashboard', exact: true },
        { path: '/dashboard/appointments', icon: <FaCalendarCheck />, label: 'My Appointments' },
        { path: '/dashboard/documents', icon: <FaFolderOpen />, label: 'Documents' },
        { path: '/dashboard/favourite', icon: <FaHeart />, label: 'Favourite Doctors' },
        { path: '/dashboard/invoices', icon: <FaFileInvoiceDollar />, label: 'Invoices & payments' },
        { path: '/dashboard/prescription', icon: <FaPills />, label: 'Prescriptions' }  /* Shortened: the full 'Prescriptions & medicines' overruns the 210px rail and ellipsises */,
        { path: '/dashboard/track', icon: <FaSearch />, label: 'Track appointment' },
    ];

    const menuItems = role === 'doctor' ? doctorMenuItems : patientMenuItems;

    return (
        <div className="dashboard-sidebar dashboard-sidebar--rail dashboard-sidebar--static">
            <nav className="dashboard-nav">
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <NavLink 
                                to={item.path} 
                                end={item.exact}
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                <span className="icon">{item.icon}</span>
                                <span className="label">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                    
                    <div className="dashboard-nav-divider" />
                    
                    <li>
                        <NavLink to="/dashboard/profile-setting">
                            <span className="icon"><FaUserCog /></span>
                            <span className="label">Profile Settings</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dashboard/change-password">
                            <span className="icon"><FaLock /></span>
                            <span className="label">Change Password</span>
                        </NavLink>
                    </li>
                    <li>
                        <button type="button" className="dashboard-nav-logout" onClick={handleLogout}>
                            <span className="icon"><FaSignOutAlt /></span>
                            <span className="label">Logout</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default DashboardSidebar;
