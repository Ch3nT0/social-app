const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema({
    senderId: {
        // ID của người gửi lời mời
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        // ID của người nhận lời mời
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        // Trạng thái lời mời: pending (đang chờ), accepted (đã chấp nhận), rejected (đã từ chối)
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
},
{ timestamps: true }
);

// Đảm bảo không có lời mời trùng lặp giữa hai người dùng
FriendRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

module.exports = mongoose.model("FriendRequest", FriendRequestSchema);