require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env before seeding');
  }

  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
  const adminExists = await User.findOne({ email: adminEmail });

  if (!adminExists) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Hostel Warden',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      hostel: 'Main Hostel',
      block: 'A',
      roomNumber: 'N/A',
      phone: '0000000000',
    });
    console.log('Admin account created successfully');
  } else if (adminExists.role !== 'admin') {
    adminExists.role = 'admin';
    adminExists.password = process.env.ADMIN_PASSWORD;
    await adminExists.save();
    console.log('Existing configured account promoted to administrator and password updated');
  } else {
    console.log('Admin account already exists');
  }

  await mongoose.disconnect();
};

if (require.main === module) {
  seedAdmin().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = seedAdmin;
