const newsListing = require("../models/newsListing.js");
const searchListing = require("../models/searchResults.js");
const Bookmark = require("../models/bookmark.js");


module.exports.bookmarkedNews = async (req, res) => {
    if (!req.user) {
        return res.redirect("/user/login");
    }

    const { id } = req.params;
    let bookmarkedNews = await newsListing.findById(id) || await searchListing.findById(id);

    if (!bookmarkedNews) {
        return res.status(404).send("News not found");
    }

    const existingBookmark = await Bookmark.findOne({
        user: req.user._id,
        "news._id": bookmarkedNews._id
    });

    if (!existingBookmark) {
        const newBookmark = new Bookmark({
            user: req.user._id,
            news: { ...bookmarkedNews.toObject() } 
        });

        await newBookmark.save();
    }

    res.redirect("/");
}

module.exports.userBookmarks = async (req, res) => {
    if (!req.user) {
        return res.redirect("/user/login");
    }

    try {
        const bookmarks = await Bookmark.find({ user: req.user._id }).populate("news");
        console.log(bookmarks);
        res.render("bookmarks.ejs", { bookmarks });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}


