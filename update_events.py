import urllib.request, json, re, os, subprocess
from datetime import datetime, timezone, timedelta

AGENDA_URL = 'https://futbol-libre.su/agenda/'
COLOMBIA_OFFSET = -300

MANUAL_FALLBACK = [
    {'time': '18:00', 'comp': 'Amistoso', 'home': 'Colombia', 'away': 'Costa Rica', 'channels': ['https://futbol-libre.su/eventos.html?r=aHR0cHM6Ly9sYXRhbXZpZHoxLmNvbS9jYW5hbC5waHA/c3RyZWFtPWNhcmFjb2x0dg==']},
]

def fetch_html(url):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
    })
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read().decode()

def parse_title(title):
    comp, home, away = 'Futbol', '', ''
    if ': ' in title:
        comp, rest = title.split(': ', 1)
        title = rest
    if ' vs ' in title:
        parts = title.split(' vs ')
        home, away = parts[0], ' vs '.join(parts[1:])
    else:
        home = title
    return comp, home, away

def adjust_time(time_str, offset_minutes):
    parts = time_str.split(':')
    t = int(parts[0]) * 60 + int(parts[1]) + offset_minutes
    t = t % 1440
    return f'{t // 60:02d}:{t % 60:02d}'

def format_events_js(events):
    lines = ['const EVENTOS_MANUALES = [']
    for e in events:
        ch = json.dumps(e['channels'])
        lines.append(f"    {{ time: '{e['time']}', comp: '{e['comp']}', home: '{e['home']}', away: '{e['away']}', channels: {ch} }},")
    lines.append('];')
    return '\n'.join(lines)

def update_js_file(filepath, new_events_block):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    pattern = r'const EVENTOS_MANUALES = \[.*?\];'
    replacement = new_events_block
    new_content = re.sub(pattern, replacement, content, count=1, flags=re.DOTALL)
    if new_content == content:
        print(f'  [!] No se encontr\u00f3 EVENTOS_MANUALES en {filepath}')
        return False
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'  [OK] Actualizado {filepath}')
    return True

def bump_version(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    match = re.search(r'<meta name="app-version" content="(\d+)">', content)
    if not match:
        print('  [!] No se encontr\u00f3 app-version')
        return False
    ver = int(match.group(1)) + 1
    content = content.replace(f'v={ver - 1}', f'v={ver}')
    content = content.replace(f'content="{ver - 1}"', f'content="{ver}"')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  [OK] Version bump: {ver - 1} -> {ver}')
    return True

def main():
    print('[Scraper] Fetching events from futbol-libre.su...')
    try:
        html = fetch_html(AGENDA_URL)
    except Exception as e:
        print(f'[Error] Failed to fetch: {e}')
        return

    # Parse matches from HTML agenda
    matches = []
    li_pattern = re.compile(
        r'<li class="[^"]*"><a href="#">(.*?)<span class="t">([^<]*)</span></a>\s*<ul>(.*?)</ul>\s*</li>',
        re.DOTALL
    )

    for m in li_pattern.finditer(html):
        title = m.group(1).strip()
        time_str = m.group(2).strip()
        ul_content = m.group(3)

        channels = []
        stream_pattern = re.compile(
            r'<a href="(https://futbol-libre\.su/eventos\.html\?r=[^"]*)"',
            re.DOTALL
        )
        for sm in stream_pattern.finditer(ul_content):
            channels.append(sm.group(1))

        if channels:
            comp, home, away = parse_title(title)
            matches.append({
                'time': time_str,
                'comp': comp,
                'home': home,
                'away': away,
                'channels': channels,
            })

    if not matches:
        print(f'[!] No events found from futbol-libre')
        return

    print(f'[OK] {len(matches)} events from futbol-libre')

    user_offset = -datetime.now().astimezone().utcoffset().total_seconds() / 60
    tz_off = user_offset - (-COLOMBIA_OFFSET)

    parsed = []
    for e in matches:
        t = e['time']
        if abs(tz_off) > 1:
            t = adjust_time(t, int(tz_off))
        parsed.append({
            'time': t,
            'comp': e['comp'],
            'home': e['home'],
            'away': e['away'],
            'channels': e['channels'],
        })

    # Merge with fallback (dedup by team names, merge channels)
    seen = {}
    merged = []
    for e in parsed:
        key = e['home'] + ' vs ' + e['away']
        if key not in seen:
            seen[key] = True
            merged.append(e)
        else:
            for m in merged:
                if m['home'] + ' vs ' + m['away'] == key:
                    for ch in e['channels']:
                        if ch not in m['channels']:
                            m['channels'].append(ch)
                    break

    for e in MANUAL_FALLBACK:
        key = e['home'] + ' vs ' + e['away']
        if key not in seen:
            seen[key] = True
            merged.append(e)
        else:
            for m in merged:
                if m['home'] + ' vs ' + m['away'] == key:
                    for ch in e['channels']:
                        if ch not in m['channels']:
                            m['channels'].append(ch)
                    break

    print(f'[OK] {len(merged)} total events (futbol-libre + fallback)')

    js_block = format_events_js(merged)
    base = os.path.dirname(os.path.abspath(__file__))

    files = ['app-pc.js', 'app-mobile.js']
    updated = False
    for f in files:
        path = os.path.join(base, f)
        if update_js_file(path, js_block):
            updated = True

    if not updated:
        print('[!] No files updated')
        return

    today = datetime.now(timezone(timedelta(hours=-5))).strftime('%Y-%m-%d')
    bump_version(os.path.join(base, 'index.html'))

    # Git commit and push
    try:
        token = os.environ.get('GITHUB_TOKEN', '')
        remote = subprocess.run(['git', 'remote', 'get-url', 'origin'], cwd=base, capture_output=True, text=True).stdout.strip()
        if token and 'x-access-token:' not in remote and remote.startswith('https://'):
            remote = remote.replace('https://', f'https://x-access-token:{token}@')
            subprocess.run(['git', 'remote', 'set-url', 'origin', remote], cwd=base, check=True, capture_output=True)
        subprocess.run(['git', 'config', 'user.name', 'scraper-bot'], cwd=base, check=True, capture_output=True)
        subprocess.run(['git', 'config', 'user.email', 'scraper@bot.com'], cwd=base, check=True, capture_output=True)
        subprocess.run(['git', 'add', '-A'], cwd=base, check=True, capture_output=True)
        subprocess.run(['git', 'commit', '-m', f'auto: update events {today} [{len(merged)} events]'], cwd=base, check=True, capture_output=True)
        subprocess.run(['git', 'push'], cwd=base, check=True, capture_output=True)
        print('[OK] Pushed to GitHub')
    except subprocess.CalledProcessError as e:
        err = (e.stderr or b'') + (e.stdout or b'')
        if b'nothing to commit' in err:
            print('[OK] No changes to commit')
        else:
            print(f'[Error] Git: {err.decode()}')

if __name__ == '__main__':
    main()
