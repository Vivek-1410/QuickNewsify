const User = require("../models/user.js");
const searchListing = require("../models/searchResults.js");
const newsListing = require("../models/newsListing.js");
const transporter = require("./mailer");

async function sendDailyDigest() {
    try {
        const users = await User.find({ receiveDigest: true });

        for (let user of users) {
            const { email, preferences } = user;
            console.log(`Sending digest to: ${email}`);

            let newsQuery = {};
            
            if (preferences && preferences.length > 0) {
                newsQuery = { title: { $regex: new RegExp(preferences.join("|"), "i") } };
            }

            // Fetch latest news (limit 5 articles)
            let newsList = await searchListing.find(newsQuery).limit(5);

            if (newsList.length === 0) {
                newsList = await newsListing.find({}).limit(5);
            }

            if (newsList.length === 0) {
                console.log(`No news found for ${email}`);
                continue;
            }

            let emailContent = `<h2>Your QuickNewsify Daily Digest</h2><hr>`;
            newsList.forEach(news => {
                emailContent += `
                    <h3>${news.title}</h3>
                    <p>${news.description}</p>
                    <a href="${news.url}" target="_blank">Read More</a>
                    <hr>
                `;
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Your Daily News Digest - QuickNewsify",
                html: emailContent,
            });

            console.log(`✅ Digest sent successfully to ${email}`);
        }
    } catch (error) {
        console.error("❌ Error sending daily digest:", error);
    }
}

module.exports = sendDailyDigest;
