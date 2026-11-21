const express = require('express');
const { body } = require('express-validator');
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  updateAnnouncementStatus,
  markAnnouncementRead,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const {
  announcementFields,
  announcementIdRule,
  announcementStatusRule,
} = require('../validators/announcementValidators');

const router = express.Router();

router.use(protect);
router.get('/', getAnnouncements);
router.get('/:id', announcementIdRule, validateRequest, getAnnouncementById);
router.patch(
  '/:id/read',
  authorize('student', 'staff'),
  announcementIdRule,
  validateRequest,
  markAnnouncementRead
);
router.post(
  '/',
  authorize('admin'),
  announcementFields,
  validateRequest,
  createAnnouncement
);
router.put(
  '/:id',
  authorize('admin'),
  announcementIdRule,
  announcementFields,
  validateRequest,
  updateAnnouncement
);
router.patch(
  '/:id/status',
  authorize('admin'),
  announcementIdRule,
  body('status').isIn(['Draft', 'Published', 'Archived']).withMessage('Select a valid announcement status'),
  validateRequest,
  updateAnnouncementStatus
);

module.exports = router;
