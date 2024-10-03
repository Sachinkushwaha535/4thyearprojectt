const Listing = require('../models/listings');
const { cloudinary } = require('../cloudconfig');
const streamifier = require('streamifier');
const ExpressError = require('../utils/ExpressError');
const mongoose = require('mongoose');  // Make sure mongoose is 
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geoCoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index', { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new');
};

module.exports.show = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, 'Invalid Listing ID');
    }
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate('owner');
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.status(404).redirect("/listings");
    }
    res.render('listings/show', { listing });
};

module.exports.NewListing = async (req, res, next) => {
    let response = await geocodingClient
    .forwardGeocode({
        query:req.body.listing.location,
        limit: 1,
    })
    .send();
    
    
    try {
        if (!req.file) {
            req.flash('error', 'No file uploaded');
            return res.redirect('/listings/new');
        }

        // Cloudinary upload using memory buffer
        const uploadFromBuffer = (buffer) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (error) {
                        console.error(error);  // Log error for debugging
                        return reject(new ExpressError('Cloudinary Upload Error', 400));
                    }
                    resolve(result);
                });
                streamifier.createReadStream(buffer).pipe(stream);
            });
        };

        const result = await uploadFromBuffer(req.file.buffer);

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url: result.secure_url, filename: result.public_id };
        newListing.geometry = response.body.features[0].geometry;

        let savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success", "New listing created successfully");
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        next(err);
    }
};

module.exports.Edit = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, 'Invalid Listing ID');
    }
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    let originalimageUrl = listing.image.url;
       originalimageUrl= originalimageUrl.replace("/upload","/upload/h_300,w_250");
    res.render('listings/edit', { listing, originalimageUrl});
};

module.exports.Update = async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, 'Invalid Listing ID');
    }
    
    try {
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        if (req.file) {
            // Delete the old image from Cloudinary if a new image is uploaded
            if (listing.image && listing.image.filename) {
                await cloudinary.uploader.destroy(listing.image.filename);
            }

            // Cloudinary upload using memory buffer
            const uploadFromBuffer = (buffer) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (error) {
                            console.error(error);  // Log error for debugging
                            return reject(new ExpressError('Cloudinary Upload Error', 400));
                        }
                        resolve(result);
                    });
                    streamifier.createReadStream(buffer).pipe(stream);
                });
            };

            const result = await uploadFromBuffer(req.file.buffer);
            listing.image = { url: result.secure_url, filename: result.public_id };
            await listing.save();
        }

        req.flash("success", "Listing updated successfully");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};

module.exports.Delete = async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(400, 'Invalid Listing ID');
    }
    
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        // Delete the associated image from Cloudinary
        if (listing.image && listing.image.filename) {
            await cloudinary.uploader.destroy(listing.image.filename);
        }

        await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing deleted successfully");
        res.redirect('/listings');
    } catch (err) {
        next(err);
    }
};
