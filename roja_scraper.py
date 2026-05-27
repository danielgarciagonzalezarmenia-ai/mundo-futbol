#!/usr/bin/env python3
"""
Scraper de rojadirectablog.com
Extrae eventos, canales y URLs HLS reales
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import time
from datetime import datetime

SOURCE_URL = 'https://rojadirectablog.com/default.php'
CACHE_FILE = 'roja_cache.json'
CACHE_DURATION = 300  # 5 minutos

def get_cached_data():
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
            if 'data' in cache and 'timestamp' in cache:
                age = time.time() - cache['timestamp']
                if age < CACHE_DURATION:
                    return cache['data']
    except:
        pass
    return None

def set_cached_data(data):
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump({
            'data': data,
            'timestamp': time.time()
        }, f, ensure_ascii=False, indent=2)

def fetch_html(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def extract_hls_url(html):
    # Buscar URLs .m3u8 en el HTML
    pattern = r'https?://[^\s\'"<>]+\.m3u8[^\s\'"<>]*'
    matches = re.findall(pattern, html)
    if matches:
        return matches[0]
    return None

def parse_events(html):
    soup = BeautifulSoup(html, 'html.parser')
    events = []
    
    # Buscar elementos li con eventos
    list_items = soup.find_all('li', class_='list-group-item')
    
    event_id = 0
    for item in list_items:
        text = item.get_text(strip=True)
        
        # Buscar título y hora (formato: "Competicion: Equipo1 vs Equipo2 HH:MM")
        match = re.match(r'^(.+?)(\d{1,2}:\d{2})\s*$', text)
        if not match:
            continue
        
        title = match.group(1).strip()
        event_time = match.group(2).strip()
        
        # Extraer canales (links)
        channels = []
        links = item.find_all('a', href=re.compile(r'rojadirectablog\.com'))
        
        for link in links:
            href = link.get('href')
            name = link.get_text(strip=True)
            
            if not name or 'canal' not in name.lower():
                continue
            
            channels.append({
                'name': name,
                'url': href
            })
        
        if not channels:
            continue
        
        # Separar competicion de equipos
        competition = ''
        teams = title
        if ':' in title:
            parts = title.split(':', 1)
            competition = parts[0].strip()
            teams = parts[1].strip()
        
        # Separar home vs away
        home_team = teams
        away_team = ''
        if ' vs ' in teams.lower():
            team_parts = re.split(r'\s+vs\s+', teams, 1, flags=re.IGNORECASE)
            home_team = team_parts[0].strip()
            away_team = team_parts[1].strip()
        
        events.append({
            'id': event_id,
            'title': title,
            'competition': competition,
            'homeTeam': home_team,
            'awayTeam': away_team,
            'time': event_time,
            'channels': channels
        })
        event_id += 1
    
    return events

def extract_hls_urls_from_channels(events):
    for event in events:
        for channel in event['channels']:
            # Extraer URL HLS de la página del canal
            channel_html = fetch_html(channel['url'])
            if channel_html:
                hls_url = extract_hls_url(channel_html)
                channel['hlsUrl'] = hls_url
    return events

def main():
    # Intentar usar caché primero
    cached = get_cached_data()
    if cached is not None:
        print(json.dumps({'events': cached}, ensure_ascii=False))
        return
    
    # Fetch y parsear
    html = fetch_html(SOURCE_URL)
    if not html:
        print(json.dumps({'error': 'No se pudo obtener la fuente', 'events': []}, ensure_ascii=False))
        return
    
    events = parse_events(html)
    events = extract_hls_urls_from_channels(events)
    
    # Guardar en caché
    set_cached_data(events)
    
    print(json.dumps({'events': events}, ensure_ascii=False))

if __name__ == '__main__':
    main()
