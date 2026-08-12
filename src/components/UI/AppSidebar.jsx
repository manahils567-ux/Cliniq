import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import useAuthCheck from '../../redux/hooks/useAuthCheck';
import './AppSidebar.css';

/**
 * The nav rail, rendered once for the whole app rather than per page.
 *
 * Wrapping every route in DashboardLayout was not an option: that layout
 * brings its own Header and ChatWidget, so public pages would end up with two
 * of each. Mounting the rail globally gives every page the sidebar with one
 * component and no per-page surgery.
 *
 * Hidden while signed out, and on the routes where a rail makes no sense:
 * the landing page (deliberately functionless) and the auth screens.
 */
const HIDDEN_ON = ['/', '/login', '/register'];
const HIDDEN_PREFIXES = ['/reset-password', '/admin'];

const AppSidebar = () => {
    const { authChecked, data } = useAuthCheck();
    const { pathname } = useLocation();

    if (!authChecked || !data) return null;
    if (HIDDEN_ON.includes(pathname)) return null;
    if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

    return (
        <div className="app-sidebar">
            <DashboardSidebar />
        </div>
    );
};

export default AppSidebar;
