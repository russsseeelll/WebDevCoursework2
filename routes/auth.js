const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

router.get('/login', authController.getLogin);
router.get('/register', authController.getRegister);

router.post('/login', authController.postLogin);
router.post('/register', authController.postRegister);

router.get('/github', passport.authenticate('github-login'));
router.get(
    '/github/callback',
    passport.authenticate('github-login', { failureRedirect: '/auth/login' }),
    authController.externalAuthCallback
);

router.get('/logout', authController.logout);

module.exports = router;
