const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Standard chat endpoint
router.post('/', chatbotController.saveMessage); // Reusing saveMessage to handle both AI call and saving if needed, or separate them.

// Getting history
router.get('/history/:userId', chatbotController.getHistory);

module.exports = router;
