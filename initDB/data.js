async function showData(query = "india") {
    const { franc } = await import("franc-min");

    const apiUrl = "https://newsapi.org/v2/everything";
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 1); 
    const formattedDate = fromDate.toISOString().split("T")[0]; 
    const sortBy = "publishedAt";
    const apiKey = "81b2b38ac1b64422b1a15ed8c84cde15";
    const pageSize = 50;
    const apiEndpoint = `${apiUrl}?q=${query}&from=${formattedDate}&sortBy=${sortBy}&apiKey=${apiKey}&pageSize=${pageSize}`;
    console.log(apiEndpoint);
    let newsData = [];
    let data = await fetch(apiEndpoint);
    const finalData = await data.json();

    finalData.articles.forEach(article => {
        if (
            article.title && article.title !== '[Removed]' &&
            article.url && article.url !== '[Removed]' &&
            article.description && article.description !== '[Removed]'
        ) {
            const combinedText = `${article.title} ${article.description} ${article.content || ''}`;
            const langCode = franc(combinedText);

            if (langCode === 'eng') {
                let dataFetched = {
                    source: article.source.name || "Unknown Source",
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    urlToImage: article.urlToImage || "No Image",
                    publishedAt: article.publishedAt || "No Date",
                    content: article.content || "No Content",
                    author: article.author || "Unknown Author"
                };
                delete dataFetched._id;
                newsData.push(dataFetched);
            }
        }
    });
    return newsData;
}

module.exports = { showData };
