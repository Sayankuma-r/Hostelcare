const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { allowedImageTypes } = require('../middleware/complaintUpload');

const buildComplaintQuery = (req, filters = {}) => {
  const query = {};

  if (req.user.role === 'student') {
    query.studentId = req.user._id;
  }

  if (req.user.role === 'staff') {
    query.assignedTo = req.user._id;
  }

  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.priority) query.priority = filters.priority;
  if (filters.search) {
    const escapedSearch = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { complaintId: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  return query;
};

const createNotification = async ({ userId, complaintId, message }) => {
  if (!userId) return null;
  return Notification.create({ userId, complaintId, message });
};

const notifyAdminsAndAssignedStaff = async (complaint, message) => {
  const admins = await User.find({ role: 'admin' });
  const recipients = [...admins.map((admin) => admin._id), complaint.assignedTo].filter(Boolean);
  const recipientIds = [...new Set(recipients.map((userId) => userId.toString()))];

  await Promise.all(
    recipientIds.map((userId) =>
      createNotification({
        userId,
        complaintId: complaint._id,
        message,
      })
    )
  );
};

const addStatusHistory = (complaint, previousStatus, newStatus, updatedBy, remarks = '') => {
  complaint.statusHistory.push({
    from: previousStatus,
    to: newStatus,
    updatedBy,
    remarks,
    timestamp: new Date(),
  });
};

const createComplaint = async (req, res, next) => {
  let savedImagePath;
  let complaintCreated = false;

  try {
    const { title, description, category, priority, hostel, block, roomNumber } = req.body;
    let imageUrl = '';

    if (req.file) {
      const extension = allowedImageTypes.get(req.file.mimetype);
      if (!extension) {
        return res.status(400).json({ success: false, message: 'Image must be JPEG, PNG, or WebP' });
      }

      const filename = `${crypto.randomBytes(16).toString('hex')}${extension}`;
      const uploadDirectory = path.join(__dirname, '..', '..', 'uploads');
      savedImagePath = path.join(uploadDirectory, filename);
      await fs.mkdir(uploadDirectory, { recursive: true });
      await fs.writeFile(savedImagePath, req.file.buffer, { flag: 'wx' });
      imageUrl = `/uploads/${filename}`;
    }

    const complaintId = `HC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const complaint = await Complaint.create({
      complaintId,
      title,
      description,
      category,
      priority,
      hostel,
      block,
      roomNumber,
      studentId: req.user._id,
      imageUrl,
      status: 'SUBMITTED',
      statusHistory: [
        {
          from: 'NEW',
          to: 'SUBMITTED',
          updatedBy: req.user._id,
          remarks: 'Complaint submitted by student',
          timestamp: new Date(),
        },
      ],
    });
    complaintCreated = true;

    const admins = await User.find({ role: 'admin' });
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin._id,
          complaintId: complaint._id,
          message: `New complaint ${complaintId} was submitted by ${req.user.name}`,
        })
      )
    );

    const freshComplaint = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email hostel block roomNumber')
      .populate('assignedTo', 'name email role');

    return res.status(201).json({ success: true, complaint: freshComplaint });
  } catch (error) {
    if (savedImagePath && !complaintCreated) {
      try {
        await fs.unlink(savedImagePath);
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') return next(cleanupError);
      }
    }
    return next(error);
  }
};

const getStudentDashboard = async (req, res, next) => {
  try {
    const [statusCounts, recentComplaints] = await Promise.all([
      Complaint.aggregate([
        { $match: { studentId: req.user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Complaint.find({ studentId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assignedTo', 'name email'),
    ]);

    const counts = Object.fromEntries(statusCounts.map(({ _id, count }) => [_id, count]));
    const stats = {
      total: statusCounts.reduce((total, item) => total + item.count, 0),
      pending: (counts.SUBMITTED || 0) + (counts.REOPENED || 0),
      inProgress: counts.IN_PROGRESS || 0,
      resolved: (counts.RESOLVED || 0) + (counts.CLOSED || 0),
    };

    return res.json({ success: true, stats, recentComplaints });
  } catch (error) {
    return next(error);
  }
};

const getComplaints = async (req, res, next) => {
  try {
    const requestedPage = Number(req.query.page);
    const requestedLimit = Number(req.query.limit);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 50) : 20;
    const filters = {
      status: req.query.status,
      category: req.query.category,
      priority: req.query.priority,
      search: typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '',
    };

    const query = buildComplaintQuery(req, filters);
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('studentId', 'name email hostel block roomNumber')
      .populate('assignedTo', 'name email role');

    return res.json({ success: true, complaints, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    return next(error);
  }
};

const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name email hostel block roomNumber')
      .populate('assignedTo', 'name email role')
      .populate('statusHistory.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const isOwner = req.user.role === 'student' && complaint.studentId && complaint.studentId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isAssignedStaff = req.user.role === 'staff' && complaint.assignedTo && complaint.assignedTo._id.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isAssignedStaff) {
      return res.status(403).json({ success: false, message: 'You are not allowed to view this complaint' });
    }

    return res.json({ success: true, complaint });
  } catch (error) {
    return next(error);
  }
};

const assignComplaint = async (req, res, next) => {
  try {
    const { staffId, remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff') {
      return res.status(400).json({ success: false, message: 'A valid maintenance staff user is required' });
    }

    if (!['SUBMITTED', 'ASSIGNED', 'REOPENED'].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Only submitted or reopened complaints can be assigned' });
    }

    const previousStatus = complaint.status;
    complaint.assignedTo = staff._id;
    complaint.status = 'ASSIGNED';
    addStatusHistory(complaint, previousStatus, 'ASSIGNED', req.user._id, remarks || 'Assigned to maintenance staff');
    await complaint.save();

    await createNotification({
      userId: complaint.studentId,
      complaintId: complaint._id,
      message: `Your complaint ${complaint.complaintId} was assigned to ${staff.name}`,
    });

    await createNotification({
      userId: staff._id,
      complaintId: complaint._id,
      message: `You were assigned complaint ${complaint.complaintId}`,
    });

    return res.json({ success: true, complaint });
  } catch (error) {
    return next(error);
  }
};

const updateComplaintPriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    if (!['Low', 'Medium', 'High', 'Urgent'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Select a valid priority' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.priority = priority;
    await complaint.save();

    await createNotification({
      userId: complaint.studentId,
      complaintId: complaint._id,
      message: `Priority for complaint ${complaint.complaintId} was changed to ${priority}`,
    });

    return res.json({ success: true, complaint });
  } catch (error) {
    return next(error);
  }
};

const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const validStatuses = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }

    const previousStatus = complaint.status;
    if (req.user.role === 'staff') {
      const isAssignedToMe = complaint.assignedTo && complaint.assignedTo.toString() === req.user._id.toString();
      if (!isAssignedToMe) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this complaint' });
      }
      const allowedTransition =
        (previousStatus === 'ASSIGNED' && status === 'IN_PROGRESS') ||
        (previousStatus === 'IN_PROGRESS' && status === 'RESOLVED');
      if (!allowedTransition) {
        return res.status(400).json({ success: false, message: 'Staff can only start assigned work or resolve in-progress work' });
      }

      if (status === 'RESOLVED' && (typeof remarks !== 'string' || remarks.trim().length < 5)) {
        return res.status(400).json({ success: false, message: 'Resolution notes of at least 5 characters are required' });
      }
    } else if (req.user.role === 'student') {
      const isOwner = complaint.studentId.toString() === req.user._id.toString();
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'You can only update your own complaints' });
      }
      if (previousStatus !== 'RESOLVED' || status !== 'CLOSED') {
        return res.status(400).json({ success: false, message: 'Students can only confirm a resolved complaint' });
      }
    } else {
      return res.status(403).json({ success: false, message: 'You are not allowed to update this complaint status' });
    }

    complaint.status = status;
    if (status === 'RESOLVED') complaint.resolvedAt = new Date();
    if (status === 'CLOSED') complaint.closedAt = new Date();
    if (status === 'REOPENED') complaint.closedAt = null;
    if (status === 'RESOLVED') complaint.resolutionNote = remarks.trim();

    addStatusHistory(
      complaint,
      previousStatus,
      status,
      req.user._id,
      typeof remarks === 'string' && remarks.trim() ? remarks.trim() : 'Status updated'
    );
    await complaint.save();

    await createNotification({
      userId: complaint.studentId,
      complaintId: complaint._id,
      message: `Complaint ${complaint.complaintId} moved to ${status}`,
    });
    if (req.user.role === 'student') {
      await notifyAdminsAndAssignedStaff(
        complaint,
        `The student confirmed resolution for complaint ${complaint.complaintId}`
      );
    }

    return res.json({ success: true, complaint });
  } catch (error) {
    return next(error);
  }
};

const closeComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.status !== 'RESOLVED') {
      return res.status(400).json({ success: false, message: 'Only resolved complaints can be closed' });
    }

    const previousStatus = complaint.status;
    complaint.status = 'CLOSED';
    complaint.closedAt = new Date();
    addStatusHistory(complaint, previousStatus, 'CLOSED', req.user._id, 'Closed by admin');
    await complaint.save();

    await createNotification({
      userId: complaint.studentId,
      complaintId: complaint._id,
      message: `Complaint ${complaint.complaintId} has been closed`,
    });

    return res.json({ success: true, complaint });
  } catch (error) {
    return next(error);
  }
};

const reopenComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const isOwner = complaint.studentId.toString() === req.user._id.toString();
    if (req.user.role === 'student' && !isOwner) {
      return res.status(403).json({ success: false, message: 'You can only reopen your own complaints' });
    }
    if (complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED') {
      return res.status(400).json({ success: false, message: 'Only resolved or closed complaints can be reopened' });
    }

    const previousStatus = complaint.status;
    complaint.status = 'REOPENED';
    complaint.closedAt = null;
    addStatusHistory(complaint, previousStatus, 'REOPENED', req.user._id, req.body.remarks || 'Reopened by student');
    await complaint.save();

    await createNotification({
      userId: complaint.studentId,
      complaintId: complaint._id,
      message: `Complaint ${complaint.complaintId} has been reopened`,
    });
    if (req.user.role === 'student') {
      await notifyAdminsAndAssignedStaff(complaint, `Complaint ${complaint.complaintId} was reopened by the student`);
    }

    return res.json({ success: true, complaint });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createComplaint,
  getStudentDashboard,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintPriority,
  updateComplaintStatus,
  closeComplaint,
  reopenComplaint,
};
