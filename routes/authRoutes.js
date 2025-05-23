const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

// 🚨 Temporary Admin Registration Route (Remove After First Use)
router.post('/register', authController.registerAdmin);

module.exports = router;
