import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { getCookie } from '../../helpers/cookie';

const getUserId = () => getCookie('userId') || null; 

const SidebarLeft = () => {
    const userID = getUserId();
    const location = useLocation();
    const navigate = useNavigate(); // Hook để điều hướng
    
    const [isExpanded, setIsExpanded] = useState(false);

    // Danh sách mục mặc định
    const menuItems = [
        {
            path: userID ? `/profile/${userID}` : '/login', 
            label: 'Hồ sơ cá nhân',
            icon: '👤',
            requiresAuth: true 
        },
        {
            path: '/friends',
            label: 'Bạn bè',
            icon: '👥',
            requiresAuth: true
        }
    ];

    // Các mục mở rộng
    const extraMenuItems = [
        {
            path: '/tank-game',
            label: 'Chơi Game Xe Tăng',
            icon: '🎮',
            requiresAuth: true
        }
    ];

    // Hàm xử lý khi click vào item
    const handleItemClick = (e, item) => {
        if (item.requiresAuth && !userID) {
            e.preventDefault(); // Chặn Link mặc định
            alert("Vui lòng đăng nhập để sử dụng tính năng này!");
            navigate('/login'); // Chuyển sang trang đăng nhập
        }
    };

    return (
        <div className="p-4 bg-white rounded-xl shadow-lg sticky top-20 border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2 flex items-center">
                Lối tắt của bạn
            </h3>
            
            <ul className="space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <MenuItem 
                            key={item.label} 
                            item={item} 
                            isActive={isActive} 
                            onClick={(e) => handleItemClick(e, item)} 
                        />
                    );
                })}

                {isExpanded && extraMenuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <MenuItem 
                            key={item.path} 
                            item={item} 
                            isActive={isActive} 
                            onClick={(e) => handleItemClick(e, item)}
                        />
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

const MenuItem = ({ item, isActive, onClick }) => (
    <li>
        <Link 
            to={item.path} 
            onClick={onClick} // Gắn sự kiện kiểm tra tại đây
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