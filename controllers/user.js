const {saveRedirectUrl, isLoggedIn} = require("../middleware.js");
const User = require("../models/user.js");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const mongoose = require("mongoose");
const newsListing = require("../models/newsListing");
const searchListing = require("../models/searchResults");
const Bookmark = require("../models/bookmark");


module.exports.loginpage = async (req, res) => {
    res.render("login.ejs");
}


module.exports.login = async (req, res) => {
    let redirectUrl = res.locals.redirectUrl || "/";
    req.flash("success", "Welcome back!");
    res.redirect(redirectUrl);
}

module.exports.signupPage = async (req, res) => {
    res.render("signup.ejs");
}

module.exports.signup = async (req, res, next) => {
    try {
        let { username, email, password, receiveDigest, preferences } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            req.flash("error", "Email already registered!");
            return res.redirect("/user/signup");
        }
        
        receiveDigest = receiveDigest === "on";  

        if (!Array.isArray(preferences)) {
            preferences = preferences ? [preferences] : []; 
        }

        
        const newUser = new User({
            username,
            email,
            preferences, 
            receiveDigest,   
        });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                console.error("Login Error:", err);
                return next(err);
            }
            req.flash("success", "Welcome to QuickNewsify!");
            return res.redirect("/");

        });

    } catch (err) {
        console.error("Signup Error:", err);
        req.flash("error", err.message);
        return res.redirect("/signup");
    }
};

module.exports.forgotPass = async(req, res) => {
    res.render("forgotPassword.ejs");
};



module.exports.resetPasslink = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.send("No user with that email found.");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 3600000; 

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const resetLink = `https://quicknewsify.onrender.com/user/reset-password/${token}`;


    await transporter.sendMail({
        to: user.email,
        from: "no-reply@quicknewsify.com",
        subject: "Password Reset Link",
        html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    });

    res.send("Reset link sent to your email.");
}


module.exports.resetPassform = async (req, res) => {
    const user = await User.findOne({
        resetToken: req.params.token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return res.send("Token expired or invalid");
    }

    res.render("resetPassword.ejs", { token: req.params.token });
}

module.exports.resetPass = async (req, res) => {
    const user = await User.findOne({
        resetToken: req.params.token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        req.flash("error", "Token expired or invalid");
        return res.redirect("/user/forgot-password");
    }

    await user.setPassword(req.body.password); 
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    req.flash("success", "Password updated! Please log in.");
    res.redirect("/user/login");
}


module.exports.preferencePage = async(req, res) => {
    res.render("preference.ejs");
};

module.exports.preferences = async (req, res) => {
    if (!req.user) {
        return res.redirect("/login"); 
    }

    let categories = req.body.categories;

    if (!categories || categories.length === 0) { 
        req.flash("error", "Please select at least one category.");
        return res.redirect("/preferences");
    }

    let preference = "";
    for (let category of categories) { 
        preference += category + " | ";
    }

    preference = preference.slice(0, -3);
    req.user.preferences = preference;
    await req.user.save();

    res.redirect("/");
}


module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/");
    })
}


module.exports.profile = async(req, res) => {
    if (!req.user) {
        return res.redirect("/login");
    }
    console.log(req.user);
    res.render("profile.ejs", { user: req.user });
};

module.exports.userNotes = async (req, res) => {
    if (!req.user) {
        return res.redirect("/user/login");
    }

    try {
        const user = await User.findById(req.user._id);
        const notes = user.notes || [];
        res.render("notes.ejs", { notes });
    } catch (err) {
        console.error("Error fetching user notes:", err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports.saveuserNotes = async (req, res) => {
    if (!req.user) return res.redirect("/user/login");

    try {
        const id = req.params.id;
        const newNote = req.body.userNotes?.trim();
        if (!newNote) return res.redirect("back");

        const user = await User.findById(req.user._id);

        let newsExists = null;

        // Check in normal listings and search listings
        if (mongoose.Types.ObjectId.isValid(id)) {
            newsExists = await newsListing.findById(id) || await searchListing.findById(id);

            // Check bookmarks
            if (!newsExists) {
                const bookmark = await Bookmark.findById(id);
                if (bookmark && bookmark.news && bookmark.news._id) {
                    newsExists = true; // Mark as found
                }
            }
        }

        if (!newsExists) {
            return res.status(404).send("News not found");
        }

        // Push the note into user's array
        user.notes.push({
            newsId: id,
            content: newNote,
            savedAt: new Date()
        });

        await user.save();

        res.redirect("back");
    } catch (err) {
        console.error("Note saving error:", err);
        res.status(500).send("Internal Server Error");
    }
};


module.exports.editNoteForm = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const note = user.notes.id(id);
    if (!note) return res.status(404).send("Note not found");

    res.render("editNote.ejs", { note });
};


module.exports.updateNote = async (req, res) => {
    const { id } = req.params;
    const updatedContent = req.body.content?.trim();

    if (!updatedContent) return res.redirect("/user/savenotes");

    const user = await User.findById(req.user._id);
    const note = user.notes.id(id);
    if (!note) return res.status(404).send("Note not found");

    note.content = updatedContent;
    await user.save();

    res.redirect("/user/savenotes");
};


module.exports.deleteNote = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    user.notes.id(id).deleteOne();
    await user.save();

    res.redirect("/user/savenotes");
};
