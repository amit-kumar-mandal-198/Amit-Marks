const https = require('https');
https.get('https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bde807.mp3', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
    console.log("Pixabay status:", res.statusCode);
});
