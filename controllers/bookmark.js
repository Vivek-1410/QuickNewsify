const newsListing = require("../models/newsListing.js");
const searchListing = require("../models/searchResults.js");
const Bookmark = require("../models/bookmark.js");
const mongoose = require("mongoose");
const isValidObjectId = mongoose.Types.ObjectId.isValid;

module.exports.bookmarkedNews = async (req, res) => {
    if (!req.user) return res.redirect("/user/login");

    const { id } = req.params;
    let bookmarkedNews = await newsListing.findById(id) || await searchListing.findById(id);

    if (!bookmarkedNews && isValidObjectId(id)) {
        const bookmark = await Bookmark.findById(id);
        if (bookmark && bookmark.news) {
            bookmarkedNews = {
                ...bookmark.news,
                _id: bookmark.news._id?.toString() || id // Ensure valid ID string
            };
        }
    }

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
            news: { ...bookmarkedNews }
        });
        await newBookmark.save();
    }

    res.redirect("back");
};

module.exports.userBookmarks = async (req, res) => {
    if (!req.user) {
        return res.redirect("/user/login");
    }

    try {
        const bookmarks = await Bookmark.find({ user: req.user._id });
        res.render("bookmarks.ejs", { bookmarks });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports.showBookmarkedNews = async (req, res) => {
  const { id } = req.params;
  const bookmark = await Bookmark.findById(id);

  if (!bookmark || !bookmark.news) {
    return res.status(404).send("Bookmarked news not found");
  }

  // Fix: force convert news into a proper format (including ._id)
  const showNews = {
    ...bookmark.news,
    _id: bookmark.news._id?.toString() || id // fallback
  };

  res.render("showNews.ejs", { showNews, currUser: req.user });
};


module.exports.removeBookmark = async (req, res) => {
    const { id } = req.params;

    try {
        await Bookmark.findByIdAndDelete(id);
        res.redirect("/bookmarks");
    } catch (err) {
        console.error("Error removing bookmark:", err);
        res.status(500).send("Failed to remove bookmark");
    }
};
