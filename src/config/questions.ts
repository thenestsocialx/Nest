import type { Question, BranchId } from '@/lib/assessment/types'

// Maps a branch to its first question after the INTENSITY universal question
export const BRANCH_START_MAP: Record<BranchId, string> = {
  loneliness:   'A1',
  anxiety:      'B1',
  'low-mood':   'C1',
  relationship: 'D1',
  burnout:      'E1',
  grief:        'F1',
}

// Estimated total steps for a typical path (entry 4 + branch ~4 + closing 4)
export const ESTIMATED_TOTAL_STEPS = 12

// ─── Question tree ─────────────────────────────────────────────────────────────
// Each key is a question ID. Shell traverses by following option.next pointers.
// Special next values: 'RESULT' | 'CRISIS' | 'BRANCH_START'

export const QUESTION_TREE: Record<string, Question> = {

  // ── ENTRY ──────────────────────────────────────────────────────────────────

  Q0: {
    id: 'Q0',
    text: 'How are you doing right now?',
    subtext: "Whatever brought you here — there's room for it. Just pick what's closest.",
    options: [
      { label: 'Going through something heavy',     microcopy: 'Thank you for being honest. That\'s exactly why you\'re here.',       next: 'Q1' },
      { label: 'Feeling off for a while',           microcopy: 'Sometimes what builds slowly is what runs deepest.',                  next: 'Q1' },
      { label: 'Okay but something feels missing',  microcopy: "That feeling of 'off' — you're right to listen to it.",              next: 'Q1' },
      { label: "Not sure — I just ended up here",   microcopy: "That's okay. Let's just see what comes up.",                         next: 'Q1' },
    ],
  },

  Q1: {
    id: 'Q1',
    text: 'Which feels closest to your experience?',
    subtext: "Choose what resonates most — even if it's not exact.",
    options: [
      { label: 'I feel disconnected from people',         microcopy: "Loneliness has a way of staying quiet until it gets too heavy.",                              next: 'CRISIS_CHECK', branchId: 'loneliness'   },
      { label: 'I feel anxious or overwhelmed',           microcopy: "That kind of noise in the mind is exhausting to carry.",                                     next: 'CRISIS_CHECK', branchId: 'anxiety'      },
      { label: 'I feel sad, low, or empty',               microcopy: "That flatness — it's real, even when it's hard to name.",                                    next: 'CRISIS_CHECK', branchId: 'low-mood'    },
      { label: 'Going through a difficult situation',     microcopy: "Situations have a way of getting inside us, even when we don't expect them to.",             next: 'CRISIS_CHECK', branchId: 'relationship' },
      { label: 'I feel completely exhausted',             microcopy: "Exhaustion that deep is more than tiredness — it's your whole system asking for rest.",      next: 'CRISIS_CHECK', branchId: 'burnout'      },
      { label: 'Dealing with a loss or ending',           microcopy: "Loss leaves its own kind of quiet behind. We'll go carefully.",                              next: 'CRISIS_CHECK', branchId: 'grief'        },
    ],
  },

  // ── CRISIS CHECK (immediately after Q1) ───────────────────────────────────

  CRISIS_CHECK: {
    id: 'CRISIS_CHECK',
    text: 'Before we go further — have you been having thoughts of hurting yourself or not wanting to be here?',
    subtext: "You're safe here. We ask because we want to make sure you have what you need.",
    options: [
      { label: 'Yes — I need help right now',           microcopy: 'You reached out. That matters. Please hold on.',                               next: 'CRISIS' },
      { label: 'These thoughts are coming more often',  microcopy: 'Thank you for telling us. This is exactly the right place to say it.',         next: 'CRISIS' },
      { label: 'Passing thoughts — I am okay',          microcopy: "We hear you. Let's keep going together.",                                      next: 'INTENSITY' },
      { label: 'No, not at all',                        microcopy: "Good to know. Let's understand what's been going on.",                         next: 'INTENSITY' },
    ],
  },

  // ── INTENSITY (universal, after CRISIS_CHECK) ──────────────────────────────

  INTENSITY: {
    id: 'INTENSITY',
    text: 'How much is this getting in the way of your daily life?',
    subtext: "There's no wrong answer here. Just pick what's honest.",
    options: [
      { label: "Barely — I'm mostly functioning",     microcopy: "Even small things deserve attention when they start to weigh on us.",                      next: 'BRANCH_START' },
      { label: 'Noticeably — it\'s affecting things', microcopy: "That kind of impact is worth taking seriously.",                                          next: 'BRANCH_START' },
      { label: 'A lot — most days feel harder',       microcopy: "That's a significant amount to be carrying. You don't have to keep doing it alone.",      next: 'BRANCH_START' },
      { label: "It's all I can think about",          microcopy: "When it takes over that much — you're in exactly the right place to start.",              next: 'BRANCH_START' },
    ],
  },

  // ── BRANCH A — LONELINESS ──────────────────────────────────────────────────

  A1: {
    id: 'A1',
    text: 'What does feeling alone look like for you?',
    subtext: 'Choose what feels closest — even if none is quite right.',
    options: [
      { label: 'I feel disconnected from people',                  microcopy: "Disconnection can live right next to other people — that's the hardest kind.",                           next: 'A2a' },
      { label: 'No close friends I can really talk to',            microcopy: "Not having someone to reach for — that's one of the heaviest kinds of quiet.",                          next: 'A2b' },
      { label: 'Someone to listen without trying to fix',          microcopy: "Sometimes all we need is someone who is fully present. That's not too much to ask.",                    next: 'A2b' },
      { label: 'Lost my people in a life transition',              microcopy: "Transitions take more from us than we expect — including the people we counted on.",                    next: 'A2c' },
      { label: 'A relationship ended and took my world',           microcopy: "When a relationship goes, it can feel like an entire landscape disappears.",                            next: 'A2d' },
      { label: "Feels pointless — nothing changes",                microcopy: "That hopelessness has its own particular weight. It's real, and it's worth addressing.",               next: 'A2d' },
      { label: "I pull back — afraid to be a burden",              microcopy: "The fear of being too much keeps so many people from being truly seen.",                               next: 'A2d' },
    ],
  },

  A2a: {
    id: 'A2a',
    text: 'Has connecting with people always been hard for you?',
    subtext: 'Your answer helps us understand you better.',
    options: [
      { label: 'It has always been hard for me',              microcopy: "That's a long time to have navigated this mostly alone.",                                         next: 'A3' },
      { label: 'Something changed — it used to be different', microcopy: "A shift in connection is disorienting. Let's understand what changed.",                          next: 'A2c' },
      { label: 'I have connections elsewhere, not here',      microcopy: "Context shapes connection so much. Being out of place makes it so much harder.",                 next: 'A3' },
    ],
  },

  A2b: {
    id: 'A2b',
    text: 'Is there anyone you feel close to right now?',
    subtext: 'Be honest — no one is listening but this.',
    options: [
      { label: 'Yes, one or two people',                microcopy: "Having even one is something. What you need is that kind of presence more often.",                    next: 'A3' },
      { label: 'Have people around but feel unseen',    microcopy: "Being surrounded but not truly known — that's a quiet kind of loneliness.",                          next: 'A2d' },
      { label: 'Not really',                            microcopy: "You're building something, starting here.",                                                          next: 'A3' },
      { label: 'I used to, but not anymore',            microcopy: "Losing that thread of connection leaves a specific kind of gap.",                                    next: 'A3' },
    ],
  },

  A2c: {
    id: 'A2c',
    text: 'What made connection harder recently?',
    subtext: 'Sometimes there\'s a clear turning point.',
    options: [
      { label: 'New city or new job',           microcopy: "Starting over with people takes a particular kind of energy.",                                           next: 'A3' },
      { label: 'People around me moved on',     microcopy: "Life pulling people in different directions — that loss is real, even if no one talks about it.",         next: 'A3' },
      { label: 'College or university ended',   microcopy: "Those years carry a particular closeness. Losing that structure is harder than most people admit.",       next: 'A3' },
    ],
  },

  A2d: {
    id: 'A2d',
    text: 'What stops you from reaching out?',
    subtext: 'Even a rough answer helps.',
    options: [
      { label: "Don't want to be too much for someone",   microcopy: "Carrying that fear alone is what makes it heavier.",                                            next: 'A3' },
      { label: "Been hurt by people I opened up to",      microcopy: "That kind of hurt changes how safe it feels to try again. It makes sense.",                    next: 'A3' },
      { label: "I don't know how to start",               microcopy: "Not knowing how to begin is one of the most human things.",                                    next: 'A3' },
    ],
  },

  A3: {
    id: 'A3',
    text: 'What support would feel most meaningful right now?',
    subtext: 'This shapes what we recommend.',
    options: [
      { label: 'Meeting people who understand what I feel',   microcopy: "Being around people who just get it — that's its own kind of relief.",                     next: 'CTX1' },
      { label: 'Tools to connect better with people',         microcopy: "Connection is a skill. And like any skill, it can grow.",                                  next: 'CTX1' },
      { label: 'Speaking to a professional',                  microcopy: "That readiness — to ask for real support — takes something.",                              next: 'CTX1' },
    ],
  },

  // ── BRANCH B — ANXIETY ────────────────────────────────────────────────────

  B1: {
    id: 'B1',
    text: 'What has been feeding the anxiety most?',
    subtext: 'You can pick more than one mentally — just choose the one that hits hardest.',
    options: [
      { label: 'Work or academic pressure',                     microcopy: "That kind of pressure doesn't clock out when you do.",                                   next: 'B2a' },
      { label: 'Uncertainty about the future',                  microcopy: "Not knowing what's ahead — it's hard to prepare for the unknown.",                       next: 'B2b' },
      { label: 'What people think of me',                       microcopy: "Living inside how others see you is exhausting.",                                        next: 'B2c' },
      { label: 'I overthink everything — small and big',        microcopy: "A mind that won't slow down is doing extra work that isn't asked of it.",               next: 'B2d' },
      { label: "My own thoughts — can't turn them off",         microcopy: "When the loudest thing in the room is your own mind.",                                  next: 'B2d' },
      { label: 'Specific fears and worst-case scenarios',       microcopy: "The mind can be so good at building the worst version of what might happen.",           next: 'B2c' },
    ],
  },

  B2a: {
    id: 'B2a',
    text: 'How does this pressure show up day to day?',
    subtext: 'Pick what feels most familiar.',
    options: [
      { label: 'Snapping at people or withdrawing',         microcopy: "Stress has a way of coming out sideways.",                                                     next: 'B2e' },
      { label: 'Always feel like I am falling behind',      microcopy: "The gap between where you are and where you think you should be — that's a painful place.",  next: 'B2e' },
      { label: 'Not sleeping properly',                     microcopy: "Your nervous system is still working through something, even at night.",                       next: 'B2e' },
      { label: "Can't focus or get things done",            microcopy: "A scattered mind is often a tired heart in disguise.",                                         next: 'B2e' },
    ],
  },

  B2b: {
    id: 'B2b',
    text: 'What about the future hits hardest?',
    subtext: 'Be specific if you can.',
    options: [
      { label: 'Not knowing where my life is going',    microcopy: "Living in the in-between is one of the harder places to be.",                                     next: 'B2e' },
      { label: 'Feeling behind compared to others',     microcopy: "Comparison makes everyone else's highlight reel feel like your reality.",                         next: 'B2e' },
      { label: 'Fear of making the wrong choices',      microcopy: "Decision anxiety is real. It often freezes the very thing it's trying to protect.",              next: 'B2e' },
      { label: "Fear that things won't get better",     microcopy: "That fear — that this is just how it is — is one of the heaviest kinds.",                         next: 'B2e' },
    ],
  },

  B2c: {
    id: 'B2c',
    text: 'When does the anxiety mostly show up?',
    subtext: 'There\'s no wrong pattern here.',
    options: [
      { label: 'Before — I overthink everything in advance',   microcopy: "Preparing for every possible outcome is its own kind of exhaustion.",                     next: 'B3' },
      { label: 'After — I replay everything I said',           microcopy: "The replay never changes the outcome, but your mind keeps running it anyway.",            next: 'B3' },
      { label: "During — I freeze or can't be myself",         microcopy: "Freezing in the moment — that's not weakness, it's an overwhelmed nervous system.",      next: 'B3' },
      { label: 'All of the above',                             microcopy: "Before, during, after — anxiety finding every gap. That's a lot to hold.",               next: 'B3' },
    ],
  },

  B2d: {
    id: 'B2d',
    text: 'What are those thoughts mostly about?',
    subtext: 'Pick what feels truest.',
    options: [
      { label: "A general dread I can't pin down",   microcopy: "Free-floating dread is its own kind of hard — nothing to point to, but still everywhere.",        next: 'B2e' },
      { label: 'Harsh self-criticism',               microcopy: "The inner critic working overtime — it's relentless, and it's exhausting.",                        next: 'B2e' },
      { label: 'Replaying things from the past',     microcopy: "The past has a way of demanding attention even when we're trying to move forward.",               next: 'B2e' },
    ],
  },

  B2e: {
    id: 'B2e',
    text: 'How does anxiety show up in your body or behaviour?',
    subtext: 'The body often signals before the mind does.',
    options: [
      { label: 'Physical — tightness, restlessness, racing heart',  microcopy: "Your body is carrying what your mind is working through.",                          next: 'B3' },
      { label: 'I avoid things I know I should do',                  microcopy: "Avoidance is anxiety's way of offering short-term relief. You're looking for something that lasts.", next: 'B3' },
      { label: "Always tired but can never properly rest",           microcopy: "The exhaustion of a mind that won't switch off — it compounds.",                   next: 'B3' },
    ],
  },

  B3: {
    id: 'B3',
    text: 'How do you cope when anxiety hits?',
    subtext: 'Honest answers help us understand you better.',
    options: [
      { label: 'Distract myself — phone, shows, more work',   microcopy: "Distraction works, until it doesn't. You're looking for something that lasts longer.",  next: 'CTX1' },
      { label: 'Talk to someone I trust',                     microcopy: "That impulse toward connection — it's a good one. Let's give it more room.",              next: 'CTX1' },
      { label: 'Withdraw and wait for it to pass',            microcopy: "Riding it out alone has a cost. You don't have to keep doing it this way.",              next: 'CTX1' },
      { label: 'Nothing really helps',                        microcopy: "When nothing reaches it — that's when you need something different, not more of the same.", next: 'CTX1' },
      { label: "Haven't found a way yet",                     microcopy: "Not having found it yet is different from there being nothing. Let's find it.",          next: 'CTX1' },
      { label: "Don't know — it's just always there",         microcopy: "When anxiety stops feeling like an event and starts feeling like the air — that's exactly what we're here for.", next: 'CTX1' },
    ],
  },

  // ── BRANCH C — LOW MOOD ───────────────────────────────────────────────────

  C1: {
    id: 'C1',
    text: 'What does low feel like for you?',
    subtext: 'There are many kinds of low. Pick the one that fits.',
    options: [
      { label: 'I feel sad, low, or empty',                microcopy: "That emptiness — it's real, even when it's hard to name.",                                   next: 'C2a' },
      { label: 'Life feels grey or flat',                  microcopy: "When the colour goes out of things — that's one of the harder shifts to explain to people who haven't felt it.", next: 'C2b' },
      { label: "More numb than sad — don't feel much",     microcopy: "Numbness is its own kind of weight. Sometimes it's the body protecting itself.",            next: 'C2a' },
      { label: 'Waves — some days much worse',             microcopy: "The unpredictability of waves is its own exhaustion — you never know what you'll wake up to.", next: 'C2b' },
      { label: "Genuinely sad and don't know why",         microcopy: "Sadness without a clear reason is just as real. Sometimes the body knows before the mind does.", next: 'C2a' },
    ],
  },

  C2a: {
    id: 'C2a',
    text: 'Does anything still bring you feeling?',
    subtext: "Even small things count — a song, a moment, anything.",
    options: [
      { label: 'Yes, a few things still do',               microcopy: "Hold onto those. They're threads back to yourself.",                                         next: 'C2d' },
      { label: 'Not really — most things feel flat',       microcopy: "When even the things that used to help go quiet — that's worth paying attention to.",        next: 'C3' },
      { label: 'Used to feel more, but it has faded',      microcopy: "That fading — it's one of the first things people notice and the last thing they think to mention.", next: 'C3' },
    ],
  },

  C2b: {
    id: 'C2b',
    text: 'Waves of sadness, or a constant grey?',
    subtext: 'Both are valid — just different.',
    options: [
      { label: 'Waves — some days much worse',              microcopy: "The unpredictability wears you down on its own.",                                           next: 'C3' },
      { label: 'Constant — a low hum in the background',   microcopy: "Background sadness is easy to normalise. But it deserves attention.",                        next: 'C3' },
    ],
  },

  C2d: {
    id: 'C2d',
    type: 'text',
    text: 'What are those things — and when did they change?',
    subtext: "Write as much or as little as you like. There's no right answer.",
    options: [],
    textNext: 'C3',
    textMicrocopy: "Knowing what still reaches you — those threads are worth holding onto.",
  },

  C3: {
    id: 'C3',
    text: 'Has this affected your sleep, appetite, or energy?',
    subtext: 'Our bodies often carry what our minds are still processing.',
    options: [
      { label: 'Sleep — too much, too little, or broken',     microcopy: "Your body is working through something, even while you're trying to rest.",              next: 'CTX1' },
      { label: 'Appetite — eating more or less than usual',   microcopy: "The body carries what the mind is holding. That shows up in appetite.",                  next: 'CTX1' },
      { label: 'Energy — drained most of the time',           microcopy: "That drain is real. It's not laziness — it's your system running at a deficit.",         next: 'CTX1' },
      { label: "Not sure — hard to tell anymore",             microcopy: "When everything blurs together — that's worth paying attention to.",                      next: 'CTX1' },
      { label: 'All of these',                                microcopy: "All of them — that's your whole system asking for support. You're in the right place.",   next: 'CTX1' },
    ],
  },

  // ── BRANCH D — RELATIONSHIP / SITUATION ──────────────────────────────────

  D1: {
    id: 'D1',
    text: 'What kind of situation are you going through?',
    subtext: 'Pick the one that fits most closely.',
    options: [
      { label: 'A breakup or end of a relationship',     microcopy: "When a relationship ends, it can feel like losing a version of yourself.",                      next: 'D2a' },
      { label: 'A difficult ongoing relationship',       microcopy: "Being in the middle of something that hurts — that's its own particular exhaustion.",          next: 'D2b' },
      { label: 'A falling out or friendship ending',     microcopy: "Friendships ending can hurt in ways that feel less permissible to grieve. They're not.",       next: 'D2c' },
      { label: 'Family conflict or pressure',            microcopy: "Family carries a particular weight because there's no choosing who they are to you.",          next: 'D2e' },
    ],
  },

  D2a: {
    id: 'D2a',
    text: 'How recent is this?',
    subtext: 'Where you are in it shapes what helps most.',
    options: [
      { label: 'Very recent — still raw',                   microcopy: "When it's still fresh — everything is closer to the surface.",                              next: 'D3' },
      { label: 'A few months ago',                          microcopy: "A few months in, some things settle. Others come into sharper focus.",                      next: 'D3' },
      { label: 'A while back but still affects me',         microcopy: "Time doesn't always move at the same pace as healing.",                                     next: 'D3' },
    ],
  },

  D2b: {
    id: 'D2b',
    text: 'What makes this relationship hard?',
    subtext: 'Choose what feels most present.',
    options: [
      { label: 'A lot of conflict and tension',               microcopy: "Constant tension has a way of becoming the background noise of everything.",              next: 'D3' },
      { label: 'I feel unseen or unheard',                    microcopy: "Being with someone who doesn't really see you — that's one of the loneliest places.",    next: 'D2d' },
      { label: 'Not sure whether to stay or go',              microcopy: "That in-between is one of the most draining places to live.",                            next: 'D3' },
      { label: "Drains me but don't know how to change it",   microcopy: "When you can see the drain but can't find the lever — that's exhausting.",              next: 'D3' },
    ],
  },

  D2c: {
    id: 'D2c',
    text: 'What was hardest about the falling out?',
    subtext: 'Take your time with this one.',
    options: [
      { label: "Didn't see it coming — felt blindsided",    microcopy: "The ones that come without warning shake something deeper.",                               next: 'D3' },
      { label: 'A conflict that never got resolved',        microcopy: "Unresolved things have a way of staying with us.",                                         next: 'D3' },
      { label: 'We just drifted and it hurts',              microcopy: "Drifting is quieter than a fight, but can hurt just as much.",                             next: 'D3' },
      { label: 'Let down by someone I really trusted',      microcopy: "Trust broken by someone close — that changes how safe you feel to open up.",              next: 'D3' },
    ],
  },

  D2d: {
    id: 'D2d',
    text: 'What does the loneliness inside the relationship look like?',
    subtext: 'Being specific helps us understand.',
    options: [
      { label: 'Feeling alone even when we are together',    microcopy: "That contrast — being with someone and still feeling alone — is one of the most isolating experiences.", next: 'D3' },
      { label: 'We have grown apart',                        microcopy: "Growing apart while still together — that quiet distance is its own kind of grief.",       next: 'D3' },
      { label: "Don't feel understood or valued",            microcopy: "When the person who's supposed to know you doesn't quite reach you.",                     next: 'D3' },
      { label: 'I carry everything while they seem fine',    microcopy: "The imbalance of who carries what — it's exhausting and easy to start resenting.",        next: 'D3' },
    ],
  },

  D2e: {
    id: 'D2e',
    text: 'Has this been long-standing, or did something escalate recently?',
    subtext: 'Both are valid — just different in how they affect you.',
    options: [
      { label: "Long-standing — always been like this",    microcopy: "When it's always been this way, it can be hard to see it as something that could change.",   next: 'D3' },
      { label: 'Something escalated recently',             microcopy: "A sharp turn in a family dynamic — that destabilises more than just the conflict itself.",   next: 'D3' },
      { label: "Can't share how I really feel",            microcopy: "Not being able to speak your truth in your own family — that's a particular kind of silence.", next: 'D3' },
    ],
  },

  D3: {
    id: 'D3',
    text: 'What do you need most around this right now?',
    subtext: 'This shapes what we recommend.',
    options: [
      { label: 'Someone to listen without judgment',    microcopy: "A space without judgment is rare. You deserve one.",                                           next: 'CTX1' },
      { label: 'Help making sense of what happened',    microcopy: "Sometimes you just need someone to help you find the thread.",                                next: 'CTX1' },
      { label: 'Tools to communicate better',           microcopy: "Communication is something that can grow. That's worth working on.",                          next: 'CTX1' },
      { label: 'Help rebuilding my sense of self',      microcopy: "You're still here. That version of you didn't go anywhere — it just needs room.",            next: 'CTX1' },
    ],
  },

  // ── BRANCH E — BURNOUT ────────────────────────────────────────────────────

  E1: {
    id: 'E1',
    text: 'What kind of exhaustion is this?',
    subtext: 'Pick what fits best, even if it\'s not perfect.',
    options: [
      { label: 'Completely exhausted — in every way',         microcopy: "That depth of exhaustion — it's not about needing more sleep.",                          next: 'E2a' },
      { label: "Body tired but mind won't stop",              microcopy: "A body that needs rest and a mind that won't allow it — that's a particular kind of stuck.", next: 'E2d' },
      { label: 'Lost motivation for things I once cared about', microcopy: "When passion goes quiet — something fundamental has been depleted.",                   next: 'E2b' },
      { label: "No clear reason — brain won't switch off",    microcopy: "When exhaustion has no clear source, it's often because it's coming from everywhere at once.", next: 'E2d' },
    ],
  },

  E2a: {
    id: 'E2a',
    text: 'What is making the most demands right now?',
    subtext: 'Even a rough answer helps.',
    options: [
      { label: 'Work or career responsibilities',               microcopy: "Work that expands until it fills everything — it takes more than just time.",           next: 'E2c' },
      { label: 'Family expectations or caregiving',             microcopy: "Caring for others while running on empty — that's an invisible weight.",               next: 'E3' },
      { label: "My own standards — can't say no to myself",     microcopy: "The internal standard that sets impossible bars — that one is hard to negotiate with.", next: 'E3' },
      { label: 'Multiple things at once — no single source',   microcopy: "When it's everything at once — there's no single thing to fix. That's its own kind of hard.", next: 'E3' },
      { label: 'Doing too much — no space for myself',         microcopy: "No margin left for yourself — that's not sustainable, and some part of you knows it.",  next: 'E3' },
    ],
  },

  E2b: {
    id: 'E2b',
    text: 'When did motivation start fading?',
    subtext: 'Think back — even a rough timeframe helps.',
    options: [
      { label: 'Gradually over months',               microcopy: "The slow fade is easy to miss until you can't remember what it felt like before.",              next: 'E3' },
      { label: 'After a specific event or period',    microcopy: "When you can trace it to a point — that's useful. Something shifted.",                          next: 'E3' },
      { label: "Can't remember being motivated",      microcopy: "When it's been so long, the absence starts to feel like the norm. It doesn't have to be.",      next: 'E3' },
    ],
  },

  E2c: {
    id: 'E2c',
    text: 'Is it a specific drain, or more general?',
    subtext: 'Understanding the source helps us point you somewhere useful.',
    options: [
      { label: 'A specific relationship that drains me',      microcopy: "One relationship that costs more than it gives — that depletes more than people realise.", next: 'E3' },
      { label: 'My role at work or social obligations',       microcopy: "Role exhaustion is real. Performing all day has a cost.",                                next: 'E3' },
      { label: 'People in general exhaust me lately',         microcopy: "When even good interactions feel like too much — your system is asking for quiet.",       next: 'E3' },
    ],
  },

  E2d: {
    id: 'E2d',
    text: "What does the mind not stopping feel like?",
    subtext: 'Pick what fits most closely.',
    options: [
      { label: 'Constant worrying about small things',         microcopy: "Small worries stacking up add weight like anything else.",                              next: 'E3' },
      { label: 'Replaying conversations and situations',       microcopy: "The replay never changes the outcome, but the mind keeps running it.",                  next: 'E3' },
      { label: 'Planning for things that might happen',        microcopy: "Planning as a way to feel safe — when the planning itself becomes the burden.",         next: 'E3' },
      { label: "Tried resting — it doesn't help",              microcopy: "When rest stops working, it's not about the rest — it's about what's underneath.",     next: 'E3' },
    ],
  },

  E3: {
    id: 'E3',
    text: 'What gets in the way of resting or asking for support?',
    subtext: 'Be honest — this shapes what we suggest.',
    options: [
      { label: 'Feel like I am supposed to keep going',    microcopy: "The idea that stopping is failing — it's one of the most exhausting myths we carry.",      next: 'CTX1' },
      { label: 'Guilt about resting — too much to do',     microcopy: "Rest isn't a reward for finishing. It's what makes finishing possible.",                   next: 'CTX1' },
      { label: "Don't know what I need",                   microcopy: "Not knowing what you need is often the first signal that you need something.",             next: 'CTX1' },
    ],
  },

  // ── BRANCH F — GRIEF / LOSS ───────────────────────────────────────────────

  F1: {
    id: 'F1',
    text: 'What kind of loss are you carrying?',
    subtext: 'Loss takes many forms. Pick the one that fits.',
    options: [
      { label: 'The loss of someone I love',                           microcopy: "Grief for someone you love — there's nothing to prepare you for how much space it takes up.",    next: 'F2a' },
      { label: 'A relationship that ended',                            microcopy: "A relationship ending carries its own grief — one that people don't always name that way.",      next: 'F2b' },
      { label: 'A version of my life I thought I would have',          microcopy: "Grieving a life you expected — that loss is real, even if no one can see what you lost.",       next: 'F2c' },
      { label: "A part of myself — don't recognise who I am",         microcopy: "The loss of yourself is one of the quietest griefs.",                                           next: 'F2d' },
      { label: 'A version of myself that felt more certain',           microcopy: "Losing the confidence or clarity you once had — that absence is felt every day.",              next: 'F2d' },
      { label: 'I just feel less like me',                             microcopy: "When something fundamental has shifted — that's worth paying attention to.",                   next: 'F2d' },
    ],
  },

  F2a: {
    id: 'F2a',
    text: 'How recent is this loss?',
    subtext: 'Where you are in grief shapes what helps.',
    options: [
      { label: 'Very recent — still in shock',          microcopy: "The early days are disorienting. There's no right way to be in them.",                        next: 'F3' },
      { label: 'A few months ago',                      microcopy: "A few months in — the first wave has passed, but grief doesn't follow a schedule.",            next: 'F3' },
      { label: 'Some time ago but it comes back',       microcopy: "Grief doesn't end by a certain date. It just changes shape.",                                  next: 'F3' },
    ],
  },

  F2b: {
    id: 'F2b',
    text: 'How recent was the breakup?',
    subtext: 'Where you are in it shapes what feels helpful.',
    options: [
      { label: 'Very recent — still raw',                   microcopy: "When it's still fresh — everything is closer to the surface.",                            next: 'F3' },
      { label: 'A few months ago',                          microcopy: "A few months in, some things settle. Others come into focus.",                             next: 'F3' },
      { label: 'A while back but still affects me',         microcopy: "Time doesn't always move at the same pace as healing.",                                   next: 'F3' },
    ],
  },

  F2c: {
    id: 'F2c',
    text: 'What was that life supposed to look like?',
    subtext: 'Even a rough description helps us understand.',
    options: [
      { label: 'A career path or dream I had',                    microcopy: "Losing a dream — even an imagined future — is a real kind of grief.",               next: 'F3' },
      { label: "A relationship or family I thought I'd have",     microcopy: "Mourning the family or relationship you pictured — that's valid.",                  next: 'F3' },
      { label: 'A place or community I belonged to',              microcopy: "Belonging to a place or a people — and then not — that loss runs deep.",            next: 'F3' },
    ],
  },

  F2d: {
    id: 'F2d',
    text: 'What feels most different about who you are now?',
    subtext: 'Take your time with this one.',
    options: [
      { label: 'My energy and optimism are gone',                 microcopy: "When the lightness goes — it's one of the more invisible losses.",                  next: 'F3' },
      { label: 'My values or direction feel unclear',             microcopy: "When you lose your sense of direction, even familiar things feel uncertain.",       next: 'F3' },
      { label: 'Less trusting or open than I used to be',         microcopy: "Loss can change how safe we feel to open up. That makes complete sense.",          next: 'F3' },
      { label: "Don't fully understand what I am feeling",        microcopy: "Not having words for it doesn't mean it isn't real.",                              next: 'F3' },
    ],
  },

  F3: {
    id: 'F3',
    text: 'Where are you with this loss right now?',
    subtext: 'Even a rough answer helps us understand where you are.',
    options: [
      { label: 'Still in the middle of it — it is raw',          microcopy: "Being right in the middle takes a particular kind of endurance.",                   next: 'CTX1' },
      { label: 'Starting to process it but it is slow',          microcopy: "Slow is still moving. You're doing more than it feels like.",                       next: 'CTX1' },
      { label: 'Carrying it a long time and I am tired',         microcopy: "Carrying something for a long time — you deserve somewhere to set it down.",        next: 'CTX1' },
    ],
  },

  // ── CLOSING — EVERYONE ────────────────────────────────────────────────────

  CTX1: {
    id: 'CTX1',
    text: 'Do you have people around you right now?',
    subtext: 'Be honest — no one is listening but this.',
    options: [
      { label: 'Have support — wanted something different',       microcopy: "There's a difference between having people and having the right space.",              next: 'CTX2' },
      { label: "Have people but don't bring this to them",        microcopy: "Protecting the people around you by carrying it yourself — that's a lonely way to do it.", next: 'CTX2' },
      { label: 'Have one person but limited help',                microcopy: "One person who knows is something. You deserve more than one door.",                 next: 'CTX2' },
      { label: 'Going through this pretty much alone',            microcopy: "You're not doing this alone anymore. Starting here is something.",                   next: 'CTX2' },
    ],
  },

  CTX2: {
    id: 'CTX2',
    text: 'Have you spoken to a professional before about how you feel?',
    subtext: 'No judgment either way.',
    options: [
      { label: 'Thought about it but never taken the step',   microcopy: "Thinking about it is already a step. The next one is smaller than it feels.",           next: 'R1' },
      { label: 'Never',                                        microcopy: "First time considering it — that takes something.",                                     next: 'R1' },
      { label: 'Yes, and it helped',                           microcopy: "You know what real support can feel like. You deserve to find it again.",               next: 'R1' },
      { label: "Yes, but it didn't feel right",                microcopy: "Not every fit is the right fit. That doesn't mean support won't work.",               next: 'R1' },
    ],
  },

  R1: {
    id: 'R1',
    text: 'What would feel most helpful right now?',
    subtext: 'This is how we shape what we recommend.',
    options: [
      { label: 'Want to meet others who understand me',                    microcopy: "Being around people who just get it — without having to explain everything.", next: 'R2' },
      { label: "Talk to someone — not quite ready for real people",        microcopy: "Starting where you are is the only way to start.",                          next: 'R2' },
      { label: 'Ready to speak to a real person',                          microcopy: "That readiness is something. Let's find the right match.",                  next: 'R2' },
      { label: 'Want to read and explore first',                           microcopy: "Taking it at your own pace — that's a valid choice.",                       next: 'R2' },
    ],
  },

  R2: {
    id: 'R2',
    text: 'Is there anything making it harder to reach for support?',
    subtext: "Knowing this helps us find what actually works for you.",
    options: [
      { label: 'No barriers — I am ready',              microcopy: "Then let's get you started.",                                                                 next: 'RESULT' },
      { label: 'Cost',                                   microcopy: "Cost is a real barrier. We'll find what works for where you are.",                           next: 'RESULT' },
      { label: "Not sure it will actually help",         microcopy: "That doubt is honest. The only way to know is to try something small.",                      next: 'RESULT' },
      { label: 'Fear of being judged',                   microcopy: "The fear of judgment keeps so many people from the support they deserve.",                   next: 'RESULT' },
      { label: "Don't have much time",                   microcopy: "Even small amounts of the right support can shift things significantly.",                    next: 'RESULT' },
      { label: "Not sure I deserve support",             microcopy: "You reached this far. That's not the behaviour of someone who doesn't deserve it.",          next: 'RESULT' },
    ],
  },
}
