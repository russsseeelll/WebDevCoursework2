// bookingController.js

const courseModel = require('../models/course');
const classModel = require('../models/class');
const userModel = require('../models/user');
const bookingModel = require('../models/booking');

// Middleware to ensure the user is authenticated.
exports.ensureAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error', 'Please log in to view this page.');
    res.redirect('/auth/login');
};

// Render the booking page for a course.
exports.getBookCourse = (req, res) => {
    const courseId = req.query.course;
    if (!courseId) {
        req.flash('error', 'No course selected for booking.');
        return res.redirect('/courses');
    }
    // Use the courseId from the query parameters
    courseModel.getCourseById(courseId, (err, course) => {
        if (err || !course) {
            req.flash('error', 'Course not found.');
            return res.redirect('/courses');
        }
        // Render the booking form with the course details
        res.renderWithLayout('./bookings/bookCourse', {
            course: course,
            user: req.session.user || null,
            year: new Date().getFullYear()
        });
    });
};


// Render the booking page for a class.
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
        res.renderWithLayout('./bookings/bookClass', {
            title: 'Book Class',
            active: { classes: true },
            year: new Date().getFullYear(),
            classInfo: classInfo,
            availableDates: classInfo.availableDates || [],
            user: req.session.user || null
        });
    });
};

// Helper function to calculate the course end date.
function getCourseEndDate(course) {
    const duration = parseInt(course.duration, 10);
    if (isNaN(duration) || duration <= 0 || !course.schedule || !course.schedule.length) {
        return "";
    }
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + duration * 7);
    const weekdayMap = {
        "Sunday": 0,
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6
    };
    const scheduledDays = course.schedule.map(day => weekdayMap[day]).filter(n => n !== undefined);
    const availableDates = [];
    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
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

// Handle course booking requests.
exports.postBookCourse = (req, res) => {
    const processBooking = (user, userId, createSession = true) => {
        if (createSession) {
            req.session.user = user;
        }
        bookingModel.findOne(
            { userId: userId, bookingType: 'course', itemId: req.body.courseId },
            (err, existingBooking) => {
                if (err) {
                    req.flash('error', 'Error checking existing bookings.');
                    return res.redirect('/courses');
                }
                if (existingBooking) {
                    req.flash('error', 'You have already booked this course.');
                    return res.redirect('/courses');
                }
                const booking = {
                    userId: userId,
                    bookingType: 'course',
                    itemId: req.body.courseId,
                    contactName: req.body.contactName,
                    contactEmail: req.body.contactEmail,
                    contactMobile: req.body.contactMobile,
                    selectedDates: req.body.selectedDates,
                    createdAt: new Date()
                };
                bookingModel.addBooking(booking, (err) => {
                    if (err) {
                        req.flash('error', 'Error booking course: ' + err.message);
                        return res.redirect('/courses');
                    }
                    // After inserting the booking, update the course's participants.
                    courseModel.getCourseById(req.body.courseId, (err, course) => {
                        if (!err && course) {
                            course.participants = course.participants || [];
                            // For courses, store the real name and email
                            course.participants.push({
                                name: req.body.contactName,
                                email: req.body.contactEmail
                            });
                            courseModel.updateCourse(req.body.courseId, { participants: course.participants }, (updateErr) => {
                                if (updateErr) {
                                    console.error("Error updating course participants:", updateErr);
                                }
                                req.flash('success', 'Course booking request received.');
                                res.redirect('/courses');
                            });
                        } else {
                            req.flash('success', 'Course booking request received. (Could not update participants)');
                            res.redirect('/courses');
                        }
                    });
                });
            }
        );
    };

    if (req.session.user) {
        processBooking(req.session.user, req.session.user._id);
    } else {
        userModel.getUserByEmail(req.body.contactEmail, (err, existingUser) => {
            if (err) {
                req.flash('error', 'Error processing booking.');
                return res.redirect('/courses');
            }
            if (existingUser) {
                if (existingUser.isregistered === false) {
                    processBooking(existingUser, existingUser._id, false);
                } else {
                    processBooking(existingUser, existingUser._id);
                }
            } else {
                const newUser = {
                    name: req.body.contactName,
                    email: req.body.contactEmail,
                    mobile: req.body.contactMobile,
                    role: 'user',
                    isregistered: false
                };
                userModel.addUser(newUser, (err, savedUser) => {
                    if (err) {
                        req.flash('error', 'Error adding user for booking.');
                        return res.redirect('/courses');
                    }
                    processBooking(savedUser, savedUser._id, false);
                });
            }
        });
    }
};

// Handle class booking requests.
exports.postBookClass = (req, res) => {
    const processBooking = (user, userId, createSession = true) => {
        if (createSession) {
            req.session.user = user;
        }
        bookingModel.findOne(
            {
                userId: userId,
                bookingType: 'class',
                itemId: req.body.classId,
                selectedTime: req.body.selectedTime
            },
            (err, existingBooking) => {
                if (err) {
                    req.flash('error', 'Error checking existing bookings.');
                    return res.redirect('/classes');
                }
                if (existingBooking) {
                    req.flash('error', 'You have already booked this class for that time slot.');
                    return res.redirect('/classes');
                }
                const booking = {
                    userId: userId,
                    bookingType: 'class',
                    itemId: req.body.classId,
                    contactName: req.body.contactName,
                    contactEmail: req.body.contactEmail,
                    contactMobile: req.body.contactMobile,
                    selectedTime: req.body.selectedTime,
                    createdAt: new Date()
                };
                bookingModel.addBooking(booking, (err) => {
                    if (err) {
                        req.flash('error', 'Error booking class: ' + err.message);
                        return res.redirect('/classes');
                    }
                    // After inserting the booking, update the class's participants.
                    classModel.getClassById(req.body.classId, (err, classInfo) => {
                        if (!err && classInfo) {
                            classInfo.participants = classInfo.participants || [];
                            // For classes, store the name, email, and selectedTime
                            classInfo.participants.push({
                                name: req.body.contactName,
                                email: req.body.contactEmail,
                                selectedTime: req.body.selectedTime
                            });
                            classModel.updateClass(req.body.classId, { participants: classInfo.participants }, (updateErr) => {
                                if (updateErr) {
                                    console.error("Error updating class participants:", updateErr);
                                }
                                req.flash('success', 'Class booking request received.');
                                res.redirect('/classes');
                            });
                        } else {
                            req.flash('success', 'Class booking request received. (Could not update participants)');
                            res.redirect('/classes');
                        }
                    });
                });
            }
        );
    };

    if (req.session.user) {
        processBooking(req.session.user, req.session.user._id);
    } else {
        userModel.getUserByEmail(req.body.contactEmail, (err, existingUser) => {
            if (err) {
                req.flash('error', 'Error processing booking.');
                return res.redirect('/classes');
            }
            if (existingUser) {
                if (existingUser.isregistered === false) {
                    processBooking(existingUser, existingUser._id, false);
                } else {
                    processBooking(existingUser, existingUser._id);
                }
            } else {
                const newUser = {
                    name: req.body.contactName,
                    email: req.body.contactEmail,
                    mobile: req.body.contactMobile,
                    role: 'user',
                    isregistered: false
                };
                userModel.addUser(newUser, (err, savedUser) => {
                    if (err) {
                        req.flash('error', 'Error adding user for booking.');
                        return res.redirect('/classes');
                    }
                    processBooking(savedUser, savedUser._id, false);
                });
            }
        });
    }
};

