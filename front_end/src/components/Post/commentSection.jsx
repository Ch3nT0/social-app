import React, { useState, useEffect, useCallback } from 'react';
import { getPostComments, createNewComment, deleteCommentById } from '../../services/client/commentService';
import { getCookie } from '../../helpers/cookie';
import { useSocket } from '../../context/SocketContext'; 

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
        setIsReplying(false); 
        setSubmittingReply(false);
    };

    const canDelete = comment.userId?._id === currentUserId || postOwnerId === currentUserId;

    const paddingLeft = `${Math.min(level, 4) * 16}px`; 

    return (
        <div style={{ paddingLeft }} className={`pb-2 ${level > 0 ? 'border-l border-gray-200 pl-4' : ''}`}>
            <div className="flex space-x-2 text-sm">
                <img src={comment.userId?.profilePicture || "https://via.placeholder.com/50/CCCCCC?text=U"} alt="Avatar" className="w-7 h-7 rounded-full flex-shrink-0" />
                <div className="flex-grow min-w-0">
                    <div className="bg-gray-100 p-2 rounded-xl inline-block max-w-full">
                        <p className="font-semibold text-gray-800 break-words">
                            {comment.userId?.username || "Người dùng"}
                            {comment.userId?._id === postOwnerId && (<span className="ml-1 text-xs text-blue-500 font-normal">(Chủ bài)</span>)}
                        </p>
                        <p className="text-gray-700 break-words mt-0.5">{comment.text}</p>
                    </div>
                    <div className="flex items-center space-x-3 mt-1 ml-2 text-xs text-gray-500">
                        {currentUserId && level < 4 && (
                            <button onClick={() => setIsReplying(!isReplying)} className="hover:underline font-medium">
                                {isReplying ? 'Hủy' : 'Trả lời'}
                            </button>
                        )}
                        {canDelete && (
                            <button onClick={() => onDeleteComment(comment._id)} className="hover:underline text-red-500 font-medium">
                                Xóa
                            </button>
                        )}
                        <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                    </div>

                    {isReplying && currentUserId && (
                        <form onSubmit={handleReply} className="flex space-x-2 mt-2 ml-1">
                            <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Trả lời ${comment.userId?.username}...`} className="flex-grow p-1 border rounded-full text-sm focus:ring-blue-500" disabled={submittingReply} />
                            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm disabled:bg-blue-300" disabled={submittingReply || !replyText.trim()}>Gửi</button>
                        </form>
                    )}
                </div>
            </div>

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

const CommentSection = ({ postId, postOwnerId, onCommentCountChange }) => {
    const [comments, setComments] = useState([]); 
    const [newCommentText, setNewCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const currentUserId = getUserId();
    
    const { socket } = useSocket(); 

    // Hàm đệ quy để chèn bình luận mới vào đúng vị trí (gốc hoặc replies)
    const updateCommentsState = (prevComments, newComment, parentId) => {
        if (!parentId) {
            return [...prevComments, newComment];
        }
        const insertReply = (items) => {
            return items.map(item => {
                if (item._id === parentId) {
                    return {
                        ...item,
                        replies: [...(item.replies || []), newComment] 
                    };
                }
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
    
    
    const fetchComments = useCallback(async () => {
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
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);
    
    // EFFECT SOCKET.IO: Tham gia phòng và lắng nghe sự kiện
    useEffect(() => {
        if (socket && postId) {
            console.log("Tham gia phòng bình luận cho bài viết:", postId);
            socket.emit('joinPostRoom', postId); 

            const handleNewComment = (newComment) => {
                console.log("Nhận bình luận mới qua socket:", newComment);
                if (newComment.postId === postId) { 
                    
                    setComments(prev => {
                        const exists = prev.some(c => c._id === newComment._id);
                        if (!exists) {
                            const parentId = newComment.parentId; 
                            return updateCommentsState(prev, newComment, parentId);
                         }
                        return prev;
                    });
                }
            };
            
            const handleCountUpdate = (data) => {
                 if (data.postId === postId && data.change) {
                    onCommentCountChange(data.change); 
                }
            };

            socket.on('newComment', handleNewComment);
            socket.on('updateCommentCount', handleCountUpdate); 

            // Cleanup: Rời phòng khi component unmount
            return () => {
                socket.emit('leavePostRoom', postId);
                socket.off('newComment', handleNewComment);
                socket.off('updateCommentCount', handleCountUpdate);
            };
        }
    }, [socket, postId, onCommentCountChange]); 


    const handleNewCommentSubmit = async (parentId, text) => {
        setSubmitting(true);
        const commentData = {
            userId: currentUserId,
            postId: postId,
            text: text,
            parentId: parentId || undefined 
        };

        try {
            const result = await createNewComment(commentData);
            if (result && result.comment) {
                // Optimistic Update: Thêm vào state ngay lập tức
                setComments(prev => updateCommentsState(prev, result.comment, parentId));
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
                await fetchComments(); 
                
                const deletedCount = result.deletedCount || 1; 
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

            {loading && <p className="text-center text-sm text-gray-500">Đang tải bình luận...</p>}
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {comments.length === 0 && !loading && (
                    <p className="text-center text-gray-500">Chưa có bình luận nào.</p>
                )}
                
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