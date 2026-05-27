const fs = require('fs');
const content = fs.readFileSync(String.raw`C:\Users\Amit kumar Mandal\.gemini\antigravity\brain\bc831333-ef16-4d27-9213-018500dec2dd\.system_generated\steps\165\content.md`, 'utf8');
const match = content.match(/property="og:image" content="([^"]+)"/);
if (match) {
    console.log(match[1]);
} else {
    // Try to find __PINTEREST_APP_STATE__ or similar
    const match2 = content.match(/"image_url":"([^"]+)"/);
    if(match2) {
        console.log(match2[1]);
    } else {
        console.log("Not found og:image");
    }
}
