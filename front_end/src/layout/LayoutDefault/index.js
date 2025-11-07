import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import SidebarLeft from '../../components/SidebarLeft/SidebarLeft';
import SidebarRight from '../../components/SidebarRight/SidebarRight';

const LayoutDefault = () => { 
    return (
        <div className="flex flex-col min-h-screen bg-gray-100"> 
            <Navbar /> 

            <div className="social-layout-container flex justify-center w-full pt-16 mx-auto max-w-7xl">
                
                
                <div className="hidden lg:block w-1/5 xl:w-1/6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto px-4">
                    <SidebarLeft />
                </div>
                
                <main className="w-full lg:w-3/5 xl:w-4/6 px-2 sm:px-4 py-4 min-h-[calc(100vh-64px)]">
                    <Outlet /> 
                </main>
                
                <div className="hidden xl:block w-1/5 xl:w-1/6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto px-4">
                    <SidebarRight />
                </div>
            </div>
            
        </div>
    );
};

export default LayoutDefault;