// Base de datos de escudos de equipos
// Formato: 'Nombre del Equipo': 'URL del escudo'
// Se puede agregar cualquier equipo cuando sea necesario

const TEAM_LOGOS = {
    // Equipos de La Liga
    'Real Madrid': 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    'Barcelona': 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    'Atletico Madrid': 'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg',
    'Sevilla': 'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg',
    'Valencia': 'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg',
    'Real Sociedad': 'https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg',
    'Villarreal': 'https://upload.wikimedia.org/wikipedia/en/7/70/Villarreal_CF_logo.svg',
    'Athletic Bilbao': 'https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg',
    'Real Betis': 'https://upload.wikimedia.org/wikipedia/en/1/13/Real_Betis_logo.svg',
    
    // Equipos de Premier League
    'Manchester City': 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
    'Manchester United': 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    'Chelsea': 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
    'Arsenal': 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    'Tottenham': 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
    'Newcastle': 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg',
    'Aston Villa': 'https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest_%282016%29.svg',
    
    // Equipos de Bundesliga
    'Bayern Munich': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg',
    'Borussia Dortmund': 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
    'RB Leipzig': 'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg',
    'Bayer Leverkusen': 'https://upload.wikimedia.org/wikipedia/en/5/55/Bayer_04_Leverkusen_logo.svg',
    'Eintracht Frankfurt': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg',
    
    // Equipos de Serie A
    'Inter Milan': 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
    'Juventus': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg',
    'AC Milan': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
    'Napoli': 'https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg',
    'Roma': 'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg',
    
    // Equipos de Ligue 1
    'PSG': 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
    'Marseille': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
    'Lyon': 'https://upload.wikimedia.org/wikipedia/en/a/a0/Olympique_Lyonnais.svg',
    'Monaco': 'https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg',
    'Lille': 'https://upload.wikimedia.org/wikipedia/commons/1/13/LOSC_Lille_M%C3%A9tropole_2018_logo.png',
    
    // Equipos de Eredivisie
    'Ajax': 'https://upload.wikimedia.org/wikipedia/commons/7/76/AFC_Ajax_1900.svg',
    'PSV Eindhoven': 'https://upload.wikimedia.org/wikipedia/commons/2/23/PSV_Eindhoven_2021.svg',
    'Feyenoord': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Feyenoord_Rotterdam_2021.svg',
    
    // Equipos de Primeira Liga
    'Benfica': 'https://upload.wikimedia.org/wikipedia/en/1/1e/S.L._Benfica_logo.svg',
    'Porto': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/FC_Porto_logo.svg',
    'Sporting CP': 'https://upload.wikimedia.org/wikipedia/en/2/26/Sporting_Clube_de_Portugal_logo.svg',
    
    // Equipos de Liga MX
    'America': 'https://upload.wikimedia.org/wikipedia/en/8/82/Club_America_logo.svg',
    'Chivas': 'https://upload.wikimedia.org/wikipedia/en/4/4e/Club_Deportivo_Guadalajara_logo.svg',
    'Cruz Azul': 'https://upload.wikimedia.org/wikipedia/en/5/5f/Cruz_Azul_FC_logo.svg',
    'Pumas': 'https://upload.wikimedia.org/wikipedia/en/6/6c/Club_Universitario_Nacional_logo.svg',
    'Monterrey': 'https://upload.wikimedia.org/wikipedia/en/6/6d/CF_Monterrey_logo.svg',
    'Tigres': 'https://upload.wikimedia.org/wikipedia/en/4/4f/Tigres_UANL_logo.svg',
    
    // Equipos de Brasileirão
    'Flamengo': 'https://upload.wikimedia.org/wikipedia/en/2/2e/Clube_de_Regatas_do_Flamengo_logo.svg',
    'Palmeiras': 'https://upload.wikimedia.org/wikipedia/en/4/41/Sociedade_Esportiva_Palmeiras_-_Logo.svg',
    'Corinthians': 'https://upload.wikimedia.org/wikipedia/en/4/47/Sport_Club_Corinthians_Paulista_logo.svg',
    'São Paulo': 'https://upload.wikimedia.org/wikipedia/en/8/86/S%C3%A3o_Paulo_Futebol_Clube_logo.svg',
    'Santos': 'https://upload.wikimedia.org/wikipedia/en/3/3c/Santos_FC_logo.svg',
    
    // Equipos de Copa Colombia
    'Deportivo Cali': 'https://upload.wikimedia.org/wikipedia/en/0/06/Deportivo_Cali_logo.svg',
    'Alianza Valledupar': 'https://upload.wikimedia.org/wikipedia/en/5/5e/Alianza_FC_logo.svg',
    'Millonarios': 'https://upload.wikimedia.org/wikipedia/en/1/10/Millonarios_FC_logo.svg',
    'Atletico Nacional': 'https://upload.wikimedia.org/wikipedia/en/2/2f/Atl%C3%A9tico_Nacional_logo.svg',
    'Junior': 'https://upload.wikimedia.org/wikipedia/en/6/6e/Atl%C3%A9tico_Junior_logo.svg',
    
    // Equipos de NBA
    'Oklahoma City Thunder': 'https://upload.wikimedia.org/wikipedia/en/d/d4/Oklahoma_City_Thunder.svg',
    'San Antonio Spurs': 'https://upload.wikimedia.org/wikipedia/en/a/a2/San_Antonio_Spurs.svg',
    'Los Angeles Lakers': 'https://upload.wikimedia.org/wikipedia/en/3/3c/Los_Angeles_Lakers_logo.svg',
    'Golden State Warriors': 'https://upload.wikimedia.org/wikipedia/en/1/10/Golden_State_Warriors_logo.svg',
    'Boston Celtics': 'https://upload.wikimedia.org/wikipedia/en/8/88/Boston_Celtics.svg',
    'Miami Heat': 'https://upload.wikimedia.org/wikipedia/en/1/1e/Miami_Heat_logo.svg'
};

// Función helper para obtener logo de equipo
function getTeamLogo(teamName) {
    return TEAM_LOGOS[teamName] || '';
}

// Genera HTML para logo con fallback a escudo genérico
function teamLogoHtml(teamName) {
    const url = getTeamLogo(teamName);
    const safe = String(teamName).replace(/[&<>"']/g, function(c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
    if (url) {
        return '<img class="event-team-logo" src="' + url.replace(/&/g,'&amp;') + '" alt="' + safe + '" loading="lazy" decoding="async">';
    }
    return '<svg class="event-team-logo team-shield" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><path d="M50 8L15 25v30c0 20 14 34 35 42 21-8 35-22 35-42V25L50 8z"/><line x1="30" y1="42" x2="70" y2="42"/><line x1="50" y1="22" x2="50" y2="62"/></svg>';
}
