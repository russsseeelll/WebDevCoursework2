/**
 * controllers/Controller.js
 *
 * Handles public-facing pages:
 * - Home page
 * - Courses and classes pages with pagination
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 4; // Only 4 courses per page
    const skip = (page - 1) * limit;

    courseModel.countCourses({}, (err, totalCount) => {
        if (err) {
            req.flash('error', 'Error loading courses: ' + err.message);
            return res.renderWithLayout('./bookings/courses', {
                title: 'Full Courses',
                active: { courses: true },
                courses: [],
                pagination: {},
                year: new Date().getFullYear()
            });
        }
        courseModel.getCoursesPaginated({}, skip, limit, (err, courses) => {
            if (err) {
                req.flash('error', 'Error loading courses: ' + err.message);
                courses = [];
            }
            const totalPages = Math.ceil(totalCount / limit);
            const pagination = {
                currentPage: page,
                totalPages: totalPages,
                hasPrev: page > 1,
                hasNext: page < totalPages,
                prevPage: page - 1,
                nextPage: page + 1,
                pages: [],
                show: totalPages > 1
            };
            for (let i = 1; i <= totalPages; i++) {
                pagination.pages.push({
                    number: i,
                    active: i === page
                });
            }
            res.renderWithLayout('./bookings/courses', {
                title: 'Full Courses',
                active: { courses: true },
                courses: courses,
                pagination: pagination,
                year: new Date().getFullYear()
            });
        });
    });
};

exports.getClassesPage = (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 6; // Only 6 classes per page
    const skip = (page - 1) * limit;

    classModel.countClasses({}, (err, totalCount) => {
        if (err) {
            req.flash('error', 'Error loading classes: ' + err.message);
            return res.renderWithLayout('./bookings/classes', {
                title: 'Individual Classes',
                active: { classes: true },
                classes: [],
                pagination: {},
                year: new Date().getFullYear()
            });
        }
        classModel.getClassesPaginated({}, skip, limit, (err, classes) => {
            if (err) {
                req.flash('error', 'Error loading classes: ' + err.message);
                classes = [];
            }
            const totalPages = Math.ceil(totalCount / limit);
            const pagination = {
                currentPage: page,
                totalPages: totalPages,
                hasPrev: page > 1,
                hasNext: page < totalPages,
                prevPage: page - 1,
                nextPage: page + 1,
                pages: [],
                show: totalPages > 1
            };
            for (let i = 1; i <= totalPages; i++) {
                pagination.pages.push({
                    number: i,
                    active: i === page
                });
            }
            res.renderWithLayout('./bookings/classes', {
                title: 'Individual Classes',
                active: { classes: true },
                classes: classes,
                pagination: pagination,
                year: new Date().getFullYear()
            });
        });
    });
};
