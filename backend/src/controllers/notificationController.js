const Notification = require('../models/Notification');

const getNotifications = async (req, res, next) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('complaintId', 'complaintId title'),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ]);
    return res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    return next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    return res.json({ success: true, updatedCount: result.modifiedCount || 0 });
  } catch (error) {
    return next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    return res.json({ success: true, notification });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getNotifications, markNotificationRead, markAllNotificationsRead };
