// models/booking.js
const Datastore = require('nedb');
const path = require('path');

const db = new Datastore({
    filename: path.join(__dirname, '../data/bookings.db'),
    autoload: true
});

module.exports = {
    db,
    addBooking: (booking, callback) => {
        db.insert(booking, callback);
    },
    getBookingsByUserId: (userId, callback) => {
        db.find({ userId: userId }, callback);
    },
    deleteBooking: (id, callback) => {
        db.remove({ _id: id }, {}, callback);
    },
    findOne: (query, callback) => {
        db.findOne(query, callback);
    }
};
