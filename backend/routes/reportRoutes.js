const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Using mock/simple memory storage or proxy instead of multer for now
router.post('/upload', express.json({limit: '50mb'}), reportController.analyzeReport);

module.exports = router;
