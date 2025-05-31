const express = require("express");
const router = express.Router();
const ListingController = require("../controllers/newlisting.js");



router.route("/")
    .get(
        ListingController.index
    );


router.route("/privacy")
    .get(
        ListingController.privacy
    );

router.route("/terms")
    .get(
        ListingController.terms
    );

router.route("/:id")
    .get(
        ListingController.show
    );



module.exports = router;