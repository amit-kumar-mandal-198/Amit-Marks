const fs = require('fs');
const content = fs.readFileSync(String.raw`C:\Users\Amit kumar Mandal\.gemini\antigravity\brain\bc831333-ef16-4d27-9213-018500dec2dd\.system_generated\steps\165\content.md`, 'utf8');
const matches = content.match(/https:\/\/i\.pinimg\.com\/originals\/[^"]+\.(?:jpg|png)/g);
if (matches) {
    // Deduplicate and print all
    const unique = [...new Set(matches)];
    unique.forEach(url => console.log(url));
} else {
    console.log('Not found');
}
