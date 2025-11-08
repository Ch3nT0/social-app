import React, { useState, useEffect } from 'react';
import { getPostComments, createNewComment, deleteCommentById } from '../../services/client/commentService';
import { getCookie } from '../../helpers/cookie';

const getUserId = () => getCookie('userId') || null;

const CommentSection = ({ postId, postOwnerId, onCommentCountChange }) => {
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const currentUserId = getUserId();

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            try {
                const data = await getPostComments(postId);
                if (Array.isArray(data)) {
                    setComments(data);
                }
            } catch (err) {
                console.error("Lỗi tải bình luận:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [postId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || !currentUserId) return;

        setSubmitting(true);
        const commentData = {
            userId: currentUserId,
            postId: postId,
            text: newCommentText.trim()
        };

        try {
            const result = await createNewComment(commentData);
            if (result && result.comment) {
                setComments(prev => [...prev, result.comment]);
                setNewCommentText('');
                onCommentCountChange(1); // Tăng số lượng comment ở component cha
            } else {
                alert(result.message || "Không thể bình luận.");
            }
        } catch (error) {
            alert("Đã xảy ra lỗi khi gửi bình luận.");
        } finally {
            setSubmitting(false);
        }
    };
    
    const handleDelete = async (commentId, authorId) => {
        if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
        
        try {
            const result = await deleteCommentById(commentId);
            
            if (result && result.message) {
                setComments(prev => prev.filter(c => c._id !== commentId));
                onCommentCountChange(-1); 
            } else {
                 alert(result.message || "Xóa thất bại.");
            }
        } catch (error) {
             alert("Lỗi khi xóa bình luận.");
        }
    };

    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-3">Bình luận ({comments.length})</h4>
            
            {/* Form Bình luận */}
            {currentUserId && (
                <form onSubmit={handleCommentSubmit} className="flex space-x-2 mb-4">
                    <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Viết bình luận..."
                        className="flex-grow p-2 border rounded-full focus:ring-blue-500"
                        disabled={submitting}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-medium disabled:bg-blue-300"
                        disabled={submitting || !newCommentText.trim()}
                    >
                        {submitting ? 'Gửi...' : 'Gửi'}
                    </button>
                </form>
            )}

            {/* Danh sách Bình luận */}
            {loading && <p className="text-center text-sm text-gray-500">Đang tải bình luận...</p>}
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {comments.map((comment) => (
                    <div key={comment._id} className="flex space-x-2 text-sm">
                        <img 
                            src={comment.userId?.profilePicture || "https://via.placeholder.com/50/CCCCCC?text=U"} 
                            alt="Avatar" className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-grow bg-gray-100 p-2 rounded-xl">
                            <p className="font-semibold text-gray-800">
                                {comment.userId?.username || "Người dùng"}
                                {comment.userId?._id === postOwnerId && (
                                    <span className="ml-1 text-xs text-blue-500">(Chủ bài)</span>
                                )}
                            </p>
                            <p className="text-gray-700 break-words">{comment.text}</p>
                        </div>
                        
                        {/* Nút Xóa (Chỉ hiện khi là chủ comment hoặc chủ bài đăng) */}
                        {(comment.userId?._id === currentUserId || postOwnerId === currentUserId) && (
                            <button onClick={() => handleDelete(comment._id, comment.userId?._id)} className="text-red-500 hover:text-red-700 text-xs self-start">
                                Xóa
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;