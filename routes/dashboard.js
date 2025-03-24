const express = require('express');
const router = express.Router();
const courseModel = require('../models/course');
const classModel = require('../models/class');
const userModel = require('../models/user');

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'organiser') {
        return next();
    }
    res.redirect('/login');
}

router.get('/', isAuthenticated, (req, res) => {
    courseModel.getCourses({}, (err, courses) => {
        if (err) courses = [];
        classModel.getClasses({}, (err, classes) => {
            if (err) classes = [];
            userModel.getUsers({}, (err, users) => {
                if (err) users = [];
                res.renderWithLayout('dashboard', {
                    title: "Organiser Dashboard",
                    active: { dashboard: true },
                    year: new Date().getFullYear(),
                    courses: courses,
                    classes: classes,
                    users: users
                });
            });
        });
    });
});

module.exports = router;