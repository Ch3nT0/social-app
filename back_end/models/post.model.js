const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    userId: {
        // Tham chiếu đến ID của người dùng đã tạo bài đăng
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        max: 500
    },
    image: {
        type: String // URL hoặc path của ảnh/video
    },
    likes: {
        // Mảng chứa ID của người dùng đã thích bài đăng này
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