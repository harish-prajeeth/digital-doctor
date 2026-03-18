const CryptoJS = require('crypto-js');
const ReportHistory = require('../models/ReportHistory');
const User = require('../models/User');

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'medical_secret_key';

exports.analyzeReport = async (req, res) => {
  try {
    const { userId, fileData, fileName } = req.body;
    
    // Call Python AI
    const aiUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const aiRes = await fetch(`${aiUrl}/analyze-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileData, fileName: fileName || 'report.pdf' })
    });
    
    if (!aiRes.ok) {
        throw new Error('AI Analysis Service is currently unavailable. Please try again later.');
    }
    
    const data = await aiRes.json();
    
    // AES Encrypt sensitive findings before saving to DB
    const encryptedAnalysis = CryptoJS.AES.encrypt(JSON.stringify(data.analysis), SECRET_KEY).toString();
    
    // Save to ReportHistory (this matches what Dashboard/historyRoutes expect)
    const report = new ReportHistory({
      userId,
      fileName: fileName || 'Medical Report',
      summary: data.analysis.summary,
      extractedTerms: data.analysis.key_terms || [],
      aiExplanation: encryptedAnalysis // Store encrypted detailed analysis here
    });
    
    await report.save();
    
    // Return decrypted data to the authorized requester
    res.json({ analysis: data.analysis, recordId: report._id });
  } catch (error) {
    console.error("Report Analysis Error:", error.message);
    res.status(502).json({ message: error.message || 'AI Service Error' });
  }
};
