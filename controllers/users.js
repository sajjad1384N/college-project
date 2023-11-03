const User = require("../models/user.js");
module.exports.renderSignupForm = (req, res) => {
    res.render("user/signup.ejs");
}
module.exports.signup = async(req, res) => {
    try {
        let { username, email, password } = req.body;

        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);
        req.login(registerUser, (err) => {
                if (err) {
                    return next(err);
                }
                req.flash("success", " Welcome to wanderlust");
                res.redirect("/listings");
            })
            // console.log(registerUser);

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }


}
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