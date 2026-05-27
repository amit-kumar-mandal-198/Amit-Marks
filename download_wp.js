const https = require('https');
const fs = require('fs');

const searchUrl = "https://wall.alphacoders.com/search.php?search=miles+and+gwen+upside+down";

https.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const match = data.match(/https:\/\/images[0-9]*\.alphacoders\.com\/[0-9]+\/[0-9]+\.(?:jpg|png|jpeg)/);
        if (match) {
            const imgUrl = match[0];
            console.log("Found:", imgUrl);
            
            // Download it
            const file = fs.createWriteStream("spiderman_horizontal.jpg");
            https.get(imgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (imgRes) => {
                imgRes.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log("Downloaded to spiderman_horizontal.jpg");
                });
            });
        } else {
            console.log("Not found on alphacoders");
        }
    });
}).on('error', (err) => {
    console.log("Error:", err.message);
});
