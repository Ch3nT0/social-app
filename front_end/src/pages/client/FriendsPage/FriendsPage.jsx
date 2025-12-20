import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
// import LayoutDefault from '../../../layout/LayoutDefault'; // Đã comment vì bạn đang render trong component
import { getCookie } from '../../../helpers/cookie';
import { getPendingRequests, unfriendUser } from '../../../services/client/friendService';
import { getSuggestedFriends } from '../../../services/client/friendService';
import { getFriendsList } from '../../../services/client/userService'; 
import UserCard from '../../../components/UserCard/UserCard';
import PendingRequestCard from '../../../components/UserCard/PendingRequestCard';

const getUserId = () => getCookie('userId') || null;


const FriendListItem = ({ friend, onUnfriendSuccess }) => {
    const [loading, setLoading] = useState(false);
    
    const handleUnfriend = async () => {
        if (!window.confirm(`Xóa kết bạn với ${friend.username}?`)) return;
        setLoading(true);
        try {
            await unfriendUser(friend._id); 
            onUnfriendSuccess(friend._id); 
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="group flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img 
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" 
                        src={friend.profilePicture || "https://via.placeholder.com/150"} 
                        alt={friend.username}
                    />
                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                    <Link to={`/profile/${friend._id}`} className="font-bold text-gray-800 hover:text-blue-600 transition-colors block text-lg">
                        {friend.username}
                    </Link>
                </div>
            </div>

            <button 
                onClick={handleUnfriend}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 bg-red-50 text-red-600 text-xs sm:text-sm px-5 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-200 font-bold shadow-sm"
                disabled={loading}
            >
                {loading ? '...' : 'Hủy kết bạn'}
            </button>
        </div>
    );
};

const FriendsPage = () => {
    const currentUserId = getUserId();
    
    const [friendsList, setFriendsList] = useState([]); 
    const [pendingRequests, setPendingRequests] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!currentUserId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [friendsData, pendingData, suggestedRes] = await Promise.all([
                getFriendsList(currentUserId), 
                getPendingRequests(currentUserId),
                getSuggestedFriends(currentUserId) // Gọi API gợi ý mới
            ]);
            
            setFriendsList(friendsData || []); 
            setPendingRequests(pendingData || []);
            // Lưu ý: suggestedRes trả về { suggestions: [...] }
            setSuggestions(suggestedRes?.suggestions || []);

        } catch (error) {
            console.error("Lỗi tải trang Bạn bè:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // Khi chấp nhận kết bạn
    const handleRequestStatusUpdate = useCallback((requestId, newStatus) => {
        const request = pendingRequests.find(req => req._id === requestId);
        setPendingRequests(prev => prev.filter(req => req._id !== requestId));
        
        if (newStatus === 'friend' && request) {
            // Thêm người đó vào danh sách bạn bè ngay lập tức
            setFriendsList(prev => [...prev, request.senderId]); 
        }
    }, [pendingRequests]);
    
    // Khi xóa bạn bè
    const handleUnfriendFromList = useCallback((friendId) => {
        setFriendsList(prev => prev.filter(friend => friend._id !== friendId));
    }, []);

    if (loading) return <div className="text-center p-20 text-blue-500 font-medium">Đang tải danh sách bạn bè...</div>;
    if (!currentUserId) return <div className="text-center p-20 text-red-500">Vui lòng đăng nhập.</div>;

    return (
        <div className="friends-page max-w-4xl mx-auto py-6 px-4">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Bạn bè</h2>
            
            {/* LỜI MỜI KẾT BẠN */}
            {pendingRequests.length > 0 && (
                <section className="mb-10">
                    <h3 className="text-lg font-bold mb-4 text-orange-500 flex items-center">
                        🔔 Lời mời kết bạn ({pendingRequests.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {pendingRequests.map(req => (
                            <PendingRequestCard 
                                key={req._id} 
                                request={req} 
                                currentUserId={currentUserId}
                                onActionSuccess={handleRequestStatusUpdate}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* DANH SÁCH BẠN BÈ */}
            <section className="mb-10">
                <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
                    Bạn bè hiện tại ({friendsList.length})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {friendsList.length > 0 ? (
                        friendsList.map(friend => (
                            <FriendListItem 
                                key={friend._id} 
                                friend={friend} 
                                onUnfriendSuccess={handleUnfriendFromList}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg">Bạn chưa có người bạn nào. Hãy kết nối thêm nhé!</p>
                    )}
                </div>
            </section>

            {/* GỢI Ý KẾT BẠN */}
            <section>
                <h3 className="text-lg font-bold mb-4 text-blue-600 border-b pb-2">
                    Gợi ý dành cho bạn
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {suggestions.length > 0 ? (
                        suggestions.map(user => (
                            <UserCard 
                                key={user._id} 
                                user={user} 
                                onUpdateStatus={() => {
                                    setSuggestions(prev => prev.filter(s => s._id !== user._id));
                                }} 
                            />
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm">Không có gợi ý mới.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default FriendsPage;