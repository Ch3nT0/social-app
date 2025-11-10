const Notification = require('../models/notification.model');

// [GET] /notifications - Lấy danh sách thông báo
exports.getNotifications = async (req, res) => {
    const userId = req.user?.id;
    try {
        const notifications = await Notification.find({ receiverId: userId })
            .populate('senderId', 'username profilePicture')
            .sort({ createdAt: -1 }) // Sắp xếp mới nhất lên trước
            .limit(20);

        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi lấy thông báo.", error: err.message });
    }
};

// [PUT] /notifications/read - Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
    const userId = req.user?.id;
    const { notificationId } = req.body;
    try {
        if (notificationId) {
            await Notification.findOneAndUpdate(
                { _id: notificationId, receiverId: userId },
                { isRead: true }
            );
        } else {
            await Notification.updateMany(
                { receiverId: userId, isRead: false },
                { isRead: true }
            );
        }
        res.status(200).json({ message: "Cập nhật trạng thái đọc thành công." });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi đánh dấu đã đọc.", error: err.message });
    }
};