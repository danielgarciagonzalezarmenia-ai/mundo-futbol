"""Debug: check what team names scraper gets vs what's in JS file"""
import re, json, urllib.request

# 1. Read the current JS file (should have channels from earlier)
js = open('app-pc.js', encoding='utf-8').read()

# 2. Simulate read_existing_channels
pattern = re.compile(r"home:\s*'([^']+)',\s*away:\s*'([^']+)',\s*channels:\s*(\[[^\]]*\])\s*\}", re.DOTALL)
print("=== Channels in JS file ===")
js_channels = {}
for m in pattern.finditer(js):
    home = m.group(1)
    away = m.group(2)
    key = home + ' vs ' + away
    try:
        channels = json.loads(m.group(3))
    except:
        channels = []
    js_channels[key] = channels
    if channels:
        print(f"  {key}: {channels}")
print(f"Total JS events: {len(js_channels)}, with channels: {sum(1 for c in js_channels.values() if c)}")

# 3. Fetch and parse from futbol-libre
print("\n=== Events from futbol-libre.su ===")
req = urllib.request.Request('https://futbol-libre.su/agenda/', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=15).read().decode()
li_pattern = re.compile(
    r'<li class="[^"]*"><a href="#">(.*?)<span class="t">([^<]*)</span></a>\s*<ul>(.*?)</ul>\s*</li>',
    re.DOTALL
)
scraped_keys = []
for m in li_pattern.finditer(html):
    title = m.group(1).strip()
    time_str = m.group(2).strip()
    comp = 'Futbol'
    if ': ' in title:
        comp, rest = title.split(': ', 1)
        title = rest
    if ' vs ' in title:
        parts = title.split(' vs ')
        home, away = parts[0], ' vs '.join(parts[1:])
    else:
        home = title
        away = ''
    key = home + ' vs ' + away
    scraped_keys.append(key)
    print(f"  '{key}'  (from title: '{m.group(1).strip()}')")

# 4. Check matching
print("\n=== Match check ===")
for k in scraped_keys:
    if k in js_channels:
        ch = js_channels[k]
        if ch:
            print(f"  MATCH: {k} -> channels: {ch}")
        else:
            print(f"  MATCH (empty): {k}")
    else:
        print(f"  NO MATCH: {k}")
        # Try fuzzy match
        for jk in js_channels:
            if k.lower().replace(' ', '') == jk.lower().replace(' ', ''):
                print(f"    -> fuzzy match: '{jk}'")
