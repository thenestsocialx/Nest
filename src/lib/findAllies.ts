// ══════════════════════════════════════════════════════════════
// Nest · Find Allies — Constants & filter logic
// ══════════════════════════════════════════════════════════════
import type { TopicFilter, VibeFilter, AllyPublicProfile, MatchQuality, TopicId, VibeId } from '@/types/findAllies';

// ── Topic filters ─────────────────────────────────────────────
// id values must exactly match what is stored in allies.specialties[]
export const TOPIC_FILTERS: TopicFilter[] = [
  {
    id: 'anxiety',
    label: 'Anxiety',
    iconInner: '<circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.4"/><path d="M9 3v1.5M9 13.5V15M3 9h1.5M13.5 9H15" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  },
  {
    id: 'heartbreak',
    label: 'Heartbreak',
    iconInner: '<path d="M9 14s-6-3.5-6-7a5 5 0 0112 0c0 .5-.05 1-.14 1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M11 10l1.5 1.5L15 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/><path d="M9 14s-6-3.5-6-7a5 5 0 0112 0" stroke="currentColor" stroke-width="1.4"/>',
  },
  {
    id: 'loneliness',
    label: 'Loneliness',
    iconInner: '<circle cx="9" cy="6.5" r="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M4 15c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".45"/>',
  },
  {
    id: 'family',
    label: 'Family pressure',
    iconInner: '<circle cx="9" cy="5" r="2" stroke="currentColor" stroke-width="1.4"/><circle cx="4.5" cy="8" r="1.5" stroke="currentColor" stroke-width="1.4"/><circle cx="13.5" cy="8" r="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M6.5 14c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2 14c0-1.1.7-2 1.7-2.3M14.3 11.7c1 .3 1.7 1.2 1.7 2.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>',
  },
  {
    id: 'identity',
    label: 'Identity',
    iconInner: '<circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M9 6v4M9 12v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  },
  {
    id: 'grief',
    label: 'Grief',
    iconInner: '<path d="M9 14s-6-3.5-6-7.5a6 6 0 0112 0c0 4-6 7.5-6 7.5z" stroke="currentColor" stroke-width="1.4"/>',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    iconInner: '<circle cx="6" cy="7" r="2.5" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="7" r="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M3 14c0-1.7 1.3-3 3-3M9 14c0-1.7 1.3-3 3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  },
  {
    id: 'burnout',
    label: 'Burnout',
    iconInner: '<path d="M9 3c0 0-5 3-5 7a5 5 0 0010 0c0-2-1.5-3.5-1.5-3.5s0 2.5-2 3.5c-1-1-1.5-2.5-1.5-4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  },
  {
    id: 'self-esteem',
    label: 'Self-worth',
    iconInner: '<path d="M9 2l1.5 4.5L15 8l-4.5 1.5L9 14l-1.5-4.5L3 8l4.5-1.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  },
  {
    id: 'career',
    label: 'Career',
    iconInner: '<rect x="3" y="7" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M6 7V5.5a3 3 0 016 0V7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  },
  {
    id: 'trauma',
    label: 'Trauma',
    iconInner: '<path d="M9 3L3 14h12L9 3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 8v2.5M9 12.5v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  },
  {
    id: 'depression',
    label: 'Depression',
    iconInner: '<path d="M3 7c2-3 7-3 9 0s7 0 9-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" transform="scale(0.6) translate(3,4)"/><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.4" opacity=".3"/><path d="M6.5 11c.5-.5 1.5-.8 2.5-.8s2 .3 2.5.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  },
  {
    id: 'communication',
    label: 'Communication',
    iconInner: '<path d="M3 4.5h8a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5H6l-3 2V6a1.5 1.5 0 011.5-1.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 7.5h.5A1.5 1.5 0 0114 9v2.5l2 1.5v-5A1.5 1.5 0 0014.5 6H12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>',
  },
  {
    id: 'confidence',
    label: 'Confidence',
    iconInner: '<path d="M9 2l1.8 4L15 7l-3 3 .7 4.2L9 12l-3.7 2.2L6 10 3 7l4.2-1z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  },
  {
    id: 'cultural',
    label: 'Cultural',
    iconInner: '<circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M3 9h12M9 2.5c-2 2-3 4-3 6.5s1 4.5 3 6.5M9 2.5c2 2 3 4 3 6.5s-1 4.5-3 6.5" stroke="currentColor" stroke-width="1.4"/>',
  },
  {
    id: 'lgbtq+',
    label: 'LGBTQ+',
    iconInner: '<path d="M5 13l2-4 2 2 2-4 2 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="6" r="3" stroke="currentColor" stroke-width="1.4" opacity=".5"/>',
  },
  {
    id: 'anger management',
    label: 'Anger',
    iconInner: '<path d="M3 9c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M6 12l1.5-2 1.5 2 1.5-2 1.5 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  },
];

// ── Vibe filters ──────────────────────────────────────────────
// id values must exactly match what is stored in allies.user_vibes[]
export const VIBE_FILTERS: VibeFilter[] = [
  {
    id: 'vent',
    title: 'I just need to vent',
    sub: 'Someone who listens, no advice',
    iconInner: '<path d="M6 11c.5.5 1.5 1 3 1s2.5-.5 3-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="6.5" cy="7.5" r=".8" fill="currentColor"/><circle cx="11.5" cy="7.5" r=".8" fill="currentColor"/><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.4"/>',
  },
  {
    id: 'tools',
    title: 'Give me tools to cope',
    sub: 'Practical, structured support',
    iconInner: '<path d="M5 9h8M9 5v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="3" y="3" width="12" height="12" rx="3" stroke="currentColor" stroke-width="1.4"/>',
  },
  {
    id: 'gentle',
    title: 'Be gentle with me',
    sub: 'Soft, patient, non-judgmental',
    iconInner: '<path d="M9 13s-5-3-5-6a5 5 0 0110 0c0 3-5 6-5 6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  },
  {
    id: 'direct',
    title: 'Give it to me straight',
    sub: 'Direct, honest, no sugarcoating',
    iconInner: '<path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  },
];

// ── Filter logic ──────────────────────────────────────────────
export function filterAllies(
  allies: AllyPublicProfile[],
  selectedTopic: TopicId | null,
  selectedVibe: VibeId | null,
): AllyPublicProfile[] {
  return allies.filter(ally => {
    const topicOk = !selectedTopic || ally.specialties.includes(selectedTopic);
    const vibeOk  = !selectedVibe  || ally.user_vibes.includes(selectedVibe);
    return topicOk && vibeOk;
  });
}

// ── Match quality ─────────────────────────────────────────────
export function getMatchQuality(
  ally: AllyPublicProfile,
  selectedTopic: TopicId | null,
  selectedVibe: VibeId | null,
): MatchQuality {
  const topicMatch = !selectedTopic || ally.specialties.includes(selectedTopic);
  const vibeMatch  = !selectedVibe  || ally.user_vibes.includes(selectedVibe);
  if (selectedTopic && selectedVibe && topicMatch && vibeMatch) return 'great';
  return 'good';
}

// ── Avatar helpers ────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#E8C8A0 0%,#D4A882 100%)',
  'linear-gradient(135deg,#C8DAC0 0%,#9EBC96 100%)',
  'linear-gradient(135deg,#D4C4B0 0%,#B8A08C 100%)',
  'linear-gradient(135deg,#BED0C8 0%,#94B0A8 100%)',
];

export function getAvatarGradient(id: string): string {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export function getInitials(displayName: string): string {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

// ── Topic label lookup ────────────────────────────────────────
export function getTopicLabel(id: TopicId): string {
  return TOPIC_FILTERS.find(t => t.id === id)?.label ?? id;
}

// ── Vibe title lookup ─────────────────────────────────────────
export function getVibeTitle(id: VibeId): string {
  return VIBE_FILTERS.find(v => v.id === id)?.title ?? id;
}
