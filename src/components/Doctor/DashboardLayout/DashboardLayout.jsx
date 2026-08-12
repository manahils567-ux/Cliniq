import React from 'react';
import Header from '../../Shared/Header/Header';
import DoctorProfileCompletionGate from '../DoctorProfileCompletionGate';
import ChatWidget from '../../AI/ChatWidget';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    return (
        <>
            <Header />
            <div className="dashboard-wrapper">
                <div className="container-fluid">
                    <div className="row">
                        {/* The rail is mounted globally in App (AppSidebar). */}
                        <div className="col-12">
                            <div className="dashboard-content">
                                <DoctorProfileCompletionGate>{children}</DoctorProfileCompletionGate>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* AI Health Companion — floats on all dashboard pages */}
            <ChatWidget />
        </>
    );
};

export default DashboardLayout;
