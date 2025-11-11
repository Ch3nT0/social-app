import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { likePost } from '../../services/client/postService'; 
import { getCookie } from '../../helpers/cookie';
import CommentSection from './commentSection'; 
import { useSocket } from '../../context/SocketContext'; 

const getUserId = () => getCookie('userId') || null;

const Post = ({ post }) => {
    const [postData, setPostData] = useState(post); 
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    
    const currentUserId = getUserId(); 
    const posterId = postData.userId?._id;
    const username = postData.userId?.username || "Người dùng";
    const isPopulated = typeof postData.userId === 'object' && postData.userId !== null && postData.userId._id;
    
    const { socket } = useSocket(); // Lấy Socket

    // Effect 1: Khởi tạo trạng thái Like
    useEffect(() => {
        setIsLiked(!!(currentUserId && postData.likes.includes(currentUserId)));
    }, [postData.likes, currentUserId]);
    
    // Effect 2: Lắng nghe Like Real-time
    useEffect(() => {
        if (socket) {
            const handlePostLiked = (data) => {
                if (data.postId === postData._id) {
                    setPostData(prev => ({
                        ...prev,
                        likes: data.newCount, // Update số lượng likes
                        // Cập nhật trạng thái isLiked nếu action là của người dùng hiện tại
                        likes: data.isLiked 
                            ? [...prev.likes, data.userId] 
                            : prev.likes.filter(id => id !== data.userId)
                    }));
                }
            };

            socket.on('postLiked', handlePostLiked);
            return () => socket.off('postLiked', handlePostLiked);
        }
    }, [socket, postData._id]);


    const handleLike = async () => {
        if (!currentUserId) {
            alert("Vui lòng đăng nhập để thực hiện hành động này.");
            return;
        }

        const previousIsLiked = isLiked;
        const previousLikes = postData.likes;

        // Optimistic Update
        setIsLiked(!isLiked);
        setPostData(prev => ({
            ...prev,
            likes: isLiked 
                ? prev.likes.filter(id => id !== currentUserId) 
                : [...prev.likes, currentUserId] 
        }));

        try {
            await likePost(postData._id); 
        } catch (error) {
            console.error("Lỗi khi thích bài đăng:", error);
            setIsLiked(previousIsLiked);
            setPostData(prev => ({ ...prev, likes: previousLikes }));
            alert("Có lỗi xảy ra, không thể thích/bỏ thích bài đăng.");
        }
    };
    
    const handleCommentCountChange = (change) => {
        setPostData(prev => ({
            ...prev,
            commentsCount: (prev.commentsCount || 0) + change
        }));
    };


    return (
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
            {/* Header Post */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                    <img className="w-10 h-10 rounded-full object-cover" src={postData.userId?.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"} alt="User Avatar" />
                    <div>
                        {isPopulated ? (
                            <Link to={`/profile/${posterId}`} className="font-semibold text-gray-800 hover:text-blue-600 hover:underline transition duration-150">
                                {username}
                            </Link>
                        ) : (<span className="font-semibold text-gray-800">{username}</span>)}
                        <div className="text-xs text-gray-500">{new Date(postData.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">...</button>
            </div>

            <p className="text-gray-700 mb-4">{postData.content}</p>
            {postData.image && (<img className="w-full max-h-96 object-contain rounded-lg mb-4" src={postData.image} alt="Post Content" />)}

            {/* Footer - Stats and Actions */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                <div className="text-sm text-gray-500">
                    <span className={`mr-4 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                        ❤️ {postData.likes.length} Thích
                    </span>
                    <button onClick={() => setShowComments(prev => !prev)} className='hover:underline'>
                        💬 {postData.commentsCount} Bình luận
                    </button>
                </div>

                <div className="flex space-x-4">
                    <button onClick={handleLike} className={`flex items-center space-x-1 transition duration-150 ${isLiked ? 'text-red-500 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}>
                        <span>👍</span> <span className="text-sm">{isLiked ? 'Đã thích' : 'Thích'}</span>
                    </button>
                    <button onClick={() => setShowComments(prev => !prev)} className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-150">
                        <span>💬</span> <span className="text-sm">Bình luận</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-150">
                        <span>📤</span> <span className="text-sm">Chia sẻ</span>
                    </button>
                </div>
            </div>
            
            {/* Comment Section Integration */}
            {showComments && (
                <CommentSection 
                    postId={postData._id} 
                    postOwnerId={posterId} 
                    onCommentCountChange={handleCommentCountChange} 
                />
            )}
        </div>
    );
};

export default Post;