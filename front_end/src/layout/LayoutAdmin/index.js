// src/layout/LayoutAdmin/LayoutAdmin.jsx

import React from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar/AdminSidebar.jsx'; 
import AdminNavbar from '../../components/admin/AdminNavbar/AdminNavbar.jsx'; 

const LayoutAdmin = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">

            <div className="hidden md:block w-64 flex-shrink-0">
                <AdminSidebar />
            </div>

            <div className="flex flex-col flex-1 overflow-hidden">

                <AdminNavbar />

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">

                    <div className="mx-auto max-w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LayoutAdmin;