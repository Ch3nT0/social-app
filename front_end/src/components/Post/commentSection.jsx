import React, { useState, useEffect, useCallback } from 'react';
import { getPostComments, createNewComment, deleteCommentById } from '../../services/client/commentService';
import { getCookie } from '../../helpers/cookie';

const getUserId = () => getCookie('userId') || null;
const CommentItem = ({ 
    comment, 
    postOwnerId, 
    currentUserId, 
    onReplySubmit, 
    onDeleteComment,
    level = 0 
}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || submittingReply) return;

        setSubmittingReply(true);
        await onReplySubmit(comment._id, replyText.trim());
        setReplyText('');
        setIsReplying(false); // Đóng form sau khi gửi
        setSubmittingReply(false);
    };

    const canDelete = comment.userId?._id === currentUserId || postOwnerId === currentUserId;

    const paddingLeft = `${Math.min(level, 4) * 16}px`; 

    return (
        <div style={{ paddingLeft }} className={`pb-2 ${level > 0 ? 'border-l border-gray-200 pl-4' : ''}`}>
            <div className="flex space-x-2 text-sm">
                <img 
                    src={comment.userId?.profilePicture || "https://via.placeholder.com/50/CCCCCC?text=U"} 
                    alt="Avatar" 
                    className="w-7 h-7 rounded-full flex-shrink-0"
                />
                <div className="flex-grow min-w-0">
                    {/* Nội dung bình luận */}
                    <div className="bg-gray-100 p-2 rounded-xl inline-block max-w-full">
                        <p className="font-semibold text-gray-800 break-words">
                            {comment.userId?.username || "Người dùng"}
                            {comment.userId?._id === postOwnerId && (
                                <span className="ml-1 text-xs text-blue-500 font-normal">(Chủ bài)</span>
                            )}
                        </p>
                        <p className="text-gray-700 break-words mt-0.5">{comment.text}</p>
                    </div>

                    {/* Footer - Trả lời / Xóa */}
                    <div className="flex items-center space-x-3 mt-1 ml-2 text-xs text-gray-500">
                        {currentUserId && level < 4 && ( // Giới hạn độ sâu trả lời
                            <button 
                                onClick={() => setIsReplying(!isReplying)} 
                                className="hover:underline font-medium"
                            >
                                {isReplying ? 'Hủy' : 'Trả lời'}
                            </button>
                        )}
                        {canDelete && (
                            <button 
                                onClick={() => onDeleteComment(comment._id)} 
                                className="hover:underline text-red-500 font-medium"
                            >
                                Xóa
                            </button>
                        )}
                        <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                    </div>

                    {/* Form Trả lời */}
                    {isReplying && currentUserId && (
                        <form onSubmit={handleReply} className="flex space-x-2 mt-2 ml-1">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Trả lời ${comment.userId?.username}...`}
                                className="flex-grow p-1 border rounded-full text-sm focus:ring-blue-500"
                                disabled={submittingReply}
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm disabled:bg-blue-300"
                                disabled={submittingReply || !replyText.trim()}
                            >
                                Gửi
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Hiển thị các Replies (Đệ quy) */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 space-y-2">
                    {comment.replies.map(reply => (
                        <CommentItem 
                            key={reply._id} 
                            comment={reply} 
                            postOwnerId={postOwnerId}
                            currentUserId={currentUserId}
                            onReplySubmit={onReplySubmit}
                            onDeleteComment={onDeleteComment}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ==========================================================
// Component Chính: CommentSection
// ==========================================================
const CommentSection = ({ postId, postOwnerId, onCommentCountChange }) => {
    const [comments, setComments] = useState([]); 
    const [newCommentText, setNewCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const currentUserId = getUserId();

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            // Backend trả về comments đã nested (dạng cây)
            const data = await getPostComments(postId); 
            if (Array.isArray(data)) {
                setComments(data);
            }
        } catch (err) {
            console.error("Lỗi tải bình luận:", err);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Hàm đệ quy để chèn bình luận mới vào đúng vị trí (gốc hoặc replies)
    const updateCommentsState = (prevComments, newComment, parentId) => {
        if (!parentId) {
            // Nếu không có parentId, thêm vào cấp độ gốc
            return [...prevComments, newComment];
        }

        const insertReply = (items) => {
            return items.map(item => {
                if (item._id === parentId) {
                    // Tìm thấy parent, thêm reply vào mảng replies của nó
                    return {
                        ...item,
                        // Đảm bảo replies là một mảng trước khi thêm
                        replies: [...(item.replies || []), newComment] 
                    };
                }
                // Tìm kiếm đệ quy trong replies
                if (item.replies) {
                    return {
                        ...item,
                        replies: insertReply(item.replies)
                    };
                }
                return item;
            });
        };

        return insertReply(prevComments);
    };

    // Xử lý gửi bình luận CHUNG (gốc hoặc trả lời)
    const handleNewCommentSubmit = async (parentId, text) => {
        setSubmitting(true);
        const commentData = {
            userId: currentUserId,
            postId: postId,
            text: text,
            parentId: parentId || undefined // Gửi parentId nếu có
        };

        try {
            const result = await createNewComment(commentData);
            if (result && result.comment) {
                // Thêm vào state và cập nhật UI
                setComments(prev => updateCommentsState(prev, result.comment, parentId));
                onCommentCountChange(1); // Tăng tổng số lượng
            } else {
                alert(result.message || "Không thể bình luận.");
            }
        } catch (error) {
            alert("Đã xảy ra lỗi khi gửi bình luận.");
        } finally {
            setSubmitting(false);
        }
    };
    
    // Xử lý gửi bình luận GỐC
    const handleRootCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || !currentUserId) return;

        await handleNewCommentSubmit(null, newCommentText.trim());
        setNewCommentText('');
    };
    
    // Xử lý XÓA
    const handleDelete = async (commentId) => {
        if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
        
        try {
            const result = await deleteCommentById(commentId);
            
            if (result && result.message) {
                const deletedCount = result.deletedCount || 1; 

                // Lấy lại danh sách bình luận để đảm bảo xóa sạch các replies đã bị xóa ở backend
                await fetchComments(); 
                
                onCommentCountChange(-deletedCount); 
            } else {
                 alert(result.message || "Xóa thất bại.");
            }
        } catch (error) {
             alert("Lỗi khi xóa bình luận.");
        }
    };

    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-3">Bình luận</h4>
            
            {/* Form Bình luận Gốc */}
            {currentUserId && (
                <form onSubmit={handleRootCommentSubmit} className="flex space-x-2 mb-6">
                    <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Viết bình luận..."
                        className="flex-grow p-2 border rounded-full focus:ring-blue-500 focus:border-blue-500"
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

            {/* Danh sách Bình luận (Sử dụng Component Đệ quy) */}
            {loading && <p className="text-center text-sm text-gray-500">Đang tải bình luận...</p>}
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {comments.length === 0 && !loading && (
                    <p className="text-center text-gray-500">Chưa có bình luận nào.</p>
                )}
                
                {/* Lặp qua các bình luận gốc */}
                {comments.map((comment) => (
                    <CommentItem 
                        key={comment._id} 
                        comment={comment} 
                        postOwnerId={postOwnerId}
                        currentUserId={currentUserId}
                        onReplySubmit={handleNewCommentSubmit}
                        onDeleteComment={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentSection;