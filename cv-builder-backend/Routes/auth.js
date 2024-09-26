const express = require('express');
const authController = require('../Controllers/auth');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', authController.postSignUp);

router.post('/resend-code', authController.generateCode);

router.post('/verify-email', authController.verifyEmail);

router.post('/login', authController.postLogin);

router.post('/logout', authenticateToken, authController.postLogout);

router.post('/delete-account', authenticateToken, authController.postDeleteAccount);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.newPassword);

module.exports = router;
