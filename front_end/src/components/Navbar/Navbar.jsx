import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCookie, deleteCookie } from '../../helpers/cookie';
import { getUserProfile } from '../../services/client/userService';

const getUserId = () => {
    return getCookie('userId') || null;
};

const Navbar = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState(''); 

    const currentUserId = getUserId();
    const menuRef = useRef(null);
    const FALLBACK_AVATAR = "https://via.placeholder.com/150/CCCCCC/FFFFFF?text=P";

    useEffect(() => {
        const token = getCookie('token');
        setIsAuthenticated(!!token);
    }, []);

    useEffect(() => {
        if (isAuthenticated && currentUserId) {
            const fetchUserProfile = async () => {
                try {
                    const user = await getUserProfile(currentUserId);
                    if (user && user._id) {
                        setCurrentUser(user);
                    } else {
                        handleLogout(false);
                    }
                } catch (error) {
                    console.error("Lỗi khi tải thông tin người dùng cho Navbar:", error);
                    handleLogout(false);
                }
            };
            fetchUserProfile();
        } else {
            setCurrentUser(null);
        }
    }, [isAuthenticated, currentUserId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleLogout = (shouldNavigate = true) => {
        deleteCookie('token');
        deleteCookie('userId');

        setIsAuthenticated(false);
        setIsMenuOpen(false);
        setCurrentUser(null);
        if (shouldNavigate) navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
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
                            placeholder="Tìm kiếm bạn bè, bài đăng..."
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

                        {/* Icons */}
                        <div className="flex space-x-3">
                            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">🏠</button>
                            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">💬</button>
                            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">🔔</button>
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