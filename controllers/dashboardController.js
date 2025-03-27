/**
 * controllers/dashboardController.js
 */

const courseModel = require('../models/course');
const classModel = require('../models/class');
const userModel = require('../models/user');

exports.getDashboard = (req, res) => {
    courseModel.getCourses({}, (err, courses) => {
        if (err) courses = [];
        classModel.getClasses({}, (err, classes) => {
            if (err) classes = [];
            userModel.getUsers({}, (err, users) => {
                if (err) users = [];
                res.renderWithLayout('./admin/dashboard', {
                    title: 'Organiser Dashboard',
                    active: { dashboard: true },
                    year: new Date().getFullYear(),
                    courses: courses,
                    classes: classes,
                    users: users
                });
            });
        });
    });
};

exports.isAuthedAsOrganiser = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'organiser') {
        return next();
    }
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    return res.redirect('/auth/login');
};

