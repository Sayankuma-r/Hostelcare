const Complaint = require('../models/Complaint');
const User = require('../models/User');

const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalComplaints,
      pendingComplaints,
      assignedComplaints,
      inProgressComplaints,
      resolvedComplaints,
      recentComplaints,
      categoryData,
      statusData,
      monthlyData,
      staffPerformance,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Complaint.countDocuments({}),
      Complaint.countDocuments({ status: { $in: ['SUBMITTED', 'REOPENED'] } }),
      Complaint.countDocuments({ status: 'ASSIGNED' }),
      Complaint.countDocuments({ status: 'IN_PROGRESS' }),
      Complaint.countDocuments({ status: { $in: ['RESOLVED', 'CLOSED'] } }),
      Complaint.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('studentId', 'name email')
        .populate('assignedTo', 'name role'),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Complaint.aggregate([
        {
          $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Complaint.aggregate([
        { $match: { assignedTo: { $ne: null } } },
        {
          $group: {
            _id: '$assignedTo',
            assignedCount: { $sum: 1 },
            resolvedCount: {
              $sum: { $cond: [{ $in: ['$status', ['RESOLVED', 'CLOSED']] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: User.collection.name,
            localField: '_id',
            foreignField: '_id',
            as: 'staff',
          },
        },
        { $unwind: '$staff' },
        {
          $project: {
            _id: 1,
            name: '$staff.name',
            assignedCount: 1,
            resolvedCount: 1,
            resolutionRate: {
              $multiply: [{ $divide: ['$resolvedCount', '$assignedCount'] }, 100],
            },
          },
        },
        { $sort: { resolvedCount: -1, assignedCount: -1 } },
      ]),
    ]);

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalComplaints,
        pendingComplaints,
        assignedComplaints,
        inProgressComplaints,
        resolvedComplaints,
      },
      categoryData,
      statusData,
      monthlyData,
      staffPerformance,
      recentComplaints,
    });
  } catch (error) {
    return next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const role = req.query.role || 'all';
    if (!['all', 'student', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid user role filter' });
    }

    const requestedPage = Number(req.query.page);
    const requestedLimit = Number(req.query.limit);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 50;
    const query = role === 'all' ? {} : { role };
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const search = req.query.search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-password'),
    ]);
    return res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    return next(error);
  }
};

const createStaffUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (
      typeof name !== 'string' ||
      name.trim().length < 2 ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, valid email and a password between 8 and 72 characters are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: typeof phone === 'string' ? phone.trim() : '',
      role: 'staff',
    });

    return res.status(201).json({ success: true, user: user.toPublicJSON() });
  } catch (error) {
    return next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!['student', 'staff'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be student or staff' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    user.role = role;
    await user.save();

    return res.json({ success: true, user: user.toPublicJSON ? user.toPublicJSON() : user });
  } catch (error) {
    return next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const summary = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return res.json({ success: true, summary });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAdminDashboard, getUsers, createStaffUser, updateUserRole, getReports };
