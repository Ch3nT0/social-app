import React, { useState } from 'react'; // Thêm useState
import { Link, useLocation } from 'react-router-dom';
import { getCookie } from '../../helpers/cookie';

const getUserId = () => getCookie('userId') || null; 

const SidebarLeft = () => {
    const userID = getUserId();
    const location = useLocation();
    
    // Quản lý trạng thái đóng/mở của phần "Xem thêm"
    const [isExpanded, setIsExpanded] = useState(false);

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

    // Danh sách các mục ẩn khi nhấn "Xem thêm" mới hiện
    const extraMenuItems = [
        {
            path: '/tank-game', // Đường dẫn này phải khớp với Route bạn đặt ở App.js
            label: 'Chơi Game Xe Tăng',
            icon: '🎮',
        }
    ];

    return (
        <div className="p-4 bg-white rounded-xl shadow-lg sticky top-20 border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2 flex items-center">
                Lối tắt của bạn
            </h3>
            
            <ul className="space-y-2">
                {/* Render các mục mặc định */}
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <MenuItem key={item.path} item={item} isActive={isActive} />
                    );
                })}

                {/* Render các mục mở rộng nếu isExpanded = true */}
                {isExpanded && extraMenuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <MenuItem key={item.path} item={item} isActive={isActive} />
                    );
                })}

                <hr className="my-4 border-gray-100"/>
                
                <li>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center p-2.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition duration-150"
                    >
                        <span className="mr-3">{isExpanded ? '➖' : '➕'}</span> 
                        {isExpanded ? 'Thu gọn' : 'Xem thêm game & ứng dụng...'}
                    </button>
                </li>
            </ul>
        </div>
    );
};

// Tách nhỏ component Item để code sạch hơn
const MenuItem = ({ item, isActive }) => (
    <li>
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

export default SidebarLeft;