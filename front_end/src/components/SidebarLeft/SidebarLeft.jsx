import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCookie } from '../../helpers/cookie';

const getUserId = () => getCookie('userId') || null; 

const SidebarLeft = () => {
    const userID = getUserId();
    const location = useLocation(); // Dùng để highlight menu đang chọn

    // Danh sách các mục menu để render cho sạch code
    const menuItems = [
        {
            path: `/profile/${userID}`,
            label: 'Hồ sơ cá nhân',
            icon: '👤',
        },
        {
            path: '/friends',
            label: 'Bạn bè',
            icon: '👥',
        }
    ];

    return (
        <div className="p-4 bg-white rounded-xl shadow-lg sticky top-20 border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2 flex items-center">
                Lối tắt của bạn
            </h3>
            
            <ul className="space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <li key={item.path}>
                            <Link 
                                to={item.path} 
                                className={`flex items-center p-2.5 rounded-lg transition duration-200 group ${
                                    isActive 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                                }`}
                            > 
                                <span className={`mr-3 text-xl transition-transform duration-200 group-hover:scale-110`}>
                                    {item.icon}
                                </span>
                                <span className="font-semibold text-sm">
                                    {item.label}
                                </span>
                            </Link>
                        </li>
                    );
                })}

                <hr className="my-4 border-gray-100"/>
                
                <li>
                    <button className="w-full flex items-center p-2.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition duration-150">
                        <span className="mr-3">➕</span> Xem thêm...
                    </button>
                </li>
            </ul>
            
        </div>
    );
};

export default SidebarLeft;