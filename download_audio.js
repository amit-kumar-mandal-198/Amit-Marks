const https = require('https');
const fs = require('fs');

const files = [
    { name: 'rain.mp3', url: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3' },
    { name: 'cafe.mp3', url: 'https://assets.mixkit.co/sfx/preview/mixkit-restaurant-crowd-talking-424.mp3' },
    { name: 'forest.mp3', url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3' }
];

files.forEach(f => {
    https.get(f.url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            'Referer': 'https://mixkit.co/'
        }
    }, (res) => {
        if (res.statusCode === 200) {
            const file = fs.createWriteStream(f.name);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${f.name}`);
            });
        } else if (res.statusCode === 302 || res.statusCode === 301) {
            // Handle redirect
            https.get(res.headers.location, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': 'https://mixkit.co/'
                }
            }, (redirectRes) => {
                const file = fs.createWriteStream(f.name);
                redirectRes.pipe(file);
                console.log(`Downloaded ${f.name} via redirect`);
            });
        } else {
            console.log(`Failed ${f.name}: ${res.statusCode}`);
        }
    }).on('error', (err) => {
        console.log(`Error ${f.name}:`, err.message);
    });
});
