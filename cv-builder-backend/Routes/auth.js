const express = require('express');
const authController = require('../Controllers/auth');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', authController.postSignUp);

router.post('/resendcode', authController.generateCode);

router.post('/verifyemail', authController.verifyEmail);

router.post('/login', authController.postLogin);

router.post('/logout', authenticateToken, authController.postLogout);

router.post('/deleteaccount', authenticateToken, authController.postDeleteAccount);

router.post('/reset', authController.postReset);

router.post('/newpassword', authController.newPassword);

module.exports = router;
