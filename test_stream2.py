import urllib.request, ssl, http.cookiejar

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))

# Test latamvidz1 with correct referrer
req = urllib.request.Request(
    'https://latamvidz1.com/canal.php?stream=disney1',
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://futbol-libre.su/eventos.html',
    },
)
resp = opener.open(req, timeout=15)
body = resp.read().decode()
print(f'=== latamvidz1 disney1 ({len(body)} bytes) ===')
print(body[:500])
print('...')
resp.close()

# Test esvideofy with correct referrer
print('\n=== esvideofy spt1 ===')
req2 = urllib.request.Request(
    'https://esvideofy.com/ote.php?id=spt1',
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://futbol-libre.su/eventos.html',
    },
)
resp2 = opener.open(req2, timeout=15)
body2 = resp2.read().decode()
print(f'Body length: {len(body2)}')
print(body2[:500])
print('...')
resp2.close()
