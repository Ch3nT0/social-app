import React from 'react';
import { Link } from 'react-router-dom';

const Post = ({ post }) => {
    const posterId = post.userId?._id;
    const username = post.userId?.username || "Người dùng";
    const isPopulated = typeof post.userId === 'object' && post.userId !== null && post.userId._id;

    return (
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">

            {/* Header Post (Avatar, Tên, Thời gian) */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                    <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={post.userId?.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"}
                        alt="User Avatar"
                    />
                    <div>
                        {isPopulated ? (
                            <Link
                                to={`/profile/${posterId}`}
                                className="font-semibold text-gray-800 hover:text-blue-600 hover:underline transition duration-150"
                            >
                                {username}
                            </Link>
                        ) : (
                            <span className="font-semibold text-gray-800">{username}</span>
                        )}

                        <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">...</button>
            </div>

            <p className="text-gray-700 mb-4">{post.content}</p>

            {post.image && (
                <img
                    className="w-full max-h-96 object-contain rounded-lg mb-4"
                    src={post.image}
                    alt="Post Content"
                />
            )}

            <div className="flex justify-between items-center border-t border-gray-200 pt-3">

                <div className="text-sm text-gray-500">
                    <span className="mr-4">❤️ {post.likes.length} Thích</span>
                    <span>💬 {post.commentsCount} Bình luận</span>
                </div>

                <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-150">
                        <span>👍</span> <span className="text-sm">Thích</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-150">
                        <span>💬</span> <span className="text-sm">Bình luận</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-150">
                        <span>📤</span> <span className="text-sm">Chia sẻ</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Post;