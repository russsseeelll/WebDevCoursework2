/**
 * controllers/usersController.js
 */


const userModel = require('../models/user');
const bookingModel = require('../models/booking');

exports.getManageBookings = (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'Please login to view your bookings.');
        return res.redirect('/auth/login');
    }
    bookingModel.getBookingsByUserId(req.session.user._id, (err, bookings) => {
        if (err) {
            req.flash('error', 'Error fetching bookings: ' + err.message);
            bookings = [];
        }
        res.renderWithLayout('manageBookings', {
            title: 'My Bookings',
            active: { bookings: true },
            year: new Date().getFullYear(),
            bookings: bookings
        });
    });
};

exports.getManageProfile = (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'Please login to view your profile.');
        return res.redirect('/auth/login');
    }
    userModel.getUserById(req.session.user._id, (err, user) => {
        if (err || !user) {
            req.flash('error', 'User not found.');
            return res.redirect('/dashboard');
        }
        res.renderWithLayout('./manage/manageProfile', {
            title: 'Manage Profile',
            active: { profile: true },
            year: new Date().getFullYear(),
            user: user
        });
    });
};

exports.postManageProfile = (req, res) => {
    if (!req.session.user) {
        req.flash('error', 'Please login to update your profile.');
        return res.redirect('/auth/login');
    }
    const update = {
        name: req.body.userName,
        mobile: req.body.userMobile
    };
    userModel.updateUser(req.session.user._id, update, (err) => {
        if (err) {
            req.flash('error', 'Error updating profile: ' + err.message);
            return res.redirect('/manageProfile');
        }
        // Update session info
        req.session.user.name = update.name;
        req.session.user.mobile = update.mobile;
        // Also update bookings for consistency
        bookingModel.updateBookingsByUserId(req.session.user._id, {
            contactName: update.name,
            contactMobile: update.mobile
        }, (updateErr) => {
            if (updateErr) {
                console.error("Error updating bookings for profile update", updateErr);
            }
            req.flash('success', 'Profile updated successfully.');
            res.redirect('/manageProfile');
        });
    });
};



exports.getUsers = (req, res) => {
    userModel.getUsers({}, (err, users) => {
        if (err) return res.status(500).send(err);
        res.json(users);
    });
};

exports.addUser = (req, res) => {
    const user = {
        name: req.body.userName,
        email: req.body.userEmail,
        role: req.body.userRole || 'user',
        password: req.body.userPassword,
        mobile: req.body.userMobile  // Added mobile field
    };

    userModel.addUser(user, (err, savedUser) => {
        if (err) {
            req.flash('error', 'Error adding user: ' + err.message);
            return res.redirect('/dashboard');
        }
        bookingModel.updateBookingsByUserId(savedUser._id, {
            contactName: user.name,
            contactEmail: user.email,
            contactMobile: user.mobile
        }, (updateErr) => {
            if (updateErr) {
                console.error("Error updating bookings for new user", updateErr);
            }
            req.flash('success', 'User added successfully');
            res.redirect('/dashboard');
        });
    });
};



exports.editUser = (req, res) => {
    const userId = req.body.userId;
    const update = {
        name: req.body.userName,
        email: req.body.userEmail,
        role: req.body.userRole,
        mobile: req.body.userMobile  // Include mobile field
    };

    if (req.body.userPassword && req.body.userPassword.trim() !== '') {
        update.password = req.body.userPassword;
    }

    userModel.updateUser(userId, update, (err) => {
        if (err) {
            req.flash('error', 'Error editing user: ' + err.message);
            return res.redirect('/dashboard');
        }
        // Update the booking records for this user
        bookingModel.updateBookingsByUserId(userId, {
            contactName: update.name,
            contactEmail: update.email,
            contactMobile: update.mobile
        }, (updateErr) => {
            if (updateErr) {
                console.error("Error updating bookings for user", updateErr);
            }
            req.flash('success', 'User updated successfully');
            res.redirect('/dashboard');
        });
    });
};

exports.deleteUser = (req, res) => {
    const userId = req.body.userId;
    userModel.deleteUser(userId, (err) => {
        if (err) {
            req.flash('error', 'Error deleting user: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'User deleted successfully');
        res.redirect('/dashboard');
    });
};
