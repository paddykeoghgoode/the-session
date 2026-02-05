// Sports events fetching utility
// Uses TheSportsDB free API for Irish-relevant sports fixtures

export interface SportEvent {
  id: string;
  name: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  sport: string;
  dateTime: string;
  venue: string | null;
  thumbnail: string | null;
  isIrelandGame: boolean;
  isBigMatch: boolean;
}

export interface DublinEvent {
  id: string;
  title: string;
  venue: string;
  dateTime: string;
  category: 'concert' | 'festival' | 'comedy' | 'sports' | 'other';
  description: string | null;
}

// League IDs from TheSportsDB
const LEAGUES = {
  PREMIER_LEAGUE: 4328,
  CHAMPIONS_LEAGUE: 4480,
  SIX_NATIONS: 4724,
  LEAGUE_OF_IRELAND: 4406,
  LA_LIGA: 4335,
  SERIE_A: 4332,
  BUNDESLIGA: 4331,
  LIGUE_1: 4334,
  URC: 5765, // United Rugby Championship
};

// Teams Irish people care about
const IRELAND_TEAMS = [
  'republic of ireland', 'ireland', 'shamrock rovers', 'bohemians',
  'shelbourne', 'dundalk', 'st patricks', 'drogheda', 'derry city',
  'sligo rovers', 'galway united', 'cork city', 'waterford',
  'leinster', 'munster', 'connacht', 'ulster',
];

const BIG_MATCH_KEYWORDS = [
  'final', 'semi-final', 'quarter-final', 'derby', 'ireland',
  'liverpool', 'manchester', 'arsenal', 'chelsea', 'tottenham',
  'celtic', 'rangers',
];

function isIrelandRelated(homeTeam: string, awayTeam: string): boolean {
  const lower = `${homeTeam} ${awayTeam}`.toLowerCase();
  return IRELAND_TEAMS.some(team => lower.includes(team));
}

function isBigMatch(eventName: string, homeTeam: string, awayTeam: string): boolean {
  const lower = `${eventName} ${homeTeam} ${awayTeam}`.toLowerCase();
  return BIG_MATCH_KEYWORDS.some(keyword => lower.includes(keyword));
}

interface TheSportsDBEvent {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strLeague: string;
  strSport: string;
  dateEvent: string;
  strTime: string;
  strVenue: string | null;
  strThumb: string | null;
}

async function fetchLeagueEvents(leagueId: number): Promise<SportEvent[]> {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${leagueId}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.events) return [];

    return data.events.map((event: TheSportsDBEvent) => ({
      id: event.idEvent,
      name: event.strEvent,
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      league: event.strLeague,
      sport: event.strSport,
      dateTime: `${event.dateEvent}T${event.strTime || '15:00:00'}`,
      venue: event.strVenue,
      thumbnail: event.strThumb,
      isIrelandGame: isIrelandRelated(event.strHomeTeam, event.strAwayTeam),
      isBigMatch: isBigMatch(event.strEvent, event.strHomeTeam, event.strAwayTeam),
    }));
  } catch {
    return [];
  }
}

export async function getUpcomingSportsEvents(): Promise<SportEvent[]> {
  const leagueIds = Object.values(LEAGUES);

  const results = await Promise.allSettled(
    leagueIds.map(id => fetchLeagueEvents(id))
  );

  const allEvents: SportEvent[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allEvents.push(...result.value);
    }
  }

  // Sort: Ireland games first, then big matches, then by date
  allEvents.sort((a, b) => {
    if (a.isIrelandGame && !b.isIrelandGame) return -1;
    if (!a.isIrelandGame && b.isIrelandGame) return 1;
    if (a.isBigMatch && !b.isBigMatch) return -1;
    if (!a.isBigMatch && b.isBigMatch) return 1;
    return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
  });

  // Filter to next 7 days
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return allEvents.filter(event => {
    const eventDate = new Date(event.dateTime);
    return eventDate >= now && eventDate <= weekFromNow;
  });
}

export function getSportIcon(sport: string): string {
  const lower = sport.toLowerCase();
  if (lower.includes('soccer') || lower.includes('football')) return '\u26BD';
  if (lower.includes('rugby')) return '\uD83C\uDFC9';
  if (lower.includes('gaa') || lower.includes('gaelic')) return '\u2618\uFE0F';
  if (lower.includes('hurling')) return '\uD83C\uDFD1';
  if (lower.includes('boxing')) return '\uD83E\uDD4A';
  if (lower.includes('mma') || lower.includes('fighting')) return '\uD83E\uDD4B';
  return '\uD83C\uDFC6';
}

export function getLeagueShortName(league: string): string {
  const map: Record<string, string> = {
    'English Premier League': 'Premier League',
    'UEFA Champions League': 'Champions League',
    'Six Nations': '6 Nations',
    'League of Ireland Premier Division': 'LOI',
    'United Rugby Championship': 'URC',
    'La Liga': 'La Liga',
    'Italian Serie A': 'Serie A',
    'German Bundesliga': 'Bundesliga',
    'French Ligue 1': 'Ligue 1',
  };
  return map[league] || league;
}

export function formatMatchTime(dateTime: string): string {
  const date = new Date(dateTime);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = date.toLocaleTimeString('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Dublin',
  });

  if (date.toDateString() === now.toDateString()) {
    return `Today ${timeStr}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow ${timeStr}`;
  }

  const dayStr = date.toLocaleDateString('en-IE', {
    weekday: 'short',
    timeZone: 'Europe/Dublin',
  });
  return `${dayStr} ${timeStr}`;
}
