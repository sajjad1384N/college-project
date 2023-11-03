if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const functionBind = require('function-bind');

//console.log(process.env.SECRETE)
const express = require("express");
const app = express();
//const Listing = require("./models/listing.js");
//this is used for connectiing express to mongodb
const mongoose = require("mongoose");
const path = require("path");
const ejs = require("ejs");
const ExpressError = require("./utils/ExpressError.js");
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const methodOverRide = require("method-override");
app.use(methodOverRide("_method"));
//this is template for  all
const ejsMate = require("ejs-mate");
//use ejs-locals for all ejs templates:
app.engine("ejs", ejsMate);
const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
//serve the static file like css and js and it is middleware
app.use(express.static(path.join(__dirname, "/public")));
// const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const dbUrl = process.env.ATLASDB_URL
const { listingSchema, reviewSchema } = require("./schema.js")
    //const Review = require("./models/review.js");
const flash = require("connect-flash");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,

});
store.on("error", () => {
    console.log("error in MONGO SESSION STORE", err);
});
const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 100,
        maxAge: 7 * 24 * 60 * 60 * 100,
        httpOnly: true,
    },

}


app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
//A web application needs to ability to identify user as they browser from page to page
//.this  series of requests  and response,each associated with same user,is known as session
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); //serialize user related info into session 
passport.deserializeUser(User.deserializeUser()); //deserialize user related info from session
app.use((req, res, next) => {
    res.locals.message = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})
main().then((res) => {

    console.log("connected to database");
})
async function main() {
    await mongoose.connect(dbUrl);
}
// app.get("/", (req, res) => {
//         res.send("I am root");
//     })
//joi package------------------
//the most powerful  schema description langauge and data validator for javascript
//install->npm i joi  and require
// const validateListing = (req, res, next) => {
//     let { error } = listingSchema.validate(req.body);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };
app.get("/demouser", async(req, res) => {

    let fakeUser = new User({
        email: "student123@gmail.com",
        username: "student-delta",
    });
    // Convenience method to register a new user instance with a given password.
    // Checks if username is unique. 
    let registerUser = await User.register(fakeUser, "helloworld"); //helloworld is password
    //which is used in pbkdf2 hashing algorithm to store the password
    res.send(registerUser);
})
app.use("/listings", listingsRouter);
// review routing
//post route
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.all("*", (req, res, next) => {
    next(new ExpressError(404, " page Not found"));
});
//error handling middleware------
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something is wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });

});
app.listen(3000, () => {
    console.log("server is running on port 3000");
})