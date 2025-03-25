/**
 * controllers/Controller.js
 *
 * Handles public-facing pages:
 * - Home page
 * - Courses and classes pages
 * - Booking endpoints for full courses and individual classes
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
        res.renderWithLayout('courses', {
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
        res.renderWithLayout('classes', {
            title: 'Individual Classes',
            active: { classes: true },
            classes: classes,
            year: new Date().getFullYear()
        });
    });
};

exports.getBookCourse = (req, res) => {
    const courseId = req.query.course;
    if (!courseId) {
        req.flash('error', 'No course selected for booking.');
        return res.redirect('/courses');
    }
    courseModel.getCourseById(courseId, (err, course) => {
        if (err || !course) {
            req.flash('error', 'Course not found.');
            return res.redirect('/courses');
        }
        res.renderWithLayout('bookCourse', {
            title: 'Book Full Course',
            active: { courses: true },
            year: new Date().getFullYear(),
            course: course,
            availableDates: course.availableDates || [],
            duration: course.duration || ''
        });
    });
};

exports.postBookCourse = (req, res) => {
    console.log('Full course booking details:', req.body);
    req.flash('success', 'Course booking request received.');
    res.redirect('/courses');
};

exports.getBookClass = (req, res) => {
    const classId = req.query.class;
    if (!classId) {
        req.flash('error', 'No class selected for booking.');
        return res.redirect('/classes');
    }
    classModel.getClassById(classId, (err, classInfo) => {
        if (err || !classInfo) {
            req.flash('error', 'Class not found.');
            return res.redirect('/classes');
        }
        res.renderWithLayout('bookClass', {
            title: 'Book Class',
            active: { classes: true },
            year: new Date().getFullYear(),
            classInfo: classInfo,
            availableDates: classInfo.availableDates || []
        });
    });
};

exports.postBookClass = (req, res) => {
    console.log('Class booking details:', req.body);
    req.flash('success', 'Class booking request received.');
    res.redirect('/classes');
};
