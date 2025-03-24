const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

// Configure Mustache templating engine
app.engine('mustache', mustacheExpress(path.join(__dirname, 'views/partials'), '.mustache'));
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Setup session and flash middleware
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
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Custom render helper to include layouts
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

// Import and use routes
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/dashboard', dashboardRoutes);

const coursesRoutes = require('./routes/courses');
app.use('/api/courses', coursesRoutes);

const classesRoutes = require('./routes/classes');
app.use('/api/classes', classesRoutes);

const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}. Ctrl+C to quit.`);
    });
}

module.exports = app;
