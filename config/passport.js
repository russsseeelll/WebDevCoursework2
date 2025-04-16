const passport = require("passport");
const userModel = require("../models/user");
const crypto = require("crypto");
require('dotenv').config();
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

// use local strategy to verify email and password
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    userModel.getUserByEmail(email, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'incorrect email.' });
        if (user.password !== password) return done(null, false, { message: 'incorrect password.' });
        if (user.isregistered === false) {
            // if user hasn't completed registration, do not allow login
            return done(null, false, { message: 'user not registered. please complete registration.' });
        }
        return done(null, user);
    });
}));

// use github strategy to login users via github account
passport.use('github-login', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "/auth/github/callback",
    passReqToCallback: true,
    scope: ['user:email']
}, (req, accessToken, refreshToken, profile, done) => {
    let email;
    // get email from profile data if available
    if (profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
    } else if (profile._json && profile._json.email) {
        email = profile._json.email;
    } else {
        return done(new Error('no email associated with this account'));
    }
    const name = profile.displayName || profile.username;
    return done(null, { email, name });
}));

// store the user id in the session
passport.serializeUser((user, done) => {
    if (!user) return done(new Error("user is null or undefined"));
    // if no user id, generate one
    if (!user._id) {
        user._id = crypto.randomBytes(8).toString('hex');
    }
    done(null, user._id);
});

// retrieve full user details using id
passport.deserializeUser((id, done) => {
    userModel.getUserById(id, (err, user) => {
        if (user) return done(err, user);
        // try to get user by email if not found by id
        userModel.getUserByEmail(id, (err, user) => {
            return done(err, user);
        });
    });
});

module.exports = passport;
