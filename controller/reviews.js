const Listing = require('../models/listings');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const mongoose = require("mongoose");

// Create a new review for a listing
module.exports.createReview = async (req, res, next) => {
    const { id } = req.params;

    // Validate listing ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ExpressError(400, 'Invalid Listing ID'));
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        return next(new ExpressError(404, 'Listing not found'));
    }

    // Validate review rating
    const { rating } = req.body.review;
    if (rating < 1 || rating > 5) {
        return next(new ExpressError(400, 'Rating must be between 1 and 5'));
    }

    try {
        const newReview = new Review(req.body.review);
        newReview.author = req.user._id; // Set the author as the logged-in user

        // Add the new review to the listing's reviews array
        listing.reviews.push(newReview);

        // Save both the review and the updated listing
        await newReview.save();
        await listing.save();

        // Flash message for successful review submission
        req.flash('success', 'Review submitted successfully!');
        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        // Handle errors and pass them to the global error handler
        next(err);
    }
};

// Delete a review from a listing
module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;

    // Validate IDs for listing and review
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewId)) {
        return next(new ExpressError(400, 'Invalid Listing or Review ID'));
    }

    try {
        // Remove the review reference from the listing and delete the review
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);

        // Flash message for successful review deletion
        req.flash('success', 'Review deleted successfully!');
        res.redirect(`/listings/${id}`);
    } catch (err) {
        // Handle errors and pass them to the global error handler
        next(err);
    }
};
