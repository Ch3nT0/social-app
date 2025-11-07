// src/components/SidebarLeft/SidebarLeft.jsx

import React from 'react';

const SidebarLeft = () => {
    return (
        // Sidebar: Cố định (sticky), Nền trắng, Đổ bóng
        <div className="p-4 bg-white rounded-xl shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Lối tắt của bạn</h3>
            <ul className="space-y-4">
                {/* Thay <a> bằng <Link> */}
                <li><a href="#" className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition duration-150"> Hồ sơ cá nhân</a></li>
                <li><a href="#" className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition duration-150"> Bạn bè</a></li>
                <li><a href="#" className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition duration-150"> Ảnh và Video</a></li>
                <li><a href="#" className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition duration-150"> Đã lưu</a></li>
                <hr className="my-2"/>
                <li className="text-xs text-gray-500 pt-2">Xem thêm...</li>
            </ul>
        </div>
    );
};

export default SidebarLeft;