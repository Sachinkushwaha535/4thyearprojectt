const User = require("../models/user");
const passport = require("passport");

module.exports.Getsignup = (req, res) => {
    res.render("user/signup");
};

module.exports.Postsignup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log("Registered user:", registeredUser);
        
        req.login(registeredUser, (err) => {
            if (err) {
                console.error("Login error:", err);
                return next(err); // Properly pass error to middleware
            }
            req.flash("success", "Welcome to Wonderlust");
            res.redirect("/listings"); // Ensure redirection to home after login
        });
    } catch (e) {
        console.error("Signup error:", e);
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.Getlogin = (req, res) => {
    res.render("user/login");
};

module.exports.Postlogin = async (req, res) => {
    req.flash("success", "Welcome back to Wonderlust!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.Logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};
