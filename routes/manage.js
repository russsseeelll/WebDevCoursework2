/**
 * routes/manage.js
 */

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');



// Routes to view and update the user's profile.
router.get('/manageProfile', usersController.getManageProfile);
router.post('/manageProfile', usersController.postManageProfile);

module.exports = router;
