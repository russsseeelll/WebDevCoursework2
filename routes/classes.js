const express = require('express');
const router = express.Router();
const classModel = require('../models/class');

router.get('/', (req, res) => {
    classModel.getClasses({}, (err, classes) => {
        if (err) return res.status(500).send(err);
        res.json(classes);
    });
});

router.post('/add', (req, res) => {
    const newClass = {
        name: req.body.className,
        description: req.body.classDescription,
        location: req.body.classLocation,
        price: parseFloat(req.body.classPrice),
        timeslots: [],
        participants: []
    };
    classModel.addClass(newClass, (err) => {
        if (err) {
            req.flash('error', 'Error adding class: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'Class added successfully');
        res.redirect('/dashboard');
    });
});

router.post('/edit', (req, res) => {
    const classId = req.body.classId;
    const update = {
        name: req.body.className,
        description: req.body.classDescription,
        location: req.body.classLocation,
        price: parseFloat(req.body.classPrice)
    };
    classModel.updateClass(classId, update, (err) => {
        if (err) {
            req.flash('error', 'Error editing class: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'Class updated successfully');
        res.redirect('/dashboard');
    });
});

router.post('/delete', (req, res) => {
    const classId = req.body.classId;
    classModel.deleteClass(classId, (err) => {
        if (err) {
            req.flash('error', 'Error deleting class: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'Class deleted successfully');
        res.redirect('/dashboard');
    });
});

router.post('/timeslots/update', (req, res) => {
    let timeslots = [];
    if (req.body.timeslotsCSV) {
        timeslots = req.body.timeslotsCSV.split(',').map(ts => ts.trim());
    }
    const classId = req.body.classId;
    classModel.updateClass(classId, { timeslots: timeslots }, (err) => {
        if (err) {
            req.flash('error', 'Error updating timeslots: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'Timeslots updated successfully');
        res.redirect('/dashboard');
    });
});

router.get('/participants', (req, res) => {
    const classId = req.query.classId;
    classModel.getClassById(classId, (err, classObj) => {
        if (err || !classObj) return res.status(500).send(err || "Class not found");
        res.json(classObj.participants || []);
    });
});

router.post('/participants/add', (req, res) => {
    const classId = req.body.classId;
    const participant = {
        name: req.body.participantName,
        email: req.body.participantEmail
    };
    classModel.getClassById(classId, (err, classObj) => {
        if (err || !classObj) {
            req.flash('error', 'Class not found');
            return res.redirect('/dashboard');
        }
        classObj.participants = classObj.participants || [];
        classObj.participants.push(participant);
        classModel.updateClass(classId, { participants: classObj.participants }, (err) => {
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