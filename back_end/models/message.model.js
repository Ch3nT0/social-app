const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: {
        // ID của cuộc trò chuyện mà tin nhắn này thuộc về
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: {
        // ID của người gửi tin nhắn
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'emoji'], 
        default: 'text',
        required: true
    },
    content: {
        type: String,
        required: true,
        max: 1000 
    },
    metadata: {
        type: Object,
        default: {} // Ví dụ: { fileName: "tài_liệu.pdf", fileSize: 1024, mimeType: "application/pdf" }
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);