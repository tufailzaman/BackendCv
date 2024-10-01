const express = require('express');
const authController = require('../Controllers/auth');

const router = express.Router();

router.post('/signup', authController.postSignUp);

router.post('/resendCode', authController.generateCode);

router.post('/verifyEmail', authController.verifyEmail);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.post('/deleteAccount/:userId', authController.postDeleteAccount);

router.post('/reset', authController.postReset);

router.post('/newPassword/:token', authController.newPassword);

module.exports = router;
