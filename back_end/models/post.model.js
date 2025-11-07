const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        max: 500
    },
    image: {
        type: String 
    },
    likes: {
        type: Array,
        default: []
    },
    commentsCount: {
        type: Number,
        default: 0 // Số lượng comment (dùng để hiển thị nhanh)
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);