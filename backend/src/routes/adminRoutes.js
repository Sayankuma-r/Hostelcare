const express = require('express');
const { getAdminDashboard, getUsers, createStaffUser, updateUserRole, getReports } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.post('/staff', createStaffUser);
router.patch('/users/:id/role', updateUserRole);
router.get('/reports', getReports);

module.exports = router;
