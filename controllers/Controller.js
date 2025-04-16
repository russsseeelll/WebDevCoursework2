const classModel = require('../models/class');
const courseModel = require('../models/course');

// render the homepage with hero section
exports.getHome = (req, res) => {
    res.renderWithLayout('index', {
        title: 'danceright!',
        active: { home: true },
        year: new Date().getFullYear(),
        showHero: true
    });
};

// render courses page with pagination
exports.getCoursesPage = (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    courseModel.countCourses({}, (err, totalCount) => {
        if (err) {
            req.flash('error', 'error loading courses: ' + err.message);
            return res.renderWithLayout('./bookings/courses', {
                title: 'full courses',
                active: { courses: true },
                courses: [],
                pagination: {},
                year: new Date().getFullYear()
            });
        }
        courseModel.getCoursesPaginated({}, skip, limit, (err, courses) => {
            if (err) {
                req.flash('error', 'error loading courses: ' + err.message);
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
                title: 'full courses',
                active: { courses: true },
                courses: courses,
                pagination: pagination,
                year: new Date().getFullYear()
            });
        });
    });
};

// render classes page with pagination
exports.getClassesPage = (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    classModel.countClasses({}, (err, totalCount) => {
        if (err) {
            req.flash('error', 'error loading classes: ' + err.message);
            return res.renderWithLayout('./bookings/classes', {
                title: 'individual classes',
                active: { classes: true },
                classes: [],
                pagination: {},
                year: new Date().getFullYear()
            });
        }
        classModel.getClassesPaginated({}, skip, limit, (err, classes) => {
            if (err) {
                req.flash('error', 'error loading classes: ' + err.message);
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
                title: 'individual classes',
                active: { classes: true },
                classes: classes,
                pagination: pagination,
                year: new Date().getFullYear()
            });
        });
    });
};
