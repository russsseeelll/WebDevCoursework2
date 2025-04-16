const classModel = require('../models/class');
const bookingModel = require('../models/booking');

// return all classes as json
exports.getClasses = (req, res) => {
    classModel.getClasses({}, (err, classes) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!Array.isArray(classes)) {
            classes = [];
        }
        res.json(classes);
    });
};

// add a new class with details from the request
exports.addClass = (req, res) => {
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
            req.flash('error', 'error adding class: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'class added successfully');
        res.redirect('/dashboard');
    });
};

// edit an existing class with updated details
exports.editClass = (req, res) => {
    const classId = req.body.classId;
    const update = {
        name: req.body.className,
        description: req.body.classDescription,
        location: req.body.classLocation,
        price: parseFloat(req.body.classPrice)
    };

    classModel.updateClass(classId, update, (err) => {
        if (err) {
            req.flash('error', 'error editing class: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'class updated successfully');
        res.redirect('/dashboard');
    });
};

// delete a class and its related bookings
exports.deleteClass = (req, res) => {
    const classId = req.body.classId;
    classModel.deleteClass(classId, (err) => {
        if (err) {
            req.flash('error', 'error deleting class: ' + err.message);
            return res.redirect('/dashboard');
        }
        bookingModel.deleteBookings({ bookingType: 'class', itemId: classId }, (err) => {
            if (err) {
                console.error('error deleting bookings for class:', err);
            }
            req.flash('success', 'class deleted successfully.');
            res.redirect('/dashboard');
        });
    });
};

// update available timeslots for a class
exports.updateTimeslots = (req, res) => {
    let timeslots = [];
    if (req.body.timeslotsCSV) {
        timeslots = req.body.timeslotsCSV.split(',').map(ts => ts.trim());
    }
    const classId = req.body.classId;

    classModel.updateClass(classId, { timeslots: timeslots }, (err) => {
        if (err) {
            req.flash('error', 'error updating timeslots: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'timeslots updated successfully');
        res.redirect('/dashboard');
    });
};

// return participants for a given class as json
exports.getParticipants = (req, res) => {
    const classId = req.query.classId;
    classModel.getClassById(classId, (err, classObj) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!classObj) return res.status(404).json([]);
        res.json(Array.isArray(classObj.participants) ? classObj.participants : []);
    });
};

// add a participant to a class
exports.addParticipant = (req, res) => {
    const classId = req.body.classId;
    const participant = {
        name: req.body.participantName,
        email: req.body.participantEmail
    };

    classModel.getClassById(classId, (err, classObj) => {
        if (err || !classObj) {
            req.flash('error', 'class not found');
            return res.redirect('/dashboard');
        }
        classObj.participants = classObj.participants || [];
        classObj.participants.push(participant);

        classModel.updateClass(classId, { participants: classObj.participants }, (err) => {
            if (err) {
                req.flash('error', 'error adding participant: ' + err.message);
                return res.redirect('/dashboard');
            }
            req.flash('success', 'participant added successfully');
            res.redirect('/dashboard');
        });
    });
};
