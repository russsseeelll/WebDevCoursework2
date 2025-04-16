const courseModel = require('../models/course');
const bookingModel = require('../models/booking');

// return all courses in json format
exports.getCourses = (req, res) => {
    courseModel.getCourses({}, (err, courses) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!Array.isArray(courses)) {
            courses = [];
        }
        res.json(courses);
    });
};

// add a new course and calculate its end date
exports.addCourse = (req, res) => {
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

    // calculate course end date based on duration and schedule
    course.endDate = getCourseEndDate(course);

    courseModel.addCourse(course, (err, newCourse) => {
        if (err) {
            req.flash('error', 'error adding course: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'course added successfully');
        res.redirect('/dashboard');
    });
};

// edit an existing course and recalc end date
exports.editCourse = (req, res) => {
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

    // recalc the end date with updated info
    update.endDate = getCourseEndDate(update);

    courseModel.updateCourse(courseId, update, (err) => {
        if (err) {
            req.flash('error', 'error editing course: ' + err.message);
            return res.redirect('/dashboard');
        }
        req.flash('success', 'course updated successfully');
        res.redirect('/dashboard');
    });
};

// delete a course and remove its related bookings
exports.deleteCourse = (req, res) => {
    const courseId = req.body.courseId;
    courseModel.deleteCourse(courseId, (err) => {
        if (err) {
            req.flash('error', 'error deleting course: ' + err.message);
            return res.redirect('/dashboard');
        }
        bookingModel.deleteBookings({ bookingType: 'course', itemId: courseId }, (err) => {
            if (err) {
                console.error('error deleting bookings for course:', err);
            }
            req.flash('success', 'course deleted successfully.');
            res.redirect('/dashboard');
        });
    });
};

// return course participants in json format
exports.getParticipants = (req, res) => {
    const courseId = req.query.courseId;
    courseModel.getCourseById(courseId, (err, course) => {
        if (err || !course) return res.status(500).send(err || 'course not found');
        res.json(course.participants || []);
    });
};

// add a new participant to a course
exports.addParticipant = (req, res) => {
    const courseId = req.body.courseId;
    const participant = {
        name: req.body.participantName,
        email: req.body.participantEmail
    };

    courseModel.getCourseById(courseId, (err, course) => {
        if (err || !course) {
            req.flash('error', 'course not found');
            return res.redirect('/dashboard');
        }
        course.participants = course.participants || [];
        course.participants.push(participant);

        courseModel.updateCourse(courseId, { participants: course.participants }, (err) => {
            if (err) {
                req.flash('error', 'error adding participant: ' + err.message);
                return res.redirect('/dashboard');
            }
            req.flash('success', 'participant added successfully');
            res.redirect('/dashboard');
        });
    });
};

// helper function to calculate course end date from duration and scheduled days
function getCourseEndDate(course) {
    const duration = parseInt(course.duration, 10);
    if (isNaN(duration) || duration <= 0 || !course.schedule || !course.schedule.length) {
        return "";
    }

    const startDate = course.startDate ? new Date(course.startDate) : new Date();
    const endDate = new Date(startDate);

    // add weeks based on duration
    endDate.setDate(startDate.getDate() + duration * 7);

    const weekdayMap = {
        "sunday": 0,
        "monday": 1,
        "tuesday": 2,
        "wednesday": 3,
        "thursday": 4,
        "friday": 5,
        "saturday": 6
    };

    const scheduledDays = course.schedule.map(day => weekdayMap[day]).filter(n => n !== undefined);
    const availableDates = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (scheduledDays.includes(d.getDay())) {
            availableDates.push(new Date(d));
        }
    }
    if (availableDates.length === 0) return "";
    const lastDate = availableDates[availableDates.length - 1];
    const dd = ("0" + lastDate.getDate()).slice(-2);
    const mm = ("0" + (lastDate.getMonth() + 1)).slice(-2);
    const yyyy = lastDate.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
}
