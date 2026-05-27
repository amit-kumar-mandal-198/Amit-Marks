import re
with open(r"C:\Users\Amit kumar Mandal\.gemini\antigravity\brain\bc831333-ef16-4d27-9213-018500dec2dd\.system_generated\steps\165\content.md", "r", encoding="utf-8") as f:
    text = f.read()
    urls = re.findall(r"https://i\.pinimg\.com/originals/[^\"]+\.(?:jpg|png)", text)
    if urls:
        print(urls[0])
    else:
        print("Not found")
