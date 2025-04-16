const userModel = require('../models/user');
const bookingModel = require('../models/booking');

// show the current user's bookings if logged in
exports.getManageBookings = (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'please login to view your bookings.');
        return res.redirect('/auth/login');
    }
    bookingModel.getBookingsByUserId(req.session.user._id, (err, bookings) => {
        if (err) {
            req.flash('error', 'error fetching bookings: ' + err.message);
            bookings = [];
        }
        res.renderWithLayout('manageBookings', {
            title: 'my bookings',
            active: { bookings: true },
            year: new Date().getFullYear(),
            bookings: bookings
        });
    });
};

// show the profile page for the current user
exports.getManageProfile = (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'please login to view your profile.');
        return res.redirect('/auth/login');
    }
    userModel.getUserById(req.session.user._id, (err, user) => {
        if (err || !user) {
            req.flash('error', 'user not found.');
            return res.redirect('/dashboard');
        }
        res.renderWithLayout('./manage/manageProfile', {
            title: 'manage profile',
            active: { profile: true },
            year: new Date().getFullYear(),
            user: user
        });
    });
};

// update the current user's profile info
exports.postManageProfile = (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'please login to update your profile.');
        return res.redirect('/auth/login');
    }
    const update = {
        name: req.body.userName,
        mobile: req.body.userMobile
    };
    userModel.updateUser(req.session.user._id, update, (err) => {
        if (err) {
            req.flash('error', 'error updating profile: ' + err.message);
            return res.redirect('/manageProfile');
        }
        req.session.user.name = update.name;
        req.session.user.mobile = update.mobile;
        // also update the user's bookings for consistency
        bookingModel.updateBookingsByUserId(req.session.user._id, {
            contactName: update.name,
            contactMobile: update.mobile
        }, (updateErr) => {
            if (updateErr) {
                console.error("error updating bookings for profile update", updateErr);
            }
            req.flash('success', 'profile updated successfully.');
            res.redirect('/manageProfile');
        });
    });
};

// get all users and return as json
exports.getUsers = (req, res) => {
    userModel.getUsers({}, (err, users) => {
        if (err) return res.status(500).send(err);
        res.json(users);
    });
};

// add a new user from submitted data
exports.addUser = (req, res) => {
    const user = {
        name: req.body.userName,
        email: req.body.userEmail,
        role: req.body.userRole || 'user',
        password: req.body.userPassword,
        mobile: req.body.userMobile
    };

    userModel.addUser(user, (err, savedUser) => {
        if (err) {
            req.flash('error', 'error adding user: ' + err.message);
            return res.redirect('/dashboard');
        }
        bookingModel.updateBookingsByUserId(savedUser._id, {
            contactName: user.name,
            contactEmail: user.email,
            contactMobile: user.mobile
        }, (updateErr) => {
            if (updateErr) {
                console.error("error updating bookings for new user", updateErr);
            }
            req.flash('success', 'user added successfully');
            res.redirect('/dashboard');
        });
    });
};

// update an existing user's details
exports.editUser = (req, res) => {
    const userId = req.body.userId;
    const update = {
        name: req.body.userName,
        email: req.body.userEmail,
        role: req.body.userRole,
        mobile: req.body.userMobile
    };

    if (req.body.userPassword && req.body.userPassword.trim() !== '') {
        update.password = req.body.userPassword;
    }

    userModel.updateUser(userId, update, (err) => {
        if (err) {
            req.flash('error', 'error editing user: ' + err.message);
            return res.redirect('/dashboard');
        }
        // update booking records for consistency
        bookingModel.updateBookingsByUserId(userId, {
            contactName: update.name,
            contactEmail: update.email,
            contactMobile: update.mobile
        }, (updateErr) => {
            if (updateErr) {
                console.error("error updating bookings for user", updateErr);
            }
            req.flash('success', 'user updated successfully');
            res.redirect('/dashboard');
        });
    });
};

// delete a user based on the provided id
exports.deleteUser = (req, res) => {
    const userId = req.body.userId;
    userModel.deleteUser(userId, (err) => {
        if (err) {
            req.flash('error', 'error deleting user: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'user deleted successfully');
        res.redirect('/dashboard');
    });
};
