const express = require('express');
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { registrationRules, loginRules } = require('../validators/authValidators');
const { rateLimit } = require('express-rate-limit');

const router = express.Router();
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Try again later.' },
});

router.post('/register', authRateLimit, registrationRules, validateRequest, registerUser);
router.post('/login', authRateLimit, loginRules, validateRequest, loginUser);
router.get('/me', protect, getCurrentUser);

module.exports = router;
