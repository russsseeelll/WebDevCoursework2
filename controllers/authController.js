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
            req.session.user = {
                email: user.email,
                role: user.role,
                name: user.name,
                _id: user._id,
                mobile: user.mobile || ''
            };
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

function mergeDuplicateUsers(email, newData, callback) {
    userModel.getUsers({ email: email }, (err, users) => {
        if (err) return callback(err);
        if (!users || users.length === 0) return callback(null, null);

        const master = users[0];

        userModel.updateUser(master._id, newData, (err) => {
            if (err) return callback(err);

            const duplicates = users.slice(1);
            let count = duplicates.length;
            if (count === 0) return callback(null, master);
            duplicates.forEach(dup => {
                userModel.deleteUser(dup._id, (err) => {
                    if (err) console.error('Error deleting duplicate user:', err);
                    count--;
                    if (count === 0) callback(null, master);
                });
            });
        });
    });
}

exports.postRegister = (req, res) => {
    const { username, email, password } = req.body;

    mergeDuplicateUsers(email, { name: username, password: password, isregistered: true }, (err, mergedUser) => {
        if (err) {
            req.flash('error', 'Registration failed.');
            return res.redirect('/auth/register');
        }
        if (mergedUser) {

            if (mergedUser.isregistered === false) {
                req.flash('success', 'Registration successful. Please log in.');
                return res.redirect('/auth/login');
            } else {
                req.flash('error', 'Email already registered.');
                return res.redirect('/auth/register');
            }
        } else {

            const newUser = { name: username, email, password, role: 'user', isregistered: true };
            userModel.addUser(newUser, (err, savedUser) => {
                if (err) {
                    req.flash('error', 'Error adding user: ' + err.message);
                    return res.redirect('/auth/register');
                }
                req.flash('success', 'Registration successful. Please log in.');
                res.redirect('/auth/login');
            });
        }
    });
};

exports.externalAuthCallback = (req, res) => {
    const externalUser = req.user;
    mergeDuplicateUsers(externalUser.email, { isregistered: true }, (err, mergedUser) => {
        if (err) {
            req.flash('error', 'Error during external authentication.');
            return res.redirect('/auth/login');
        }
        if (!mergedUser) {
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const newUser = {
                name: externalUser.name || externalUser.email,
                email: externalUser.email,
                password: randomPassword,
                role: 'user',
                isregistered: true
            };
            userModel.addUser(newUser, (err, savedUser) => {
                if (err || !savedUser) {
                    req.flash('error', 'Error creating user from external login.');
                    return res.redirect('/auth/login');
                }
                if (!savedUser._id) savedUser._id = savedUser.email;
                req.session.user = {
                    email: savedUser.email,
                    role: savedUser.role,
                    name: savedUser.name,
                    _id: savedUser._id,
                    mobile: savedUser.mobile || ''
                };
                return res.redirect('/dashboard');
            });
        } else {
            if (!mergedUser._id) mergedUser._id = mergedUser.email;
            req.session.user = {
                email: mergedUser.email,
                role: mergedUser.role,
                name: mergedUser.name,
                _id: mergedUser._id,
                mobile: mergedUser.mobile || ''
            };
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