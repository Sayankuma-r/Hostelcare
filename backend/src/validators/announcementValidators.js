const { body, param } = require('express-validator');

const categories = ['General', 'Water', 'Electricity', 'Maintenance', 'Mess', 'Emergency'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];
const audiences = ['student', 'staff'];

const announcementFields = [
  body('title').trim().isLength({ min: 5, max: 120 }).withMessage('Title must be between 5 and 120 characters'),
  body('content').trim().isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters'),
  body('category').isIn(categories).withMessage('Select a valid announcement category'),
  body('priority').isIn(priorities).withMessage('Select a valid announcement priority'),
  body('status').optional().isIn(['Draft', 'Published', 'Archived']).withMessage('Select a valid announcement status'),
  body('audience')
    .isArray({ min: 1, max: 2 })
    .withMessage('Select at least one audience role')
    .bail()
    .custom((audience) => audience.every((role) => audiences.includes(role)))
    .withMessage('Audience roles must be student or staff'),
  body('hostel').optional({ checkFalsy: true }).isString().trim().isLength({ max: 100 }),
  body('block').optional({ checkFalsy: true }).isString().trim().isLength({ max: 50 }),
  body('expiresAt')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
];

const announcementIdRule = param('id').isMongoId().withMessage('Invalid announcement ID');
module.exports = { announcementFields, announcementIdRule };
