const Comment = require('../../models/comment.model');
const Post = require('../../models/post.model'); 
const Notification = require('../../models/notification.model');

// [POST] /comments
exports.createComment = async (req, res) => {
    const userId = req.user?.id || req.body.userId;
    const { postId, text, parentId } = req.body;
    
    if (!userId) {
        return res.status(401).json({ message: "Yêu cầu xác thực để bình luận." });
    }
    
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Bài đăng không tồn tại để bình luận." });
        }
        
        const postOwnerId = post.userId.toString();
        let parentCommentOwnerId = null; 

        // 1. Kiểm tra bình luận cha (nếu tồn tại)
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                 return res.status(404).json({ message: "Bình luận cha không tồn tại." });
            }
            if (parentComment.postId.toString() !== postId) {
                return res.status(400).json({ message: "Bình luận cha không thuộc bài đăng này." });
            }
            // Lấy ID chủ comment cha
            parentCommentOwnerId = parentComment.userId.toString();
        } 
        
        // 2. Lưu bình luận mới và cập nhật count
        const newComment = new Comment({ postId, userId, text, parentId });
        const savedComment = await newComment.save();
        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }); 

        const populatedComment = await Comment.findById(savedComment._id)
            .populate('userId', 'username profilePicture');
        
        // 3. XỬ LÝ THÔNG BÁO VÀ SOCKET
        const uniqueReceivers = new Set();
        
        // A. Thông báo Chủ Bài viết (Chỉ khi người bình luận không phải là chủ bài)
        if (userId !== postOwnerId) {
            uniqueReceivers.add(postOwnerId);
        }
        
        // B. Thông báo Chủ Bình luận Cha (Nếu là reply và người được trả lời khác người reply)
        if (parentId && parentCommentOwnerId && parentCommentOwnerId !== userId) {
            // Thêm người được trả lời. Set sẽ tự động loại bỏ trùng lặp nếu người này cũng là chủ post.
            uniqueReceivers.add(parentCommentOwnerId);
        }

        // Tạo và gửi thông báo đẩy cho từng người nhận
        if (global.io) {
            
            uniqueReceivers.forEach(async (receiverId) => {
                const isReply = parentId && parentCommentOwnerId === receiverId;
                const isCommentToPost = !parentId && postOwnerId === receiverId;

                let notificationContent = '';
                let notificationType = '';
                
                if (isReply) {
                    notificationContent = `đã trả lời bình luận của bạn: "${text.substring(0, 30)}..."`;
                    notificationType = 'reply';
                } else if (isCommentToPost || (postOwnerId === receiverId && parentId)) {
                    // Nếu là chủ post, nhận thông báo comment hoặc reply (chỉ cần 1 thông báo)
                    notificationContent = `đã bình luận về bài viết của bạn: "${text.substring(0, 30)}..."`;
                    notificationType = 'comment';
                }
                
                if (notificationContent) {
                    // Tạo bản ghi thông báo
                    const newNotification = new Notification({
                        senderId: userId,
                        receiverId: receiverId,
                        type: notificationType,
                        entityId: postId, 
                        content: notificationContent
                    });
                    const savedNotif = await newNotification.save();
                    
                    // Gửi tín hiệu real-time
                    const receiverSocketId = global.activeUsers.get(receiverId);
                    if (receiverSocketId) {
                        global.io.to(receiverSocketId).emit('newNotification', savedNotif);
                    }
                }
            });
        }
        
        // 4. Phát sóng Comment Real-time (cho người đang xem bài)
        if (global.io) {
            console.log("Phát sóng NEW COMMENT tới Room:", postId);
            global.io.to(postId).emit('newComment', populatedComment); 
            global.io.to(postId).emit('updateCommentCount', { postId, change: 1 });
        }
            
        res.status(201).json({ 
            message: "Bình luận đã được tạo thành công.",
            comment: populatedComment
        });
    } catch (err) {
        console.error("Lỗi khi tạo bình luận:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};
// [DELETE] /comments/:id
exports.deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user?.userId || req.body.userId; 
    
    
    try {
        const comment = await Comment.findById(commentId);
        

        if (!comment) {
            return res.status(404).json({ message: "Bình luận không tồn tại." });
        }

        const post = await Post.findById(comment.postId);
        
        const isOwner = comment.userId.toString() === userId;
        const isPostOwner = post && post.userId.toString() === userId;

        if (!isOwner && !isPostOwner) {
            return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này." });
        }
        const postId = comment.postId; 

        let commentsDeletedCount = 0;

        if (comment.parentId === null) {
            const result = await Comment.deleteMany({ parentId: commentId });
            commentsDeletedCount = result.deletedCount;
        }

        await comment.deleteOne();
        commentsDeletedCount += 1;

        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -commentsDeletedCount } }); 

        res.status(200).json({ 
            message: "Bình luận và các bình luận trả lời liên quan (nếu có) đã được xóa thành công.",
            deletedCount: commentsDeletedCount
        });
    } catch (err) {
        console.error("Lỗi khi xóa bình luận:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [GET] /comments/:postId - Lấy danh sách bình luận
exports.getCommentsByPost = async (req, res) => {
    const postId = req.params.postId;
    
    try {
        const allComments = await Comment.find({ postId: postId })
            .populate('userId', 'username profilePicture') 
            .sort({ createdAt: -1 }); 

        const buildCommentTree = (comments) => {
            const commentMap = {};
            const rootComments = [];

            comments.forEach(comment => {
                commentMap[comment._id.toString()] = { 
                    ...comment.toObject(), 
                    replies: [] 
                };
            });

            comments.forEach(comment => {
                const commentId = comment._id.toString();
                const parentId = comment.parentId ? comment.parentId.toString() : null;

                if (parentId && commentMap[parentId]) {
                    commentMap[parentId].replies.push(commentMap[commentId]);
                } else {
                    rootComments.push(commentMap[commentId]);
                }
            });

            return rootComments;
        };
        
        const nestedComments = buildCommentTree(allComments);
        
        res.status(200).json(nestedComments); 
        
    } catch (err) {
        console.error("Lỗi khi lấy bình luận:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};