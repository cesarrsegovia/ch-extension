// lib/soccer-api.js

const THE_ODDS_API_KEY = "bad96ac3db0872eaeabc81e726a0b3f4";
const THE_ODDS_API_URL = "https://api.the-odds-api.com/v4";
const THE_SPORTS_DB_URL = "https://www.thesportsdb.com/api/v1/json/3";
const ARGENTINA_LEAGUE_ID = "4406";
const CHAMPIONS_LEAGUE_ID = "4480";

const TEAM_NAME_FIXES = {
    // Argentina fixes
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
    "Velez Sarsfield BA": "Vélez Sarsfield",

    // Champions League Fixes
    "Inter Milan": "Inter",
    "AC Milan": "Milan",
    "Paris Saint Germain": "Paris SG",
    "PSV Eindhoven": "PSV",
    "Sporting Lisbon": "Sporting CP",
    "Atletico Madrid": "Atlético Madrid",
    "Bayer Leverkusen": "Bayer 04 Leverkusen",
    "Bayern Munich": "Bayern Munchen",
    "Dortmund": "Borussia Dortmund",
    "Qarabağ FK": "Qarabag",
    "Red Star Belgrade": "Crvena Zvezda"
};

// URLs desde r2.thesportsdb.com (CDN actual) o Wikipedia para fiabilidad
const FALLBACK_LOGOS = {
    // Argentina Fallbacks
    "Gimnasia y Esgrima de Mendoza": "https://r2.thesportsdb.com/images/media/team/badge/h11mlf1677636958.png",
    "Estudiantes de Río Cuarto": "https://r2.thesportsdb.com/images/media/team/badge/b6szbk1578822113.png",
    "Estudiantes de Rio Cuarto": "https://r2.thesportsdb.com/images/media/team/badge/b6szbk1578822113.png",
    "Gimnasia y Esgrima Mendoza": "https://r2.thesportsdb.com/images/media/team/badge/h11mlf1677636958.png",

    // Champions League Fallbacks (Major Teams - Optimized)
    // Real Madrid
    "Real Madrid": "https://r2.thesportsdb.com/images/media/team/badge/vwvwrw1473502969.png",
    // Paris Saint-Germain
    "Paris Saint Germain": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/150px-Paris_Saint-Germain_F.C..svg.png",
    "Paris SG": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/150px-Paris_Saint-Germain_F.C..svg.png",
    // Borussia Dortmund
    "Borussia Dortmund": "https://r2.thesportsdb.com/images/media/team/badge/tqo8ge1716960353.png",
    "Dortmund": "https://r2.thesportsdb.com/images/media/team/badge/tqo8ge1716960353.png",
    // Inter Milan
    "Inter": "https://r2.thesportsdb.com/images/media/team/badge/ryhu6d1617113103.png",
    "Inter Milan": "https://r2.thesportsdb.com/images/media/team/badge/ryhu6d1617113103.png",
    // AC Milan
    "Milan": "https://r2.thesportsdb.com/images/media/team/badge/wvspur1448806617.png",
    "AC Milan": "https://r2.thesportsdb.com/images/media/team/badge/wvspur1448806617.png",
    // Atletico Madrid
    "Atlético Madrid": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/150px-Atletico_Madrid_2017_logo.svg.png",
    "Atletico Madrid": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/150px-Atletico_Madrid_2017_logo.svg.png",
    // Benfica
    "Benfica": "https://r2.thesportsdb.com/images/media/team/badge/0pywy21662316682.png",
    "SL Benfica": "https://r2.thesportsdb.com/images/media/team/badge/0pywy21662316682.png",
    // Bayer Leverkusen
    "Bayer 04 Leverkusen": "https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Bayer_04_Leverkusen_logo.svg/150px-Bayer_04_Leverkusen_logo.svg.png",
    "Bayer Leverkusen": "https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Bayer_04_Leverkusen_logo.svg/150px-Bayer_04_Leverkusen_logo.svg.png",
    // Arsenal
    "Arsenal": "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/150px-Arsenal_FC.svg.png",
    // Man City
    "Manchester City": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/150px-Manchester_City_FC_badge.svg.png",
    // Barcelona
    "Barcelona": "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/150px-FC_Barcelona_%28crest%29.svg.png",
    "FC Barcelona": "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/150px-FC_Barcelona_%28crest%29.svg.png",
    // Bayern
    "Bayern Munich": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/150px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
    "Bayern Munchen": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/150px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
    // Juventus
    "Juventus": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/150px-Juventus_FC_2017_icon_%28black%29.svg.png",
    // Galatasaray
    "Galatasaray": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Galatasaray_Sports_Club_Logo.svg/150px-Galatasaray_Sports_Club_Logo.svg.png",
    // Monaco
    "AS Monaco": "https://r2.thesportsdb.com/images/media/team/badge/exjf5l1678808044.png",
    // Atalanta
    "Atalanta BC": "https://r2.thesportsdb.com/images/media/team/badge/lrvxg71534873930.png",
    "Atalanta": "https://r2.thesportsdb.com/images/media/team/badge/lrvxg71534873930.png"
};

