const express = require('express');
const { getStaffDashboard, getStaffComplaints } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('staff'));
router.get('/dashboard', getStaffDashboard);
router.get('/complaints', getStaffComplaints);

module.exports = router;
