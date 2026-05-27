const https = require('https');
https.get('https://upload.wikimedia.org/wikipedia/commons/4/4b/Rain_on_a_tin_roof.ogg', (res) => {
    console.log("Rain status:", res.statusCode);
});
https.get('https://upload.wikimedia.org/wikipedia/commons/b/bc/Forest_birds.ogg', (res) => {
    console.log("Forest status:", res.statusCode);
});
https.get('https://upload.wikimedia.org/wikipedia/commons/1/1a/Restaurant_ambience.ogg', (res) => {
    console.log("Restaurant status:", res.statusCode);
});
