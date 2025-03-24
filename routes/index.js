/**
 * routes/index.js
 */

const express = require('express');
const router = express.Router();
const indexController = require('../controllers/Controller');

router.get('/', indexController.getHome);
router.get('/login', indexController.getLogin);
router.post('/login', indexController.postLogin);
router.get('/register', indexController.getRegister);
router.post('/register', indexController.postRegister);
router.get('/courses', indexController.getCoursesPage);
router.get('/classes', indexController.getClassesPage);
router.get('/bookCourse', indexController.getBookCourse);
router.post('/bookCourse', indexController.postBookCourse);
router.get('/bookClass', indexController.getBookClass);
router.post('/bookClass', indexController.postBookClass);

module.exports = router;
