const SymptomHistory = require('../models/SymptomHistory');
const ReportHistory = require('../models/ReportHistory');
const User = require('../models/User');

exports.getPatients = async (req, res) => {
  try {
    // Get unique patient IDs from history
    const patientIds = await SymptomHistory.distinct('userId');
    const patients = await User.find({ _id: { $in: patientIds } }, 'name email role');
    
    // Enrich with summary data
    const enrichedPatients = await Promise.all(patients.map(async (p) => {
      const lastQuery = await SymptomHistory.findOne({ userId: p._id }).sort({ date: -1 });
      return {
        id: p._id,
        name: p.name,
        email: p.email,
        predictedCondition: lastQuery?.predictedCondition || 'Healthy',
        riskLevel: lastQuery?.riskLevel || 'Low'
      };
    }));

    res.json(enrichedPatients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPatientProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await User.findById(id, 'name email');
    const symptoms = await SymptomHistory.find({ userId: id }).sort({ date: -1 });
    const reports = await ReportHistory.find({ userId: id }).sort({ date: -1 });

    res.json({
      profile: patient,
      symptoms,
      reports
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
