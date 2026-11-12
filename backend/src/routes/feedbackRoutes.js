const express = require('express');
const { createFeedback, getFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);
router.post(
  '/',
  authorize('student'),
  [
    body('complaintId').isMongoId().withMessage('A valid complaint ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be a whole number from 1 to 5').toInt(),
    body('comment').trim().isLength({ min: 5, max: 1000 }).withMessage('Feedback must be between 5 and 1000 characters'),
  ],
  validateRequest,
  createFeedback
);
router.get('/', authorize('student', 'admin'), getFeedback);
router.get(
  '/:complaintId',
  authorize('student', 'admin'),
  param('complaintId').isMongoId().withMessage('Invalid complaint ID'),
  validateRequest,
  getFeedback
);

module.exports = router;
