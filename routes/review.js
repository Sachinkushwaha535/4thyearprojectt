const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to access :id from parent route
const { createReview, deleteReview } = require('../controller/reviews');
const { validateReview, isLoggedIn, isAuthor } = require('../middleware');

// Route to create a review
//router.post('/', isLoggedIn, validateReview, createReview);
// In reviews.js
router.post('/', isLoggedIn, validateReview, async (req, res, next) => {
    try {
        await createReview(req, res); // Your existing createReview logic
    } catch (err) {
        console.error('Error creating review:', err);
        req.flash('error', 'Something went wrong while submitting your review.');
        return res.redirect(`/listings/${req.params.id}`); // Ensure this points to the listing
    }
});


// Route to delete a review
router.delete('/:reviewId', isLoggedIn, isAuthor, deleteReview);

module.exports = router;
