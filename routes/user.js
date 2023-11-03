const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
router.route("/signup").
get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));
//router for login
router.route("/login").
post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login)
    .get(userController.renderLoginForm)

//passport.authenticate() is middleware  which is used to authenticate user is login or not 
//then proceed further

router.get("/logout", userController.logout)
module.exports = router;