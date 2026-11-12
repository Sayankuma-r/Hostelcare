const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const sendUserResponse = (user, token) => ({
  token,
  user: user.toPublicJSON ? user.toPublicJSON() : user,
});

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, hostel, block, roomNumber, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      hostel: hostel || '',
      block: block || '',
      roomNumber: roomNumber || '',
      phone: phone || '',
      role: 'student',
    });

    const token = generateToken(user);
    return res.status(201).json({ success: true, ...sendUserResponse(user, token) });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    return res.json({ success: true, ...sendUserResponse(user, token) });
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req, res) => {
  return res.json({ success: true, user: req.user.toPublicJSON ? req.user.toPublicJSON() : req.user });
};

module.exports = { registerUser, loginUser, getCurrentUser };
