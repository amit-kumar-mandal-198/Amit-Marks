import urllib.request
import re
import json

url = "https://wall.alphacoders.com/search.php?search=miles+and+gwen+upside+down"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    # AlphaCoders images are usually like https://images.alphacoders.com/131/131...
    match = re.search(r'https://images[0-9]*\.alphacoders\.com/[0-9]+/[0-9]+\.(?:jpg|png|jpeg)', html)
    if match:
        img_url = match.group(0)
        print("Found:", img_url)
        urllib.request.urlretrieve(img_url, "spiderman_horizontal.jpg")
        print("Downloaded to spiderman_horizontal.jpg")
    else:
        # Fallback to another search
        print("Not found on alphacoders")
except Exception as e:
    print("Error:", e)
