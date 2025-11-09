const FriendRequest = require('../../models/friendRequest.model');
const User = require('../../models/user.model');
const bcrypt = require('bcrypt');


// [PUT] /users/:id - Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    if (req.body.currentUserId === userId || req.body.isAdmin) {
        try {
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }

            const user = await User.findByIdAndUpdate(userId, {
                $set: req.body,
            }, { new: true });

            const { password, ...other } = user._doc;
            res.status(200).json({
                message: "Cập nhật tài khoản thành công!",
                user: other
            });
        } catch (err) {
            console.error("Lỗi khi cập nhật user:", err);
            res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
        }
    } else {
        return res.status(403).json({ message: "Bạn chỉ được cập nhật tài khoản của chính mình!" });
    }
};

// [DELETE] /users/:id - Xóa tài khoản
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;

    if (req.body.currentUserId === userId || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(userId);
            res.status(200).json({ message: "Xóa tài khoản thành công." });
        } catch (err) {
            console.error("Lỗi khi xóa user:", err);
            res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
        }
    } else {
        return res.status(403).json({ message: "Bạn chỉ được xóa tài khoản của chính mình!" });
    }
};

// [GET] /users/:id - Lấy thông tin người dùng
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [GET] /users/friends/:userId - Lấy danh sách bạn bè
exports.getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        const friends = await Promise.all(
            user.friends.map((friendId) => {
                return User.findById(friendId).select('username profilePicture');
            })
        );

        res.status(200).json(friends);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách bạn bè:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [PUT] /users/:id/follow - Theo dõi người dùng
exports.followUser = async (req, res) => {
    const userIdToFollow = req.params.id;
    const currentUserId = req.body.currentUserId;

    if (currentUserId === userIdToFollow) {
        return res.status(403).json({ message: "Bạn không thể tự theo dõi chính mình." });
    }

    try {
        const userToFollow = await User.findById(userIdToFollow);
        const currentUser = await User.findById(currentUserId);

        if (!userToFollow) {
            return res.status(404).json({ message: "Người dùng này không tồn tại." });
        }

        if (userToFollow.followers.includes(currentUserId)) {
            return res.status(400).json({ message: "Bạn đã theo dõi người dùng này rồi." });
        }
        await userToFollow.updateOne({ $push: { followers: currentUserId } });
        await currentUser.updateOne({ $push: { following: userIdToFollow } });

        res.status(200).json({ message: "Theo dõi người dùng thành công." });
    } catch (err) {
        console.error("Lỗi khi follow user:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

//[PUT] /users/:id/unfollow - Bỏ theo dõi người dùng
exports.unfollowUser = async (req, res) => {
    const userIdToUnfollow = req.params.id;
    const currentUserId = req.body.currentUserId;

    if (currentUserId === userIdToUnfollow) {
        return res.status(403).json({ message: "Bạn không thể tự bỏ theo dõi chính mình." });
    }

    try {
        const userToUnfollow = await User.findById(userIdToUnfollow);
        const currentUser = await User.findById(currentUserId);

        if (!userToUnfollow) {
            return res.status(404).json({ message: "Người dùng này không tồn tại." });
        }

        if (!userToUnfollow.followers.includes(currentUserId)) {
            return res.status(400).json({ message: "Bạn chưa theo dõi người dùng này." });
        }

        await userToUnfollow.updateOne({ $pull: { followers: currentUserId } });

        await currentUser.updateOne({ $pull: { following: userIdToUnfollow } });

        res.status(200).json({ message: "Bỏ theo dõi thành công." });
    } catch (err) {
        console.error("Lỗi khi unfollow user:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [GET] /api/users/search?q=keyword
exports.searchUsers = async (req, res) => {
    const keyword = req.query.q;
    const currentUserId = req.user?.userId;
    if (!keyword || keyword.length < 2) {
        return res.status(200).json([]);
    }
    try {
        const regex = new RegExp(keyword, 'i');
        let searchResults = await User.find({
            $or: [
                { username: { $regex: regex } },
                { email: { $regex: regex } }
            ],
            _id: { $ne: currentUserId }
        })
            .select('_id username profilePicture city friends')
            .limit(20)
            .lean();
        if (!currentUserId || searchResults.length === 0) {
            return res.status(200).json(searchResults.map(user => ({ ...user, friendshipStatus: 'none' })));
        }

        const resultUserIds = searchResults.map(user => user._id);

        const pendingRequests = await FriendRequest.find({
            status: 'pending',
            $or: [
                { senderId: currentUserId, receiverId: { $in: resultUserIds } },
                { senderId: { $in: resultUserIds }, receiverId: currentUserId }
            ]
        });
        const finalResults = searchResults.map(user => {
            if (user.friends.includes(currentUserId)) {
                return { ...user, friendshipStatus: 'friend' };
            }

            const pendingReq = pendingRequests.find(req =>
                req.senderId.toString() === user._id.toString() || req.receiverId.toString() === user._id.toString()
            );

            if (pendingReq) {
                if (pendingReq.senderId.toString() === currentUserId) {
                    return { ...user, friendshipStatus: 'pending_sent' };
                } else {
                    return { ...user, friendshipStatus: 'pending_received' };
                }
            }

            return { ...user, friendshipStatus: 'none' };
        });

        const finalOutput = finalResults.map(({ friends, ...user }) => user);
        res.status(200).json(finalOutput);

    } catch (err) {
        console.error("Lỗi khi tìm kiếm người dùng:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

