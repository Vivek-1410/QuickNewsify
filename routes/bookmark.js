const express = require("express");
const router = express.Router();
const bookmarkController = require("../controllers/bookmark.js");


router.route("/user/specific")
    .get(
        bookmarkController.userBookmarks
    );



router.route("/:id")
    .get(
        bookmarkController.bookmarkedNews
    );

module.exports = router;