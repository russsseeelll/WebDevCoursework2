require('dotenv').config();
const crypto = require('crypto');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const userModel = require('../models/user');

passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    userModel.getUserByEmail(email, (err, user) => {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect email.' });
        if (user.password !== password) return done(null, false, { message: 'Incorrect password.' });
        return done(null, user);
    });
}));

passport.use('github-login', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "/auth/github/callback",
    passReqToCallback: true,
    scope: ['user:email']
}, (req, accessToken, refreshToken, profile, done) => {
    let email;
    if (profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
    } else if (profile._json && profile._json.email) {
        email = profile._json.email;
    } else {
        return done(new Error('No email associated with this account'));
    }
    const name = profile.displayName || profile.username;
    // Here you can use req to determine if you want to update an existing user or create a new one.
    // For simplicity, we'll return a user object with email and name.
    return done(null, { email, name });
}));

passport.serializeUser((user, done) => {
    if (!user) return done(new Error("User is null or undefined"));
    if (!user._id) {
        user._id = crypto.randomBytes(8).toString('hex');
    }
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    userModel.getUserById(id, (err, user) => {
        if (user) return done(err, user);
        userModel.getUserByEmail(id, (err, user) => {
            return done(err, user);
        });
    });
});

module.exports = passport;
