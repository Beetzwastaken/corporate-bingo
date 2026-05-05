// Server mirror of src/game/data/wordPool.ts.
// Server holds answers + clues so it can redact for active rounds and
// validate guesses without trusting the client.
// Keep contents in sync with src/game/data/wordPool.ts.

export const WORD_POOL = [
  { id: "synergy", answer: "synergy", display: "Synergy", clues: [
    "A word leadership uses to describe combining two failing departments and hoping they fail less together.",
    "What you call it when the reorg makes everything worse but the slide deck looks great.",
    "The official term for \"1 + 1 = whatever the McKinsey deck says it equals.\"",
    "Three syllables. Starts with S. Means nothing. Said constantly."
  ]},
  { id: "leverage", answer: "leverage", display: "Leverage", clues: [
    "A verb invented to make \"use\" sound like it deserves a six-figure salary.",
    "What consultants do to \"existing assets\" right before they recommend layoffs.",
    "Originally a physics term. Now a way to say \"use\" while charging $400/hour.",
    "Eight letters. Verb. Means \"use\" but with extra steps and a Patagonia vest."
  ]},
  { id: "low-hanging-fruit", answer: "low-hanging fruit", display: "Low-hanging Fruit", clues: [
    "The work nobody wants to do but everyone agrees should be \"tackled first.\"",
    "An agricultural metaphor used by people who have never picked anything in their lives.",
    "What you call easy wins, right before discovering they're neither easy nor wins.",
    "Three words. The first describes elevation. The last is something you eat."
  ]},
  { id: "boil-the-ocean", answer: "boil the ocean", display: "Boil the Ocean", clues: [
    "A phrase used to describe ambition, right before someone explains why it's impossible.",
    "What leadership asks for in Q1 and quietly abandons by Q2.",
    "The corporate version of \"what if we just did everything, all at once, perfectly.\"",
    "Three words. Involves a large body of water and a temperature change."
  ]},
  { id: "move-the-needle", answer: "move the needle", display: "Move the Needle", clues: [
    "A metric-flavored phrase used by people who have not looked at the metrics.",
    "What every initiative claims to do, and what no initiative has ever measurably done.",
    "The thing your project must do, on a gauge nobody has actually defined.",
    "Three words. Refers to a small piece of metal on an instrument you've never touched."
  ]},
  { id: "bandwidth", answer: "bandwidth", display: "Bandwidth", clues: [
    "A finite resource you ran out of in 2019 and have been faking ever since.",
    "The polite word for \"I cannot absorb one more thing without something inside me breaking.\"",
    "Originally a networking term. Now a way to refuse work without admitting you're drowning.",
    "Nine letters. One word. What you don't have, which is why you keep saying you don't have it."
  ]},
  { id: "deep-dive", answer: "deep dive", display: "Deep Dive", clues: [
    "A 90-minute meeting that could have been a paragraph.",
    "What you propose when you don't understand something and don't want to admit it.",
    "The act of looking at a slide for an hour without learning anything new.",
    "Two words. Aquatic verb plus a depth descriptor. Means a long meeting."
  ]},
  { id: "circle-back", answer: "circle back", display: "Circle Back", clues: [
    "A promise that decays at the speed of the next calendar invite.",
    "The corporate equivalent of \"I'll text you\" after a bad date.",
    "What you said you'd do about that thing in March. It is now October.",
    "Two words. A geometric shape, then a direction. Means \"I will not be doing that.\""
  ]},
  { id: "touch-base", answer: "touch base", display: "Touch Base", clues: [
    "A baseball metaphor for a 15-minute meeting that accomplishes nothing.",
    "What your manager wants to do every Tuesday for reasons neither of you understand.",
    "The phrase that fills your calendar with conversations you've already had.",
    "Two words. The first is a verb of contact. The second is part of a baseball diamond."
  ]},
  { id: "take-this-offline", answer: "take this offline", display: "Take This Offline", clues: [
    "Said in a meeting to ensure a thing will never be discussed again.",
    "A graceful way to bury a question your boss doesn't want answered in front of others.",
    "The phrase used right before nothing happens for the rest of time.",
    "Three words. Begins with \"take.\" Means \"let's pretend we'll discuss this later, but won't.\""
  ]},
  { id: "run-it-up-the-flagpole", answer: "run it up the flagpole", display: "Run it Up the Flagpole", clues: [
    "A phrase used by people who don't have authority to make a decision but enjoy delaying yours.",
    "The act of asking permission from someone who will also need to ask permission.",
    "What you do with an idea right before it dies in a VP's inbox.",
    "Five words. Involves a verb of motion and a pole used for displaying fabric."
  ]},
  { id: "herding-cats", answer: "herding cats", display: "Herding Cats", clues: [
    "How project managers describe their job to anyone who will pity them.",
    "The metaphor for trying to align eight stakeholders with seven competing priorities.",
    "What you say at happy hour when someone asks how the new initiative is going.",
    "Two words. A verb done to livestock, applied to a small domestic animal."
  ]},
  { id: "north-star", answer: "north star", display: "North Star", clues: [
    "A guiding principle leadership invokes annually and abandons quarterly.",
    "The thing your company is \"aligned on,\" which changes every six months without explanation.",
    "A celestial metaphor for whatever priority is on this week's executive slide.",
    "Two words. A direction plus a celestial object. Means \"the goal we'll change soon.\""
  ]},
  { id: "roi", answer: "roi", display: "ROI", clues: [
    "A three-letter acronym used to justify decisions that have already been made.",
    "The number you back-calculate after the project ships to make it look intentional.",
    "What every PowerPoint claims, what no spreadsheet confirms.",
    "Three letters. Stands for Return On Investment. Pronounced like a fish or a king's name."
  ]},
  { id: "above-my-paygrade", answer: "above my paygrade", display: "Above My Paygrade", clues: [
    "The most honest sentence ever spoken in a corporate meeting.",
    "A polite way to say \"I am not paid enough to care about this and you know it.\"",
    "What you say when someone asks your opinion and you'd like to keep your job.",
    "Three words. Begins with a preposition of elevation. Refers to compensation."
  ]},
  { id: "culture-fit", answer: "culture fit", display: "Culture Fit", clues: [
    "The reason given for not hiring someone, which legally cannot be the real reason.",
    "A vague hiring criterion that means \"reminds me of myself but younger.\"",
    "What HR says when the team didn't want to explain why they passed.",
    "Two words. Refers to organizational vibes and clothing dimensions."
  ]},
  { id: "throw-under-the-bus", answer: "throw under the bus", display: "Throw Under the Bus", clues: [
    "A vehicular metaphor for what your peer just did to you in the all-hands.",
    "The act of naming a coworker by name during a postmortem to save yourself.",
    "What happens to whoever isn't in the room when leadership asks \"who owns this?\"",
    "Four words. Verb of propulsion, then a preposition, then a large public vehicle."
  ]},
  { id: "youre-muted", answer: "you're muted", display: "You're Muted", clues: [
    "The two words that have replaced \"amen\" as the most-spoken phrase in American professional life.",
    "What 60 million people heard for the first time in March 2020 and never stopped hearing.",
    "The phrase that confirms you've been talking to yourself for the last 90 seconds.",
    "Two words. A contraction, then a verb describing your microphone status."
  ]},
  { id: "hard-stop", answer: "hard stop", display: "Hard Stop", clues: [
    "The only sentence in the meeting that anyone is genuinely excited to say.",
    "A boundary that exists because without it you would simply not stop.",
    "The phrase that saves you from continued existence in this Zoom.",
    "Two words. An adjective of difficulty plus a verb of cessation."
  ]},
  { id: "back-to-back-meetings", answer: "back-to-back meetings", display: "Back-to-Back Meetings", clues: [
    "The reason you ate a granola bar over the sink at 2pm and called it lunch.",
    "A calendar pattern that would be illegal under the Geneva Convention.",
    "What you have on Tuesdays, Wednesdays, Thursdays, and increasingly, Mondays and Fridays.",
    "Three words separated by two hyphens, plus the noun for what fills your calendar."
  ]}
];

export function getWord(id) {
  return WORD_POOL.find(w => w.id === id);
}

// Pick a random word excluding `excludeIds`. If all excluded, fall back to full pool.
export function pickWord(excludeIds = []) {
  const exclude = new Set(excludeIds);
  const pool = WORD_POOL.filter(w => !exclude.has(w.id));
  const candidates = pool.length > 0 ? pool : WORD_POOL;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export const POINTS_BY_GUESS = [10, 5, 3, 1]; // index 0 = 1st guess

export function pointsForGuess(guessNumber) {
  return POINTS_BY_GUESS[guessNumber - 1] ?? 0;
}
