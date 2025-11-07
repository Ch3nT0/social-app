// src/components/Navbar/Navbar.jsx

import React from 'react';
// import { Link } from 'react-router-dom'; 

const Navbar = () => {
    return (
        // Navbar: Cố định, nền trắng, đổ bóng nhẹ
        <div className="fixed top-0 left-0 w-full h-16 bg-white shadow-lg z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            
            {/* Logo/Trang chủ */}
            <div className="flex items-center space-x-4">
                {/* Thay <a> bằng <Link to="/"> */}
                <a href="/" className="text-2xl font-extrabold text-blue-600 tracking-wider">
                    SocialApp
                </a>
            </div>

            {/* Thanh Tìm kiếm (Chỉ hiển thị trên desktop/tablet) */}
            <div className="hidden sm:block flex-1 max-w-md mx-4">
                <input 
                    type="text"
                    placeholder="Tìm kiếm bạn bè, bài đăng..."
                    className="w-full p-2.5 bg-gray-100 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150 text-sm"
                />
            </div>

            {/* Icons & Profile */}
            <div className="flex items-center space-x-4">
                {/* Icons (Home, Message, Notification) */}
                <div className="flex space-x-3">
                    <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">🏠</button>
                    <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">💬</button>
                    <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">🔔</button>
                </div>
                
                {/* Ảnh đại diện */}
                <img 
                    className="h-9 w-9 rounded-full object-cover cursor-pointer border-2 border-transparent hover:border-blue-500 transition duration-150" 
                    src="https://via.placeholder.com/150/0000FF/FFFFFF?text=P" 
                    alt="Profile"
                />
            </div>
        </div>
    );
};

export default Navbar;