import React from 'react';
import DashboardSidebar from '../../UI/DashboardSidebar';
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
                        <div className="col-lg-3 col-xl-3">
                            <DashboardSidebar />
                        </div>
                        <div className="col-lg-9 col-xl-9">
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
