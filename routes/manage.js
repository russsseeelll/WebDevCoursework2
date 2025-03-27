/**
 * routes/manage.js
 */

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const bookingController = require("../controllers/bookingController");

router.get('/manageBookings', bookingController.getManageBookings);
router.post('/cancelBooking', bookingController.cancelBooking);

router.get('/manageProfile', usersController.getManageProfile);
router.post('/manageProfile', usersController.postManageProfile);

module.exports = router;
