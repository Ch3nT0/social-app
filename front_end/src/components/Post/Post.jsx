import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { likePost, deletePost, updateVisibility } from '../../services/client/postService';
import { getCookie } from '../../helpers/cookie';
import CommentSection from './commentSection';
import { useSocket } from '../../context/SocketContext';

// Thư viện xem ảnh
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Thư viện hiển thị 3D
import '@google/model-viewer';

const getUserId = () => getCookie('userId') || null;

const Post = ({ post }) => {
    const [postData, setPostData] = useState(post);
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const menuRef = useRef(null);

    // State cho trình xem ảnh phóng to
    const [openLightbox, setOpenLightbox] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);

    const currentUserId = getUserId();
    const posterId = postData.userId?._id;
    const username = postData.userId?.username || "Người dùng";
    const isPopulated = typeof postData.userId === 'object' && postData.userId !== null && postData.userId._id;

    const { socket } = useSocket();

    // Xử lý danh sách ảnh
    const images = postData.image
        ? (Array.isArray(postData.image) ? postData.image : [postData.image])
        : [];

    const slides = images.map(src => ({ src }));

    const getVisibilityIcon = (type) => {
        switch (type) {
            case 'public': return '🌎';
            case 'friends': return '👥';
            case 'private': return '🔒';
            default: return '🌎';
        }
    };

    // Tự động đóng menu khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Cập nhật quyền riêng tư
    const handleUpdateVisibility = async (newVisibility) => {
        if (newVisibility === postData.visibility) return;
        setIsUpdating(true);
        try {
            const result = await updateVisibility(postData._id, newVisibility);
            if (result) {
                setPostData(prev => ({ ...prev, visibility: newVisibility }));
                setShowMenu(false);
            }
        } catch (error) {
            alert("Không thể cập nhật quyền riêng tư.");
        } finally {
            setIsUpdating(false);
        }
    };

    // Xử lý Like Realtime
    useEffect(() => {
        setIsLiked(!!(currentUserId && postData.likes.includes(currentUserId)));
    }, [postData.likes, currentUserId]);

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
        if (!currentUserId) return alert("Vui lòng đăng nhập.");
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
            setIsLiked(previousIsLiked);
            setPostData(prev => ({ ...prev, likes: previousLikes }));
        }
    };

    const handleCommentCountChange = (change) => {
        setPostData(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + change }));
    };

    const handleDeletePost = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) return;
        try {
            await deletePost(postData._id);
            window.location.reload();
        } catch (error) {
            alert("Không thể xóa bài viết.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 relative mb-4">
            {/* Header Post */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <img
                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                        src={postData.userId?.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"}
                        alt="Avatar"
                    />
                    <div>
                        {isPopulated ? (
                            <Link to={`/profile/${posterId}`} className="font-semibold text-gray-800 hover:text-blue-600 hover:underline">
                                {username}
                            </Link>
                        ) : (
                            <span className="font-semibold text-gray-800">{username}</span>
                        )}

                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{new Date(postData.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span>•</span>
                            <span title={postData.visibility}>
                                {getVisibilityIcon(postData.visibility)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Menu Action (Fix hiển thị) */}
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setShowMenu(!showMenu)} 
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        •••
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
                            {currentUserId === posterId ? (
                                <>
                                    <div className="px-4 py-2 border-b bg-gray-50">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Quyền riêng tư</span>
                                    </div>
                                    <button 
                                        onClick={() => handleUpdateVisibility('public')}
                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center hover:bg-blue-50 ${postData.visibility === 'public' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-600'}`}
                                    >
                                        <span className="mr-3">🌎</span> Công khai
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateVisibility('friends')}
                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center hover:bg-blue-50 ${postData.visibility === 'friends' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-600'}`}
                                    >
                                        <span className="mr-3">👥</span> Bạn bè
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateVisibility('private')}
                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center hover:bg-blue-50 ${postData.visibility === 'private' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-600'}`}
                                    >
                                        <span className="mr-3">🔒</span> Chỉ mình tôi
                                    </button>
                                    <div className="border-t border-gray-100"></div>
                                    <button onClick={handleDeletePost} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center transition duration-150">
                                        <span className="mr-3">🗑️</span> Xóa bài viết
                                    </button>
                                </>
                            ) : (
                                <button className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-center">
                                    <span className="mr-3">🚩</span> Báo cáo bài viết
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Nội dung text */}
            <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">{postData.content}</p>

            {/* Media Section */}
            <div className="relative z-10">
                {postData.model3d ? (
                    <div className="w-full h-[400px] bg-gray-50 rounded-xl mb-4 relative shadow-inner border border-gray-100 overflow-hidden">
                        <model-viewer src={postData.model3d} alt="3D Model" auto-rotate camera-controls ar shadow-intensity="1" style={{ width: '100%', height: '100%' }} touch-action="pan-y">
                            <div slot="poster" className="flex items-center justify-center h-full bg-gray-100 text-gray-400">Mô hình 3D đang tải...</div>
                        </model-viewer>
                    </div>
                ) : postData.video ? (
                    <div className="w-full mb-4 rounded-xl overflow-hidden border border-gray-100 bg-black flex justify-center">
                        <video className="max-h-[500px] w-full" controls preload="metadata" poster={images[0] || ""}>
                            <source src={postData.video} type="video/mp4" />
                            Trình duyệt không hỗ trợ video.
                        </video>
                    </div>
                ) : (
                    images.length > 0 && (
                        <div className={`grid gap-2 mb-4 overflow-hidden rounded-xl ${images.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {images.slice(0, 4).map((img, index) => (
                                <div
                                    key={index}
                                    className={`relative cursor-pointer hover:brightness-90 transition aspect-square ${images.length === 3 && index === 0 ? 'row-span-2 aspect-auto' : ''}`}
                                    onClick={() => { setPhotoIndex(index); setOpenLightbox(true); }}
                                >
                                    <img className="w-full h-full object-cover" src={img} alt="Post" />
                                    {index === 3 && images.length > 4 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                                            +{images.length - 4}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            <Lightbox open={openLightbox} close={() => setOpenLightbox(false)} slides={slides} index={photoIndex} />

            {/* Footer Stats */}
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <div className="flex items-center text-sm text-gray-500 font-medium">
                    <div className="flex items-center mr-4 cursor-default">
                        <span className="flex items-center justify-center w-5 h-5 bg-red-100 text-red-500 rounded-full text-[10px] mr-1.5 shadow-sm">❤️</span>
                        <span>{postData.likes.length}</span>
                    </div>
                    <button onClick={() => setShowComments(!showComments)} className="hover:text-blue-600 transition-colors">
                        {postData.commentsCount || 0} bình luận
                    </button>
                </div>

                <div className="flex space-x-1">
                    <button onClick={handleLike} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition duration-200 ${isLiked ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <span>{isLiked ? '👍' : '👍'}</span> <span className="text-sm">{isLiked ? 'Đã thích' : 'Thích'}</span>
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition duration-200">
                        <span>💬</span> <span className="text-sm">Bình luận</span>
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <CommentSection postId={postData._id} postOwnerId={posterId} onCommentCountChange={handleCommentCountChange} />
                </div>
            )}
        </div>
    );
};

export default Post;