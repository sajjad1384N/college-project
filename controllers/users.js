const User = require("../models/user.js");
module.exports.renderSignupForm = (req, res) => {
    res.render("user/signup.ejs");
}
module.exports.signup = async (req, res) => {
    try {
        let { username, email, password, fName } = req.body;

        if (!fName) {
            req.flash("error", "First name is required");
            return res.redirect("/signup");
        }

        const newUser = new User({ email, username, fName });
        const registerUser = await User.register(newUser, password);
        req.login(registerUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
        res.render("user/login.ejs")
    }
    // this work after login the form
module.exports.login = async(req, res) => {
    // res.send("Welcome to wanderlust! you are logged in!")
    req.flash("success", "Welcome back to wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logout!")
        res.redirect("/listings");
    })
}