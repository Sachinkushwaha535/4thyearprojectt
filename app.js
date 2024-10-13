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
const User = require("./models/user");
const listings = require('./routes/listings');
const reviews = require('./routes/review');
const userRoutes = require('./routes/user');

// Environment Variables
const dbUrl = process.env.ATLASDB_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;

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
app.use(express.static(path.join(__dirname, 'public')));

// Session Store Configuration
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: SESSION_SECRET,
    },
    touchAfter: 24 * 3600 // Time in seconds
});

store.on("error", (err) => {
    console.error("ERROR in MONGO SESSION STORE:", err);
});

// Session Configuration
const sessionOptions = {
    store,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Ensure secure cookies in production
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
    res.locals.currUser = req.user; // Current user information
    next();
});

// Routes
app.use('/', userRoutes);  // Use userRoutes for root
app.use('/listings', listings); // Use listings routes for /listings
app.use('/listings/:id/reviews', reviews); // Use reviews routes for specific listing

// Catch-all 404 Error Handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('error', { err });
});

// Start the Server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
