const express = require('express');
const { submitFormData } = require('../Controllers/formData.controller'); // Import the controller
const router = express.Router();

// Handle form data submission
router.post('/submit', submitFormData);

module.exports = router;
