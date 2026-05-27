const https = require('https');
https.get('https://actions.google.com/sounds/v1/water/rain.ogg', (res) => {
    console.log("Rain status:", res.statusCode);
});
https.get('https://actions.google.com/sounds/v1/crowds/cafe_crowd.ogg', (res) => { // guess
    console.log("Cafe status:", res.statusCode);
});
