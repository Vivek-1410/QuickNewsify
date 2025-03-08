const mongoose = require("mongoose");
const newsListing = require("../models/newsListing.js");
const { showData } = require("./data.js");
const searchResults = require("../models/searchResults");

const MONGO_URL = "mongodb://127.0.0.1:27017/QuickNewsDB";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("Connection successful");
    })
    .catch((err) => {
        console.log(err);
    });

// Insert data into the `newsListing` collection
async function insertIntoDB(query = "india") {
    try {
        const data = await showData(query);

        if (data.length > 0) {
            console.log(`Fetched ${data.length} news articles.`);

            // Ensure no `_id` field is set in the data
            const sanitizedData = data.map((item) => {
                const { _id, ...rest } = item; // Remove `_id` if it exists
                return rest;
            });

            await newsListing.deleteMany({}); // Clear the collection
            await newsListing.insertMany(sanitizedData); // Insert sanitized data
            console.log("News listing database updated successfully.");
        } else {
            console.warn("No valid data fetched to update the news listing database.");
        }
    } catch (err) {
        console.error("Error while updating news listing database:", err);
    }
}


function updateNewsData(query = "india") {
    insertIntoDB(query);
}


module.exports = { updateNewsData };
