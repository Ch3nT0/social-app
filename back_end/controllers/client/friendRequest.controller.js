const FriendRequest = require('../../models/friendRequest.model');
const notificationModel = require('../../models/notification.model');
const User = require('../../models/user.model');

const getCurrentUserId = (req) => req.user?.userId || req.body.userId;

// [POST] /friends/add/:receiverId
exports.sendFriendRequest = async (req, res) => {
    const senderId = getCurrentUserId(req);
    const receiverId = req.params.receiverId;
    if (!senderId) {
        return res.status(401).json({ message: "Yêu cầu xác thực." });
    }
    if (senderId === receiverId) {
        return res.status(400).json({ message: "Bạn không thể tự gửi lời mời kết bạn cho chính mình." });
    }
    try {
        const sender = await User.findById(senderId);
        if (!sender) { return res.status(404).json({ message: "Người gửi không tồn tại." }); }

        if (sender && sender.friends && sender.friends.includes(receiverId)) {
            return res.status(400).json({ message: "Hai người đã là bạn bè." });
        }
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { senderId: senderId, receiverId: receiverId, status: 'pending' },
                { senderId: receiverId, receiverId: senderId, status: 'pending' }
            ]
        });
        if (existingRequest) {
            if (existingRequest.senderId.toString() === receiverId) {
                return res.status(400).json({ message: "Người dùng này đã gửi lời mời kết bạn cho bạn. Vui lòng chấp nhận." });
            }
            return res.status(400).json({ message: "Lời mời kết bạn đã được gửi trước đó và đang chờ xử lý." });
        }
        const newRequest = new FriendRequest({
            senderId,
            receiverId,
            status: 'pending'
        });
        const savedRequest = await newRequest.save();
        const newNotification = new notificationModel({
            senderId: senderId,
            receiverId: receiverId,
            type: 'friend_request',
            entityId: savedRequest._id,
            content: `đã gửi cho bạn lời mời kết bạn.`
        });
        const savedNotif = await newNotification.save();
        const receiverSocketId = global.activeUsers.get(receiverId);
        if (global.io && receiverSocketId) {
            global.io.to(receiverSocketId).emit('newNotification', savedNotif);
        }
        res.status(201).json({
            message: "Lời mời kết bạn đã được gửi.",
            request: savedRequest
        });
    } catch (err) {
        console.error("Lỗi khi gửi lời mời kết bạn:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [PUT] /friends/accept/:requestId
exports.acceptFriendRequest = async (req, res) => {
    const receiverId = getCurrentUserId(req);
    const requestId = req.params.requestId;
    if (!receiverId) { return res.status(401).json({ message: "Yêu cầu xác thực." }); }

    try {
        const request = await FriendRequest.findOne({ _id: requestId, status: 'pending' });

        if (!request) {
            return res.status(404).json({ message: "Lời mời kết bạn không tồn tại hoặc đã được xử lý." });
        }

        if (request.receiverId.toString() !== receiverId) {
            return res.status(403).json({ message: "Bạn không phải là người nhận của lời mời này." });
        }

        const senderId = request.senderId;

        await Promise.all([
            FriendRequest.findByIdAndDelete(requestId),
            User.findByIdAndUpdate(senderId, { $push: { friends: receiverId } }),
            User.findByIdAndUpdate(receiverId, { $push: { friends: senderId } })
        ]);
        const newNotification = new notificationModel({
            senderId: receiverId,
            receiverId: senderId,
            type: 'friend_accept',
            entityId: receiverId,
            content: `đã chấp nhận lời mời kết bạn của bạn.`
        });
        const savedNotif = await newNotification.save();
        const senderSocketId = global.activeUsers.get(senderId.toString());
        if (global.io && senderSocketId) {
            global.io.to(senderSocketId).emit('newNotification', savedNotif);
        }
        res.status(200).json({ message: "Đã chấp nhận lời mời kết bạn. Hai bạn đã là bạn bè!" });
    } catch (err) {
        console.error("Lỗi khi chấp nhận lời mời:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [PUT] /friends/reject/:requestId
exports.rejectFriendRequest = async (req, res) => {
    const receiverId = getCurrentUserId(req);
    const requestId = req.params.requestId;
    if (!receiverId) { return res.status(401).json({ message: "Yêu cầu xác thực." }); }
    try {
        const request = await FriendRequest.findById(requestId);
        if (!request) { return res.status(404).json({ message: "Lời mời kết bạn không tồn tại." }); }
        if (request.receiverId.toString() !== receiverId) {
            return res.status(403).json({ message: "Bạn không có quyền từ chối lời mời này." });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Lời mời đã ở trạng thái ${request.status}.` });
        }
        await FriendRequest.findByIdAndDelete(requestId);

        await notificationModel.deleteOne({
            entityId:requestId,
            type: 'friend_request',
        });

        res.status(200).json({ message: "Đã từ chối lời mời kết bạn." });
    } catch (err) {
        console.error("Lỗi khi từ chối lời mời:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [DELETE] /friends/cancel/:requestId
exports.cancelFriendRequest = async (req, res) => {
    const senderId = getCurrentUserId(req);
    const requestId = req.params.requestId;
    if (!senderId) { return res.status(401).json({ message: "Yêu cầu xác thực." }); }
    try {
        const request = await FriendRequest.findById(requestId);
        if (!request) { return res.status(404).json({ message: "Lời mời kết bạn không tồn tại." }); }

        if (request.senderId.toString() !== senderId) {
            return res.status(403).json({ message: "Bạn không phải là người gửi lời mời này." });
        }
        await notificationModel.deleteOne({
            entityId:requestId,
            type: 'friend_request',
            receiverId: request.receiverId
        });
        await FriendRequest.findByIdAndDelete(requestId);
        res.status(200).json({ message: "Đã hủy lời mời kết bạn thành công." });
    } catch (err) {
        console.error("Lỗi khi hủy lời mời:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [GET] /friends/requests/:userId 
exports.getPendingRequests = async (req, res) => {
    const receiverId = req.params.userId;
    try {
        const pendingRequests = await FriendRequest.find({
            receiverId: receiverId,
            status: 'pending'
        })
            .populate('senderId', 'username profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json(pendingRequests);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách lời mời:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [DELETE] /friends/:friendId/unfriend
exports.unfriendUser = async (req, res) => {
    const friendId = req.params.friendId;
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
        return res.status(401).json({ message: "Yêu cầu xác thực." });
    }

    if (currentUserId === friendId) {
        return res.status(400).json({ message: "Bạn không thể xóa bạn với chính mình." });
    }

    try {
        const currentUser = await User.findById(currentUserId);
        const userToRemove = await User.findById(friendId);

        if (!currentUser || !userToRemove) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        if (!currentUser.friends.includes(friendId)) {
            return res.status(400).json({ message: "Hai người không phải là bạn bè." });
        }
        await Promise.all([
            currentUser.updateOne({ $pull: { friends: friendId } }),
            userToRemove.updateOne({ $pull: { friends: currentUserId } })
        ]);
        res.status(200).json({ message: `Đã xóa bạn bè với ${userToRemove.username}.` });
    } catch (err) {
        console.error("Lỗi khi xóa bạn bè:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [GET] /friends/suggestions
exports.getSuggestedFriends = async (req, res) => {
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
        return res.status(401).json({ message: "Yêu cầu xác thực." });
    }

    try {
        const user = await User.findById(currentUserId).select('friends');
        const myFriends = user.friends || [];
        const pendingRequests = await FriendRequest.find({
            $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
            status: 'pending'
        });

        const excludedIds = [
            currentUserId, 
            ...myFriends,
            ...pendingRequests.map(r => r.senderId.toString() === currentUserId ? r.receiverId : r.senderId)
        ];
        const suggestions = await User.find({
            _id: { $nin: excludedIds },
            friends: { $in: myFriends }  
        })
        .select('username profilePicture followers friends')
        .limit(10); 
        if (suggestions.length < 5) {
            const extraSuggestions = await User.find({
                _id: { $nin: [...excludedIds, ...suggestions.map(s => s._id)] }
            })
            .select('username profilePicture followers friends')
            .limit(5 - suggestions.length);
            
            suggestions.push(...extraSuggestions);
        }

        res.status(200).json({
            message: "Tải danh sách gợi ý thành công.",
            suggestions
        });

    } catch (err) {
        console.error("Lỗi khi lấy gợi ý kết bạn:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

// [GET] /friends/check_requests/:userId 
exports.getCheckRequests = async (req, res) => {
    const receiverId = req.params.userId; 
    const senderId = req.user.userId;
    console.log("Checking friend requests between:", senderId, "and", receiverId);
    try {
        // Tìm lời mời giữa 2 người (A gửi B hoặc B gửi A)
        const request = await FriendRequest.findOne({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).populate('senderId receiverId', 'username profilePicture');

        if (!request) {
            return res.status(200).json({ status: "none", message: "Không có yêu cầu kết bạn nào." });
        }

        // Xác định vai trò của người dùng hiện tại
        const isSender = request.senderId._id.toString() === senderId.toString();

        res.status(200).json({
            status: request.status, // 'pending', 'accepted', v.v.
            isCurrentUserSource: isSender, // true nếu bạn là người gửi, false nếu bạn là người nhận
            requestDetails: request
        });

    } catch (err) {
        console.error("Lỗi khi kiểm tra lời mời:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};