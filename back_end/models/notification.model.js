const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'friend_request', 'friend_accept', 'new_post'],
        required: true,
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true 
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    content: {
        type: String,
        trim: true,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);