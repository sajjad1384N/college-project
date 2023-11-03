const Listing = require("../models/listing.js")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });
module.exports.index = async(req, res, ) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
    //next();
}
module.exports.renderNewForm = (req, res) => {
    //console.log(req.user);

    res.render("listings/new.ejs")
}
module.exports.showListing = async(req, res) => {
    let { id } = req.params; //use urlencoded app.set---
    const showListing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    }).populate("owner");
    if (!showListing) {
        req.flash("error", "listing you requested for does not exit!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { showListing });
    // console.log(showListing);

}
module.exports.createListing = async(req, res, next) => {
    // const result = listingSchema.validate(req.body.listing);
    // console.log(result);
    //add next to call next middleware
    let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send();



    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, "..", filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = (response.body.features[0].geometry);
    let saveListing = await newListing.save();
    console.log(saveListing);
    req.flash("success", "New listing created");
    res.redirect("/listings");
    //next();
}
module.exports.editListing = async(req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "you are not the owner of this listing");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/c_fill,g_face,h_300,w_300/f_png/r_max")

    res.render("listings/edit.ejs", { listing, originalImageUrl });
    //next(res.redirect("/listing"));

}
module.exports.updateListing = async(req, res, next) => {
    let { id } = req.params;
    let updateListing = req.body.listing;

    let listing = await Listing.findByIdAndUpdate(id, updateListing);
    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };

        await listing.save();
        // console.log(listing.geometry.coordinates);
    }

    req.flash("success", "listing updated");
    res.redirect(`/listings/${id}`);
}
module.exports.deleteListing = async(req, res, next) => {
    let { id } = req.params;
    //after deleting the listing it call to middleware for deleting the corressponding reviews
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "listing deleted");
    res.redirect("/listings");
}