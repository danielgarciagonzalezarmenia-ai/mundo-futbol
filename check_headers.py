import urllib.request

url = 'https://futbol-libre.su/eventos.html?r=aHR0cHM6Ly9sYXRhbXZpZHoxLmNvbS9jYW5hbC5waHA/c3RyZWFtPWRpc25leTE='
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=10)
headers = dict(resp.headers)
print(f'Status: {resp.status}')
for k, v in headers.items():
    kl = k.lower()
    if kl in ('x-frame-options', 'content-security-policy', 'set-cookie', 'location', 'referrer-policy', 'access-control-allow-origin'):
        print(f'{k}: {v}')
body = resp.read().decode()
print(f'Body length: {len(body)}')
# Check for frame-busting headers
if 'X-Frame-Options' in headers:
    print(f'X-Frame-Options: {headers["X-Frame-Options"]} - WILL BLOCK IFRAME EMBEDDING!')
else:
    print('No X-Frame-Options - should work in iframe')
if 'Content-Security-Policy' in headers:
    csp = headers['Content-Security-Policy']
    if 'frame-ancestors' in csp:
        print(f'CSP frame-ancestors present: {csp} - May block iframe!')
    else:
        print('CSP present but no frame-ancestors restriction')
