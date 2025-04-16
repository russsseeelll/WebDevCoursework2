const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/bookcourse', bookingController.getBookCourse);

router.post('/bookcourse', bookingController.postBookCourse);

router.get('/bookclass', bookingController.getBookClass);

router.post('/bookclass', bookingController.postBookClass);

module.exports = router;
