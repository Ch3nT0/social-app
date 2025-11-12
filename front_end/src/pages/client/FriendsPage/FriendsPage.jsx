import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import LayoutDefault from '../../../layout/LayoutDefault';
import { getCookie } from '../../../helpers/cookie';
import { getPendingRequests, acceptFriendRequest, rejectFriendRequest, unfriendUser } from '../../../services/client/friendService';
import { getSuggestedUsers, getFriendsList } from '../../../services/client/userService';
import UserCard from '../../../components/UserCard/UserCard';

const getUserId = () => getCookie('userId') || null;

const FriendListItem = ({ friend, currentUserId, onUnfriendSuccess }) => {
    const [loading, setLoading] = useState(false);
    
    const handleUnfriend = async () => {
        if (!window.confirm(`Bạn có chắc muốn xóa bạn với ${friend.username} không?`)) return;
        setLoading(true);
        try {
            await unfriendUser(friend._id); 
            alert(`Đã xóa bạn với ${friend.username}.`);
            onUnfriendSuccess(friend._id); 
        } catch (error) {
            console.error("Lỗi xóa bạn:", error);
            alert("Lỗi khi xóa bạn bè.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
                <img 
                    className="w-10 h-10 rounded-full object-cover" 
                    src={friend.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"} 
                    alt={friend.username}
                />
                <div>
                    <Link to={`/profile/${friend._id}`} className="font-semibold text-gray-800 hover:text-blue-600 hover:underline">
                        {friend.username}
                    </Link>
                    <p className="text-xs text-gray-500">{friend.city || friend.desc}</p>
                </div>
            </div>

            <div className="flex space-x-2">
                <button 
                    onClick={handleUnfriend}
                    className="bg-red-500 text-white text-sm px-3 py-1 rounded-full hover:bg-red-600 transition disabled:opacity-70"
                    disabled={loading}
                >
                    {loading ? 'Đang xóa...' : 'Xóa bạn'}
                </button>
            </div>
        </div>
    );
};


// ==========================================================
// Component Con 2: Hiển thị Lời mời đang chờ (có nút Chấp nhận/Từ chối)
// ==========================================================
const PendingRequestCard = ({ request, currentUserId, onActionSuccess }) => {
    const [loading, setLoading] = useState(false);
    
    const requestId = request._id; 
    const sender = request.senderId;
    const senderName = sender?.username || 'Người lạ';
    
    const handleAction = async (actionType) => {
        if (!currentUserId) return;

        setLoading(true);
        try {
            let result;
            if (actionType === 'accept') {
                result = await acceptFriendRequest(requestId); 
            } else {
                result = await rejectFriendRequest(requestId);
            }
            
            if (result && result.message) {
                alert(result.message);
                onActionSuccess(requestId, actionType === 'accept' ? 'friend' : 'rejected'); 
            } else {
                // Nếu BE trả về lỗi, BE có thể không cung cấp message, cần check response
                alert(result?.message || "Thao tác thất bại.");
            }
        } catch (error) {
            console.error(`Lỗi ${actionType} request:`, error);
            alert("Lỗi kết nối server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
                <img 
                    className="w-10 h-10 rounded-full object-cover" 
                    src={sender?.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"} 
                    alt={senderName}
                />
                <div>
                    <Link to={`/profile/${sender._id}`} className="font-semibold text-gray-800 hover:text-blue-600 hover:underline">
                        {senderName}
                    </Link>
                    <p className="text-xs text-gray-500">Đã gửi lời mời</p>
                </div>
            </div>

            <div className="flex space-x-2">
                <button 
                    onClick={() => handleAction('accept')}
                    className="bg-green-600 text-white text-sm px-3 py-1 rounded-full hover:bg-green-700 transition disabled:bg-green-300"
                    disabled={loading}
                >
                    {loading ? '...' : 'Chấp nhận'}
                </button>
                <button 
                    onClick={() => handleAction('reject')}
                    className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full hover:bg-gray-300 transition disabled:opacity-70"
                    disabled={loading}
                >
                    Từ chối
                </button>
            </div>
        </div>
    );
};


// ==========================================================
// Component Chính: FriendsPage
// ==========================================================
const FriendsPage = () => {
    const currentUserId = getUserId();
    
    const [friendsList, setFriendsList] = useState([]); 
    const [pendingRequests, setPendingRequests] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    
    // Hàm fetch dữ liệu chính
    const fetchData = useCallback(async () => {
        if (!currentUserId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Lấy dữ liệu đồng thời
            const [friendsData, pendingData, suggestedData] = await Promise.all([
                getFriendsList(currentUserId), 
                getPendingRequests(currentUserId),
                getSuggestedUsers(currentUserId)
            ]);
            
            // Xử lý và lưu state
            setFriendsList(friendsData || []); 
            setPendingRequests(pendingData || []);
            setSuggestions(suggestedData || []);

        } catch (error) {
            console.error("Lỗi tải trang Bạn bè:", error);
            alert("Lỗi tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // Cập nhật giao diện sau khi chấp nhận/từ chối
    const handleRequestStatusUpdate = useCallback((requestId, newStatus) => {
        // Lấy request đã chấp nhận
        const acceptedRequest = pendingRequests.find(req => req._id === requestId);
        
        // Xóa request khỏi danh sách pending
        setPendingRequests(prev => prev.filter(req => req._id !== requestId));
        
        // Nếu chấp nhận, thêm người dùng vào friendsList (Tối ưu)
        if (newStatus === 'friend' && acceptedRequest) {
             // Dữ liệu người gửi (sender) đã được populate trong acceptedRequest.senderId
             setFriendsList(prev => [...prev, acceptedRequest.senderId]); 
        }
    }, [pendingRequests]);
    
    // Xóa bạn bè khỏi danh sách FriendsList
    const handleUnfriendFromList = useCallback((friendId) => {
        setFriendsList(prev => prev.filter(friend => friend._id !== friendId));
        // Tùy chọn: Sau khi xóa bạn, fetch lại danh sách gợi ý để xem người đó có xuất hiện lại không
        // fetchData(); 
    }, []);


    if (loading) {
        // Giả định LayoutDefault đã được khai báo ở nơi khác
        return <LayoutDefault><div className="text-center p-8">Đang tải dữ liệu bạn bè...</div></LayoutDefault>;
    }
    
    if (!currentUserId) {
         return <LayoutDefault><div className="text-center p-8 text-red-500">Bạn cần đăng nhập để xem trang này.</div></LayoutDefault>;
    }


    return (
        <div className="friends-page pt-4 px-4 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Quản lý Bạn bè</h2>
            
            {/* 1. DANH SÁCH BẠN BÈ HIỆN TẠI */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-green-600 border-t pt-4">
                    Bạn bè của tôi ({friendsList.length})
                </h3>
                <div className="space-y-3">
                    {friendsList.length > 0 ? (
                        friendsList.map(friend => (
                            <FriendListItem 
                                key={friend._id} 
                                friend={friend} 
                                currentUserId={currentUserId}
                                onUnfriendSuccess={handleUnfriendFromList}
                            />
                        ))
                    ) : (
                        <div className="p-4 bg-white rounded-lg shadow-md text-gray-500">
                            Bạn chưa có người bạn nào.
                        </div>
                    )}
                </div>
            </div>


            {/* 2. LỜI MỜI KẾT BẠN ĐANG CHỜ */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-orange-600 border-t pt-4">
                    Lời mời kết bạn đang chờ ({pendingRequests.length})
                </h3>
                
                <div className="space-y-3">
                    {pendingRequests.length > 0 ? (
                        pendingRequests.map(req => (
                            <PendingRequestCard 
                                key={req._id} 
                                request={req} 
                                currentUserId={currentUserId}
                                onActionSuccess={handleRequestStatusUpdate}
                            />
                        ))
                    ) : (
                        <div className="p-4 bg-white rounded-lg shadow-md text-gray-500">
                            Hiện không có lời mời kết bạn mới nào.
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-600 border-t pt-4">
                    Gợi ý Kết bạn ({suggestions.length})
                </h3>
                
                <div className="space-y-3">
                    {suggestions.length > 0 ? (
                        suggestions.map(user => (
                            <UserCard 
                                key={user._id} 
                                user={user} 
                                onUpdateStatus={() => fetchData()} 
                            />
                        ))
                    ) : (
                        <div className="p-4 bg-white rounded-lg shadow-md text-gray-500">
                            Hiện không có gợi ý nào.
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
};



export default FriendsPage;