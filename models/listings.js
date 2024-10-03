const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review"); // Import the Review model

const DEFAULT_IMAGE_URL = "https://example.com/default-image.jpg"; // Define a default image URL

const listingSchema = new Schema({
    title: { 
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "No description provided"
    },
    image: { 
       url: String,
       filename: String,
    },
    price: {
        type: Number,
        min: 0, // Ensures price can't be negative
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

listingSchema.set('strictPopulate', false);

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
