const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/user");

router.route("/signup")
    .get((req, res) => {

        userController.Getsignup(req, res);
    })
    .post((req, res) => {
        userController.Postsignup(req, res);
    });

router.route("/login")
    .get((req, res) => {
        
        userController.Getlogin(req, res);
    })
    .post(saveRedirectUrl, passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }), (req, res) => {
        
        userController.Postlogin(req, res);
    });










// GET route for handling user logout
router.get("/logout", userController.Logout);

module.exports = router;
