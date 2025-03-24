const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const classModel = require('../models/class');
const courseModel = require('../models/course');

router.get('/', (req, res) => {
    res.renderWithLayout('index', {
        title: "Danceright!",
        active: { home: true },
        year: new Date().getFullYear(),
        showHero: true
    });
});

router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.renderWithLayout('login', {
        title: "Login",
        active: { login: true },
        year: new Date().getFullYear()
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    userModel.getUserByEmail(email, (err, user) => {
        if (err || !user) {
            req.flash('error', 'Login failed. Please try again.');
            return res.redirect('/login');
        }
        if (user.password === password) {
            req.session.user = { email: user.email, role: user.role, name: user.name };
            return res.redirect('/dashboard');
        }
        req.flash('error', 'Invalid credentials.');
        return res.redirect('/login');
    });
});

router.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.renderWithLayout('register', {
        title: "Register",
        active: { register: true },
        year: new Date().getFullYear()
    });
});

router.post('/register', (req, res) => {
    res.redirect('/login');
});

router.get('/courses', (req, res) => {
    courseModel.getCourses({}, (err, courses) => {
        if (err) {
            req.flash('error', 'Error loading courses: ' + err.message);
            courses = [];
        }
        res.renderWithLayout('courses', {
            title: "Full Courses",
            active: { courses: true },
            courses: courses,
            year: new Date().getFullYear()
        });
    });
});

router.get('/classes', (req, res) => {
    classModel.getClasses({}, (err, classes) => {
        if (err) {
            req.flash('error', 'Error loading classes: ' + err.message);
            classes = [];
        }
        res.renderWithLayout('classes', {
            title: "Individual Classes",
            active: { classes: true },
            classes: classes,
            year: new Date().getFullYear()
        });
    });
});

router.get('/bookCourse', (req, res) => {
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
            title: "Book Full Course",
            active: { courses: true },
            year: new Date().getFullYear(),
            course: course,
            availableDates: course.availableDates || [],
            duration: course.duration || ''
        });
    });
});

router.post('/bookCourse', (req, res) => {
    console.log("Full course booking details:", req.body);
    req.flash('success', 'Course booking request received.');
    res.redirect('/courses');
});

router.get('/bookClass', (req, res) => {
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
            title: "Book Class",
            active: { classes: true },
            year: new Date().getFullYear(),
            classInfo: classInfo,
            availableDates: classInfo.availableDates || []
        });
    });
});

router.post('/bookClass', (req, res) => {
    console.log("Class booking details:", req.body);
    req.flash('success', 'Class booking request received.');
    res.redirect('/classes');
});

module.exports = router;
