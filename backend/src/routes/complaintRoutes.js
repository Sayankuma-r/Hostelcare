const express = require('express');
const {
  createComplaint,
  getStudentDashboard,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintPriority,
  updateComplaintStatus,
  closeComplaint,
  reopenComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { complaintRules } = require('../validators/complaintValidators');
const { complaintUpload } = require('../middleware/complaintUpload');

const router = express.Router();

router.post('/', protect, authorize('student'), complaintUpload.single('image'), complaintRules, validateRequest, createComplaint);
router.get('/dashboard', protect, authorize('student'), getStudentDashboard);
router.get('/', protect, getComplaints);
router.get('/:id', protect, getComplaintById);
router.patch('/:id/assign', protect, authorize('admin'), assignComplaint);
router.patch('/:id/priority', protect, authorize('admin'), updateComplaintPriority);
router.patch('/:id/status', protect, authorize('student', 'staff'), updateComplaintStatus);
router.patch('/:id/close', protect, authorize('admin'), closeComplaint);
router.patch('/:id/reopen', protect, authorize('student', 'admin'), reopenComplaint);

module.exports = router;