// Manage bookings: fetch and process all bookings for the current user.
exports.getManageBookings = async (req, res) => {
    const currentUser = req.user || req.session.user;
    if (!currentUser) {
        req.flash('error', 'Please log in to view your bookings.');
        return res.redirect('/auth/login');
    }

    bookingModel.getBookingsByUserId(currentUser._id, async (err, bookings) => {
        if (err) {
            req.flash('error', 'Error fetching bookings: ' + err.message);
            bookings = [];
        }
        if (!bookings || bookings.length === 0) {
            return res.renderWithLayout('./manage/manageBookings', {
                title: 'My Bookings',
                active: { bookings: true },
                year: new Date().getFullYear(),
                bookings: []
            });
        }
        const processedBookings = [];
        for (const b of bookings) {
            let location = '';
            let extraInfo = '';
            let itemName = '';
            let courseEndDate = '';

            if (b.bookingType === 'course') {
                const course = await new Promise((resolve) => {
                    courseModel.getCourseById(b.itemId, (err, course) => {
                        if (err || !course) {
                            return resolve(null);
                        }
                        resolve(course);
                    });
                });
                if (course) {
                    location = course.location || '';
                    itemName = course.name || '';
                    if (course.schedule && Array.isArray(course.schedule) && course.schedule.length > 0) {
                        extraInfo = 'Every ' + course.schedule.join(', ');
                    } else if (b.selectedDates) {
                        const dates = b.selectedDates.split(',');
                        extraInfo = 'Starts on ' + dates[0];
                    } else {
                        extraInfo = 'No schedule';
                    }
                    if (course.startTime && course.endTime) {
                        extraInfo += ' | ' + course.startTime + '-' + course.endTime;
                    }

                    courseEndDate = getCourseEndDate(course);
                }
            } else if (b.bookingType === 'class') {
                const classInfo = await new Promise((resolve) => {
                    classModel.getClassById(b.itemId, (err, classInfo) => {
                        if (err || !classInfo) {
                            return resolve(null);
                        }
                        resolve(classInfo);
                    });
                });
                if (classInfo) {
                    location = classInfo.location || '';
                    itemName = classInfo.name || '';
                    if (b.selectedTime) {
                        const parts = b.selectedTime.split(' - ');
                        extraInfo = parts.length > 1 ? parts[0] + ' | ' + parts.slice(1).join(' - ') : b.selectedTime;
                    } else {
                        extraInfo = 'No time selected';
                    }
                    courseEndDate = "N/A";
                }
            }

            let createdAtVal = b.createdAt;
            if (createdAtVal && createdAtVal.$$date) {
                createdAtVal = createdAtVal.$$date;
            }
            const formattedDate = new Date(createdAtVal).toLocaleDateString('en-GB');

            processedBookings.push({
                bookingType: b.bookingType,
                itemName: itemName,
                location: location,
                contactEmail: b.contactEmail,
                contactMobile: b.contactMobile,
                extraInfo: extraInfo,
                courseEndDate: courseEndDate,
                formattedDate: formattedDate,
                _id: b._id
            });
        }
        res.renderWithLayout('./manage/manageBookings', {
            title: 'My Bookings',
            active: { bookings: true },
            year: new Date().getFullYear(),
            bookings: processedBookings
        });
    });
};

exports.cancelBooking = (req, res) => {
    const bookingId = req.body.bookingId;
    if (!bookingId) {
        req.flash('error', 'No booking specified.');
        return res.redirect('/manageBookings');
    }
    bookingModel.getBookingById(bookingId, (err, booking) => {
        if (err || !booking) {
            req.flash('error', 'Booking not found.');
            return res.redirect('/manageBookings');
        }
        bookingModel.deleteBooking(bookingId, (err) => {
            if (err) {
                req.flash('error', 'Error cancelling booking: ' + err.message);
                return res.redirect('/manageBookings');
            }
            // Cascade: remove the participant from the course or class.
            if (booking.bookingType === 'course') {
                courseModel.getCourseById(booking.itemId, (err, course) => {
                    if (!err && course) {
                        // Filter out the participant based on a unique property (email).
                        course.participants = (course.participants || []).filter(p => p.email !== booking.contactEmail);
                        courseModel.updateCourse(booking.itemId, { participants: course.participants }, (updateErr) => {
                            if (updateErr) {
                                console.error('Error removing participant from course:', updateErr);
                            }
                            req.flash('success', 'Booking cancelled successfully.');
                            res.redirect('/manageBookings');
                        });
                    } else {
                        req.flash('success', 'Booking cancelled successfully.');
                        res.redirect('/manageBookings');
                    }
                });
            } else if (booking.bookingType === 'class') {
                classModel.getClassById(booking.itemId, (err, classInfo) => {
                    if (!err && classInfo) {
                        // For classes, also check selectedTime since a user may have multiple bookings.
                        classInfo.participants = (classInfo.participants || []).filter(p =>
                            p.email !== booking.contactEmail || p.selectedTime !== booking.selectedTime
                        );
                        classModel.updateClass(booking.itemId, { participants: classInfo.participants }, (updateErr) => {
                            if (updateErr) {
                                console.error('Error removing participant from class:', updateErr);
                            }
                            req.flash('success', 'Booking cancelled successfully.');
                            res.redirect('/manageBookings');
                        });
                    } else {
                        req.flash('success', 'Booking cancelled successfully.');
                        res.redirect('/manageBookings');
                    }
                });
            }
        });
    });
};

