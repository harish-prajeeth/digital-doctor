const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');

router.post('/predict', symptomController.predictDisease);

module.exports = router;
