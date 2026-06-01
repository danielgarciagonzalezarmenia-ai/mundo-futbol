import urllib.request, ssl, http.cookiejar

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Cookie-aware opener
cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(
    urllib.request.HTTPSHandler(context=ctx),
    urllib.request.HTTPCookieProcessor(cj),
)
opener.addheaders = [
    ('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
    ('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'),
]

# Step 1: visit agenda to get cookies
resp1 = opener.open('https://futbol-libre.su/agenda/', timeout=15)
print(f'Step 1 - Agenda: {resp1.status}')
resp1.close()

# Step 2: visit eventos.html
resp2 = opener.open('https://futbol-libre.su/eventos.html?r=aHR0cHM6Ly9sYXRhbXZpZHoxLmNvbS9jYW5hbC5waHA/c3RyZWFtPWRpc25leTE=', timeout=15)
print(f'Step 2 - Eventos: {resp2.status}')
resp2.close()

print(f'Cookies after visits: {len(cj)}')
for c in cj:
    print(f'  {c.name}={c.value}')

# Step 3: try latamvidz1 with cookies
print('\nStep 3 - latamvidz1 with cookies+referer:')
req = urllib.request.Request(
    'https://latamvidz1.com/canal.php?stream=disney1',
    headers={
        'Referer': 'https://futbol-libre.su/eventos.html',
    },
)
try:
    resp3 = opener.open(req, timeout=15)
    body = resp3.read()
    print(f'  Status: {resp3.status}')
    print(f'  Content-Type: {resp3.headers.get("Content-Type", "?")}')
    print(f'  Body length: {len(body)}')
    resp3.close()
except Exception as e:
    print(f'  Error: {e}')

# Step 4: try esvideofy with cookies
print('\nStep 4 - esvideofy with cookies+referer:')
req4 = urllib.request.Request(
    'https://esvideofy.com/ote.php?id=spt1',
    headers={
        'Referer': 'https://futbol-libre.su/eventos.html',
    },
)
try:
    resp4 = opener.open(req4, timeout=15)
    body4 = resp4.read()
    print(f'  Status: {resp4.status}')
    print(f'  Content-Type: {resp4.headers.get("Content-Type", "?")}')
    print(f'  Body length: {len(body4)}')
    resp4.close()
except Exception as e:
    print(f'  Error: {e}')
