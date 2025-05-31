const {saveRedirectUrl, isLoggedIn} = require("../middleware.js");
const User = require("../models/user.js");



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
            return res.redirect("/signup");
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
}


module.exports.userNotes = async (req, res) => {
    if (!req.user) {
        return res.redirect("/user/login");
    }
    try {
        let usernotes = await User.findById(req.user._id);
        let notes = usernotes.notes;
        res.render("notes.ejs", {notes});
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
}

module.exports.saveuserNotes = async (req, res) => {
    if (!req.user) {
        return res.redirect("/user/login");
    }
    try {
        let id = req.params.id;
        let user = await User.findById(req.user._id);
        let newNote = req.body.userNotes;
        user.notes.push(newNote);
        user.save();
        res.redirect(`/${id}`);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
}