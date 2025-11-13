import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendFriendRequest, cancelSentRequest, unfriendUser, acceptFriendRequest, rejectFriendRequest } from '../../services/client/friendService';
import { getCookie } from '../../helpers/cookie';

const getUserId = () => getCookie('userId') || null;

const UserCard = ({ user, onUpdateStatus,requestId }) => {
    console.log(requestId)
    const currentUserId = getUserId();
    const [requestStatus, setRequestStatus] = useState(user.friendshipStatus || 'none'); 
    const [loading, setLoading] = useState(false);
    
    const isCurrentUser = currentUserId === user._id;

    const updateState = (newStatus) => {
        setRequestStatus(newStatus);
        if (onUpdateStatus) onUpdateStatus(user._id, newStatus);
    };

    const handleSendRequest = async () => {
        if (!currentUserId) {
            alert("Vui lòng đăng nhập để gửi lời mời kết bạn.");
            return;
        }
        setLoading(true);
        try {
            const result = await sendFriendRequest(user._id); 
            if (result && result.request) {
                alert(`Đã gửi lời mời kết bạn đến ${user.username}.`);
                updateState('pending_sent');
            } else {
                alert(result.message || "Gửi lời mời thất bại.");
            }
        } catch (error) {
            console.error("Lỗi gửi lời mời:", error);
            alert("Lỗi kết nối server khi gửi lời mời.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancelRequest = async () => {
        if (!window.confirm("Bạn có chắc muốn hủy lời mời kết bạn này?")) return;
        setLoading(true);
        try {
            await cancelSentRequest(requestId); 
            alert(`Đã hủy lời mời kết bạn đến ${user.username}.`);
            updateState('none'); 
        } catch (error) {
            console.error("Lỗi hủy lời mời:", error);
            alert("Lỗi khi hủy lời mời.");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        if (!window.confirm(`Bạn có chắc muốn chấp nhận lời mời từ ${user.username} không?`)) return;
        setLoading(true);
        try {
            await acceptFriendRequest(requestId); 
            alert(`Đã chấp nhận lời mời từ ${user.username}.`);
            updateState('friend');
        } catch (error) {
            console.error("Lỗi chấp nhận lời mời:", error);
            alert("Lỗi khi chấp nhận lời mời.");
        } finally {
            setLoading(false);
        }
    };    
    const handleRejectRequest = async () => {
        if (!window.confirm(`Bạn có chắc muốn từ chối lời mời từ ${user.username} không?`)) return;
        setLoading(true);
        try {
            await rejectFriendRequest(requestId); 
            alert(`Đã từ chối lời mời từ ${user.username}.`);
            updateState('none'); // Trạng thái trở về none
        } catch (error) {
            console.error("Lỗi từ chối lời mời:", error);
            alert("Lỗi khi từ chối lời mời.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleUnfriend = async () => {
        if (!window.confirm(`Bạn có chắc muốn xóa bạn với ${user.username} không?`)) return;
        setLoading(true);
        try {
            await unfriendUser(user._id); 
            alert(`Đã xóa bạn với ${user.username}.`);
            updateState('none');
        } catch (error) {
            console.error("Lỗi xóa bạn:", error);
            alert("Lỗi khi xóa bạn bè.");
        } finally {
            setLoading(false);
        }
    };

    const renderActionButton = () => {
        if (isCurrentUser) {
            return null;
        }
        
        if (requestStatus === 'friend') {
            return (
                <button 
                    onClick={handleUnfriend} 
                    className="bg-red-500 text-white text-sm px-3 py-1 rounded-full hover:bg-red-600 transition disabled:opacity-70"
                    disabled={loading}
                >
                    {loading ? 'Đang xóa...' : 'Xóa bạn'}
                </button>
            );
        }
        
        if (requestStatus === 'pending_sent') {
            return (
                <button 
                    onClick={handleCancelRequest}
                    className="bg-gray-500 text-white text-sm px-3 py-1 rounded-full hover:bg-gray-600 transition disabled:opacity-70"
                    disabled={loading}
                >
                    {loading ? 'Đang hủy...' : 'Hủy lời mời'}
                </button>
            );
        }
        
        if (requestStatus === 'pending_received') {
            return (
                <div className="flex space-x-2">
                    <button 
                        onClick={handleAcceptRequest}
                        className="bg-green-600 text-white text-sm px-3 py-1 rounded-full hover:bg-green-700 transition"
                        disabled={loading}
                    >
                        {loading ? '...' : 'Chấp nhận'}
                    </button>
                    <button 
                        onClick={handleRejectRequest}
                        className="bg-red-600 text-white text-sm px-3 py-1 rounded-full hover:bg-red-700 transition"
                        disabled={loading}
                    >
                        Từ chối
                    </button>
                </div>
            );
        }
        
        return (
            <button 
                onClick={handleSendRequest}
                className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full hover:bg-blue-600 transition disabled:bg-blue-300"
                disabled={loading}
            >
                {loading ? 'Đang gửi...' : 'Kết bạn'}
            </button>
        );
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
                <img 
                    className="w-12 h-12 rounded-full object-cover" 
                    src={user.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"} 
                    alt={user.username}
                />
                <div>
                    <Link to={`/profile/${user._id}`} className="font-semibold text-gray-800 hover:text-blue-600 hover:underline">
                        {user.username}
                    </Link>
                    <p className="text-xs text-gray-500">{user.city || user.desc}</p>
                </div>
            </div>
            
            {renderActionButton()}
        </div>
    );
};

export default UserCard;