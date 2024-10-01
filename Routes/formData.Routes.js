const express = require('express');
const { submitFormData } = require('../Controllers/formData.controller'); 
const router = express.Router();


router.post('/submit', submitFormData);

module.exports = router;
