const Datastore = require('nedb');
const path = require('path');

const db = new Datastore({
    filename: path.join(__dirname, '../data/users.db'),
    autoload: true
});

module.exports = {
    db,
    addUser: (user, callback) => {
        db.insert(user, callback);
    },
    getUsers: (query, callback) => {
        db.find(query, callback);
    },
    getUserById: (id, callback) => {
        db.findOne({ _id: id }, callback);
    },
    getUserByEmail: (email, callback) => {
        db.findOne({ email: email }, callback);
    },
    updateUser: (id, update, callback) => {
        db.update({ _id: id }, { $set: update }, {}, callback);
    },
    deleteUser: (id, callback) => {
        db.remove({ _id: id }, {}, callback);
    }
};
