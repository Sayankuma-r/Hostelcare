const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    content: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    category: {
      type: String,
      required: true,
      enum: ['General', 'Water', 'Electricity', 'Maintenance', 'Mess', 'Emergency'],
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
    },
    audience: {
      type: [{ type: String, enum: ['student', 'staff'] }],
      default: ['student', 'staff'],
      validate: {
        validator: (audience) => audience.length > 0,
        message: 'At least one audience role is required',
      },
    },
    hostel: { type: String, default: '', trim: true, maxlength: 100 },
    block: { type: String, default: '', trim: true, maxlength: 50 },
    expiresAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

announcementSchema.index({ status: 1, expiresAt: 1, audience: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
