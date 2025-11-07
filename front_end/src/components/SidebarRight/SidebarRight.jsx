// src/components/SidebarRight/SidebarRight.jsx

import React from 'react';

const SidebarRight = () => {
    return (
        // Sidebar: Cố định (sticky), Nền trắng, Đổ bóng
        <div className="p-4 bg-white rounded-xl shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Đang hoạt động (Online)</h3>
            
            {/* Danh sách bạn bè Online */}
            <ul className="space-y-3">
                {['User C', 'User D', 'User E'].map((name) => (
                    <li key={name} className="flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 p-1 rounded-md cursor-pointer">
                        <div className="flex items-center">
                            <div className="relative mr-2">
                                <img 
                                    src="https://via.placeholder.com/50/00FF00/000000?text=U" 
                                    className="h-8 w-8 rounded-full object-cover" 
                                    alt={name}
                                />
                                {/* Đèn báo xanh (Online indicator) */}
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-500"></span>
                            </div>
                            {name}
                        </div>
                    </li>
                ))}
            </ul>
            
            <hr className="my-4"/>
            
            {/* Gợi ý kết bạn */}
            <h3 className="text-lg font-bold mb-3 text-gray-800">Gợi ý kết bạn</h3>
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span>Người lạ Z</span>
                    <button className="text-blue-500 font-semibold hover:text-blue-700 transition duration-150">Kết bạn</button>
                </div>
            </div>
        </div>
    );
};

export default SidebarRight;