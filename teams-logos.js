// Resolución de escudos desde img/escudos/ (LOGO_INDEX en logo-index.js)
// Aliases para nombres que no coinciden con el nombre del archivo

// Overrides manuales para casos donde el auto-índice tiene conflictos
const MANUAL_LOGOS = {
    'vitoria': 'img/escudos/clubes/brasil/vitoria.png',
    'vitoriaguimaraes': 'img/escudos/clubes/portugal/vitoria.png',
    'vitoriasc': 'img/escudos/clubes/portugal/vitoria.png',
};

const TEAM_ALIASES = {
    // Argentina
    'bocajuniors': 'boca',
    'riverplate': 'river',
    'racingclub': 'racing',
    'defensayjusticia': 'defensa',
    'estudiantesriocuarto': 'estudiantesrc',
    'independienterivadavia': 'independienteriv',
    'gimnasiayesgrima': 'gimnasia',
    'gimnasiayesgrimamendoza': 'gimnasiamendoza',
    'newellsoldboys': 'newells',
    'rosariocentral': 'rosariocentral',
    'uniondesantafe': 'union',
    'deportivoriera': 'riestra',
    'clubsarmiento': 'sarmiento',
    'atleticosarmiento': 'sarmiento',
    // Spain
    'atleticomadrid': 'atlmadrid',
    'athleticbilbao': 'athletic',
    'realbetis': 'betis',
    'rayovallecano': 'rayovallecano',
    'realoviedo': 'realoviedo',
    // England
    'tottenhamhotspur': 'tottenham',
    'newcastleunited': 'newcastle',
    'westhamunited': 'westham',
    'wolverhamptonwanderers': 'wolves',
    'leedsunited': 'leeds',
    'nottinghamforest': 'nottinghamforest',
    'manchesterunited': 'manchesterunited',
    'manchestercity': 'manchestercity',
    'astonvilla': 'astonvilla',
    'crystalpalace': 'crystalpalace',
    // Germany
    'bayernmunich': 'bayernmunchen',
    'borussiamonchengladbach': 'bmonchengladbach',
    'eintrachtfrankfurt': 'eintrachtfrankfurt',
    'bayerleverkusen': 'bayerleverkusen',
    '1fcunionberlin': 'unionberlin',
    'fcstpauli': 'stpauli',
    'stpauli': 'stpauli',
    // Italy
    'intermilan': 'inter',
    'acmilan': 'milan',
    'hellasverona': 'hellasverona',
    // France
    'parissaintgermain': 'psg',
    'olympiquemarseille': 'olimpiquemarsella',
    'olympiquelyon': 'olympiquelyon',
    'strasbourg': 'racingetrasburgo',
    'racingetrasburgo': 'racingetrasburgo',
    // Netherlands
    'psveindhoven': 'psv',
    'goaheadeagles': 'goaheadeagles',
    'scoheerenveen': 'scheerenveen',
    // Portugal
    'sportingcp': 'sporting',
    'sportinglisboa': 'sporting',
    'casapia': 'casapia',
    'gilvicente': 'gilvicente',
    'rioave': 'rioave',
    'vitoriasc': 'vitoriasc',
    'vitoriasportclub': 'vitoriasc',
    // Brazil
    'saopaulo': 'saopaulo',
    'atleticomineiro': 'atlmineiro',
    'atleticoparanaense': 'atlparanaense',
    'rbbragantino': 'rbbragantino',
    // Colombia
    'deportivocali': 'depcali',
    'atleticonacional': 'atlnacional',
    'aguilasdoradas': 'aguilasdoradas',
    'alianzavalledupar': 'alianza',
    'independientemedellin': 'dim',
    'internacionalbogota': 'internacionalbogota',
    'boyacachico': 'boyacachico',
    // Mexico
    'guadalajara': 'guadalajara',
    'clubamerica': 'america',
    'cruzazul': 'cruzazul',
    'pumasunam': 'pumas',
    'atleticoslp': 'atleticosl',
    'chivas': 'guadalajara',
    // Chile
    'colocolo': 'colocolo',
    'universidadcatolica': 'ucatolica',
    'universidaddechile': 'udechile',
    'unionlacalera': 'unionlacalera',
    'deportesconcepcion': 'deportesconcepcion',
    'deporteslimache': 'deporteslimache',
    'cobresal': 'cobresal',
    // Peru
    'alianzalima': 'alianzalima',
    'sportingcristal': 'sportingcristal',
    'deportivogarcilaso': 'deportivogarcilaso',
    'comerciantesunidos': 'comerciantesunidos',
    'juanpabloiicollege': 'juanpabloiicollege',
    'loschankas': 'loschankas',
    'sportboys': 'sportboys',
    'atleticograu': 'atleticograu',
    // Ecuador
    'independientedelvalle': 'independientedv',
    'ligadequito': 'ligadequito',
    'guayaquilcity': 'guayaquilcity',
    // Uruguay
    'penarol': 'penarol',
    'nacional': 'nacional',
    'montevideowanderers': 'wanderers',
    'liverpooluruguay': 'liverpooluruguay',
    'liverpoolmaldonado': 'liverpooluruguay',
    // USA/Canada
    'losangelesfc': 'losangeles',
    'newyorkredbulls': 'newyork',
    'newyorkcityfc': 'newyorkcity',
    'realsaltlake': 'realstaltlake',
    'stlouiscity': 'stlouiscity',
    'sanjoseearthquakes': 'sanjose',
    'intermiami': 'intermiami',
    'dcunited': 'dcunited',
    'houstondynamo': 'houstondynamo',
    'orlandocity': 'orlandocity',
    // Belgium
    'clubbrujas': 'clubbrujas',
    'cerclebrugge': 'cerclebrugge',
    'sttruidense': 'sinttruidense',
    'unionsaintgilloise': 'unionsaintgilloise',
    'royalantwerp': 'royalantwerp',
    'standardlieja': 'standardlieja',
    'fcvdender': 'fcvdender',
    // Other countries
    'estadosunidos': 'usa',
    'unitedstates': 'usa',
    'unitedstatesofamerica': 'usa',
    'coreadelsur': 'coreadelsur',
    'southkorea': 'coreadelsur',
    'korearepublic': 'coreadelsur',
    'arabiasaudita': 'arabiasaudita',
    'saudiarabia': 'arabiasaudita',
    'costarica': 'costarica',
    'nuevazelanda': 'nuevazelanda',
    'newzealand': 'nuevazelanda',
    'paisesbajos': 'paisesbajos',
    'netherlands': 'paisesbajos',
    'holland': 'paisesbajos',
    'republicadominicana': 'republicadominicana',
    'irlandadelnorte': 'irlandadelnorte',
    'northernireland': 'irlandadelnorte',
    'costademarfil': 'costademarfil',
    'ivorycoast': 'costademarfil',
    'cotedivoire': 'costademarfil',
    'caboverde': 'caboverde',
    'capeverde': 'caboverde',
};

function normTeamName(name) {
    return String(name).toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
}

function getTeamLogo(teamName) {
    var key = normTeamName(teamName);
    var lookup = TEAM_ALIASES[key] || key;
    if (typeof LOGO_INDEX !== 'undefined') {
        return MANUAL_LOGOS[lookup] || LOGO_INDEX.clubes[lookup] || LOGO_INDEX.selecciones[lookup] || LOGO_INDEX.mundial2026[lookup] || '';
    }
    return '';
}

function teamLogoHtml(teamName) {
    var url = getTeamLogo(teamName);
    var safe = String(teamName).replace(/[&<>"']/g, function(c) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
    if (url) {
        return '<img class="event-team-logo" src="' + url.replace(/&/g,'&amp;') + '" alt="' + safe + '" loading="lazy" decoding="async">';
    }
    return '<svg class="event-team-logo team-shield" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><path d="M50 8L15 25v30c0 20 14 34 35 42 21-8 35-22 35-42V25L50 8z"/><line x1="30" y1="42" x2="70" y2="42"/><line x1="50" y1="22" x2="50" y2="62"/></svg>';
}
