// models/class.js
const Datastore = require('nedb');
const path = require('path');

const db = new Datastore({
    filename: path.join(__dirname, '../data/classes.db'),
    autoload: true
});

module.exports = {
    db,
    addClass: (classObj, callback) => {
        db.insert(classObj, callback);
    },
    getClasses: (query, callback) => {
        db.find(query, callback);
    },
    getClassById: (id, callback) => {
        db.findOne({ _id: id }, callback);
    },
    updateClass: (id, update, callback) => {
        db.update({ _id: id }, { $set: update }, {}, callback);
    },
    deleteClass: (id, callback) => {
        db.remove({ _id: id }, {}, callback);
    }
};
