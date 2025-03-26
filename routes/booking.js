/**
 * routes/booking.js
 */
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Booking endpoints for courses and classes.
router.get('/bookCourse', bookingController.getBookCourse);
router.post('/bookCourse', bookingController.postBookCourse);
router.get('/bookClass', bookingController.getBookClass);
router.post('/bookClass', bookingController.postBookClass);

// Route to view the user's bookings.
router.get('/manageBookings', bookingController.getManageBookings);
router.post('/cancelBooking', bookingController.cancelBooking);

module.exports = router;
