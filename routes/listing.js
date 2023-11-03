const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js")
    //Multer is a node.js middleware for handling multipart/form-data, 
    //which is primarily used for uploading files. It is written on top of busboy for maximum efficiency.
    //NOTE: Multer will not process any form which is not multipart (multipart/form-data).
const multer = require('multer')
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
router.route("/")
    .get(wrapAsync(listingController.index)) //index listing
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing)); //create listing
// new route

router.get("/new", isLoggedIn, listingController.renderNewForm);
router.route("/:id")
    .get(wrapAsync(listingController.showListing)) //show routing
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing)) //update listing
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing)); //delete listing

//edit routing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));
module.exports = router;