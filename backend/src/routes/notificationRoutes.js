const express = require('express');
const { param } = require('express-validator');
const { getNotifications, markNotificationRead, markAllNotificationsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', param('id').isMongoId().withMessage('Invalid notification ID'), validateRequest, markNotificationRead);

module.exports = router;
