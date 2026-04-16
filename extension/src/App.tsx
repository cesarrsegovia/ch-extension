import React, { useEffect, useState } from 'react'
import { useStore } from './store/useStore'
import axios from 'axios'
import MatchDetail from './components/MatchDetail'
import { SPORTS, SOCCER_LEAGUE_IDS } from './constants/sports'
import { formatMatchTime } from './utils/format'

const App: React.FC = () => {
  const { 
    matches, 
    standings, 
    selectedMatchId, 
    selectedSport,
    selectedSection,
    language,
    setMatches, 
    setStandings, 
    updateMatch, 
    setSelectedMatchId,
    setSelectedSport,
    setSelectedSection,
    setLanguage,
    t
  } = useStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'matches' | 'results' | 'standings'>('matches')

  /**
   * Fetches matches and standings from the backend.
   */
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const sportPath = selectedSport.toLowerCase()
      const [matchesRes, standingsRes] = await Promise.all([
        axios.get(`http://127.0.0.1:3000/sports/${sportPath}`),
        axios.get(`http://127.0.0.1:3000/sports/${sportPath}/standings`)
      ])

      setMatches(matchesRes.data)
      setStandings(standingsRes.data)
    } catch (e) {
      setError(t('errorConnection') || 'Could not connect to server.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetches data on sport change and listens for real-time WebSocket updates.
   */
  useEffect(() => {
    setActiveTab('matches')
    fetchData()
    const listener = (message: any) => {
      if (message.type === 'MATCH_UPDATE') updateMatch(message.data)
      else if (message.type === 'STANDINGS_UPDATE') setStandings(message.data)
    }
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(listener)
      return () => chrome.runtime.onMessage.removeListener(listener)
    }
  }, [selectedSport])

  /**
   * Renders a single match card with live status and scores.
   */
  const renderMatchCard = (match: any) => (
    <div 
      key={match.id} 
      onClick={() => setSelectedMatchId(match.id)}
      className="bg-white/[0.03] border border-white/5 rounded-xl p-3 transition-all hover:bg-white/[0.05] hover:border-[#f4c025]/20 flex flex-col shadow-md cursor-pointer group"
    >
      <div className="flex justify-between mb-2 text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className={`font-black uppercase tracking-tight ${match.status === 'LIVE' ? 'text-red-500 animate-pulse' : match.status === 'FINISHED' ? 'text-gray-400' : 'opacity-70'}`}>
            {match.status === 'LIVE' ? (match.currentClock || t('tweetLiveLabel')) : match.status === 'SCHEDULED' ? formatMatchTime(match.startTime, language) : match.currentClock}
          </span>
        </div>
        {match.status === 'LIVE' && (
          <div className="flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded-full">
            <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-red-500 font-extrabold tracking-tighter text-[9px]">LIVE</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/5 rounded-md flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform flex-shrink-0">
              {match.homeLogo ? <img src={match.homeLogo} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full bg-[#f4c025]/20 rounded-sm"></div>}
            </div>
            <span className="text-xs font-bold text-gray-100 group-hover:text-white transition-colors">{match.homeTeam}</span>
          </div>
          <span className={`text-sm font-black tabular-nums transition-colors ${match.status === 'FINISHED' ? 'text-gray-400' : 'text-[#f4c025]'}`}>
            {match.status === 'SCHEDULED' ? '-' : match.homeScore}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/5 rounded-md flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform flex-shrink-0">
              {match.awayLogo ? <img src={match.awayLogo} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full bg-[#f4c025]/20 rounded-sm"></div>}
            </div>
            <span className="text-xs font-bold text-gray-100 group-hover:text-white transition-colors">{match.awayTeam}</span>
          </div>
          <span className={`text-sm font-black tabular-nums transition-colors ${match.status === 'FINISHED' ? 'text-gray-400' : 'text-[#f4c025]'}`}>
            {match.status === 'SCHEDULED' ? '-' : match.awayScore}
          </span>
        </div>
      </div>
    </div>
  )

  /**
   * Groups matches by date and renders the match board or results view.
 group matches by: Today, Tomorrow, or specific Date.
   */
  const renderMatches = (filter: 'active' | 'results') => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    const filtered = matches.filter(m => {
      const status = m.status?.toUpperCase()
      const matchDate = m.startTime ? new Date(m.startTime).toISOString().split('T')[0] : ''
      const isPast = matchDate < todayStr
      const isToday = matchDate === todayStr
      const isFuture = matchDate > todayStr

      if (filter === 'active') {
        if (status === 'LIVE') return true
        if (status === 'SCHEDULED' && (isToday || isFuture)) return true
        return false
      } else {
        if (status === 'FINISHED') return true
        if (status === 'SCHEDULED' && isPast) return true
        return false
      }
    })

    if (filter === 'active') {
      filtered.sort((a, b) => {
        if (a.status === 'LIVE' && b.status !== 'LIVE') return -1
        if (a.status !== 'LIVE' && b.status === 'LIVE') return 1
        return 0
      })
    }

    const groupedMatches: Record<string, any[]> = {}
    filtered.forEach(m => {
      const date = m.startTime ? new Date(m.startTime).toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' }) : t('sbUnknownDate')
      const today = new Date().toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' })
      const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' })
      
      let label = date
      if (date === today) label = t('sbHoy')
      else if (date === tomorrow) label = t('sbManana')

      if (!groupedMatches[label]) groupedMatches[label] = []
      groupedMatches[label].push(m)
    })

    return (
      <div className="w-full px-2">
        {!(selectedSport === 'WORLD-CUP' && filter === 'active' && filtered.length === 0) && (
          <div className="flex items-center justify-between py-2 mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
              {filter === 'active' ? t('sbMainBoard') : t('sbRecentResults')} • {filtered.length} {t('sbPartidos')}
            </p>
          </div>
        )}
        
        {Object.keys(groupedMatches).length > 0 ? (
          Object.entries(groupedMatches).map(([dateLabel, dateMatches]) => (
            <div key={dateLabel} className="mb-8">
              <div className="flex items-center gap-3 mb-4 sticky top-0 bg-[#050505] py-2 z-10">
                <div className="h-[1px] flex-1 bg-white/10"></div>
                <span className="text-[10px] font-black text-[#f4c025] uppercase tracking-[0.3em] bg-[#f4c025]/5 px-3 py-1 rounded-full border border-[#f4c025]/10">
                  {dateLabel}
                </span>
                <div className="h-[1px] flex-1 bg-white/10"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dateMatches.map(renderMatchCard)}
              </div>
            </div>
          ))
        ) : !loading && (
          selectedSport === 'WORLD-CUP' && filter === 'active' ? (
            <div className="flex justify-center py-4">
              <img 
                src="/banner-wc-vertical.png" 
                alt="World Cup 2026" 
                className="w-full max-w-[260px] h-auto object-contain filter drop-shadow-[0_0_30px_rgba(244,192,37,0.25)] animate-in fade-in slide-in-from-bottom-5 duration-1000" 
              />
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 flex flex-col items-center gap-6">
              <p className="text-gray-500 text-sm font-medium italic max-w-[200px]">
                {filter === 'active' ? t('sbNoMatches') : t('sbNoResults')}
              </p>
            </div>
          )
        )}
      </div>
    )
  }

  /**
   * Renders the standings table for the selected sport and conference.
   * Handles layout differences between Soccer and US Sports (NBA/NHL).
   */
  const renderStandings = () => {
    const sortedStandings = [...standings].sort((a, b) => a.seed - b.seed)
    const activeStandings = sortedStandings.length > 0;

    const conferences = Array.from(new Set(standings.map(s => s.conference || 'General')));
    
    const renderConference = (title: string, data: any[]) => {
      const soccerLeagues = ['soccer', 'champions-league', 'libertadores', 'sudamericana', 'world-cup'];
      const isSoccer = soccerLeagues.includes(selectedSport.toLowerCase());
      
      return (
        <div className="mb-8 w-full px-2">
          <div className="flex items-center gap-3 py-3 px-1 border-b-2 border-[#fbbf24]/20 mb-4">
            <div className="w-1.5 h-6 bg-[#fbbf24] rounded-full"></div>
            <h3 className="text-sm font-black text-[#FBBF24] uppercase tracking-widest">{title}</h3>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01]">
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-500 uppercase font-black text-[9px] tracking-widest">
                  <th className="py-3 px-3 w-8 text-center">#</th>
                  <th className="py-3 px-2">{t('sbEquipo')}</th>
                  {isSoccer ? (
                    <>
                      <th className="py-3 text-center w-8">{t('sbPJ')}</th>
                      <th className="py-3 text-center w-6">{t('sbG')}</th>
                      <th className="py-3 text-center w-6">{t('sbE')}</th>
                      <th className="py-3 text-center w-6">{t('sbP')}</th>
                      <th className="py-3 text-center w-8">{t('sbGF')}</th>
                      <th className="py-3 text-center w-8">{t('sbGC')}</th>
                      <th className="py-3 text-center w-8">{t('sbDG')}</th>
                      <th className="py-3 px-3 text-center w-10 bg-white/5 text-white">{t('sbPTS')}</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 text-center w-8">W</th>
                      <th className="py-3 text-center w-8">L</th>
                      <th className="py-3 text-center w-10">PCT</th>
                      <th className="py-3 text-center w-8">GB</th>
                      <th className="py-3 px-3 text-center w-12 border-l border-white/5">STRK</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="font-bold">
                {data.map((team, idx) => (
                  <tr key={team.id} className={`border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                    <td className="py-3 text-center text-gray-500 font-black">{team.seed || idx + 1}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-white/5 rounded p-0.5 flex-shrink-0">
                          {team.teamLogo ? <img src={team.teamLogo} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full bg-[#f4c025]/20 rounded-sm"></div>}
                        </div>
                        <span className="text-white truncate max-w-[80px]">{team.teamAbbr || team.teamName}</span>
                      </div>
                    </td>
                    {isSoccer ? (
                      <>
                        <td className="py-3 text-center text-gray-400">{(team.wins || 0) + (team.draws || 0) + (team.losses || 0)}</td>
                        <td className="py-3 text-center text-gray-300">{team.wins || 0}</td>
                        <td className="py-3 text-center text-gray-300">{team.draws || 0}</td>
                        <td className="py-3 text-center text-gray-300">{team.losses || 0}</td>
                        <td className="py-3 text-center text-gray-500">{team.goalsFor || 0}</td>
                        <td className="py-3 text-center text-gray-500">{team.goalsAgainst || 0}</td>
                        <td className="py-3 text-center text-gray-300">{(team.goalsFor || 0) - (team.goalsAgainst || 0)}</td>
                        <td className="py-3 px-3 text-center text-[#f4c025] bg-white/5 text-xs font-black">
                          {team.points || (team.wins * 3 + team.draws)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 text-center text-gray-300">{team.wins}</td>
                        <td className="py-3 text-center text-gray-300">{team.losses}</td>
                        <td className="py-3 text-center text-gray-300">{(team.pct || 0).toFixed(3)}</td>
                        <td className="py-3 text-center text-gray-300">{team.gamesBehind || '0'}</td>
                        <td className="py-3 px-3 text-center text-gray-400 border-l border-white/5">{team.streak || '-'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-500 pb-20">
        {!activeStandings && !loading && (
          <div className="text-center py-20 px-6 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 mx-4">
             <span className="material-symbols-outlined !text-[48px] text-white/5 mb-4">leaderboard</span>
             <p className="text-gray-500 text-sm font-medium italic">{t('sbNoStandings')}</p>
          </div>
        )}
        {conferences.map(conf => (
          renderConference(conf, sortedStandings.filter(s => (s.conference || 'General') === conf))
        ))}
      </div>
    )
  }

  const renderGlobalBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 h-[72px] bg-[#050505]/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-between px-2 z-[100] shadow-[0_-15px_40px_rgba(0,0,0,0.6)]">
      {[
        { id: 'home', icon: 'home', label: t('navHome') },
        { id: 'games', icon: 'sports_esports', label: t('navGames') },
        { id: 'sportsbook', icon: 'sports_score', label: t('navSportsbook'), center: true },
        { id: 'profile', icon: 'person', label: t('navProfile') },
      ].map((item) => {
        const isActive = selectedSection === item.id;
        
        if (item.center) {
          return (
            <div key={item.id} className="relative flex-1 flex flex-col items-center">
              <button
                onClick={() => setSelectedSection(item.id as any)}
                className={`group relative -top-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#f4c025] via-[#fbbf24] to-[#f59e0b] shadow-[0_8px_25px_rgba(244,192,37,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 border-[6px] border-[#050505] overflow-hidden cursor-pointer`}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="material-symbols-outlined !text-[28px] text-[#050505] font-black">
                  {item.icon}
                </span>
              </button>
              <span className={`text-[9px] font-black uppercase tracking-tighter mt-[-18px] transition-colors ${isActive ? 'text-[#f4c025]' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </div>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setSelectedSection(item.id as any)}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-all h-full group cursor-pointer"
          >
            <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
              isActive ? 'bg-[#f4c025]/10' : 'group-hover:bg-white/5'
            }`}>
              <span className={`material-symbols-outlined !text-[22px] transition-all ${
                isActive ? 'text-[#f4c025] font-black scale-110' : 'text-gray-500 group-hover:text-gray-300'
              }`}>
                {item.icon}
              </span>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
              isActive ? 'text-[#f4c025]' : 'text-gray-600 group-hover:text-gray-400'
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  )

  /**
   * Main Sportsbook layout including sport selector and view tabs.
   */
  const renderSportsbook = () => (
    <>
      {/* Sport Selector Nav (Level 2) */}
      <div className="grid grid-cols-2 gap-3 py-4 px-4 bg-[#050505] border-b border-white/[0.05] overflow-visible relative z-[60]">
        {SPORTS.map((sport) => {
          const isGroupActive = sport.id === 'SOCCER_GROUP' && SOCCER_LEAGUE_IDS.includes(selectedSport.toLowerCase() as any);
          const isActive = isGroupActive || selectedSport === sport.id;

          return (
            <div key={sport.id} className="relative group cursor-pointer flex justify-center">
              <button
                onClick={() => {
                  if (sport.id === 'SOCCER_GROUP') {
                    setSelectedSport('SOCCER_ALL');
                    setActiveTab('matches');
                  } else {
                    setSelectedSport(sport.id);
                  }
                }}
                className={`w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-black tracking-widest transition-all cursor-pointer border ${
                  isActive 
                    ? 'bg-[#fbbf24]/10 text-[#FBBF24] border-[#fbbf24]/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]' 
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-sm">{sport.icon}</span>
                {sport.label}
              </button>

              {sport.sub && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] flex flex-col py-2 cursor-default">
                  {sport.sub.map(subItem => (
                    <button 
                      key={subItem.id} 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedSport(subItem.id); 
                      }}
                      className={`px-4 py-3 text-[10px] font-black text-center uppercase tracking-widest cursor-pointer transition-colors ${selectedSport === subItem.id ? 'text-[#f4c025] bg-white/[0.04]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sport View Tabs (Level 3) */}
      {selectedSport !== 'SOCCER_ALL' && (
        <nav className="flex items-center justify-center bg-[#050505] border-b border-white/10 sticky top-[64px] z-40 overflow-x-hidden">
          {(['matches', 'results', 'standings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 relative text-[10px] font-black py-4 uppercase tracking-[0.1em] transition-all cursor-pointer ${
              activeTab === tab 
                ? 'text-[#FBBF24] bg-white/[0.02] after:content-[""] after:absolute after:bottom-0 after:left-1 after:right-1 after:h-0.5 after:bg-[#FBBF24] after:rounded-full after:shadow-[0_0_10px_#fbbf24]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.01]'
            }`}
          >
            {tab === 'matches' ? t('sbTabBoard') : tab === 'results' ? t('sbTabResults') : t('sbTabStandings')}
          </button>
        ))}
        </nav>
      )}

      <main className="flex-1 w-full px-4 py-6 pb-24 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 animate-pulse">
            <div className="w-12 h-12 border-4 border-[#f4c025]/10 border-t-[#f4c025] rounded-full animate-spin"></div>
            <p className="text-xs font-black text-[#f4c025]/60 tracking-[0.2em] uppercase">{t('sbSyncing')} {selectedSport}...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {selectedSport === 'SOCCER_ALL' || activeTab === 'matches' ? renderMatches('active') : activeTab === 'results' ? renderMatches('results') : renderStandings()}
          </div>
        )}
      </main>
    </>
  )

  const renderUserCard = (compact = false) => (
    <div className={`flex flex-col items-center gap-4 ${compact ? 'mb-6' : 'mb-10'}`}>
      <div className="relative">
        <div className={`${compact ? 'w-20 h-20' : 'w-24 h-24'} rounded-full border-4 border-[#f4c025] p-1 bg-[#050505]`}>
          <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
             <span className={`material-symbols-outlined ${compact ? '!text-[40px]' : '!text-[48px]'} text-white/20`}>person</span>
          </div>
        </div>
        <div className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} absolute bottom-1 right-1 bg-green-500 border-4 border-[#050505] rounded-full`}></div>
      </div>
      <div className="text-center">
        <h2 className={`${compact ? 'text-xl' : 'text-2xl'} font-black text-white`}>Alex Roller</h2>
        <p className="text-xs font-bold text-[#f4c025] mt-1 tracking-widest uppercase opacity-70">Platinum VIP Level</p>
      </div>
    </div>
  )

  const renderHome = () => (
    <main className="flex-1 w-full px-3 py-6 flex flex-col gap-6 pb-24 overflow-y-auto overflow-x-hidden">
      {renderUserCard(true)}
      {/* 
      <div className="bg-gradient-to-br from-[#f4c025] to-[#fbbf24] rounded-2xl p-5 text-[#050505] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/30 transition-all duration-700"></div>
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-widest opacity-60">{t('totalBalance')}</p>
          <h2 className="text-4xl font-black mt-1">$12,450.00</h2>
          <div className="flex items-center gap-2 mt-4 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
            <span className="material-symbols-outlined !text-[14px]">trending_up</span>
            <span className="text-[10px] font-black">{t('trendToday')}</span>
          </div>
        </div>
      </div>
      */}
 
       <div className="grid grid-cols-2 gap-3">
         <button className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2 hover:bg-white/10 transition-all active:scale-95 shadow-lg group cursor-pointer">
           <div className="p-2 bg-[#f4c025]/10 rounded-lg group-hover:bg-[#f4c025]/20 transition-colors">
             <span className="material-symbols-outlined !text-[20px]">add_circle</span>
           </div>
           <span className="text-xs font-black uppercase tracking-tighter">{t('btnDeposit')}</span>
         </button>
         <button className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col items-center gap-2 hover:bg-white/10 transition-all active:scale-95 shadow-lg group cursor-pointer">
           <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
             <span className="material-symbols-outlined">arrow_outward</span>
           </div>
           <span className="text-xs font-black uppercase tracking-tighter">{t('btnWithdraw')}</span>
         </button>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 px-2">{t('homeRecentActivity')}</h3>
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-center border-dashed">
          <p className="text-sm text-gray-600 italic">{t('homeNoActivity')}</p>
        </div>
      </div>
    </main>
  )

  const renderGames = () => (
    <main className="flex-1 w-full px-3 py-6 flex flex-col gap-6 pb-24 overflow-y-auto overflow-x-hidden">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-black text-white tracking-tight">{t('gamesSocialCasino')}</h2>
        <span className="px-3 py-1 bg-[#f4c025]/20 text-[#f4c025] rounded-full text-[10px] font-black uppercase animate-pulse">{t('tweetLiveLabel')}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { title: 'Bull Ride Loot', prov: 'Relax Gaming', img: 'https://lh3.googleusercontent.com/fife/AL65B2p...' },
          { title: 'Santa\'s Stack', prov: 'Pragmatic', img: 'https://lh3.googleusercontent.com/fife/AL65B2p...' },
          { title: 'Army of Ares', prov: 'Pragmatic', img: 'https://lh3.googleusercontent.com/fife/AL65B2p...' },
          { title: 'The Count', prov: 'Relax Gaming', img: 'https://lh3.googleusercontent.com/fife/AL65B2p...' },
        ].map((game, i) => (
          <div key={i} className="aspect-[4/5] bg-white/5 rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5 hover:border-[#f4c025]/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <div className="absolute bottom-3 left-3 right-3 z-20">
              <p className="text-[10px] font-black text-white truncate">{game.title}</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{game.prov}</p>
            </div>
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined !text-[40px] text-white/10 group-hover:text-[#f4c025]/40 transition-colors">casino</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )

  const renderProfile = () => (
    <main className="flex-1 w-full px-4 py-8 pb-24 overflow-y-auto">
      {renderUserCard()}
 
      {/* Language Switcher */}
      <div className="mb-8 p-1 bg-white/5 rounded-2xl flex gap-1">
        {[
          { id: 'en', label: 'English' },
          { id: 'de', label: 'Deutsch' },
          { id: 'fr', label: 'Français' },
        ].map((lang) => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id as any)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              language === lang.id 
                ? 'bg-[#f4c025] text-[#050505] shadow-lg scale-[1.02]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

       <div className="flex flex-col gap-2">
         {[
          { icon: 'account_balance_wallet', label: t('menuTransHistory') },
          { icon: 'settings', label: t('menuSettings') || 'Settings' },
          { icon: 'support_agent', label: t('helpTitle') },
        ].map((item, i) => (
          <button key={i} className="flex items-center gap-4 w-full p-4 hover:bg-white/5 rounded-2xl transition-all group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#f4c025]/10 transition-colors">
              <span className="material-symbols-outlined !text-[20px] text-gray-400 group-hover:text-[#f4c025]">{item.icon}</span>
            </div>
            <span className="text-sm font-bold text-gray-300 flex-1 text-left">{item.label}</span>
            <span className="material-symbols-outlined !text-[18px] text-gray-600 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>
        ))}
        <button className="flex items-center gap-4 w-full p-4 mt-8 hover:bg-red-500/5 rounded-2xl transition-all group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined !text-[20px] text-red-500">logout</span>
          </div>
          <span className="text-sm font-bold text-red-500">{t('menuLogout')}</span>
        </button>
      </div>
    </main>
  )

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden w-full mx-auto relative shadow-2xl">
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-3 bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 shadow-xl z-50">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/5 rounded-lg border border-white/10 shadow-inner flex items-center justify-center">
            <img src="/logo-fl.png" alt="FL-Sports" className="w-8 h-8 object-contain drop-shadow-md" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-black text-white m-0 tracking-tight leading-tight">FL-Sports</h1>
            <span className="text-[10px] text-[#f4c025] font-black uppercase tracking-widest opacity-80 leading-none">
              {selectedSection === 'home' ? t('navHome') : selectedSection === 'games' ? t('navGames') : selectedSection === 'profile' ? t('navProfile') : `${selectedSport} ${t('tweetRealTime')}`}
            </span>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="bg-white/5 border border-white/10 text-[#f4c025] hover:bg-white/10 rounded-xl w-10 h-10 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg group cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 21h5v-5" />
          </svg>
        </button>
      </header>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {selectedMatchId ? (
          <div className="flex-1 p-6 pb-24 overflow-y-auto">
            <MatchDetail />
          </div>
        ) : (
          <>
            {selectedSection === 'home' && renderHome()}
            {selectedSection === 'sportsbook' && renderSportsbook()}
            {selectedSection === 'games' && renderGames()}
            {selectedSection === 'profile' && renderProfile()}
          </>
        )}
      </div>

      {renderGlobalBottomNav()}

      {error && (
        <div className="fixed bottom-20 left-6 right-6 z-[200] bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-4 items-center shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
          <div className="bg-red-500 p-2 rounded-lg text-white">
            <span className="material-symbols-outlined !text-[20px]">error</span>
          </div>
          <div>
            <h4 className="text-sm font-black text-red-500 uppercase tracking-tighter">Error</h4>
            <p className="text-xs font-bold text-red-200/70 leading-relaxed mt-0.5">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
