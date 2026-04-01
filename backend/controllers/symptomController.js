const SymptomHistory = require('../models/SymptomHistory');

/*
* Proxy to Python Symptom Analysis AI
*/
exports.predictDisease = async (req, res) => {
  try {
    const { symptoms, userId } = req.body;
    
    // Call Python AI Service
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/ai-service` : 'http://localhost:8000';
    const aiUrl = process.env.PYTHON_SERVICE_URL || baseUrl;
    const response = await fetch(`${aiUrl}/predict-disease`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms })
    });
    
    if (!response.ok) {
        throw new Error(`AI Service Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Save to History if user is logged in
    if (userId && data.prediction) {
      const history = new SymptomHistory({
        userId,
        symptoms,
        predictedCondition: data.prediction.condition,
        confidence: data.prediction.confidence,
        riskLevel: data.riskLevel,
        suggestion: data.suggestion
      });
      await history.save();
    }

    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Symptom prediction error:', error.message);
    res.status(502).json({ message: 'AI Prediction Service is temporarily offline. Please try again soon.' });
  }
};
