const ChatHistory = require('../models/ChatHistory');

// Save a chat message
exports.saveMessage = async (req, res) => {
  const { userId, sender, text } = req.body;
  try {
    let history = await ChatHistory.findOne({ userId }).sort({ createdAt: -1 });
    if (!history) {
      history = new ChatHistory({ userId, messages: [] });
    }
    history.messages.push({ sender, text });
    await history.save();
    res.status(201).json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get chat history
exports.getHistory = async (req, res) => {
  try {
    const history = await ChatHistory.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
