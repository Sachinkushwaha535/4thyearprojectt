const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust"; // Corrected the IP address

// Function to connect to the database
async function connectDB() {
    try {
        await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to the database");
    } catch (err) {
        console.error("Error connecting to the database:", err);
        process.exit(1); // Exit the process with a failure code if connection fails
    }
}

// Function to initialize the database
async function initDB() {
    try {
        await Listing.deleteMany({});
        const listingsWithOwner = initData.data.map(obj => ({
            ...obj,
            owner: "66b602d2a3166743b4d18c62" // Ensure this ObjectId is valid in your User collection
        }));
        await Listing.insertMany(listingsWithOwner);
        console.log("Data was initialized");
    } catch (err) {
        console.error("Error initializing data:", err);
    } finally {
        await mongoose.connection.close(); // Ensure connection is properly closed
        console.log("Database connection closed");
    }
}

// Main function to run the script
async function main() {
    await connectDB();  // Connect to the database
    await initDB();     // Initialize the database
}

main();
