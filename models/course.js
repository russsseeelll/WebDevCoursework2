// models/course.js
const Datastore = require('nedb');
const path = require('path');

const db = new Datastore({
    filename: path.join(__dirname, '../data/courses.db'),
    autoload: true
});

module.exports = {
    db,
    addCourse: (course, callback) => {
        db.insert(course, callback);
    },
    getCourses: (query, callback) => {
        db.find(query, callback);
    },
    getCourseById: (id, callback) => {
        db.findOne({ _id: id }, callback);
    },
    updateCourse: (id, update, callback) => {
        db.update({ _id: id }, { $set: update }, {}, callback);
    },
    deleteCourse: (id, callback) => {
        db.remove({ _id: id }, {}, callback);
    }
};
