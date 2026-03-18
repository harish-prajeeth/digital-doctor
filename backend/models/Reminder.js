const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  time: { type: String, required: true }, // e.g. "08:00 AM"
  frequency: { type: String, enum: ['Daily', 'Weekly', 'Once'], default: 'Daily' },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reminder', reminderSchema);
