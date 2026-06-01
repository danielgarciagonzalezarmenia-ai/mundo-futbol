import urllib.request, json, re, os, subprocess
from datetime import datetime, timezone, timedelta

LA14HD_URL = 'https://la14hd.com/eventos/json/agenda123.json'
COLOMBIA_OFFSET = -300

MANUAL_FALLBACK = [
    {'time': '12:00', 'comp': 'Amistoso', 'home': 'Austria', 'away': 'Túnez', 'channels': ['https://la14hd.com/vivo/canales.php?stream=espn']},
    {'time': '18:00', 'comp': 'Amistoso', 'home': 'Colombia', 'away': 'Costa Rica', 'channels': ['https://la14hd.com/vivo/canales.php?stream=caracol']},
]

def fetch_json(url):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
    })
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode())

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
        print(f'  [!] No se encontró EVENTOS_MANUALES en {filepath}')
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
        print('  [!] No se encontró app-version')
        return False
    ver = int(match.group(1)) + 1
    content = content.replace(f'v={ver - 1}', f'v={ver}')
    content = content.replace(f'content="{ver - 1}"', f'content="{ver}"')
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  [OK] Version bump: {ver - 1} -> {ver}')
    return True

def main():
    print('[Scraper] Fetching events from la14hd.com...')
    try:
        data = fetch_json(LA14HD_URL)
    except Exception as e:
        print(f'[Error] Failed to fetch: {e}')
        return

    today = datetime.now(timezone(timedelta(hours=-5))).strftime('%Y-%m-%d')
    api_events = [e for e in data if e.get('date') == today]

    if not api_events:
        print(f'[!] No events for {today}')
        return

    print(f'[OK] {len(api_events)} events for {today}')

    user_offset = -datetime.now().astimezone().utcoffset().total_seconds() / 60
    tz_off = user_offset - (-COLOMBIA_OFFSET)

    parsed = []
    for e in api_events:
        comp, home, away = parse_title(e.get('title', ''))
        t = e.get('time', '00:00')
        if abs(tz_off) > 1:
            t = adjust_time(t, int(tz_off))
        parsed.append({
            'time': t,
            'comp': comp,
            'home': home,
            'away': away,
            'channels': [e.get('link', '')],
        })

    # Merge with fallback (dedup by team names)
    seen = {}
    merged = []
    for e in parsed:
        key = e['home'] + ' vs ' + e['away']
        if key not in seen:
            seen[key] = True
            merged.append(e)
    for e in MANUAL_FALLBACK:
        key = e['home'] + ' vs ' + e['away']
        if key not in seen:
            seen[key] = True
            merged.append(e)

    print(f'[OK] {len(merged)} total events (API + fallback)')

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

    bump_version(os.path.join(base, 'index.html'))

    # Git commit and push
    try:
        subprocess.run(['git', 'add', '-A'], cwd=base, check=True, capture_output=True)
        subprocess.run(['git', 'commit', '-m', f'auto: update events {today} [{len(merged)} events]'], cwd=base, check=True, capture_output=True)
        subprocess.run(['git', 'push'], cwd=base, check=True, capture_output=True)
        print('[OK] Pushed to GitHub')
    except subprocess.CalledProcessError as e:
        if 'nothing to commit' in e.stderr.decode() or 'nothing to commit' in e.stdout.decode():
            print('[OK] No changes to commit')
        else:
            print(f'[Error] Git: {e.stderr.decode()}')

if __name__ == '__main__':
    main()
