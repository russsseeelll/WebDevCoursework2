const userModel = require('./models/user');
const classModel = require('./models/class');
const courseModel = require('./models/course');

function seedUser() {
    return new Promise((resolve, reject) => {
        userModel.db.findOne({ email: 'dummy@dummy.com' }, (err, user) => {
            if (err) return reject(err);
            if (user) return resolve(user);
            const dummyUser = {
                name: 'Dummy Admin',
                email: 'dummy@dummy.com',
                role: 'organiser',
                password: 'password'
            };
            userModel.addUser(dummyUser, (err, newUser) => {
                if (err) return reject(err);
                resolve(newUser);
            });
        });
    });
}

function seedClasses() {
    return new Promise((resolve, reject) => {
        classModel.db.remove({}, { multi: true }, (err) => {
            if (err) return reject(err);
            const classes = [
                {
                    name: "SPIN CLASS",
                    description: "Biking",
                    location: "Glasgow office - studio 1",
                    price: 10,
                    timeslots: ["25/04/2025 - 09:00 - 10:00", "27/03/2025 - 13:00 - 14:00"],
                    participants: []
                },
                {
                    name: "YOGA SESSION",
                    description: "Mind and body balance",
                    location: "Glasgow office - studio 2",
                    price: 12,
                    timeslots: ["26/04/2025 - 10:00 - 11:00", "28/04/2025 - 17:00 - 18:00"],
                    participants: []
                },
                {
                    name: "HIIT WORKOUT",
                    description: "High intensity interval training",
                    location: "Glasgow office - gym",
                    price: 15,
                    timeslots: ["27/04/2025 - 08:00 - 09:00", "29/04/2025 - 18:00 - 19:00"],
                    participants: []
                },
                {
                    name: "PILATES",
                    description: "Core strength and flexibility",
                    location: "Glasgow office - studio 3",
                    price: 14,
                    timeslots: ["28/04/2025 - 11:00 - 12:00", "30/04/2025 - 16:00 - 17:00"],
                    participants: []
                }
            ];
            classModel.db.insert(classes, (err, newClasses) => {
                if (err) return reject(err);
                resolve(newClasses);
            });
        });
    });
}

function seedCourses() {
    return new Promise((resolve, reject) => {
        courseModel.db.remove({}, { multi: true }, (err) => {
            if (err) return reject(err);
            const courses = [
                {
                    name: "AADP",
                    description: "Bunch AADP",
                    startDate: "2025-04-01",
                    duration: 8,
                    schedule: ["Monday", "Tuesday", "Wednesday"],
                    price: 100,
                    location: "Studio 1",
                    startTime: "09:00",
                    endTime: "12:00",
                    participants: []
                },
                {
                    name: "Salsa Beginners",
                    description: "Learn basic Salsa moves",
                    startDate: "2025-05-01",
                    duration: 6,
                    schedule: ["Thursday", "Friday"],
                    price: 80,
                    location: "Dance Hall A",
                    startTime: "18:00",
                    endTime: "20:00",
                    participants: []
                },
                {
                    name: "Hip Hop Jam",
                    description: "Hip Hop dance classes",
                    startDate: "2025-06-01",
                    duration: 10,
                    schedule: ["Wednesday", "Saturday"],
                    price: 120,
                    location: "Urban Studio",
                    startTime: "17:00",
                    endTime: "19:00",
                    participants: []
                },
                {
                    name: "Ballet Intensive",
                    description: "Advanced ballet technique",
                    startDate: "2025-07-01",
                    duration: 4,
                    schedule: ["Monday", "Friday"],
                    price: 150,
                    location: "Ballet Studio",
                    startTime: "14:00",
                    endTime: "16:00",
                    participants: []
                }
            ];
            courseModel.db.insert(courses, (err, newCourses) => {
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
