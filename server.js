const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

app.engine('mustache', mustacheExpress(path.join(__dirname, 'views/partials'), '.mustache'));
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

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

const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/dashboard', dashboardRoutes);

const coursesRoutes = require('./routes/courses');
app.use('/courses', coursesRoutes);

const classesRoutes = require('./routes/classes');
app.use('/classes', classesRoutes);

const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}. Ctrl+C to quit.`);
});