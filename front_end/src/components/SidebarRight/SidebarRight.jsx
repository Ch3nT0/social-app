import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { getCookie } from '../../helpers/cookie';
import { getFriendsList } from '../../services/client/userService'; 
import { getSuggestedFriends,sendFriendRequest } from '../../services/client/friendService';
import { Link } from 'react-router-dom';

const getUserId = () => getCookie('userId') || null;

const SidebarRight = () => {
    const { socket } = useSocket();
    const currentUserId = getUserId();

    const [friends, setFriends] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!currentUserId) {
            setLoading(false);
            return;
        }
        try {
            // Gọi đồng thời cả 2 API để tối ưu tốc độ
            const [friendsResponse, suggestedResponse] = await Promise.all([
                getFriendsList(currentUserId),
                getSuggestedFriends(currentUserId)
            ]);

            // Xử lý dữ liệu bạn bè
            let friendsArray = [];
            if (Array.isArray(friendsResponse)) {
                friendsArray = friendsResponse;
            } else if (friendsResponse?.friends) {
                friendsArray = friendsResponse.friends;
            }
            setFriends(friendsArray);

            // Xử lý dữ liệu gợi ý (Lấy từ trường suggestions trong API response)
            setSuggestions(suggestedResponse?.suggestions || []);
        } catch (error) {
            console.error("Lỗi tải SidebarRight:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (socket) {
            const handleOnlineUsers = (activeUserIds) => {
                setOnlineUsers(activeUserIds);
            };
            socket.on('getOnlineUsers', handleOnlineUsers);
            return () => socket.off('getOnlineUsers', handleOnlineUsers);
        }
    }, [socket]);

    // Hàm xử lý gửi lời mời kết bạn
    const handleAddFriend = async (targetUserId) => {
        try {
            await sendFriendRequest(targetUserId);
            // Sau khi gửi thành công, xóa người đó khỏi danh sách gợi ý
            setSuggestions(prev => prev.filter(user => user._id !== targetUserId));
            alert("Đã gửi lời mời kết bạn!");
        } catch (error) {
            console.error("Lỗi gửi lời mời:", error);
            alert("Không thể gửi lời mời lúc này.");
        }
    };

    const onlineFriends = friends.filter(friend => onlineUsers.includes(friend._id));

    if (loading) return <div className="p-4 text-center text-sm animate-pulse">Đang tải...</div>;

    return (
        <div className="p-4 bg-white rounded-xl shadow-lg sticky top-20">
            {/* 1. DANH SÁCH BẠN BÈ ĐANG HOẠT ĐỘNG */}
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2 flex items-center">
                <span className="relative flex h-3 w-3 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Đang hoạt động ({onlineFriends.length})
            </h3>

            <ul className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                {onlineFriends.map((friend) => (
                    <li key={friend._id} className="flex items-center text-sm text-gray-700 hover:bg-gray-50 p-1 rounded-lg transition">
                        <div className="relative mr-3">
                            <img
                                src={friend.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"}
                                className="h-10 w-10 rounded-full object-cover border border-gray-100"
                                alt={friend.username}
                            />
                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>
                        </div>
                        <span className="font-medium">{friend.username}</span>
                    </li>
                ))}
                {onlineFriends.length === 0 && (
                    <p className="text-xs text-gray-400 py-2">Hiện chưa có ai online.</p>
                )}
            </ul>

            {/* 2. GỢI Ý KẾT BẠN */}
            <hr className="my-6 border-gray-100" />

            <h3 className="text-lg font-bold mb-4 text-gray-800">Gợi ý kết bạn</h3>
            <div className="flex flex-col space-y-4">
                {suggestions.length > 0 ? (
                    suggestions.slice(0, 5).map((user) => (
                        <div key={user._id} className="flex items-center justify-between group">
                            <Link to={`/profile/${user._id}`} className="flex items-center flex-1">
                                <img 
                                    src={user.profilePicture || "https://via.placeholder.com/150/CCCCCC/FFFFFF?text=P"} 
                                    className="h-9 w-9 rounded-full object-cover mr-3"
                                    alt={user.username}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition truncate w-24">
                                        {user.username}
                                    </span>
                                    {/* Hiển thị số bạn chung nếu API của bạn hỗ trợ trả về trường này */}
                                    {user.commonFriendsCount > 0 && (
                                        <span className="text-[10px] text-gray-400">{user.commonFriendsCount} bạn chung</span>
                                    )}
                                </div>
                            </Link>
                            <button 
                                onClick={() => handleAddFriend(user._id)}
                                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-600 hover:text-white transition duration-200"
                            >
                                Kết bạn
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-400">Không có gợi ý mới.</p>
                )}
            </div>
            
        </div>
    );
};

export default SidebarRight;