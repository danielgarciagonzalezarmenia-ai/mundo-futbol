import urllib.request, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    ("HLS /live/", "http://ahhshitherewegoagain.sytes.net:2096/live/UMDC5858/iz6vhhFsUt/775740.m3u8"),
    ("HLS /live/ (browser)", "http://ahhshitherewegoagain.sytes.net:2096/live/UMDC5858/iz6vhhFsUt/775740.m3u8"),
    ("RAW TS", "http://ahhshitherewegoagain.sytes.net:2096/UMDC5858/iz6vhhFsUt/775740"),
]

for name, url in urls:
    try:
        req = urllib.request.Request(url)
        if "browser" in name:
            req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            req.add_header('Origin', 'http://ahhshitherewegoagain.sytes.net:2096')
            req.add_header('Referer', 'http://ahhshitherewegoagain.sytes.net:2096/')
        else:
            req.add_header('User-Agent', 'VLC/3.0.18')
        
        resp = urllib.request.urlopen(req, timeout=10, context=ctx)
        ct = resp.headers.get('Content-Type', '?')
        body = resp.read(2000)
        print(f"{name}: HTTP {resp.status}, Content-Type={ct}")
        print(f"  Body ({len(body)} bytes): {body[:300]}")
        print()
    except Exception as e:
        print(f"{name}: {str(e)[:100]}")
        print()
