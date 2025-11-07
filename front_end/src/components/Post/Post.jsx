import React from 'react';
const Post = ({ post }) => {
    console.log("Rendering Post component with post data:", post);
    return (
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                    <img 
                        className="w-10 h-10 rounded-full object-cover" 
                        src={post.userId?.profilePicture || "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"} 
                        alt="User Avatar"
                    />
                    <div>
                        <span className="font-semibold text-gray-800">{post.userId?.username || "Người dùng"}</span>
                        <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                </div>
                {/* Nút tùy chọn (3 chấm) */}
                <button className="text-gray-400 hover:text-gray-600">...</button>
            </div>

            {/* Nội dung Post */}
            <p className="text-gray-700 mb-4">{post.content}</p>

            {/* Hình ảnh/Video */}
            {post.image && (
                <img 
                    className="w-full max-h-96 object-contain rounded-lg mb-4" 
                    src={post.image} 
                    alt="Post Content" 
                />
            )}
            
            <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                
                {/* Stats (Likes & Comments) */}
                <div className="text-sm text-gray-500">
                    <span className="mr-4">❤️ {post.likes.length} Thích</span>
                    <span>💬 {post.commentsCount} Bình luận</span>
                </div>

                {/* Actions (Like, Comment, Share) */}
                <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-150">
                        <span>👍</span> <span className="text-sm">Thích</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-150">
                        <span></span> <span className="text-sm">Bình luận</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition duration-150">
                        <span></span> <span className="text-sm">Chia sẻ</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Post;