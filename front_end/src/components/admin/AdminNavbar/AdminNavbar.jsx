
import React from 'react';


const AdminNavbar = () => {
    return (
        <header className="bg-white shadow-md h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 border-b border-gray-200">
            
            <div className="md:hidden">

                <button 
                    className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-600"
                    onClick={() => console.log('Toggle Sidebar')}
                >
                    {/* Thay thế bằng Icon Menu thực tế */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </div>
            
            {/* 2. Tiêu đề hoặc Thanh tìm kiếm */}
            <h2 className="text-xl font-semibold text-gray-700 hidden md:block">
                Bảng điều khiển Admin
            </h2>

            {/* 3. Các hành động và Profile */}
            <div className="flex items-center space-x-4">
                
                {/* Icon Thông báo */}
                <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-500 relative">
                    {/* Thay thế bằng Icon Bell thực tế */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    {/* Badge thông báo mới */}
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                </button>

                {/* Profile Dropdown (Giả lập) */}
                <div className="flex items-center space-x-2 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition duration-150">
                    <img 
                        className="h-8 w-8 rounded-full object-cover" 
                        src="https://via.placeholder.com/150/0000FF/FFFFFF?text=AD" 
                        alt="Admin Profile"
                    />
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin Name</span>
                </div>
            </div>
        </header>
    );
};

export default AdminNavbar;