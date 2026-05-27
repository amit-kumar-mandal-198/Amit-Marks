const https = require('https');
const fs = require('fs');

const id = '1313337';
const servers = ['images', 'images2', 'images3', 'images4', 'images5', 'images6', 'images7', 'images8'];
let index = 0;

function tryNext() {
    if (index >= servers.length) {
        console.log("Failed to find image on any server");
        return;
    }
    const server = servers[index];
    const imgUrl = `https://${server}.alphacoders.com/131/${id}.jpeg`; // or .jpg, usually .jpeg for 131...
    // Also test .jpg
    tryDownload(imgUrl, () => {
        tryDownload(imgUrl.replace('.jpeg', '.jpg'), () => {
            index++;
            tryNext();
        });
    });
}

function tryDownload(url, failCallback) {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode === 200) {
            const file = fs.createWriteStream("spiderman.jpg");
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log("Success! Downloaded from", url);
            });
        } else {
            failCallback();
        }
    }).on('error', () => {
        failCallback();
    });
}

tryNext();
