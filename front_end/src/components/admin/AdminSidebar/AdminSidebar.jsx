// src/components/Admin/AdminSidebar/AdminSidebar.jsx

import React from 'react';
// Giả định sử dụng React Router DOM để điều hướng
// import { Link } from 'react-router-dom'; 

const AdminSidebar = () => {
    // Các mục điều hướng
    const navItems = [
        { name: 'Dashboard', link: '/admin/dashboard' },
        { name: 'Quản lý User', link: '/admin/users' },
        { name: 'Quản lý Post', link: '/admin/posts' },
        { name: 'Phân tích (Analytics)', link: '/admin/analytics' },
        { name: 'Cài đặt hệ thống', link: '/admin/settings' },
    ];

    return (
        <div className="fixed md:sticky top-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-30 shadow-2xl">
            
            <div className="p-4 border-b border-gray-700">
                <h1 className="text-2xl font-extrabold text-blue-400">Admin Panel</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <a 
                        key={item.name}
                        href={item.link} 
                        className="flex items-center p-3 rounded-lg text-sm font-medium transition duration-200 
                                   hover:bg-gray-700 hover:text-blue-300"
                    >
                        <span className="mr-3">📊</span> 
                        {item.name}
                    </a>
                ))}
            </nav>
            
            <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
                &copy; 2024 Social Admin
            </div>
        </div>
    );
};

export default AdminSidebar;