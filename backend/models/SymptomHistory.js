const mongoose = require('mongoose');

const symptomHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: [{ type: String }],
  predictedCondition: { type: String },
  confidence: { type: Number },
  riskLevel: { type: String },
  suggestion: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SymptomHistory', symptomHistorySchema);
