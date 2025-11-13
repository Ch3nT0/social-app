import { useState } from "react";
import { acceptFriendRequest, rejectFriendRequest } from "../../services/client/friendService";
import { Link } from "react-router-dom";

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

export default PendingRequestCard;