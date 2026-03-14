
const https = require('https');
const fs = require('fs');

const API_KEY = "bad96ac3db0872eaeabc81e726a0b3f4";
const SPORT = "soccer_argentina_primera_division";
const REGIONS = "eu";
const MARKETS = "h2h";

const url = `https://api.the-odds-api.com/v4/sports/${SPORT}/odds/?apiKey=${API_KEY}&regions=${REGIONS}&markets=${MARKETS}&oddsFormat=decimal`;

console.log(`Fetching from: ${url}`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            fs.writeFileSync('odds_response.json', JSON.stringify(jsonData, null, 2));
            console.log("Data written to odds_response.json");
        } catch (e) {
            console.error(e.message);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
