const express = require("express");
const router = express.Router();
const ListingController = require("../controllers/newlisting.js");



router.route("/")
    .get(
        ListingController.index
    );



router.route("/:id")
    .get(
        ListingController.show
    );



module.exports = router;