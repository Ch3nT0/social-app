const FriendRequest = require('../../models/friendRequest.model');
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
        const request = await FriendRequest.findById(requestId);

        if (!request) { return res.status(404).json({ message: "Lời mời kết bạn không tồn tại." }); }

        if (request.receiverId.toString() !== receiverId) {
            return res.status(403).json({ message: "Bạn không phải là người nhận của lời mời này." });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Lời mời đã ở trạng thái ${request.status}.` });
        }

        const senderId = request.senderId;

        await Promise.all([
            FriendRequest.findByIdAndUpdate(requestId, { status: 'accepted' }),
            User.findByIdAndUpdate(senderId, { $push: { friends: receiverId } }),
            User.findByIdAndUpdate(receiverId, { $push: { friends: senderId } })
        ]);
        
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

        await FriendRequest.findByIdAndUpdate(requestId, { status: 'rejected' }); 

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