const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');

const createFeedback = async (req, res, next) => {
  try {
    const { complaintId, rating, comment } = req.body;

    if (
      typeof complaintId !== 'string' ||
      typeof rating !== 'number' ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      typeof comment !== 'string' ||
      comment.trim().length < 5 ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({ success: false, message: 'Complaint, rating and comment are required' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only review your own complaints' });
    }

    if (complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED') {
      return res.status(400).json({ success: false, message: 'Feedback is only allowed for resolved complaints' });
    }

    const existingFeedback = await Feedback.findOne({ complaintId, studentId: req.user._id });
    if (existingFeedback) {
      return res.status(409).json({ success: false, message: 'Feedback for this complaint has already been submitted' });
    }

    const feedback = await Feedback.create({
      complaintId,
      studentId: req.user._id,
      rating,
      comment: comment.trim(),
    });

    return res.status(201).json({ success: true, feedback });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Feedback for this complaint has already been submitted' });
    }
    return next(error);
  }
};

const getFeedback = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const query = complaintId ? { complaintId } : {};

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not allowed to view feedback' });
    }

    const feedback = await Feedback.find(query)
      .populate('complaintId', 'complaintId title status')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    return res.json({ success: true, feedback });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createFeedback, getFeedback };
