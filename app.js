const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const { updateNewsData } = require("./initDB/init.js");
const ejsMate = require("ejs-mate");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const flash = require("connect-flash");  
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
require("dotenv").config();
const cron = require("node-cron");
const dailydigest = require("./transport-mail/dailydigest.js");
const newsListingRouter = require("./routes/newslisting.js");
const bookmarkRouter = require("./routes/bookmark.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL

async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => console.log("Connection successful"))
    .catch((err) => console.log(err));

const port = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("ejs", ejsMate);

const store = MongoStore.create({
    mongoUrl: dbUrl, 
    crypto: {
        secret: "mysupersecretcode"
    },
    touchAfter: 24 * 3600,
})

const sessionOptions = {
    store,
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

cron.schedule("00 08 * * *", async () => {
    console.log("Running Daily Digest Job...");
    await dailydigest();
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.use("/Home", newsListingRouter);
updateNewsData("india");
app.use("/Home/bookmarks", bookmarkRouter);
app.use("/user", userRouter);


app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
});


app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});