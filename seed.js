const userModel = require('./models/user');
const classModel = require('./models/class');
const courseModel = require('./models/course');

// helper to compute the course end date from start date, duration, and schedule
function computeCourseEndDate(startDate, duration, schedule) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration * 7);
    const weekdayMap = {
        "sunday": 0,
        "monday": 1,
        "tuesday": 2,
        "wednesday": 3,
        "thursday": 4,
        "friday": 5,
        "saturday": 6
    };
    // convert schedule days to numbers using the weekday map
    const scheduledDays = schedule.map(day => weekdayMap[day.toLowerCase()]).filter(n => n !== undefined);
    let lastAvailable = null;
    // find the last day in the range that matches a scheduled day
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (scheduledDays.includes(d.getDay())) {
            lastAvailable = new Date(d);
        }
    }
    if (!lastAvailable) return "";
    const yyyy = lastAvailable.getFullYear();
    let mm = (lastAvailable.getMonth() + 1).toString();
    let dd = lastAvailable.getDate().toString();
    if (mm.length < 2) mm = '0' + mm;
    if (dd.length < 2) dd = '0' + dd;
    return `${yyyy}-${mm}-${dd}`;
}

// seed a default organiser user if not already present
function seedUser() {
    return new Promise((resolve, reject) => {
        userModel.getUserByEmail('alexandra.smith@danceacademy.com', (err, user) => {
            if (err) return reject(err);
            if (user) return resolve(user);
            const adminUser = {
                name: 'alexandra smith',
                email: 'alexandra.smith@danceacademy.com',
                role: 'organiser',
                password: 'securepassword123'
            };
            userModel.addUser(adminUser, (err, newUser) => {
                if (err) return reject(err);
                resolve(newUser);
            });
        });
    });
}

// clear all classes from the database
function clearClasses() {
    return new Promise((resolve, reject) => {
        classModel.getClasses({}, (err, classes) => {
            if (err) return reject(err);
            if (!classes || classes.length === 0) return resolve();
            const deletePromises = classes.map(c => new Promise((resolveDel, rejectDel) => {
                classModel.deleteClass(c._id, (err) => {
                    if (err) return rejectDel(err);
                    resolveDel();
                });
            }));
            Promise.all(deletePromises)
                .then(() => resolve())
                .catch(reject);
        });
    });
}

// seed classes by clearing existing ones then inserting new ones
function seedClasses() {
    return new Promise((resolve, reject) => {
        clearClasses()
            .then(() => {
                const classesToInsert = [
                    {
                        name: "salsa fusion",
                        description: "experience the fiery passion of salsa with dynamic fusion moves.",
                        location: "glasgow dance studio - room a",
                        price: 15,
                        timeslots: ["25/04/2025 - 18:00 - 19:30", "27/04/2025 - 18:00 - 19:30"],
                        participants: []
                    },
                    {
                        name: "tango basics",
                        description: "learn the fundamentals of the sultry argentine tango.",
                        location: "glasgow dance studio - room b",
                        price: 18,
                        timeslots: ["26/04/2025 - 19:00 - 20:30", "28/04/2025 - 19:00 - 20:30"],
                        participants: []
                    },
                    {
                        name: "hip-hop groove",
                        description: "get into the rhythm with high-energy hip-hop dance sessions.",
                        location: "glasgow urban dance center",
                        price: 20,
                        timeslots: ["27/04/2025 - 20:00 - 21:30", "29/04/2025 - 20:00 - 21:30"],
                        participants: []
                    },
                    {
                        name: "ballet expression",
                        description: "explore classical ballet techniques with a modern twist.",
                        location: "glasgow ballet studio",
                        price: 22,
                        timeslots: ["28/04/2025 - 17:00 - 18:30", "30/04/2025 - 17:00 - 18:30"],
                        participants: []
                    }
                ];
                const insertPromises = classesToInsert.map(newClass => {
                    return new Promise((resolveInsert, rejectInsert) => {
                        classModel.addClass(newClass, (err, insertedClass) => {
                            if (err) return rejectInsert(err);
                            resolveInsert(insertedClass);
                        });
                    });
                });
                Promise.all(insertPromises)
                    .then(insertedClasses => resolve(insertedClasses))
                    .catch(reject);
            })
            .catch(reject);
    });
}

// clear all courses from the database
function clearCourses() {
    return new Promise((resolve, reject) => {
        courseModel.getCourses({}, (err, courses) => {
            if (err) return reject(err);
            if (!courses || courses.length === 0) return resolve();
            const deletePromises = courses.map(course => new Promise((resolveDel, rejectDel) => {
                courseModel.deleteCourse(course._id, (err) => {
                    if (err) return rejectDel(err);
                    resolveDel();
                });
            }));
            Promise.all(deletePromises)
                .then(() => resolve())
                .catch(reject);
        });
    });
}

// seed courses by clearing existing ones, calculating end dates, and inserting new courses
function seedCourses() {
    return new Promise((resolve, reject) => {
        clearCourses()
            .then(() => {
                const coursesToInsert = [
                    {
                        name: "salsa intensive",
                        description: "master the art of salsa with immersive sessions focusing on technique and performance.",
                        startDate: "2025-05-01",
                        duration: 6,
                        schedule: ["monday", "wednesday", "friday"],
                        price: 200,
                        location: "dance studio a",
                        startTime: "18:00",
                        endTime: "20:00",
                        participants: []
                    },
                    {
                        name: "hip-hop mastery",
                        description: "advanced hip-hop techniques and performance training for dedicated dancers.",
                        startDate: "2025-06-01",
                        duration: 8,
                        schedule: ["tuesday", "thursday"],
                        price: 250,
                        location: "urban dance studio",
                        startTime: "19:00",
                        endTime: "21:00",
                        participants: []
                    },
                    {
                        name: "ballet fundamentals",
                        description: "discover classical ballet techniques and build a strong foundation in movement.",
                        startDate: "2025-07-01",
                        duration: 4,
                        schedule: ["wednesday", "saturday"],
                        price: 180,
                        location: "ballet studio",
                        startTime: "15:00",
                        endTime: "17:00",
                        participants: []
                    },
                    {
                        name: "contemporary dance workshop",
                        description: "explore modern dance styles and express yourself through movement.",
                        startDate: "2025-08-01",
                        duration: 5,
                        schedule: ["monday", "thursday"],
                        price: 220,
                        location: "contemporary dance studio",
                        startTime: "17:30",
                        endTime: "19:30",
                        participants: []
                    }
                ];

                // compute end date for each course
                coursesToInsert.forEach(course => {
                    course.endDate = computeCourseEndDate(course.startDate, course.duration, course.schedule);
                });

                const insertPromises = coursesToInsert.map(course => {
                    return new Promise((resolveInsert, rejectInsert) => {
                        courseModel.addCourse(course, (err, insertedCourse) => {
                            if (err) return rejectInsert(err);
                            resolveInsert(insertedCourse);
                        });
                    });
                });
                Promise.all(insertPromises)
                    .then(insertedCourses => resolve(insertedCourses))
                    .catch(reject);
            })
            .catch(reject);
    });
}

// run all the seed functions and exit when done
Promise.all([seedUser(), seedClasses(), seedCourses()])
    .then(results => {
        console.log("seeding complete:");
        console.log("user:", results[0]);
        console.log("classes:", results[1]);
        console.log("courses:", results[2]);
        process.exit();
    })
    .catch(err => {
        console.error("seeding error:", err);
        process.exit(1);
    });
