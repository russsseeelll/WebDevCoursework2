const Datastore = require('nedb');
const path = require('path');

const db = new Datastore({
    filename: path.join(__dirname, '../data/classes.db'),
    autoload: true
});

module.exports = {
    addClass: (newClass, callback) => {
        db.insert(newClass, callback);
    },
    getClasses: (query, callback) => {
        db.find(query, callback);
    },
    countClasses: (query, callback) => {
        db.count(query, callback);
    },
    getClassesPaginated: (query, skip, limit, callback) => {
        db.find(query).skip(skip).limit(limit).exec(callback);
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
