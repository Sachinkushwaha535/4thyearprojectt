const Listing = require('./models/listings');
const { listingSchema, reviewSchema } = require('./schema');
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');
const mongoose = require("mongoose");

// Middleware to check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect("/login");  // Stop execution if not authenticated
    }
    next();  // Proceed if authenticated
};

// Middleware to save the redirect URL in the session
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// Middleware to check if the user is the owner of the listing
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to edit this listing.");
        return res.redirect(`/listings/${id}`);  // Stop execution if not the owner
    }
    next();  // Proceed if the user is the owner
};

// Middleware to validate the listing data
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errMsg);  // Error will be caught by global error handler
    }
    next();  // Proceed if no validation errors
};

// Middleware to check if the user is the author of the review
module.exports.isAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listings/${id}`);
    }
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to edit this review.");
        return res.redirect(`/listings/${id}`);  // Stop execution if not the author
    }
    next();  // Proceed if the user is the author
};

// Middleware to validate the review data
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);  // Error will be caught by global error handler
    }
    next();  // Proceed if no validation errors
};
