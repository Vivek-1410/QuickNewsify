const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const listingSchema = new Schema({
    source: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    url: {
        type: String
    },
    urlToImage: {
        type: String
    },
    publishedAt: {
        type: String
    },
    content: {
        type: String
    },
    author: {
        type: String
    }
})

const newsListing = mongoose.model("newsListing", listingSchema);

module.exports = newsListing;