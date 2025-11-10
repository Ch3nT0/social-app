const Post = require('../../models/post.model');
const User = require('../../models/user.model');
const Notification = require('../../models/notification.model');

// [POST] /posts 
exports.createPost = async (req, res) => {
    const { userId, content, image } = req.body;
    const currentUserId = req.user?.id || userId; 
    
    try {
        const newPost = new Post({
            userId: currentUserId,
            content,
            image
        });

        const savedPost = await newPost.save();
        
        const currentUser = await User.findById(currentUserId);
        if (currentUser) {
            const receivers = [...(currentUser.following || []), ...(currentUser.friends || [])];

            if (global.io && global.activeUsers && receivers.length > 0) {
                const notificationContent = `đã đăng bài viết mới: "${content.substring(0, 30)}..."`;
                
                receivers.forEach(async (receiverId) => {
                    const receiverIdStr = receiverId.toString();

                    const newNotification = new Notification({
                        senderId: currentUserId,
                        receiverId: receiverIdStr,
                        type: 'new_post',
                        entityId: savedPost._id,
                        content: notificationContent
                    });
                    const savedNotif = await newNotification.save();                    
                    const receiverSocketId = global.activeUsers.get(receiverIdStr);
                    if (receiverSocketId) {
                        global.io.to(receiverSocketId).emit('newNotification', savedNotif);
                    }
                });
            }
        }
        
        res.status(201).json({
            message: "Bài đăng đã được tạo thành công.",
            post: savedPost
        });
    } catch (err) {
        console.error("Lỗi khi tạo bài đăng:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [PUT] /posts/:id 
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

//[DELETE] /posts/:id 
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

// [PUT] /posts/:id/like 
exports.likePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user?.userId; 
    
    if (!userId) { return res.status(401).json({ message: "Yêu cầu xác thực." }); }

    try {
        const post = await Post.findById(postId);
        if (!post) { return res.status(404).json({ message: "Bài đăng không tồn tại." }); }
        
        const postOwnerId = post.userId.toString();
        const isCurrentlyLiked = post.likes.includes(userId);
        let actionMessage;
        let newCount = post.likes.length;

        if (!isCurrentlyLiked) {
            await post.updateOne({ $push: { likes: userId } });
            actionMessage = "Bài đăng đã được thích (Like).";
            newCount++;

            if (userId !== postOwnerId) { 
                const newNotification = new Notification({
                    senderId: userId,
                    receiverId: postOwnerId,
                    type: 'like',
                    entityId: post._id,
                    content: `đã thích bài viết của bạn.`
                });
                const savedNotif = await newNotification.save();
                
                const receiverSocketId = global.activeUsers.get(postOwnerId);
                if (global.io && receiverSocketId) {
                    global.io.to(receiverSocketId).emit('newNotification', savedNotif);
                }
            }
            
        } else {
            await post.updateOne({ $pull: { likes: userId } });
            actionMessage = "Đã bỏ thích (Unlike) bài đăng.";
            newCount--;
            await Notification.deleteOne({ 
                senderId: userId, 
                receiverId: postOwnerId,
                type: 'like',
                entityId: post._id
            });
        }        
        if (global.io) {
            global.io.emit('postLiked', {
                postId: postId,
                userId: userId,
                isLiked: !isCurrentlyLiked,
                newCount: newCount
            });
        }
        
        res.status(200).json({ message: actionMessage });
        
    } catch (err) {
        console.error("Lỗi khi thích/bỏ thích bài đăng:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [GET] /posts/:id 
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

//[GET] /posts/timeline/:userId 
exports.getTimelinePosts = async (req, res) => {
    const currentUserId = req.params.userId;
    try {
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }
        const followingIds = currentUser.following || [];
        const friendIds = currentUser.friends || [];
        const allRelevantIds = [...new Set([...followingIds, ...friendIds])];
        const [currentUserPosts, externalPosts] = await Promise.all([

            Post.find({ userId: currentUserId })
                .populate('userId', 'username profilePicture')
                .sort({ createdAt: -1 })
                .exec(),

            Post.find({ userId: { $in: allRelevantIds } })
                .populate('userId', 'username profilePicture')
                .sort({ createdAt: -1 })
                .limit(50)
                .exec()
        ]);

        const allPosts = currentUserPosts.concat(externalPosts);
        allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.status(200).json(allPosts);
    } catch (err) {
        console.error("Lỗi khi lấy dòng thời gian:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [GET] /posts/user/:userId
exports.getUserPosts = async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const userPosts = await Post.find({ userId: userId })
            .populate('userId', 'username profilePicture') 
            .sort({ createdAt: -1 });

        res.status(200).json(userPosts);
    } catch (err) {
        console.error("Lỗi khi lấy bài đăng của người dùng:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};