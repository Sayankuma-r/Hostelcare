const Complaint = require('../models/Complaint');

const getStaffDashboard = async (req, res, next) => {
  try {
    const assignedTo = req.user._id;
    const [totalAssignedTasks, pendingTasks, inProgressTasks, completedTasks, recentComplaints] = await Promise.all([
      Complaint.countDocuments({ assignedTo }),
      Complaint.countDocuments({ assignedTo, status: 'ASSIGNED' }),
      Complaint.countDocuments({ assignedTo, status: 'IN_PROGRESS' }),
      Complaint.countDocuments({ assignedTo, status: { $in: ['RESOLVED', 'CLOSED'] } }),
      Complaint.find({ assignedTo })
        .sort({ updatedAt: -1 })
        .limit(8)
        .populate('studentId', 'name email hostel block roomNumber'),
    ]);

    return res.json({
      success: true,
      stats: {
        totalAssignedTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
      },
      complaints: recentComplaints,
    });
  } catch (error) {
    return next(error);
  }
};

const getStaffComplaints = async (req, res, next) => {
  try {
    const requestedPage = Number(req.query.page);
    const requestedLimit = Number(req.query.limit);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 50) : 20;
    const query = { assignedTo: req.user._id };
    if (typeof req.query.status === 'string' && req.query.status) query.status = req.query.status;
    if (typeof req.query.category === 'string' && req.query.category) query.category = req.query.category;
    if (typeof req.query.priority === 'string' && req.query.priority) query.priority = req.query.priority;
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const search = req.query.search.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } },
      ];
    }

    const [total, complaints] = await Promise.all([
      Complaint.countDocuments(query),
      Complaint.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('studentId', 'name email hostel block roomNumber'),
    ]);

    return res.json({ success: true, complaints, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getStaffDashboard, getStaffComplaints };
