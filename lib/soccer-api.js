// lib/soccer-api.js

const THE_ODDS_API_KEY = "bad96ac3db0872eaeabc81e726a0b3f4";
const THE_ODDS_API_URL = "https://api.the-odds-api.com/v4";
const THE_SPORTS_DB_URL = "https://www.thesportsdb.com/api/v1/json/3";
const ARGENTINA_LEAGUE_ID = "4406";

const TEAM_NAME_FIXES = {
    "Aldosivi Mar del Plata": "Aldosivi",
    "Argentinos Juniors": "Argentinos Juniors",
    "Atl. Tucuman": "Atlético Tucumán",
    "Atletico Tucuman": "Atlético Tucumán",
    "Banfield": "Banfield",
    "Barracas Central": "Barracas Central",
    "Belgrano de Cordoba": "Belgrano",
    "Belgrano": "Belgrano",
    "Boca Juniors": "Boca Juniors",
    "CA Tigre BA": "Tigre",
    "Tigre": "Tigre",
    "Central Cordoba": "Central Córdoba",
    "Central Córdoba": "Central Córdoba",
    "Central Córdoba SdE": "Central Córdoba",
    "Central Córdoba de Santiago del Estero": "Central Córdoba",
    "CA Central Cordoba SE": "Central Córdoba",
    "Central Cordoba SE": "Central Córdoba",
    "Defensa y Justicia": "Defensa y Justicia",
    "Deportivo Riestra": "Deportivo Riestra",
    "Estudiantes": "Estudiantes de La Plata",
    "Estudiantes de La Plata": "Estudiantes de La Plata",
    "Estudiantes de Rio Cuarto": "Estudiantes de Río Cuarto",
    "Estudiantes de Río Cuarto": "Estudiantes de Río Cuarto",
    "Estudiantes de Rio IV": "Estudiantes de Río Cuarto",
    "Gimnasia La Plata": "Gimnasia y Esgrima de La Plata",
    "Gimnasia y Esgrima La Plata": "Gimnasia y Esgrima de La Plata",
    "Gimnasia y Esgrima Mendoza": "Gimnasia y Esgrima de Mendoza",
    "Gimnasia Mendoza": "Gimnasia y Esgrima de Mendoza",
    "Godoy Cruz": "Godoy Cruz",
    "Huracan": "Huracán",
    "Huracán": "Huracán",
    "Atletico Huracan": "Huracán",
    "Atlético Huracán": "Huracán",
    "CA Huracán": "Huracán",
    "Independiente": "Independiente",
    "Independiente Rivadavia": "Independiente Rivadavia",
    "Instituto": "Instituto",
    "Instituto de Córdoba": "Instituto",
    "Lanus": "Lanús",
    "Lanús": "Lanús",
    "Newells Old Boys": "Newell's Old Boys",
    "Newell's Old Boys": "Newell's Old Boys",
    "Platense": "Platense",
    "Racing Club": "Racing Club",
    "River Plate": "River Plate",
    "Rosario Central": "Rosario Central",
    "San Lorenzo": "San Lorenzo",
    "Sarmiento": "Sarmiento",
    "Sarmiento de Junin": "Sarmiento",
    "Sarmiento de Junín": "Sarmiento",
    "Talleres": "Talleres de Córdoba",
    "Talleres de Cordoba": "Talleres de Córdoba",
    "Talleres de Córdoba": "Talleres de Córdoba",
    "Union": "Unión",
    "Unión": "Unión",
    "Union Santa Fe": "Unión",
    "Union de Santa Fe": "Unión",
    "Velez Sarsfield": "Vélez Sarsfield",
    "Vélez Sarsfield": "Vélez Sarsfield",
    "Velez Sarsfield BA": "Vélez Sarsfield"
};

// URLs desde r2.thesportsdb.com (CDN actual); las de www.thesportsdb.com pueden fallar
const FALLBACK_LOGOS = {
    "Gimnasia y Esgrima de Mendoza": "https://r2.thesportsdb.com/images/media/team/badge/h11mlf1677636958.png",
    "Estudiantes de Río Cuarto": "https://r2.thesportsdb.com/images/media/team/badge/b6szbk1578822113.png",
    "Estudiantes de Rio Cuarto": "https://r2.thesportsdb.com/images/media/team/badge/b6szbk1578822113.png",
    "Gimnasia y Esgrima Mendoza": "https://r2.thesportsdb.com/images/media/team/badge/h11mlf1677636958.png"
};

