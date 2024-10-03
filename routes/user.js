const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/user.js");


router.route("/signup")
.get( userController.Getsignup)
.post( userController.Postsignup);


router.route("/login")
.get( userController.Getlogin)
.post( saveRedirectUrl, passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
}), userController.Postlogin);









// GET route for handling user logout
router.get("/logout", userController.Logout);

module.exports = router;
