import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCookie, deleteCookie } from '../../helpers/cookie';
import { getUserProfile } from '../../services/client/userService';
import { useSocket } from '../../context/SocketContext';
import { getNotifications, markNotificationsAsRead } from '../../services/client/notificationService';

const getUserId = () => {
    return getCookie('userId') || null;
};

const Navbar = () => {
    const navigate = useNavigate();
    // Lấy state và setter từ SocketContext
    const { socket, notifications, setNotifications } = useSocket();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const currentUserId = getUserId();
    const menuRef = useRef(null);
    const notifRef = useRef(null);

    const FALLBACK_AVATAR = "https://via.placeholder.com/150/CCCCCC/FFFFFF?text=P";

    // Tính toán số lượng thông báo chưa đọc
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const token = getCookie('token');
        setIsAuthenticated(!!token);
    }, []);

    // Tải thông tin người dùng và lịch sử thông báo
    useEffect(() => {
        if (isAuthenticated && currentUserId) {
            const fetchInitialData = async () => {
                try {
                    // 1. Tải Profile User
                    const user = await getUserProfile(currentUserId);
                    if (user && user._id) {
                        setCurrentUser(user);
                    } else {
                        handleLogout(false);
                    }

                    // 2. Tải Lịch sử Thông báo (Giả định hàm này tồn tại trong notificationService)
                    // const notifHistory = await getNotifications();
                    // if (Array.isArray(notifHistory)) {
                    //     setNotifications(notifHistory);
                    // }
                } catch (error) {
                    handleLogout(false);
                }
            };
            fetchInitialData();
        } else {
            setCurrentUser(null);
            setNotifications([]);
        }
    }, [isAuthenticated, currentUserId]);

    // Xử lý đóng menu/thông báo khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen, isNotifOpen]);


    const handleLogout = (shouldNavigate = true) => {
        deleteCookie('token');
        deleteCookie('userId');

        setIsAuthenticated(false);
        setIsMenuOpen(false);
        setIsNotifOpen(false);
        setCurrentUser(null);
        if (shouldNavigate) navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
        setIsNotifOpen(false);
    };

    // Hàm mở/đóng Notification và ĐÁNH DẤU ĐÃ ĐỌC
    const toggleNotifications = async () => {
        const wasOpen = isNotifOpen;

        // 1. Logic xảy ra KHI ĐÓNG (từ true -> false)
        if (wasOpen && notifications.some(n => !n.isRead)) {
            try {
                await markNotificationsAsRead();
                setNotifications(prev => prev.map(n =>
                    !n.isRead ? { ...n, isRead: true } : n
                ));
            } catch (error) {
                console.error("Lỗi khi đánh dấu đã đọc:", error);
            }
        }
        setIsNotifOpen(prev => !prev);
        setIsMenuOpen(false);
        if (!wasOpen) { 
            try {
                const notifHistory = await getNotifications();
                console.log(notifHistory);
                if (Array.isArray(notifHistory)) {
                    setNotifications(notifHistory);
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử thông báo:", error);
            }
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmedKeyword = searchTerm.trim();
        if (trimmedKeyword) {
            navigate(`/search/friends?q=${encodeURIComponent(trimmedKeyword)}`);
            setSearchTerm('');
        }
    };

    const profileLink = `/profile/${currentUserId || '#'}`;
    const avatarSrc = currentUser?.profilePicture || FALLBACK_AVATAR;


    return (
        <div className="fixed top-0 left-0 w-full h-16 bg-white shadow-lg z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8">

            <div className="flex items-center space-x-4">
                <Link to="/" className="text-2xl font-extrabold text-blue-600 tracking-wider">
                    SocialApp
                </Link>
            </div>

            {isAuthenticated && (
                <div className="hidden sm:block flex-1 max-w-md mx-4">
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm bạn bè"
                            className="w-full p-2.5 bg-gray-100 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                </div>
            )}

            <div className="flex items-center space-x-4">

                {isAuthenticated ? (
                    <div className="flex items-center space-x-4">

                        {/* Icons Cố định */}
                        <div className="flex space-x-3">
                            {/* DROPDOWN THÔNG BÁO */}
                            <div className="relative" ref={notifRef}>
                                <button onClick={toggleNotifications} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">
                                    🔔
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white transform translate-x-1/4 -translate-y-1/4">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {isNotifOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl transition duration-200 z-50">
                                        <div className="p-3 font-bold border-b">Thông báo mới</div>
                                        {notifications.length === 0 ? (
                                            <div className="p-3 text-gray-500 text-sm">Không có thông báo nào.</div>
                                        ) : (
                                            notifications.map((notif, index) => (
                                                <div key={notif._id || index} className={`px-3 py-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer 
                                                                ${notif.isRead
                                                        ? 'bg-white opacity-70'
                                                        : 'bg-blue-50/70 font-semibold'
                                                    }`}
                                                >
                                                    <p className={`text-xs text-gray-800 ${notif.isRead ? 'text-gray-500' : 'text-gray-800'}`}>
                                                        <span className="font-semibold text-blue-600 mr-1">{notif.senderId?.username || 'System'}</span>
                                                        {notif.content}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>


                            {/* AVATAR VÀ DROPDOWN MENU */}
                            <div className="relative" ref={menuRef}>

                                <button onClick={toggleMenu} className="block focus:outline-none">
                                    <img
                                        className="h-9 w-9 rounded-full object-cover cursor-pointer border-2 border-transparent hover:border-blue-500 transition duration-150"
                                        src={avatarSrc}
                                        alt="Profile"
                                    />
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-xl transition duration-200 z-50">
                                        <Link
                                            to={profileLink}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                                        >
                                            Hồ sơ ({currentUser?.username || 'Đang tải...'})
                                        </Link>
                                        <Link
                                            to="/settings"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            Cài đặt
                                        </Link>
                                        <button
                                            onClick={() => handleLogout(true)}
                                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-b-lg border-t border-gray-200"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex space-x-3">
                        <Link
                            to="/login"
                            className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition"
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition hidden sm:block"
                        >
                            Đăng ký
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;