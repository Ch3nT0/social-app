import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { likePost } from '../../services/client/postService'; 
import { getCookie } from '../../helpers/cookie';
import CommentSection from './commentSection'; 
import { useSocket } from '../../context/SocketContext'; 
import { deletePost } from '../../services/client/postService';

// Import thư viện để hiển thị 3D
import '@google/model-viewer';

const getUserId = () => getCookie('userId') || null;

const Post = ({ post }) => {
    const [postData, setPostData] = useState(post); 
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const currentUserId = getUserId(); 
    const posterId = postData.userId?._id;
    const username = postData.userId?.username || "Người dùng";
    const isPopulated = typeof postData.userId === 'object' && postData.userId !== null && postData.userId._id;
    
    const { socket } = useSocket();

    // Effect 1: Đồng bộ trạng thái Like
    useEffect(() => {
        setIsLiked(!!(currentUserId && postData.likes.includes(currentUserId)));
    }, [postData.likes, currentUserId]);
    
    // Effect 2: Lắng nghe Like Real-time
    useEffect(() => {
        if (socket) {
            const handlePostLiked = (data) => {
                if (data.postId === postData._id && data.userId !== currentUserId) {
                    setPostData(prev => {
                        let newLikes;
                        if (data.isLiked) {
                            newLikes = Array.from(new Set([...prev.likes, data.userId]));
                        } else {
                            newLikes = prev.likes.filter(id => id !== data.userId);
                        }
                        return { ...prev, likes: newLikes };
                    });
                }
            };

            socket.on('postLiked', handlePostLiked);
            return () => socket.off('postLiked', handlePostLiked);
        }
    }, [socket, postData._id, currentUserId]);


    const handleLike = async () => {
        if (!currentUserId) {
            alert("Vui lòng đăng nhập để thực hiện hành động này.");
            return;
        }

        const previousIsLiked = isLiked;
        const previousLikes = postData.likes;

        setIsLiked(!isLiked);
        setPostData(prev => ({
            ...prev,
            likes: isLiked 
                ? prev.likes.filter(id => id !== currentUserId) 
                : Array.from(new Set([...prev.likes, currentUserId]))
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

    const handleDeletePost = async () => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?");
        if (!confirmDelete) return;

        try {
            await deletePost(postData._id);
            alert("Xóa bài đăng thành công.");
            window.location.reload(); 
        } catch (error) {
            console.error("Lỗi khi xóa bài đăng:", error);
            alert("Không thể xóa bài viết.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 relative mb-4">
            {/* Header Post */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                    <img 
                        className="w-10 h-10 rounded-full object-cover border border-gray-100" 
                        src={postData.userId?.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"} 
                        alt="User Avatar" 
                    />
                    <div>
                        {isPopulated ? (
                            <Link to={`/profile/${posterId}`} className="font-semibold text-gray-800 hover:text-blue-600 hover:underline transition duration-150">
                                {username}
                            </Link>
                        ) : (
                            <span className="font-semibold text-gray-800">{username}</span>
                        )}
                        <div className="text-xs text-gray-500">{new Date(postData.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                </div>

                <div className="relative">
                    <button 
                        onClick={() => setShowMenu(prev => !prev)} 
                        className="text-gray-400 hover:text-gray-600 p-1 px-2 rounded-full hover:bg-gray-100"
                    >
                        •••
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                            {currentUserId === posterId && (
                                <button
                                    onClick={handleDeletePost}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center"
                                >
                                    <span className="mr-2">🗑</span> Xóa bài viết
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{postData.content}</p>
            
            {/* PHẦN HIỂN THỊ MODEL 3D (.glb) */}
            {postData.model3d ? (
                <div className="w-full h-[400px] bg-gray-50 rounded-lg mb-4 relative shadow-inner border border-gray-100 overflow-hidden">
                    <model-viewer
                        src={postData.model3d}
                        alt="3D Model"
                        auto-rotate
                        camera-controls
                        ar
                        shadow-intensity="1"
                        style={{ width: '100%', height: '100%' }}
                        touch-action="pan-y"
                    >
                        <div slot="poster" className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
                            <p className="animate-pulse">Đang tải mô hình 3D...</p>
                        </div>
                    </model-viewer>
                </div>
            ) : (
                /* HIỂN THỊ ẢNH NẾU KHÔNG CÓ MODEL 3D */
                postData.image && (
                    <img 
                        className="w-full max-h-[500px] object-cover rounded-lg mb-4" 
                        src={postData.image} 
                        alt="Post Content" 
                    />
                )
            )}

            {/* Footer - Stats and Actions */}
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <div className="flex items-center text-sm text-gray-500">
                    <div className="flex items-center mr-4 cursor-default">
                        <span className="flex items-center justify-center w-5 h-5 bg-red-100 text-red-500 rounded-full text-[10px] mr-1">❤️</span>
                        <span>{postData.likes.length}</span>
                    </div>
                    <button onClick={() => setShowComments(prev => !prev)} className='hover:underline'>
                        {postData.commentsCount || 0} bình luận
                    </button>
                </div>

                <div className="flex space-x-1 sm:space-x-4">
                    <button 
                        onClick={handleLike} 
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition duration-200 ${isLiked ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <span>👍</span>
                        <span className="text-sm">{isLiked ? 'Đã thích' : 'Thích'}</span>
                    </button>
                    
                    <button 
                        onClick={() => setShowComments(prev => !prev)} 
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition duration-200"
                    >
                        <span>💬</span>
                        <span className="text-sm">Bình luận</span>
                    </button>

                </div>
            </div>
            
            {/* Comment Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <CommentSection 
                        postId={postData._id} 
                        postOwnerId={posterId} 
                        onCommentCountChange={handleCommentCountChange} 
                    />
                </div>
            )}
        </div>
    );
};

export default Post;