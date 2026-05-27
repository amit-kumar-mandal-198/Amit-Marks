const https = require('https');
const checkUrl = (url) => {
    https.get(url, (res) => {
        console.log(`${url}:`, res.statusCode);
    });
};

checkUrl('https://raw.githubusercontent.com/developedbyed/meditation-app/master/sounds/rain.mp3');
checkUrl('https://raw.githubusercontent.com/developedbyed/meditation-app/master/sounds/beach.mp3');
checkUrl('https://raw.githubusercontent.com/wacko/rainsound/master/rain.mp3');
