const Comment = require('../../models/comment.model');
const Post = require('../../models/post.model'); 


///api/comments 
exports.createComment = async (req, res) => {
    const { postId, userId, text } = req.body;     
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Bài đăng không tồn tại để bình luận." });
        }

        const newComment = new Comment({
            postId,
            userId, 
            text
        });

        const savedComment = await newComment.save();
        
        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }); 

        res.status(201).json({ 
            message: "Bình luận đã được tạo thành công.",
            comment: savedComment
        });
    } catch (err) {
        console.error("Lỗi khi tạo bình luận:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

//[DELETE] /api/comments/:id
exports.deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const { userId } = req.body; 
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
        
        await comment.deleteOne();

        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: -1 } }); 

        res.status(200).json({ message: "Bình luận đã được xóa thành công." });
    } catch (err) {
        console.error("Lỗi khi xóa bình luận:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

//[GET] /api/comments/:postId 
exports.getCommentsByPost = async (req, res) => {
    const postId = req.params.postId;
    
    try {
        const comments = await Comment.find({ postId: postId })
            .populate('userId', 'username profilePicture') 
            .sort({ createdAt: 1 }); 
        
        if (comments.length === 0) {
            return res.status(200).json({ message: "Bài đăng chưa có bình luận nào.", comments: [] });
        }

        res.status(200).json(comments);
    } catch (err) {
        console.error("Lỗi khi lấy bình luận:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};