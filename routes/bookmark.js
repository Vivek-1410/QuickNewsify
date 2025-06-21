const express = require("express");
const router = express.Router();
const bookmarkController = require("../controllers/bookmark.js");

// GET all bookmarks for logged-in user
router.get("/user/specific", bookmarkController.userBookmarks);

// GET a specific bookmarked news for detailed reading
router.get("/bookmarked-news/:id", bookmarkController.showBookmarkedNews);

// REMOVE a specific bookmark
router.get("/remove-bookmark/:id", bookmarkController.removeBookmark);

// BOOKMARK a news item by ID (should be last to avoid conflicts)
router.get("/:id", bookmarkController.bookmarkedNews);

module.exports = router;
