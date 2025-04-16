const courseModel = require('../models/course');
const classModel = require('../models/class');
const userModel = require('../models/user');

// render dashboard by fetching courses, classes, and users
exports.getDashboard = (req, res) => {
    courseModel.getCourses({}, (err, courses) => {
        if (err) courses = [];
        classModel.getClasses({}, (err, classes) => {
            if (err) classes = [];
            userModel.getUsers({}, (err, users) => {
                if (err) users = [];
                res.renderWithLayout('./admin/dashboard', {
                    title: 'organiser dashboard',
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

// check if user is logged in and has organiser role, otherwise redirect
exports.isAuthedAsOrganiser = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'organiser') {
        return next();
    }
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    return res.redirect('/auth/login');
};
