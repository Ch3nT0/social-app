const Comment = require('../../models/comment.model');
const Post = require('../../models/post.model'); 

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
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                 return res.status(404).json({ message: "Bình luận cha không tồn tại." });
            }
            if (parentComment.postId.toString() !== postId) {
                return res.status(400).json({ message: "Bình luận cha không thuộc bài đăng này." });
            }
        } 
        const newComment = new Comment({ postId, userId, text, parentId }); 
        const savedComment = await newComment.save();
        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }); 
        const populatedComment = await Comment.findById(savedComment._id)
            .populate('userId', 'username profilePicture');
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