/**
 * routes/booking.js
 */
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.get('/bookCourse', bookingController.getBookCourse);
router.post('/bookCourse', bookingController.postBookCourse);
router.get('/bookClass', bookingController.getBookClass);
router.post('/bookClass', bookingController.postBookClass);

module.exports = router;