function cleanName(name) {
    if (!name) return "";
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
}

async function getTeamLogoMap() {
    try {
        const response = await fetch(`${THE_SPORTS_DB_URL}/eventsseason.php?id=${ARGENTINA_LEAGUE_ID}&s=2025`);
        const data = await response.json();
        const logoMap = {};

        if (data.events) {
            data.events.forEach(event => {
                const teams = [
                    { name: event.strHomeTeam, logo: event.strHomeTeamBadge },
                    { name: event.strAwayTeam, logo: event.strAwayTeamBadge }
                ];

                teams.forEach(t => {
                    if (t.name && t.logo) {
                        logoMap[t.name] = t.logo;
                        logoMap[cleanName(t.name)] = t.logo;

                        // Mapeos específicos y precisos
                        if (t.name.includes("Central Córdoba")) logoMap["Central Córdoba"] = t.logo;
                        if (t.name.includes("Unión de Santa Fe")) logoMap["Unión"] = t.logo;

                        // Diferenciación precisa para Estudiantes
                        if (t.name.includes("Estudiantes de La Plata")) logoMap["Estudiantes de La Plata"] = t.logo;
                        if (t.name.includes("Estudiantes de Río Cuarto") || t.name.includes("Estudiantes RC")) {
                            logoMap["Estudiantes de Río Cuarto"] = t.logo;
                        }

                        // Diferenciación precisa para Gimnasia
                        if (t.name.includes("Gimnasia y Esgrima La Plata")) logoMap["Gimnasia y Esgrima de La Plata"] = t.logo;
                        if (t.name.includes("Gimnasia Mendoza") || t.name.includes("Gimnasia y Esgrima de Mendoza")) {
                            logoMap["Gimnasia y Esgrima de Mendoza"] = t.logo;
                        }
                    }
                });
            });
        }
        return logoMap;
    } catch (error) {
        console.error("Error fetching logos:", error);
        return {};
    }
}

async function getArgentineMatches() {
    try {
        const logoMap = await getTeamLogoMap();
        const response = await fetch(`${THE_ODDS_API_URL}/sports/soccer_argentina_primera_division/scores/?apiKey=${THE_ODDS_API_KEY}&daysFrom=1&dateFormat=iso`);
        const matches = await response.json();

        const now = new Date();

        return matches.map(match => {
            const homeFixed = TEAM_NAME_FIXES[match.home_team] || match.home_team;
            const awayFixed = TEAM_NAME_FIXES[match.away_team] || match.away_team;

            // Resolución de logos: Primero los fallbacks configurados a mano para máxima precisión
            const homeLogo = FALLBACK_LOGOS[homeFixed] ||
                FALLBACK_LOGOS[match.home_team] ||
                logoMap[homeFixed] ||
                logoMap[match.home_team] ||
                logoMap[cleanName(homeFixed)] ||
                null;

            const awayLogo = FALLBACK_LOGOS[awayFixed] ||
                FALLBACK_LOGOS[match.away_team] ||
                logoMap[awayFixed] ||
                logoMap[match.away_team] ||
                logoMap[cleanName(awayFixed)] ||
                null;

            const matchDate = new Date(match.commence_time);
            const isCompleted = match.completed;
            const hasScore = match.scores && match.scores.length > 0;
            const timeSinceStart = now.getTime() - matchDate.getTime();
            const isLive = hasScore && !isCompleted && matchDate <= now && timeSinceStart < (2.5 * 60 * 60 * 1000);

            return {
                id: match.id,
                homeTeam: homeFixed,
                awayTeam: awayFixed,
                homeScore: match.scores?.find(s => s.name === match.home_team)?.score || 0,
                awayScore: match.scores?.find(s => s.name === match.away_team)?.score || 0,
                homeLogo,
                awayLogo,
                date: match.commence_time,
                status: isCompleted ? "Finished" : (isLive ? "Live" : "Upcoming"),
                isLive
            };
        });
    } catch (error) {
        console.error("Error fetching matches:", error);
        return [];
    }
}

async function getLeagueBadge() {
    try {
        const response = await fetch(`${THE_SPORTS_DB_URL}/lookupleague.php?id=${ARGENTINA_LEAGUE_ID}`);
        const data = await response.json();
        return data.leagues?.[0]?.strBadge || null;
    } catch (error) {
        return null;
    }
}

// Exportar para que popup.js pueda usarlo (si se carga como módulo o globalmente)
window.SoccerAPI = {
    getArgentineMatches,
    getLeagueBadge
};
