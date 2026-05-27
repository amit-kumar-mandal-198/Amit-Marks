const https = require('https');
https.get('https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3', (res) => {
    console.log("Mixkit status:", res.statusCode);
});
https.get('https://ia800407.us.archive.org/16/items/NatureSounds_201708/1.Rain.mp3', (res) => {
    console.log("Archive.org status:", res.statusCode);
});
