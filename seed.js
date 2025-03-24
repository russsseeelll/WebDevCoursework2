// seed.js
const userModel = require('./models/user');

// Define the dummy organiser user with a password
const dummyUser = {
    name: 'Dummy Organiser',
    email: 'organiser@example.com',
    role: 'organiser',
    password: 'password'
};

// Check if the dummy user already exists before inserting
userModel.db.findOne({ email: dummyUser.email }, (err, user) => {
    if (err) {
        console.error("Error accessing the database:", err);
        process.exit(1);
    }
    if (user) {
        console.log("Dummy user already exists:", user);
        process.exit();
    } else {
        userModel.addUser(dummyUser, (err, newUser) => {
            if (err) {
                console.error("Error inserting dummy user:", err);
                process.exit(1);
            } else {
                console.log("Inserted dummy user:", newUser);
                process.exit();
            }
        });
    }
});
