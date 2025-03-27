/**
 * routes/users.js
 */

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.get('/', usersController.getUsers);
router.post('/add', usersController.addUser);
router.post('/edit', usersController.editUser);
router.post('/delete', usersController.deleteUser);


module.exports = router;
