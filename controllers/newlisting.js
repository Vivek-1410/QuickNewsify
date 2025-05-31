const axios = require("axios");
const mongoose = require("mongoose");
const newsListing = require("../models/newsListing.js")
const searchListing = require("../models/searchResults.js")




module.exports.index = async (req, res) => {
    let searchQuery;
    if (req.user && req.user.preferences && req.user.preferences.length > 0) {
        searchQuery = req.user.preferences.join(" OR ");
    } else {
        searchQuery = req.query.search || req.query.q || "India";
    }

    console.log("Search Query:", searchQuery);

    const searchedNews = [];
    const featuredNews = [];

    async function showData() {
        const { franc } = await import("franc-min");
        const apiUrl = "https://newsapi.org/v2/everything";
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 1); 
        const formattedDate = fromDate.toISOString().split("T")[0]; 
        const sortBy = "publishedAt";
        const apiKey = "81b2b38ac1b64422b1a15ed8c84cde15";  
        const pageSize = 50;
        const apiEndpoint = `${apiUrl}?q=${encodeURIComponent(searchQuery)}&from=${formattedDate}&sortBy=${sortBy}&apiKey=${apiKey}&pageSize=${pageSize}`;
        
        let response;
        try {
            response = await axios.get(apiEndpoint);
        } catch (error) {
            console.error("API Error:", error.message);
            return res.status(500).json({ error: "Failed to fetch news." });
        }

        const finalData = response.data;
        if (!finalData.articles || finalData.articles.length === 0) {
            return res.status(404).json({ error: "No news articles found." });
        }

        finalData.articles.forEach(article => {
            if (
                article.title && article.title !== '[Removed]' &&
                article.url && article.url !== '[Removed]' &&
                article.description && article.description !== '[Removed]'
            ) {
                const combinedText = `${article.title} ${article.description} ${article.content || ''}`;
                const langCode = franc(combinedText);

                if (langCode === 'eng') {
                    const dataFetched = {
                        source: article.source.name || "Unknown Source",
                        title: article.title,
                        description: article.description,
                        url: article.url,
                        urlToImage: article.urlToImage || "/default-news.jpg",
                        publishedAt: article.publishedAt || "No Date",
                        content: article.content || "No Content",
                        author: article.author || "Unknown Author"
                    };

                    // Add to searchedNews
                    if (!searchedNews.some(news => news.url === article.url)) {
                        searchedNews.push(dataFetched);
                    }

                    // Add top 5 to featuredNews
                    if (featuredNews.length < 5 && article.urlToImage) {
                        featuredNews.push(dataFetched);
                    }
                }
            }
        });
    }

    await showData();

    if (searchedNews.length > 0) {
        await searchListing.deleteMany({});
        await searchListing.insertMany(searchedNews);
    }

    let data = await searchListing.find({});
    if (!data || data.length === 0) {
        data = await newsListing.find({});
    }

    const trendingNews = await newsListing.find({}).limit(10).sort({ publishedAt: -1 });

    res.render("allNews.ejs", {
        newsData: data,
        featuredNews,
        trendingNews,
        searchQuery,
        currUser: req.user || null
    });
};

module.exports.privacy = async (req, res) => {
    res.render("privacy.ejs");
}

module.exports.terms = async (req, res) => {
    res.render("terms.ejs");
}



module.exports.show = async (req, res) => {
    const { id } = req.params;
    const objectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
    
    if (!objectId) {
        return res.status(400).send("Invalid ID format");
    }

    let showNews = await newsListing.findById(objectId);
    if (!showNews) {
        showNews = await searchListing.findById(objectId);
    }

    console.log(showNews);
    
    if (!showNews) {
        return res.status(404).send("News not found");
    }

    res.render("showNews.ejs", { showNews });
}
