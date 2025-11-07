const Post = require('../../models/post.model');
const User = require('../../models/user.model');

// [POST] /api/posts
exports.createPost = async (req, res) => {
    const { userId, content, image } = req.body; 
    
    try {
        const newPost = new Post({
            userId,
            content,
            image
        });

        const savedPost = await newPost.save();
        res.status(201).json({ 
            message: "Bài đăng đã được tạo thành công.",
            post: savedPost
        });
    } catch (err) {
        console.error("Lỗi khi tạo bài đăng:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [PUT] /api/posts/:id 
exports.updatePost = async (req, res) => {
    const postId = req.params.id;
    const { userId, content, image } = req.body; 

    try {
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: "Bài đăng không tồn tại." });
        }

        if (post.userId.toString() !== userId) { 
            return res.status(403).json({ message: "Bạn chỉ có thể cập nhật bài đăng của mình." });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $set: { content, image } }, 
            { new: true } 
        );

        res.status(200).json({ 
            message: "Bài đăng đã được cập nhật thành công.",
            post: updatedPost
        });
    } catch (err) {
        console.error("Lỗi khi cập nhật bài đăng:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

//[DELETE] /api/posts/:id 
exports.deletePost = async (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body; 

    try {
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: "Bài đăng không tồn tại." });
        }

        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: "Bạn chỉ có thể xóa bài đăng của mình." });
        }

        await post.deleteOne();

        res.status(200).json({ message: "Bài đăng đã được xóa thành công." });
    } catch (err) {
        console.error("Lỗi khi xóa bài đăng:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

//[PUT] /api/posts/:id/like
exports.likePost = async (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body; 

    try {
        const post = await Post.findById(postId);
        
        if (!post) {
             return res.status(404).json({ message: "Bài đăng không tồn tại." });
        }
        
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } });
            res.status(200).json({ message: "Bài đăng đã được thích (Like)." });
        } else {
            await post.updateOne({ $pull: { likes: userId } });
            res.status(200).json({ message: "Đã bỏ thích (Unlike) bài đăng." });
        }
    } catch (err) {
        console.error("Lỗi khi thích/bỏ thích bài đăng:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [GET] /api/posts/:id 
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('userId', 'username email profilePicture'); 

        if (!post) {
            return res.status(404).json({ message: "Bài đăng không tồn tại." });
        }

        res.status(200).json(post);
    } catch (err) {
        console.error("Lỗi khi lấy bài đăng:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

//[GET] /api/posts/timeline/:userId 
exports.getTimelinePosts = async (req, res) => {
    console.log("getTimelinePosts called");
    const currentUserId = req.params.userId;

    try {
        const currentUserPosts = await Post.find({ userId: currentUserId }).sort({ createdAt: -1 });

        const currentUser = await User.findById(currentUserId);
        const friendIds = currentUser ? currentUser.followings : []; 

        const friendPosts = await Post.find({ userId: { $in: friendIds } })
            .populate('userId', 'username profilePicture') 
            .sort({ createdAt: -1 })
            .limit(50); 

        const allPosts = currentUserPosts.concat(friendPosts);
        allPosts.sort((a, b) => b.createdAt - a.createdAt);

        res.status(200).json(allPosts);
    } catch (err) {
        console.error("Lỗi khi lấy dòng thời gian:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};