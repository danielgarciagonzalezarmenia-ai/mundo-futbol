import urllib.request, re, base64, json
from datetime import datetime, timezone, timedelta
from html.parser import HTMLParser

URL = 'https://futbol-libre.su/agenda/'

# Fetch
req = urllib.request.Request(URL, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
})
with urllib.request.urlopen(req, timeout=15) as r:
    html = r.read().decode()

# Parse matches with regex
# Pattern: <li class="FLAG"><a href="#">TITLE<span class="t">TIME</span></a>
#   <ul><li class="subitem1"><a href="URL" target="_top">LABEL<span>QUALITY</span></a></li></ul>
matches = []

# Find all match blocks: <li class="..."><a href="#">...</a><ul>...</ul></li>
li_pattern = re.compile(r'<li class="([^"]*)"><a href="#">(.*?)<span class="t">([^<]*)</span></a>\s*<ul>(.*?)</ul>\s*</li>', re.DOTALL)

for m in li_pattern.finditer(html):
    flag_class = m.group(1)
    title = m.group(2).strip()
    time_str = m.group(3).strip()
    ul_content = m.group(4)
    
    # Extract streams from ul
    streams = []
    stream_pattern = re.compile(r'<a href="(https://futbol-libre\.su/eventos\.html\?r=([^"]*))"[^>]*>.*?<span>([^<]*)</span>', re.DOTALL)
    for sm in stream_pattern.finditer(ul_content):
        full_url = sm.group(1)
        b64 = sm.group(2)
        label = sm.group(3).strip()
        
        # Decode base64
        try:
            decoded = base64.b64decode(b64).decode('utf-8')
        except:
            decoded = b64
        
        streams.append({'label': label, 'b64': b64, 'decoded': decoded})
    
    matches.append({
        'flag': flag_class,
        'title': title,
        'time': time_str,
        'streams': streams
    })

print(f'Found {len(matches)} matches:\n')

# Decode all base64 to see actual URLs
for match in matches:
    print(f"[{match['time']}] {match['title']}")
    for s in match['streams']:
        print(f"  -> {s['label']}: {s['decoded']}")
    print()
