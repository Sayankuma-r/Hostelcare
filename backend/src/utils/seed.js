require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
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
    } else {
      console.log('Admin account already exists');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
