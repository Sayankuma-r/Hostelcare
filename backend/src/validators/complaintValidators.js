const { body } = require('express-validator');

const complaintRules = [
  body('title').trim().isLength({ min: 5, max: 120 }).withMessage('Title must be between 5 and 120 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 3000 })
    .withMessage('Description must be between 10 and 3000 characters'),
  body('category')
    .isIn([
      'Electricity',
      'Plumbing',
      'Water Supply',
      'Wi-Fi / Internet',
      'Cleaning and Hygiene',
      'Furniture',
      'Washroom',
      'Security',
      'Food Quality',
      'Other',
    ])
    .withMessage('Select a valid complaint category'),
  body('priority').isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Select a valid priority'),
  body('hostel').trim().isLength({ min: 1, max: 100 }).withMessage('Hostel is required'),
  body('block').trim().isLength({ min: 1, max: 50 }).withMessage('Block is required'),
  body('roomNumber').trim().isLength({ min: 1, max: 30 }).withMessage('Room number is required'),
];

module.exports = { complaintRules };
