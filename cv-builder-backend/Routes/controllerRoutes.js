const express = require('express');
const cvController = require('../Controllers/cv');
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/set-template', cvController.setTemplate);

router.post('/personal',upload.single('file'),cvController.postPersonal);

router.post('/work',cvController.postWork);

router.post('/education',cvController.postEducation);

router.post('/skill',cvController.postSkill);

router.post('/custom-section', cvController.saveCustomSection);

router.get('/preview-cv/:cvId', cvController.previewCv);

router.get('/generate-pdf/:cvId',verifyToken,  cvController.getGenerateCvPdf);



module.exports = router;