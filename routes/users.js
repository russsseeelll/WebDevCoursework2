const express = require('express');
const router = express.Router();
const userModel = require('../models/user');

router.get('/', (req, res) => {
    userModel.getUsers({}, (err, users) => {
        if (err) return res.status(500).send(err);
        res.json(users);
    });
});

router.post('/add', (req, res) => {
    const user = {
        name: req.body.userName,
        email: req.body.userEmail,
        role: req.body.userRole || 'user',
        password: req.body.userPassword
    };
    userModel.addUser(user, (err) => {
        if (err) {
            req.flash('error', 'Error adding user: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'User added successfully');
        res.redirect('/dashboard');
    });
});

router.post('/edit', (req, res) => {
    const userId = req.body.userId;
    const update = {
        name: req.body.userName,
        email: req.body.userEmail,
        role: req.body.userRole
    };
    if (req.body.userPassword && req.body.userPassword.trim() !== '') {
        update.password = req.body.userPassword;
    }
    userModel.updateUser(userId, update, (err) => {
        if (err) {
            req.flash('error', 'Error editing user: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'User updated successfully');
        res.redirect('/dashboard');
    });
});

router.post('/delete', (req, res) => {
    const userId = req.body.userId;
    userModel.deleteUser(userId, (err) => {
        if (err) {
            req.flash('error', 'Error deleting user: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'User deleted successfully');
        res.redirect('/dashboard');
    });
});

module.exports = router;