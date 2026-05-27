const https = require('https');
const fs = require('fs');

const imgUrl = 'https://images.hdqwalls.com/download/spiderman-across-the-spiderverse-upside-down-poster-m3-1920x1080.jpg';

https.get(imgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    if (res.statusCode === 200) {
        const file = fs.createWriteStream("horizontal.jpg");
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log("Success! Downloaded HDQwalls horizontal poster!");
        });
    } else {
        console.log("Failed", res.statusCode);
    }
}).on('error', (err) => {
    console.log("Error:", err.message);
});
