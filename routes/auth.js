/**
 * routes/auth.js
 *
 * Routes for authentication actions:
 * - Local login and registration.
 * - External authentication (using GitHub in this case).
 * - Logout.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Render login and register pages.
router.get('/login', authController.getLogin);
router.get('/register', authController.getRegister);

// Handle local login and registration.
router.post('/login', authController.postLogin);
router.post('/register', authController.postRegister);

// GitHub authentication routes.
router.get('/github', passport.authenticate('github-login'));
router.get('/github/callback',
    passport.authenticate('github-login', { failureRedirect: '/auth/login' }),
    authController.externalAuthCallback
);


// Logout route.
router.get('/logout', authController.logout);

module.exports = router;
