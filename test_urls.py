import urllib.request, ssl, http.cookiejar

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))

# Test la14hd URLs
tests = [
    ('https://la14hd.com/vivo/canales.php?stream=disney1', 'https://deporflix.net/'),
    ('https://la14hd.com/vivo/canales.php?stream=espn', 'https://deporflix.net/'),
    ('https://la14hd.com/vivo/canales.php?stream=caracol', 'https://deporflix.net/'),
    ('https://latamvidz1.com/canal.php?stream=disney1', 'https://futbol-libre.su/eventos.html'),
    ('https://esvideofy.com/ote.php?id=spt1', 'https://futbol-libre.su/eventos.html'),
]
for url, referer in tests:
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': referer,
    })
    try:
        resp = opener.open(req, timeout=10)
        body = resp.read()
        print(f'[OK] {url.split("?")[1][:30]}... ({resp.status}, {len(body)}b)')
        resp.close()
    except Exception as e:
        print(f'[ERR] {url.split("?")[1][:30]}... -> {e}')
