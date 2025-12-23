const Post = require('../../models/post.model');
const User = require('../../models/user.model');
const Notification = require('../../models/notification.model');

// [POST] /posts
exports.createPost = async (req, res) => {
    const userId = req.user?.id || req.body.userId; 
    const { content, image, model3d, video,visibility } = req.body;

    if (!userId) {
        return res.status(401).json({ message: "Yêu cầu xác thực để tạo bài đăng." });
    }

    try {
        // 1. Tạo bản ghi bài viết mới
        const newPost = new Post({
            userId,
            content,
            image: image || [],
            model3d: model3d || "",
            video: video || "" ,
            visibility: visibility || "public"
        });

        const savedPost = await newPost.save();
        
        // 2. Lấy thông tin người đăng để xử lý thông báo
        const currentUser = await User.findById(userId);
        
        // Gộp ID người theo dõi và ID bạn bè (loại bỏ trùng lặp)
        const followers = currentUser.followers || [];
        const friends = currentUser.friends || [];
        const receivers = [...new Set([...followers.map(id => id.toString()), ...friends.map(id => id.toString())])];

        // Rút gọn nội dung cho thông báo dựa trên loại media
        let mediaTypeLabel = "bài viết mới";
        if (video) mediaTypeLabel = "một video mới";
        else if (model3d) mediaTypeLabel = "một mô hình 3D";
        else if (image && image.length > 0) mediaTypeLabel = "ảnh mới";

        const notificationContent = `đã đăng ${mediaTypeLabel}: "${content ? content.substring(0, 30) : ""}..."`;
        
        // 3. Xử lý THÔNG BÁO VÀ SOCKET REAL-TIME
        if (global.io && receivers.length > 0) {
            // Tối ưu hóa: Không dùng await bên trong vòng lặp map đơn lẻ nếu danh sách quá lớn, 
            // nhưng với Notification cần lưu DB nên dùng Promise.all là hợp lý.
            await Promise.all(receivers.map(async (receiverIdStr) => {
                // Không gửi thông báo cho chính mình
                if (receiverIdStr === userId.toString()) return;

                // Tạo bản ghi thông báo
                const newNotification = new Notification({
                    senderId: userId,
                    receiverId: receiverIdStr,
                    type: 'new_post',
                    entityId: savedPost._id,
                    content: notificationContent
                });
                
                const savedNotif = await newNotification.save();
                
                // Populate thông tin người gửi để frontend hiển thị avatar/tên ngay lập tức
                const populatedNotif = await Notification.findById(savedNotif._id)
                    .populate('senderId', 'username profilePicture');
                
                // Gửi tín hiệu real-time qua Socket.io
                const receiverSocketId = global.activeUsers.get(receiverIdStr);
                if (receiverSocketId) {
                    global.io.to(receiverSocketId).emit('newNotification', populatedNotif);
                }
            }));
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
    const { userId } = req.user;

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

// [GET] /posts/timeline/:userId
exports.getTimelinePosts = async (req, res) => {
    const observerId = req.user?.userId; 
    try {
        if (!observerId) {
            const publicPosts = await Post.find({ visibility: 'public' })
                .populate('userId', 'username profilePicture')
                .sort({ createdAt: -1 })
                .limit(50)
                .exec();
            return res.status(200).json(publicPosts);
        }
        const currentUser = await User.findById(observerId);
        if (!currentUser) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }
        const followingIds = currentUser.following || [];
        const friendIds = currentUser.friends || [];
        
        // Gộp danh sách người liên quan
        const allRelevantIds = [...new Set([...followingIds.map(id => id.toString()), ...friendIds.map(id => id.toString())])];

        const [currentUserPosts, externalPosts] = await Promise.all([
            Post.find({ userId: observerId })
                .populate('userId', 'username profilePicture')
                .sort({ createdAt: -1 })
                .exec(),

            Post.find({
                userId: { $in: allRelevantIds },
                $or: [
                    { visibility: 'public' }, 
                    { 
                        visibility: 'friends', 
                        userId: { $in: friendIds } 
                    }
                ]
            })
                .populate('userId', 'username profilePicture')
                .sort({ createdAt: -1 })
                .limit(50)
                .exec()
        ]);

        // Gộp và sắp xếp lại
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
    const targetUserId = req.params.userId; 
    const observerId = req.user?.userId;    

    try {
        let query = { userId: targetUserId };
        if (observerId !== targetUserId) {
            let isFriend = false;            
            if (observerId) {
                const observerUser = await User.findById(observerId);
                isFriend = observerUser?.friends.includes(targetUserId);
            }

            query.$or = [
                { visibility: 'public' },
                ...(isFriend ? [{ visibility: 'friends' }] : [])
            ];
        }
        const userPosts = await Post.find(query)
            .populate('userId', 'username profilePicture') 
            .sort({ createdAt: -1 });

        res.status(200).json(userPosts);
    } catch (err) {
        console.error("Lỗi khi lấy bài đăng:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [PATCH] /posts/:id/visibility
exports.updateVisibility = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json("Không tìm thấy bài viết");

        if (post.userId.toString() !== req.user.userId) {
            return res.status(403).json("Bạn chỉ có thể chỉnh sửa bài viết của chính mình");
        }

        post.visibility = req.body.visibility;
        await post.save();

        res.status(200).json({ message: "Cập nhật quyền riêng tư thành công", visibility: post.visibility });
    } catch (err) {
        res.status(500).json(err);
    }
};