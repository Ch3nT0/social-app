const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    members: {
        // Mảng chứa ID của tất cả người dùng tham gia cuộc trò chuyện (thường là 2)
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: true
    },
    lastMessage: {
        // Nội dung tin nhắn cuối cùng (dùng để hiển thị nhanh trong danh sách chat)
        type: String,
        default: ""
    }
},
{ timestamps: true }
);

ConversationSchema.index({ members: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", ConversationSchema);