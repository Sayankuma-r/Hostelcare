const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

const audienceQuery = (user) => {
  const query = {
    status: 'Published',
    audience: user.role,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  };
  if (user.hostel) query.hostel = { $in: ['', user.hostel] };
  else query.hostel = '';
  if (user.block) query.block = { $in: ['', user.block] };
  else query.block = '';
  return query;
};

const announcementPayload = (body) => ({
  title: body.title,
  content: body.content,
  category: body.category,
  priority: body.priority,
  audience: [...new Set(body.audience)],
  hostel: body.hostel || '',
  block: body.block || '',
  expiresAt: body.expiresAt || null,
});

const removeReadBy = (announcement, isRead = false) => {
  const value = announcement.toObject ? announcement.toObject() : { ...announcement };
  delete value.readBy;
  return { ...value, isRead };
};

const notifyAudience = async (announcement) => {
  if (
    announcement.priority !== 'High' &&
    announcement.priority !== 'Urgent' &&
    announcement.category !== 'Emergency'
  ) {
    return;
  }

  const userQuery = { role: { $in: announcement.audience } };
  if (announcement.hostel) userQuery.hostel = announcement.hostel;
  if (announcement.block) userQuery.block = announcement.block;
  const recipients = await User.find(userQuery).select('_id');
  if (!recipients.length) return;

  await Notification.insertMany(
    recipients.map(({ _id }) => ({
      userId: _id,
      announcementId: announcement._id,
      message: `Important hostel announcement: ${announcement.title}`,
    }))
  );
};

const getAnnouncements = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : audienceQuery(req.user);
    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    const unreadCount =
      req.user.role === 'admin'
        ? 0
        : await Announcement.countDocuments({ ...query, readBy: { $ne: req.user._id } });
    const items = announcements.map((announcement) =>
      removeReadBy(announcement, announcement.readBy?.some((userId) => userId.toString() === req.user._id.toString()))
    );

    return res.json({ success: true, announcements: items, unreadCount });
  } catch (error) {
    return next(error);
  }
};

const getAnnouncementById = async (req, res, next) => {
  try {
    const query =
      req.user.role === 'admin'
        ? { _id: req.params.id }
        : { ...audienceQuery(req.user), _id: req.params.id };
    const announcement = await Announcement.findOne(query);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const isRead = announcement.readBy.some((userId) => userId.toString() === req.user._id.toString());
    return res.json({ success: true, announcement: removeReadBy(announcement, isRead) });
  } catch (error) {
    return next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const payload = announcementPayload(req.body);
    const announcement = await Announcement.create({
      ...payload,
      status: req.body.status || 'Draft',
      publishedAt: req.body.status === 'Published' ? new Date() : null,
      createdBy: req.user._id,
    });
    if (announcement.status === 'Published') await notifyAudience(announcement);

    return res.status(201).json({
      success: true,
      announcement: removeReadBy(announcement),
    });
  } catch (error) {
    return next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

    Object.assign(announcement, announcementPayload(req.body));
    let becamePublished = false;
    if (req.body.status) {
      becamePublished = announcement.status !== 'Published' && req.body.status === 'Published';
      announcement.status = req.body.status;
      if (becamePublished) announcement.publishedAt = new Date();
    }
    await announcement.save();
    if (becamePublished) await notifyAudience(announcement);

    return res.json({ success: true, announcement: removeReadBy(announcement) });
  } catch (error) {
    return next(error);
  }
};

const updateAnnouncementStatus = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

    const becamePublished = announcement.status !== 'Published' && req.body.status === 'Published';
    announcement.status = req.body.status;
    if (becamePublished) announcement.publishedAt = new Date();
    await announcement.save();
    if (becamePublished) await notifyAudience(announcement);

    return res.json({ success: true, announcement: removeReadBy(announcement) });
  } catch (error) {
    return next(error);
  }
};

const markAnnouncementRead = async (req, res, next) => {
  try {
    const announcement = await Announcement.findOne({
      ...audienceQuery(req.user),
      _id: req.params.id,
    }).select('_id');
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await Announcement.updateOne(
      { _id: announcement._id },
      { $addToSet: { readBy: req.user._id } }
    );
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  updateAnnouncementStatus,
  markAnnouncementRead,
};
