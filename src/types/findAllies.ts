// ══════════════════════════════════════════════════════════════
// Nest · Find Allies — Types
// ══════════════════════════════════════════════════════════════

export type TopicId =
  | 'anxiety'
  | 'grief'
  | 'loneliness'
  | 'relationships'
  | 'burnout'
  | 'self-esteem';

export type VibeId = 'vent' | 'tools' | 'gentle' | 'direct';

export type MatchQuality = 'great' | 'good';

export interface TopicFilter {
  id: TopicId;
  label: string;
  iconInner: string; // SVG inner HTML, viewBox="0 0 18 18"
}

export interface VibeFilter {
  id: VibeId;
  title: string;
  sub: string;
  iconInner: string; // SVG inner HTML, viewBox="0 0 18 18"
}

export interface AllyPublicProfile {
  id: string;
  display_name: string;
  primary_role: string | null;
  years_experience: number;
  bio: string | null;
  tagline: string | null;
  specialties: string[];
  user_vibes: string[];
  modalities: string[];
  approach_style: string | null;
  photo_url: string | null;
  session_price: number;
  intro_price: number | null;
  location: string | null;
  manual_priority_score: number;
}
