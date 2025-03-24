const express = require('express');
const router = express.Router();
const courseModel = require('../models/course');

router.get('/', (req, res) => {
    courseModel.getCourses({}, (err, courses) => {
        if (err) return res.status(500).send(err);
        res.json(courses);
    });
});

router.post('/add', (req, res) => {
    const course = {
        name: req.body.courseName,
        description: req.body.courseDescription,
        startDate: req.body.courseStartDate,
        duration: req.body.courseDuration,
        schedule: Array.isArray(req.body.courseSchedule) ? req.body.courseSchedule : [req.body.courseSchedule],
        price: parseFloat(req.body.coursePrice),
        location: req.body.courseLocation,
        startTime: req.body.courseStartTime,
        endTime: req.body.courseEndTime,
        participants: []
    };
    courseModel.addCourse(course, (err, newCourse) => {
        if (err) {
            req.flash('error', 'Error adding course: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'Course added successfully');
        res.redirect('/dashboard');
    });
});

router.post('/edit', (req, res) => {
    const courseId = req.body.courseId;
    const update = {
        name: req.body.courseName,
        description: req.body.courseDescription,
        startDate: req.body.courseStartDate,
        duration: req.body.courseDuration,
        schedule: Array.isArray(req.body.courseSchedule) ? req.body.courseSchedule : [req.body.courseSchedule],
        price: parseFloat(req.body.coursePrice),
        location: req.body.courseLocation,
        startTime: req.body.courseStartTime,
        endTime: req.body.courseEndTime
    };
    courseModel.updateCourse(courseId, update, (err) => {
        if (err) {
            req.flash('error', 'Error editing course: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'Course updated successfully');
        res.redirect('/dashboard');
    });
});

router.post('/delete', (req, res) => {
    const courseId = req.body.courseId;
    courseModel.deleteCourse(courseId, (err) => {
        if (err) {
            req.flash('error', 'Error deleting course: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'Course deleted successfully');
        res.redirect('/dashboard');
    });
});

router.get('/participants', (req, res) => {
    const courseId = req.query.courseId;
    courseModel.getCourseById(courseId, (err, course) => {
        if (err || !course) return res.status(500).send(err || "Course not found");
        res.json(course.participants || []);
    });
});

router.post('/participants/add', (req, res) => {
    const courseId = req.body.courseId;
    const participant = {
        name: req.body.participantName,
        email: req.body.participantEmail
    };
    courseModel.getCourseById(courseId, (err, course) => {
        if (err || !course) {
            req.flash('error', 'Course not found');
            return res.redirect('/dashboard');
        }
        course.participants = course.participants || [];
        course.participants.push(participant);
        courseModel.updateCourse(courseId, { participants: course.participants }, (err) => {
            if (err) {
                req.flash('error', 'Error adding participant: ' + err.message);
                return res.redirect('/dashboard');
            }
            req.flash('success', 'Participant added successfully');
            res.redirect('/dashboard');
        });
    });
});

module.exports = router;