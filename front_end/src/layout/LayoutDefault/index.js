import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import SidebarLeft from '../../components/SidebarLeft/SidebarLeft';
import SidebarRight from '../../components/SidebarRight/SidebarRight';

const LayoutDefault = () => { 
    return (
        <div className="social-layout-wrapper">
            <Navbar /> 

            <div className="social-layout-container">
                
                <div className="sidebar-left-area">
                    <SidebarLeft />
                </div>
                
                <main className="main-content-area">
                    <Outlet /> 
                </main>
                
                <div className="sidebar-right-area">
                    <SidebarRight />
                </div>
            </div>
            
        </div>
    );
};

export default LayoutDefault;