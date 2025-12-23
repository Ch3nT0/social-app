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
    model3d: {
        type: String,
        default: ""
    },
    image: {
        type: [String],
        default: []
    },
    video: {
        type: String,
        default: ""
    },
    visibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: []
    },
    commentsCount: {
        type: Number,
        default: 0
    }
},
    { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);