import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext'; // Import Socket Context
import { getCookie } from '../../helpers/cookie';
import { getFriendsList, getSuggestedUsers } from '../../services/client/userService'; // Giả định service
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
            const friendsResponse = await getFriendsList(currentUserId);
            console.log("Fetched friends data:", friendsResponse);
            const suggestedData = await getSuggestedUsers(currentUserId);
            let friendsArray = [];
            if (Array.isArray(friendsResponse)) {
                friendsArray = friendsResponse;
            } else if (friendsResponse && Array.isArray(friendsResponse.friends)) {
                friendsArray = friendsResponse.friends;
            } else if (friendsResponse && Array.isArray(friendsResponse.data)) {
                friendsArray = friendsResponse.data;
            }
            setFriends(friendsArray);
            console.log(suggestedData);
            setSuggestions(suggestedData || []);
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
            return () => {
                socket.off('getOnlineUsers', handleOnlineUsers);
            };
        }
    }, [socket]);

    // Lọc danh sách bạn bè đang online
    const onlineFriends = friends.filter(friend => onlineUsers.includes(friend._id));
    console.log("Online friends:", onlineFriends);
    const offlineFriends = friends.filter(friend => !onlineUsers.includes(friend._id));

    if (loading) {
        return <div className="p-4 text-center text-sm">Đang tải sidebar...</div>;
    }

    return (
        <div className="p-4 bg-white rounded-xl shadow-lg">

            {/* 1. DANH SÁCH BẠN BÈ ĐANG HOẠT ĐỘNG */}
            <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
                Đang hoạt động ({onlineFriends.length})
            </h3>

            <ul className="space-y-3 max-h-40 overflow-y-auto">
                {onlineFriends.map((friend) => (
                    <li key={friend._id} className="flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 p-1 rounded-md cursor-pointer">
                        <div className="flex items-center">
                            <div className="relative mr-2">
                                <img
                                    src={friend.profilePicture || "https://via.placeholder.com/50/00FF00/000000?text=U"}
                                    className="h-8 w-8 rounded-full object-cover"
                                    alt={friend.username}
                                />
                                {/* Đèn báo xanh (Online indicator) */}
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-500"></span>
                            </div>
                            {friend.username}
                        </div>
                    </li>
                ))}
                {onlineFriends.length === 0 && (
                    <p className="text-sm text-gray-500 py-2">Không có bạn bè nào đang online.</p>
                )}
            </ul>

            {/* 2. GỢI Ý KẾT BẠN */}
            <hr className="my-4" />

            <h3 className="text-lg font-bold mb-3 text-gray-800">Gợi ý kết bạn</h3>
            <div className="flex flex-col space-y-2 max-h-40 overflow-y-auto">
                {suggestions.length > 0 ? (
                    suggestions.map((suggestion) => (
                        <div key={suggestion._id} className="flex justify-between items-center text-sm">
                            <Link to={`/profile/${suggestion._id}`} className="font-medium hover:underline">
                                {suggestion.username}
                            </Link>
                            <button className="text-blue-500 font-semibold hover:text-blue-700 transition duration-150">
                                Kết bạn
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">Không có gợi ý nào mới.</p>
                )}
            </div>

            {/* Tùy chọn: Danh sách bạn bè Offline */}
            {/* <hr className="my-4"/>
            <h3 className="text-lg font-bold mb-3 text-gray-800">Bạn bè khác</h3>
            {/* ... render offlineFriends ... */}
        </div>
    );
};

export default SidebarRight;