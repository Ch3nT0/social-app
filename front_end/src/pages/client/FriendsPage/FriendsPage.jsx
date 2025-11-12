import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import LayoutDefault from '../../../layout/LayoutDefault';
import { getCookie } from '../../../helpers/cookie';
import { getPendingRequests, acceptFriendRequest, rejectFriendRequest } from '../../../services/client/friendService';
import { getSuggestedUsers } from '../../../services/client/userService';
import UserCard from '../../../components/UserCard/UserCard';

const getUserId = () => getCookie('userId') || null;

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
                 alert("Thao tác thất bại.");
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

const FriendsPage = () => {
    const currentUserId = getUserId();
    
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
            const [pendingData, suggestedData] = await Promise.all([
                getPendingRequests(currentUserId),
                getSuggestedUsers(currentUserId)
            ]);
            
            // Xử lý và lưu state
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
        // Xóa request khỏi danh sách pending
        setPendingRequests(prev => prev.filter(req => req._id !== requestId));
        
        // Tùy chọn: Nếu chấp nhận, thêm người dùng vào danh sách bạn bè (nếu bạn có danh sách friends hiển thị)
        // Nếu newStatus === 'friend', bạn có thể cần logic để cập nhật list bạn bè chính thức (nếu list đó được hiển thị)
        
    }, []);


    if (loading) {
        return <LayoutDefault><div className="text-center p-8">Đang tải dữ liệu bạn bè...</div></LayoutDefault>;
    }
    
    // Chuyển hướng nếu chưa đăng nhập (Hoặc dùng Protected Route)
    if (!currentUserId) {
         return <LayoutDefault><div className="text-center p-8 text-red-500">Bạn cần đăng nhập để xem trang này.</div></LayoutDefault>;
    }


    return (
        <div className="friends-page pt-4 px-4 sm:px-0">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Quản lý Bạn bè</h2>
            
            {/* 1. LỜI MỜI KẾT BẠN ĐANG CHỜ */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-orange-600">
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

            {/* 2. GỢI Ý KẾT BẠN (Người bạn có thể biết) */}
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