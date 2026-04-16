import { create } from 'zustand'
import type { Match, TeamRanking } from '@sportsbook/types'
import en from '../locales/en.json'
import de from '../locales/de.json'
import fr from '../locales/fr.json'

type Language = 'en' | 'de' | 'fr';
type Section = 'home' | 'sportsbook' | 'games' | 'profile';

const locales: Record<string, any> = { en, de, fr };

interface SportsStore {
    matches: Match[];
    standings: TeamRanking[];
    selectedMatchId: string | null;
    selectedSport: string;
    selectedSection: Section;
    language: Language;
    t: (key: string) => string;
    setMatches: (matches: Match[]) => void;
    setStandings: (standings: TeamRanking[]) => void;
    updateMatch: (match: Partial<Match> & { id: string }) => void;
    setSelectedMatchId: (id: string | null) => void;
    setSelectedSport: (sport: string) => void;
    setSelectedSection: (section: Section) => void;
    setLanguage: (lang: Language) => void;
}

export const useStore = create<SportsStore>((set, get) => ({
    matches: [],
    standings: [],
    selectedMatchId: null,
    selectedSport: 'NBA',
    selectedSection: 'sportsbook',
    language: (localStorage.getItem('user_lang') as Language) || 'en',
    t: (key: string) => {
        const lang = get().language;
        const messages = locales[lang] || locales['en'];
        return messages[key]?.message || key;
    },
    setMatches: (matches) => set({ matches }),
    setStandings: (standings) => set({ standings }),
    updateMatch: (updatedMatch) => set((state) => ({
        matches: state.matches.map((m) =>
            m.id === updatedMatch.id ? { ...m, ...updatedMatch } : m
        )
    })),
    setSelectedMatchId: (id) => set({ selectedMatchId: id }),
    setSelectedSport: (sport) => set({ selectedSport: sport, selectedMatchId: null }),
    setSelectedSection: (section) => set({ selectedSection: section, selectedMatchId: null }),
    setLanguage: (lang) => {
        localStorage.setItem('user_lang', lang);
        set({ language: lang });
    },
}))
