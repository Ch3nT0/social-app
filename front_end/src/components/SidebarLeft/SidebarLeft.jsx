import React from 'react';
import { Link } from 'react-router-dom';
import { getCookie } from '../../helpers/cookie';

const getUserId = () => getCookie('userId') || null; 

const SidebarLeft = () => {
    const userID = getUserId();
    return (
        <div className="p-4 bg-white rounded-xl shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Lối tắt của bạn</h3>
            <ul className="space-y-4">                
                <li>
                    <Link 
                        to={`/profile/${userID}`} 
                        className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition duration-150"
                    > 
                        👤 Hồ sơ cá nhân
                    </Link>
                </li>                
                <li>
                    <Link 
                        to="/friends" 
                        className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition duration-150"
                    >
                        👥 Bạn bè
                    </Link>
                </li>
                <hr className="my-2"/>
                <li className="text-xs text-gray-500 pt-2">Xem thêm...</li>
            </ul>
        </div>
    );
};

export default SidebarLeft;