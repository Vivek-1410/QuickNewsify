const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const searchResultsSchema = new Schema({
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

const searchListing = mongoose.model("searchListing", searchResultsSchema);

module.exports = searchListing;