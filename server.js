const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

// set up mustache as the templating engine using partials
app.engine('mustache', mustacheExpress(path.join(__dirname, 'views/partials'), '.mustache'));
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// parse url-encoded bodies from form submissions
app.use(express.urlencoded({ extended: true }));

// set a local variable for demo mode based on env variable
app.use((req, res, next) => {
    res.locals.demoMode = process.env.DEMO_MODE === 'true';
    next();
});

// set up session and flash messages
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// add user info to locals for use in templates; mark if user is organiser
app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = {
            email: req.session.user.email,
            role: req.session.user.role,
            name: req.session.user.name,
            isOrganiser: req.session.user.role === 'organiser'
        };
    } else {
        res.locals.user = null;
    }
    next();
});

// add a custom render helper to wrap views in a layout
app.use((req, res, next) => {
    res.renderWithLayout = (view, options = {}) => {
        app.render(view, options, (err, html) => {
            if (err) return next(err);
            options.body = html;
            res.render('layouts/main', options);
        });
    };
    next();
});

// initialize passport for authentication
const passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// mount routes
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

const bookingRoutes = require('./routes/booking');
app.use('/', bookingRoutes);

const manageRoutes = require('./routes/manage');
app.use('/', manageRoutes);

// mount authentication routes under /auth
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// add other routes
const dashboardRoutes = require('./routes/dashboard');
app.use('/dashboard', dashboardRoutes);

const coursesRoutes = require('./routes/courses');
app.use('/courses', coursesRoutes);

const classesRoutes = require('./routes/classes');
app.use('/classes', classesRoutes);

const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`server started on port ${PORT}. ctrl+c to quit.`);
    });
}

module.exports = app;
