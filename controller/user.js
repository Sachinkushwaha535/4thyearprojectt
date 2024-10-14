const User = require("../models/user");
const passport = require("passport");

module.exports.Getsignup = (req, res) => {
    res.render("user/signup");
};

module.exports.Postsignup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });

        // Register the user
        const currUser = await User.register(newUser, password);
        console.log("Registered user:", currUser); // Debugging log

        // Log in the user
        req.login(currUser, (err) => {
            if (err) {
                console.error("Login error:", err); // Log any login errors
                return next(err);
            }
            console.log("User logged in successfully"); // Confirm successful login
            req.flash("success", "Welcome to Wonderlust");
            res.redirect("/listings"); // Redirect after successful login
        });
    } catch (e) {
        console.error("Signup error:", e); // Log any signup errors
        req.flash("error", e.message);
        res.redirect("/signup"); // Redirect back to signup on error
    }
};

module.exports.Getlogin = (req, res) => {
    res.render("user/login");
};

module.exports.Postlogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Authentication error:", err); // Log any authentication errors
            return next(err);
        }
        if (!user) {
            req.flash("error", info.message || "Invalid username or password.");
            return res.redirect("/login");
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error("Login error:", err); // Log any login errors
                return next(err);
            }
            req.flash("success", "Welcome back to Wonderlust!");
            const redirectUrl = res.locals.redirectUrl || "/listings";
            res.redirect(redirectUrl);
        });
    })(req, res, next); // Call the middleware
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
