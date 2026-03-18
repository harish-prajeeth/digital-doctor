const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.delete('/user/:id', adminController.deleteUser);

module.exports = router;
