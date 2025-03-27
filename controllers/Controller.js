/**
 * controllers/Controller.js
 *
 * Handles public-facing pages:
 * - Home page
 * - Courses and classes pages
 */

const classModel = require('../models/class');
const courseModel = require('../models/course');

exports.getHome = (req, res) => {
    res.renderWithLayout('index', {
        title: 'Danceright!',
        active: { home: true },
        year: new Date().getFullYear(),
        showHero: true
    });
};

exports.getCoursesPage = (req, res) => {
    courseModel.getCourses({}, (err, courses) => {
        if (err) {
            req.flash('error', 'Error loading courses: ' + err.message);
            courses = [];
        }
        res.renderWithLayout('./bookings/courses', {
            title: 'Full Courses',
            active: { courses: true },
            courses: courses,
            year: new Date().getFullYear()
        });
    });
};

exports.getClassesPage = (req, res) => {
    classModel.getClasses({}, (err, classes) => {
        if (err) {
            req.flash('error', 'Error loading classes: ' + err.message);
            classes = [];
        }
        res.renderWithLayout('./bookings/classes', {
            title: 'Individual Classes',
            active: { classes: true },
            classes: classes,
            year: new Date().getFullYear()
        });
    });
};
