const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listingController = require("../controller/listing");
const multer = require('multer');


// Configure multer to use memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.NewListing));
//(upload.single("listing[image"),(req,res) =>{
//res.send(req.file)});
    

router.get('/new', isLoggedIn, wrapAsync(listingController.renderNewForm));

router.route("/:id")
    .get(wrapAsync(listingController.show))
    //.put(isLoggedIn, isOwner,upload.single('listing[image]'),validateListing, wrapAsync(listingController.Update))
    .put(isLoggedIn,upload.single('listing[image]'),isOwner,validateListing, wrapAsync(listingController.Update))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.Delete));

router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.Edit));

module.exports = router;
