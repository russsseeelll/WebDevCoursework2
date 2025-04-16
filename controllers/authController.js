const passport = require('passport');
const userModel = require('../models/user');
const crypto = require('crypto');

// render the login page or redirect if already logged in
exports.getLogin = (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.renderWithLayout('auth/login', {
        title: 'login',
        active: { login: true },
        year: new Date().getFullYear(),
        services: ['github', 'facebook']
    });
};

// process login using local strategy and set session on success
exports.postLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', info.message || 'login failed.');
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

// render the registration page or redirect if already logged in
exports.getRegister = (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.renderWithLayout('auth/register', {
        title: 'register',
        active: { register: true },
        year: new Date().getFullYear()
    });
};

// merge duplicate accounts to avoid repeated records
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
                    if (err) console.error('error deleting duplicate user:', err);
                    count--;
                    if (count === 0) callback(null, master);
                });
            });
        });
    });
}

// handle user registration, merging duplicates if needed
exports.postRegister = (req, res) => {
    const { username, email, password } = req.body;

    mergeDuplicateUsers(email, { name: username, password: password, isregistered: true }, (err, mergedUser) => {
        if (err) {
            req.flash('error', 'registration failed.');
            return res.redirect('/auth/register');
        }
        if (mergedUser) {
            if (mergedUser.isregistered === false) {
                req.flash('success', 'registration successful. please log in.');
                return res.redirect('/auth/login');
            } else {
                req.flash('error', 'email already registered.');
                return res.redirect('/auth/register');
            }
        } else {
            const newUser = { name: username, email, password, role: 'user', isregistered: true };
            userModel.addUser(newUser, (err, savedUser) => {
                if (err) {
                    req.flash('error', 'error adding user: ' + err.message);
                    return res.redirect('/auth/register');
                }
                req.flash('success', 'registration successful. please log in.');
                res.redirect('/auth/login');
            });
        }
    });
};

// handle external authentication callback and merge or create a user
exports.externalAuthCallback = (req, res) => {
    const externalUser = req.user;
    mergeDuplicateUsers(externalUser.email, { isregistered: true }, (err, mergedUser) => {
        if (err) {
            req.flash('error', 'error during external authentication.');
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
                    req.flash('error', 'error creating user from external login.');
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

// log the user out and clear the session
exports.logout = (req, res) => {
    req.logout(() => {
        req.session.destroy();
        res.redirect('/');
    });
};
