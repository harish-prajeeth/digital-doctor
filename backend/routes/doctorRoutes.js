const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.get('/patients', doctorController.getPatients);
router.get('/patient/:id', doctorController.getPatientProfile);

module.exports = router;
