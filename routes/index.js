/**
 * routes/index.js
 */
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/Controller');

router.get('/', indexController.getHome);
router.get('/courses', indexController.getCoursesPage);
router.get('/classes', indexController.getClassesPage);

module.exports = router;
