require("dotenv").config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require('./models/user');
const listingsRoutes = require('./routes/listings');
const reviewsRoutes = require('./routes/review');
const favicon = require('serve-favicon');
const fs = require('fs');
const userRoutes = require('./routes/user');

// Environment Variables
const dbUrl = process.env.ATLASDB_URL || 'mongodb://localhost:27017/my-database';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallbacksecret';

// Connect to MongoDB
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

// Middleware & Static Files
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')));

// Check if favicon exists and apply middleware if it does
const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
if (fs.existsSync(faviconPath)) {
    app.use(favicon(faviconPath));
} else {
    console.warn("No favicon found at /public/favicon.ico");
}

// Session Store Configuration
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600 // Avoid multiple updates within 24 hours
});

store.on("error", (err) => {
    console.error("ERROR in MONGO SESSION STORE:", err);
});

// Session Configuration
const sessionOptions = {
    store,
    name: 'session', 
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash and User Data Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user || null;
    console.log("Current User:", req.user); // Debugging log for user data
    next();
});

// Root Route
app.get('/', (req, res) => {
    res.redirect('/listings');
});

// Route Handlers
app.use('/', userRoutes);
app.use('/listings', listingsRoutes);
app.use('/listings/:listingId/reviews', reviewsRoutes);

// Catch-all 404 Error Handler
app.all('*', (req, res, next) => {
    console.log(`404 Error - Requested URL: ${req.originalUrl}`);
    next(new ExpressError('Page not found', 404));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong!';
    console.error(err);
    res.status(statusCode).render('error', { message: err.message });
});

// Start the Server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
