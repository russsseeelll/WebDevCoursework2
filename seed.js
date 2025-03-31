const path = require('path');
const Datastore = require('nedb');

const userModel = require('./models/user');
const classModel = require('./models/class');
const courseModel = require('./models/course');

// Helper to compute the end date for a course.
// Given a startDate (ISO string), duration (in weeks), and an array of scheduled days,
// it returns the last available date (as an ISO date string, "YYYY-MM-DD") within that time frame.
function computeCourseEndDate(startDate, duration, schedule) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration * 7);
    const weekdayMap = {
        "Sunday": 0,
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6
    };
    const scheduledDays = schedule.map(day => weekdayMap[day]).filter(n => n !== undefined);
    let lastAvailable = null;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (scheduledDays.includes(d.getDay())) {
            lastAvailable = new Date(d);
        }
    }
    if (!lastAvailable) return "";
    // Format as "YYYY-MM-DD"
    const yyyy = lastAvailable.getFullYear();
    let mm = (lastAvailable.getMonth() + 1).toString();
    let dd = lastAvailable.getDate().toString();
    if (mm.length < 2) mm = '0' + mm;
    if (dd.length < 2) dd = '0' + dd;
    return `${yyyy}-${mm}-${dd}`;
}

function seedUser() {
    return new Promise((resolve, reject) => {
        // Use userModel.db which is exported in the user model.
        userModel.db.findOne({ email: 'alexandra.smith@danceacademy.com' }, (err, user) => {
            if (err) return reject(err);
            if (user) return resolve(user);
            const adminUser = {
                name: 'Alexandra Smith',
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

function seedClasses() {
    return new Promise((resolve, reject) => {
        // Create a new Datastore instance for classes using the same file as in your models.
        const classDb = new Datastore({
            filename: path.join(__dirname, 'data', 'classes.db'),
            autoload: true
        });
        // Remove all existing classes.
        classDb.remove({}, { multi: true }, (err) => {
            if (err) return reject(err);
            const classes = [
                {
                    name: "Salsa Fusion",
                    description: "Experience the fiery passion of salsa with dynamic fusion moves.",
                    location: "Glasgow Dance Studio - Room A",
                    price: 15,
                    timeslots: [
                        "25/04/2025 - 18:00 - 19:30",
                        "27/04/2025 - 18:00 - 19:30"
                    ],
                    participants: []
                },
                {
                    name: "Tango Basics",
                    description: "Learn the fundamentals of the sultry Argentine tango.",
                    location: "Glasgow Dance Studio - Room B",
                    price: 18,
                    timeslots: [
                        "26/04/2025 - 19:00 - 20:30",
                        "28/04/2025 - 19:00 - 20:30"
                    ],
                    participants: []
                },
                {
                    name: "Hip-Hop Groove",
                    description: "Get into the rhythm with high-energy hip-hop dance sessions.",
                    location: "Glasgow Urban Dance Center",
                    price: 20,
                    timeslots: [
                        "27/04/2025 - 20:00 - 21:30",
                        "29/04/2025 - 20:00 - 21:30"
                    ],
                    participants: []
                },
                {
                    name: "Ballet Expression",
                    description: "Explore classical ballet techniques with a modern twist.",
                    location: "Glasgow Ballet Studio",
                    price: 22,
                    timeslots: [
                        "28/04/2025 - 17:00 - 18:30",
                        "30/04/2025 - 17:00 - 18:30"
                    ],
                    participants: []
                }
            ];
            classDb.insert(classes, (err, newClasses) => {
                if (err) return reject(err);
                resolve(newClasses);
            });
        });
    });
}

function seedCourses() {
    return new Promise((resolve, reject) => {
        // Create a new Datastore instance for courses.
        const courseDb = new Datastore({
            filename: path.join(__dirname, 'data', 'courses.db'),
            autoload: true
        });
        // Remove all existing courses.
        courseDb.remove({}, { multi: true }, (err) => {
            if (err) return reject(err);
            const courses = [
                {
                    name: "Salsa Intensive",
                    description: "Master the art of salsa with immersive sessions focusing on technique and performance.",
                    startDate: "2025-05-01",
                    duration: 6,
                    schedule: ["Monday", "Wednesday", "Friday"],
                    price: 200,
                    location: "Dance Studio A",
                    startTime: "18:00",
                    endTime: "20:00",
                    participants: []
                },
                {
                    name: "Hip-Hop Mastery",
                    description: "Advanced hip-hop techniques and performance training for dedicated dancers.",
                    startDate: "2025-06-01",
                    duration: 8,
                    schedule: ["Tuesday", "Thursday"],
                    price: 250,
                    location: "Urban Dance Studio",
                    startTime: "19:00",
                    endTime: "21:00",
                    participants: []
                },
                {
                    name: "Ballet Fundamentals",
                    description: "Discover classical ballet techniques and build a strong foundation in movement.",
                    startDate: "2025-07-01",
                    duration: 4,
                    schedule: ["Wednesday", "Saturday"],
                    price: 180,
                    location: "Ballet Studio",
                    startTime: "15:00",
                    endTime: "17:00",
                    participants: []
                },
                {
                    name: "Contemporary Dance Workshop",
                    description: "Explore modern dance styles and express yourself through movement.",
                    startDate: "2025-08-01",
                    duration: 5,
                    schedule: ["Monday", "Thursday"],
                    price: 220,
                    location: "Contemporary Dance Studio",
                    startTime: "17:30",
                    endTime: "19:30",
                    participants: []
                }
            ];

            // Compute endDate for each course using computeCourseEndDate.
            courses.forEach(course => {
                course.endDate = computeCourseEndDate(course.startDate, course.duration, course.schedule);
            });

            courseDb.insert(courses, (err, newCourses) => {
                if (err) return reject(err);
                resolve(newCourses);
            });
        });
    });
}

Promise.all([seedUser(), seedClasses(), seedCourses()])
    .then(results => {
        console.log("Seeding complete:");
        console.log("User:", results[0]);
        console.log("Classes:", results[1]);
        console.log("Courses:", results[2]);
        process.exit();
    })
    .catch(err => {
        console.error("Seeding error:", err);
        process.exit(1);
    });
