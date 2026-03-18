const mongoose = require('mongoose');

const reportHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String },
  extractedTerms: [{ type: String }],
  summary: { type: String },
  aiExplanation: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReportHistory', reportHistorySchema);
