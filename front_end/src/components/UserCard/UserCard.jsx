import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    sendFriendRequest, 
    cancelSentRequest, 
    unfriendUser, 
    acceptFriendRequest, 
    rejectFriendRequest 
} from '../../services/client/friendService';
import { getCookie } from '../../helpers/cookie';

const getUserId = () => getCookie('userId') || null;

const UserCard = ({ user, onUpdateStatus, requestId }) => {
    const currentUserId = getUserId();
    
    const [requestStatus, setRequestStatus] = useState(user.friendshipStatus || 'none'); 
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (user.friendshipStatus) {
            setRequestStatus(user.friendshipStatus);
        } else {
            setRequestStatus('none');
        }
    }, [user.friendshipStatus, user._id]);

    const isCurrentUser = currentUserId === user._id;

    const updateState = (newStatus) => {
        setRequestStatus(newStatus);
        if (onUpdateStatus) onUpdateStatus(user._id, newStatus);
    };

    const handleSendRequest = async () => {
        if (!currentUserId) {
            alert("Vui lòng đăng nhập để thực hiện.");
            return;
        }
        setLoading(true);
        try {
            const result = await sendFriendRequest(user._id); 
            alert(result.message || "Đã gửi lời mời kết bạn.");
            if (result) {
                updateState('pending_sent');
            }
        } catch (error) {
            console.error("Lỗi gửi lời mời:", error);
            alert("Không thể gửi lời mời kết bạn.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancelRequest = async () => {
        setLoading(true);
        try {
            // Lưu ý: requestId cần được truyền từ component cha 
            // hoặc lấy từ user.requestId nếu backend trả về
            await cancelSentRequest(requestId || user.requestId); 
            updateState('none'); 
        } catch (error) {
            console.error("Lỗi hủy lời mời:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        setLoading(true);
        try {
            await acceptFriendRequest(requestId || user.requestId); 
            updateState('friend');
        } catch (error) {
            console.error("Lỗi chấp nhận:", error);
        } finally {
            setLoading(false);
        }
    };    

    const handleRejectRequest = async () => {
        setLoading(true);
        try {
            await rejectFriendRequest(requestId || user.requestId); 
            updateState('none');
        } catch (error) {
            console.error("Lỗi từ chối:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleUnfriend = async () => {
        if (!window.confirm(`Xóa kết bạn với ${user.username}?`)) return;
        setLoading(true);
        try {
            await unfriendUser(user._id); 
            updateState('none');
        } catch (error) {
            console.error("Lỗi xóa bạn:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm render nút bấm dựa trên trạng thái hiện tại
    const renderActionButton = () => {
        if (isCurrentUser) return <span className="text-xs text-gray-400 italic">Bạn</span>;
        
        

        switch (requestStatus) {
            case 'friend':
                return (
                    <button 
                        onClick={handleUnfriend} 
                        className="bg-gray-100 text-red-500 text-sm px-4 py-1.5 rounded-full hover:bg-red-50 transition font-medium"
                        disabled={loading}
                    >
                        {loading ? '...' : 'Hủy kết bạn'}
                    </button>
                );
            case 'pending_sent':
                return (
                    <button 
                        onClick={handleCancelRequest}
                        className="bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded-full hover:bg-gray-300 transition font-medium"
                        disabled={loading}
                    >
                        {loading ? '...' : 'Hủy lời mời'}
                    </button>
                );
            case 'pending_received':
                return (
                    <div className="flex space-x-2">
                        <button 
                            onClick={handleAcceptRequest}
                            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-700 transition font-medium"
                            disabled={loading}
                        >
                            {loading ? '...' : 'Chấp nhận'}
                        </button>
                        <button 
                            onClick={handleRejectRequest}
                            className="bg-gray-100 text-gray-600 text-sm px-4 py-1.5 rounded-full hover:bg-gray-200 transition font-medium"
                            disabled={loading}
                        >
                            Xóa
                        </button>
                    </div>
                );
            default: // 'none'
                return (
                    <button 
                        onClick={handleSendRequest}
                        className="bg-blue-50 text-blue-600 text-sm px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition font-bold"
                        disabled={loading}
                    >
                        {loading ? '...' : 'Thêm bạn bè'}
                    </button>
                );
        }
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-50 hover:border-blue-100 transition duration-200">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <img 
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" 
                        src={user.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"} 
                        alt={user.username}
                    />
                </div>
                <div>
                    <Link to={`/profile/${user._id}`} className="font-bold text-gray-800 hover:text-blue-600 transition">
                        {user.username}
                    </Link>
                </div>
            </div>
            
            <div className="ml-4">
                {renderActionButton()}
            </div>
        </div>
    );
};

export default UserCard;