const passport = require('passport');
const userModel = require('../models/user');
const crypto = require('crypto');

exports.getLogin = (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.renderWithLayout('auth/login', {
        title: 'Login',
        active: { login: true },
        year: new Date().getFullYear(),
        services: ['GitHub', 'Facebook']
    });
};

exports.postLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', info.message || 'Login failed.');
            return res.redirect('/auth/login');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            req.session.user = { email: user.email, role: user.role, name: user.name, _id: user._id };
            return res.redirect('/');
        });
    })(req, res, next);
};

exports.getRegister = (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.renderWithLayout('auth/register', {
        title: 'Register',
        active: { register: true },
        year: new Date().getFullYear()
    });
};

exports.postRegister = (req, res) => {
    const { username, email, password } = req.body;
    userModel.getUserByEmail(email, (err, existingUser) => {
        if (err) {
            req.flash('error', 'Registration failed.');
            return res.redirect('/auth/register');
        }
        if (existingUser) {
            req.flash('error', 'Email already registered.');
            return res.redirect('/auth/register');
        }
        const newUser = { name: username, email, password, role: 'user' };
        userModel.addUser(newUser, (err) => {
            if (err) {
                req.flash('error', 'Error adding user: ' + err.message);
                return res.redirect('/auth/register');
            }
            req.flash('success', 'Registration successful. Please log in.');
            res.redirect('/auth/login');
        });
    });
};

exports.externalAuthCallback = (req, res) => {
    const externalUser = req.user;
    userModel.getUserByEmail(externalUser.email, (err, existingUser) => {
        if (err) {
            req.flash('error', 'Error during external authentication.');
            return res.redirect('/auth/login');
        }
        if (!existingUser) {
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const newUser = {
                name: externalUser.name || externalUser.email,
                email: externalUser.email,
                password: randomPassword,
                role: 'user'
            };
            userModel.addUser(newUser, (err, savedUser) => {
                if (err || !savedUser) {
                    req.flash('error', 'Error creating user from external login.');
                    return res.redirect('/auth/login');
                }
                if (!savedUser._id) savedUser._id = savedUser.email;
                req.session.user = { email: savedUser.email, role: savedUser.role, name: savedUser.name, _id: savedUser._id };
                return res.redirect('/dashboard');
            });
        } else {
            if (!existingUser._id) existingUser._id = existingUser.email;
            req.session.user = { email: existingUser.email, role: existingUser.role, name: existingUser.name, _id: existingUser._id };
            return res.redirect('/dashboard');
        }
    });
};

exports.logout = (req, res) => {
    req.logout(() => {
        req.session.destroy();
        res.redirect('/');
    });
};
