const express = require('express');
const router = express.Router();
const SymptomHistory = require('../models/SymptomHistory');
const ReportHistory = require('../models/ReportHistory');

// Get generic history
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const symptoms = await SymptomHistory.find({ userId }).sort({ date: -1 });
    const reports = await ReportHistory.find({ userId }).sort({ date: -1 });
    
    // Logic to find health trends (simple mock for demo: e.g. checking hemoglobin)
    let hemoglobinTrend = "Stable";
    if (reports.length >= 3) {
      // Very naive text search just for demo
      hemoglobinTrend = "Stable based on last 3 reports.";
      const summaries = reports.slice(0, 3).map(r => r.summary?.toLowerCase() || "");
      if (summaries[0].includes("low hemoglobin")) hemoglobinTrend = "Decreasing High Alert";
    }

    res.json({
      symptoms,
      reports,
      trends: { hemoglobinTrend }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
