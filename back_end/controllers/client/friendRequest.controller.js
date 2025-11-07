const FriendRequest = require('../../models/friendRequest.model');
const User = require('../../models/user.model');


//[POST] /api/friends/add/:receiverId 
exports.sendFriendRequest = async (req, res) => {
    const senderId = req.body.userId; 
    const receiverId = req.params.receiverId;

    if (senderId === receiverId) {
        return res.status(400).json({ message: "Bạn không thể tự gửi lời mời kết bạn cho chính mình." });
    }

    try {
        const sender = await User.findById(senderId);
        if (sender.friends && sender.friends.includes(receiverId)) {
            return res.status(400).json({ message: "Hai người đã là bạn bè." });
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                { senderId: senderId, receiverId: receiverId }, 
                { senderId: receiverId, receiverId: senderId }
            ],
            status: 'pending'
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

//[PUT] /api/friends/accept/:requestId

exports.acceptFriendRequest = async (req, res) => {
    const receiverId = req.body.userId; 
    const requestId = req.params.requestId;

    try {
        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Lời mời kết bạn không tồn tại." });
        }

        if (request.receiverId.toString() !== receiverId) {
            return res.status(403).json({ message: "Bạn không phải là người nhận của lời mời này." });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Lời mời đã ở trạng thái ${request.status}.` });
        }

        const senderId = request.senderId;
        await FriendRequest.findByIdAndUpdate(requestId, { status: 'accepted' });
        await User.findByIdAndUpdate(senderId, { $push: { friends: receiverId } });
        await User.findByIdAndUpdate(receiverId, { $push: { friends: senderId } });
        
        res.status(200).json({ message: "Đã chấp nhận lời mời kết bạn. Hai bạn đã là bạn bè!" });
    } catch (err) {
        console.error("Lỗi khi chấp nhận lời mời:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};

//[PUT] /api/friends/reject/:requestId
exports.rejectFriendRequest = async (req, res) => {
    const receiverId = req.body.userId;
    const requestId = req.params.requestId;

    try {
        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Lời mời kết bạn không tồn tại." });
        }

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

//[DELETE] /api/friends/cancel/:requestId
exports.cancelFriendRequest = async (req, res) => {
    const senderId = req.body.userId;
    const requestId = req.params.requestId;

    try {
        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Lời mời kết bạn không tồn tại." });
        }

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

//[GET] /api/friends/requests/:userId 
exports.getPendingRequests = async (req, res) => {
    const userId = req.params.userId; 

    try {
        const pendingRequests = await FriendRequest.find({ 
            receiverId: userId,
            status: 'pending'
        })
        .populate('senderId', 'username profilePicture') // Lấy thông tin người gửi
        .sort({ createdAt: -1 });

        res.status(200).json(pendingRequests);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách lời mời:", err);
        res.status(500).json({ message: "Lỗi Server nội bộ.", error: err.message });
    }
};