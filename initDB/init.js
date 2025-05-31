const mongoose = require("mongoose");
const newsListing = require("../models/newsListing.js");
const { showData } = require("./data.js");
const searchResults = require("../models/searchResults");

const MONGO_URL = process.env.ATLASDB_URL;

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

async function insertIntoDB(query = "india") {
    try {
        const data = await showData(query);

        if (data.length > 0) {
            console.log(`Fetched ${data.length} news articles.`);

            
            const sanitizedData = data.map((item) => {
                const { _id, ...rest } = item; 
                return rest;
            });

            await newsListing.deleteMany({}); 
            await newsListing.insertMany(sanitizedData); 
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
