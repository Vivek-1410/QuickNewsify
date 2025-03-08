const express = require("express");
const router = express.Router();
const {saveRedirectUrl, isLoggedIn} = require("../middleware.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userController = require("../controllers/user.js");



router.route("/login")
    .get(userController.loginpage)
    .post(
            saveRedirectUrl,
            passport.authenticate("local", {
            failureRedirect: "/user/login",
            failureFlash: true,
        }),
        userController.login,
    );

router.route("/signup")
    .get(userController.signupPage)
    .post(
        userController.signup
    );


router.route("/logout")
    .get(
        userController.logout
    );

router.route("/profile")
    .get(
        userController.profile
    );



router.route("/preferences")
    .get(userController.preferencePage)
    .post(
        userController.preferences
    );


module.exports = router;