function cleanName(name) {
    if (!name) return "";
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
}

async function getTeamLogoMap() {
    try {
        // Fetch de Argentina (4406) y Champions League (4480) para logos
        // Usamos allSettled para que un fallo en CL no afecte a Argentina
        const results = await Promise.allSettled([
            fetch(`${THE_SPORTS_DB_URL}/eventsseason.php?id=${ARGENTINA_LEAGUE_ID}&s=2025`),
            fetch(`${THE_SPORTS_DB_URL}/eventsseason.php?id=${CHAMPIONS_LEAGUE_ID}&s=2024-2025`)
        ]);

        const logoMap = {};

        const processEvents = (events) => {
            if (events) {
                events.forEach(event => {
                    const teams = [
                        { name: event.strHomeTeam, logo: event.strHomeTeamBadge },
                        { name: event.strAwayTeam, logo: event.strAwayTeamBadge }
                    ];

                    teams.forEach(t => {
                        if (t.name && t.logo) {
                            logoMap[t.name] = t.logo;
                            logoMap[cleanName(t.name)] = t.logo;

                            // Mapeos específicos y precisos (Argentina)
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
        };

        // Procesar resultados
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value.ok) {
                try {
                    const data = await result.value.json();
                    processEvents(data.events);
                } catch (e) {
                    console.error("Error parsing logo data", e);
                }
            }
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

        // Timestamp para evitar cache
        const ts = Date.now();

        // URLs para Argentina
        const argScoresUrl = `${THE_ODDS_API_URL}/sports/soccer_argentina_primera_division/scores/?apiKey=${THE_ODDS_API_KEY}&daysFrom=3&dateFormat=iso&_=${ts}`;
        const argOddsUrl = `${THE_ODDS_API_URL}/sports/soccer_argentina_primera_division/odds/?apiKey=${THE_ODDS_API_KEY}&regions=eu&markets=h2h&oddsFormat=decimal&_=${ts}`;

        // URLs para Champions League
        const clScoresUrl = `${THE_ODDS_API_URL}/sports/soccer_uefa_champs_league/scores/?apiKey=${THE_ODDS_API_KEY}&daysFrom=3&dateFormat=iso&_=${ts}`;
        const clOddsUrl = `${THE_ODDS_API_URL}/sports/soccer_uefa_champs_league/odds/?apiKey=${THE_ODDS_API_KEY}&regions=eu&markets=h2h&oddsFormat=decimal&_=${ts}`;

        // Usamos allSettled para que si una falla, la otra siga
        const results = await Promise.allSettled([
            fetch(argScoresUrl), fetch(argOddsUrl),
            fetch(clScoresUrl), fetch(clOddsUrl)
        ]);

        // Helper para obtener JSON seguro
        const getJson = async (result) => {
            if (result.status === 'fulfilled' && result.value.ok) {
                try {
                    return await result.value.json();
                } catch (e) {
                    console.error("Error parsing JSON", e);
                    return [];
                }
            }
            // Si falla Champions, no es critico, devolvemos array vacio
            return [];
        };

        const argMatches = await getJson(results[0]);
        const argOdds = await getJson(results[1]);
        const clMatches = await getJson(results[2]);
        const clOdds = await getJson(results[3]);

        // Helper para procesar odds
        const processOdds = (oddsData) => {
            const map = {};
            if (Array.isArray(oddsData)) {
                oddsData.forEach(game => {
                    if (game.bookmakers && game.bookmakers.length > 0) {
                        const bookmaker = game.bookmakers.find(b => b.key === 'bet365') ||
                            game.bookmakers.find(b => b.key === 'pinnacle') ||
                            game.bookmakers[0];

                        const market = bookmaker?.markets?.find(m => m.key === 'h2h');
                        if (market && market.outcomes) {
                            map[game.id] = {
                                home: market.outcomes.find(o => o.name === game.home_team)?.price,
                                away: market.outcomes.find(o => o.name === game.away_team)?.price,
                                draw: market.outcomes.find(o => o.name === 'Draw')?.price,
                                bookmaker: bookmaker.title
                            };
                        }
                    }
                });
            }
            return map;
        };

        const argOddsMap = processOdds(argOdds);
        const clOddsMap = processOdds(clOdds);

        const now = new Date();

        const processMatches = (matchesList, oddsMap, isChampions = false) => {
            if (!Array.isArray(matchesList)) return [];
            return matchesList.map(match => {
                const matchDate = new Date(match.commence_time);
                const isCompleted = match.completed;
                const hasScore = match.scores && match.scores.length > 0;
                const timeSinceStart = now.getTime() - matchDate.getTime();
                // Extendemos tiempo de live para Champions
                const liveDuration = isChampions ? 4 * 60 * 60 * 1000 : 2.5 * 60 * 60 * 1000;
                const isLive = hasScore && !isCompleted && matchDate <= now && timeSinceStart < liveDuration;

                // IMPORTANTE: Si es Champions League y NO está en vivo, devolvemos null para filtrarlo
                if (isChampions && !isLive) {
                    return null;
                }

                const homeFixed = TEAM_NAME_FIXES[match.home_team] || match.home_team;
                const awayFixed = TEAM_NAME_FIXES[match.away_team] || match.away_team;

                let homeLogo = null;
                let awayLogo = null;

                homeLogo = FALLBACK_LOGOS[homeFixed] ||
                    FALLBACK_LOGOS[match.home_team] ||
                    logoMap[homeFixed] ||
                    logoMap[match.home_team] ||
                    logoMap[cleanName(homeFixed)] ||
                    null;

                awayLogo = FALLBACK_LOGOS[awayFixed] ||
                    FALLBACK_LOGOS[match.away_team] ||
                    logoMap[awayFixed] ||
                    logoMap[match.away_team] ||
                    logoMap[cleanName(awayFixed)] ||
                    null;

                return {
                    id: match.id,
                    league: isChampions ? "UEFA Champions League" : "Primera División - Argentina",
                    homeTeam: homeFixed,
                    awayTeam: awayFixed,
                    homeScore: match.scores?.find(s => s.name === match.home_team)?.score || 0,
                    awayScore: match.scores?.find(s => s.name === match.away_team)?.score || 0,
                    homeLogo,
                    awayLogo,
                    date: match.commence_time,
                    status: isCompleted ? "Finished" : (isLive ? "Live" : "Upcoming"),
                    isLive,
                    odds: oddsMap[match.id] || null
                };
            }).filter(match => match !== null);
        };

        const allMatches = [
            ...processMatches(argMatches, argOddsMap, false),
            ...processMatches(clMatches, clOddsMap, true)
        ];

        // Ordenar por fecha
        allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

        return allMatches;

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
