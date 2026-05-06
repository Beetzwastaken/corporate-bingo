// Server mirror of src/game/data/wordPool.ts.
// Server holds answers + clues so it can redact for active rounds and
// validate guesses without trusting the client.
// Keep contents in sync with src/game/data/wordPool.ts.

export const WORD_POOL = [
  { id: "synergy", answer: "synergy", display: "Synergy", clues: [
    "The reason given when two teams get smashed together and half the people get fired.",
    "A word executives use to make \"we're cutting costs\" sound like a strategy.",
    "\"Yeah, the merger's really about the ___ between the two teams.\"",
    "The vague upside that's supposed to come from combining things. It never actually does."
  ]},
  { id: "leverage", answer: "leverage", display: "Leverage", clues: [
    "A fancier word for \"use,\" invented so consultants could charge more.",
    "What you do with assets, relationships, and people right before something bad happens to them.",
    "\"We just need to ___ what we already have.\"",
    "The corporate word for using something you already have to get something else."
  ]},
  { id: "low-hanging-fruit", answer: "low-hanging fruit", display: "Low-hanging Fruit", clues: [
    "The easy shit nobody wants to do but everyone agrees should get done first.",
    "A farming metaphor used by people who have never touched a piece of fruit in their lives.",
    "\"Let's start with the ___ and build from there.\"",
    "The phrase for the simplest tasks available — the ones you should knock out first."
  ]},
  { id: "boil-the-ocean", answer: "boil the ocean", display: "Boil the Ocean", clues: [
    "What you say when someone proposes doing every fucking thing at once.",
    "A phrase used to describe a goal so big it's obviously not going to happen.",
    "\"Look, we don't need to ___ here. Let's just focus on phase one.\"",
    "The phrase for taking on a task that's way too big to actually finish."
  ]},
  { id: "move-the-needle", answer: "move the needle", display: "Move the Needle", clues: [
    "What every project claims it'll do. What no project has ever measurably done.",
    "A metric-flavored phrase used by people who haven't looked at the metrics.",
    "\"Yeah, this initiative is really gonna ___ for us.\"",
    "The phrase for actually making a difference on a number that matters."
  ]},
  { id: "bandwidth", answer: "bandwidth", display: "Bandwidth", clues: [
    "A way to say \"I'm fucking drowning\" without admitting it.",
    "What your manager asks if you have, right before piling more on you.",
    "\"I'd love to take that on but I really don't have the ___ right now.\"",
    "The corporate word for capacity. As in: you don't have any."
  ]},
  { id: "deep-dive", answer: "deep dive", display: "Deep Dive", clues: [
    "A 90-minute meeting that could have been a paragraph.",
    "What you propose when you don't understand something and don't want to admit it.",
    "\"Let's set up a ___ to really get into this.\"",
    "The phrase for a long, detailed examination of something — usually too detailed."
  ]},
  { id: "circle-back", answer: "circle back", display: "Circle Back", clues: [
    "A promise to deal with something later that everyone knows is a lie.",
    "What you say to shut down a topic in a meeting without admitting you're shutting it down.",
    "\"Great question — let's ___ on that next week.\"",
    "The phrase you use when you have no intention of revisiting something."
  ]},
  { id: "touch-base", answer: "touch base", display: "Touch Base", clues: [
    "A 15-minute meeting that accomplishes nothing.",
    "What your manager wants to do every Tuesday for reasons neither of you understand.",
    "\"Hey, just wanted to ___ real quick.\"",
    "The corporate phrase for a quick conversation to stay in contact."
  ]},
  { id: "take-this-offline", answer: "take this offline", display: "Take This Offline", clues: [
    "Said in a meeting to make absolutely sure something never gets discussed again.",
    "A polite way to bury a question that's making someone look bad in front of the room.",
    "\"Yeah, why don't we ___ and follow up after.\"",
    "What you say when you want to move a conversation out of the meeting."
  ]},
  { id: "run-it-up-the-flagpole", answer: "run it up the flagpole", display: "Run it Up the Flagpole", clues: [
    "What people without authority say when they want to look like they have authority.",
    "The act of asking permission from someone who also has to ask permission.",
    "\"Let me ___ and I'll get back to you.\"",
    "The phrase for floating an idea past leadership to see if they'll approve it."
  ]},
  { id: "herding-cats", answer: "herding cats", display: "Herding Cats", clues: [
    "How project managers describe their job to anyone who'll feel sorry for them.",
    "The metaphor for trying to align eight people who all want different shit.",
    "\"Honestly, getting alignment on this has been like ___.\"",
    "The phrase for managing a group of people who won't go in the same direction."
  ]},
  { id: "north-star", answer: "north star", display: "North Star", clues: [
    "A guiding principle leadership invokes once a year and abandons by Q2.",
    "The thing your company is \"aligned on\" that changes every six months.",
    "\"This is really our ___ for the next fiscal year.\"",
    "The phrase for the long-term goal that's supposed to guide every decision."
  ]},
  { id: "roi", answer: "roi", display: "ROI", clues: [
    "A three-letter acronym used to justify decisions that were already made.",
    "The number you back-calculate after the project ships to make it look intentional.",
    "\"What's the ___ on this initiative?\"",
    "The acronym for return on investment."
  ]},
  { id: "above-my-paygrade", answer: "above my paygrade", display: "Above My Paygrade", clues: [
    "The most honest sentence ever spoken in a corporate meeting.",
    "A polite way to say \"I'm not paid enough to give a shit about this.\"",
    "\"Honestly, that's ___ — you'd have to ask my manager.\"",
    "The phrase for a decision or topic that's not your responsibility."
  ]},
  { id: "culture-fit", answer: "culture fit", display: "Culture Fit", clues: [
    "The reason given for not hiring someone, which legally cannot be the real reason.",
    "A vague hiring criterion that means \"reminds me of myself but younger.\"",
    "\"Strong candidate, but we're not sure about the ___.\"",
    "The phrase for whether a person matches the vibe of the company."
  ]},
  { id: "throw-under-the-bus", answer: "throw under the bus", display: "Throw Under the Bus", clues: [
    "What your peer just did to you in the all-hands.",
    "The act of naming a coworker by name during a postmortem to save your own ass.",
    "\"I don't want to ___ anyone, but the issue was on Sandy's team.\"",
    "The phrase for blaming someone else to protect yourself."
  ]},
  { id: "youre-muted", answer: "you're muted", display: "You're Muted", clues: [
    "The two words that have replaced \"amen\" as the most-spoken phrase in professional life.",
    "What 60 million people heard for the first time in March 2020 and never stopped hearing.",
    "\"Hey, sorry — ___.\"",
    "What people say to you on a video call when your microphone is off."
  ]},
  { id: "hard-stop", answer: "hard stop", display: "Hard Stop", clues: [
    "The only sentence in a meeting anyone is genuinely excited to say.",
    "A boundary that exists because without it you would simply not stop.",
    "\"Just a heads up, I have a ___ at the top of the hour.\"",
    "A firm time you have to leave a meeting, no matter what."
  ]},
  { id: "back-to-back-meetings", answer: "back-to-back meetings", display: "Back-to-Back Meetings", clues: [
    "The reason you ate a granola bar over the sink at 2pm and called it lunch.",
    "A calendar pattern that should be illegal.",
    "\"Sorry I'm late — I've been in ___ all morning.\"",
    "When you have meetings scheduled directly one after another with no gap."
  ]},
  { id: "double-booked", answer: "double booked", display: "Double Booked", clues: [
    "A scheduling failure that's somehow always treated like an accomplishment.",
    "What you call having two meetings at once when you don't want to admit you forgot one.",
    "\"Sorry, can we move it? I'm ___ at 2.\"",
    "When you have two meetings scheduled at the same time."
  ]},
  { id: "best-practice", answer: "best practice", display: "Best Practice", clues: [
    "Whatever someone did once that worked, now elevated to law nobody can question.",
    "A phrase used to shut down new ideas by claiming the old ones are research-backed.",
    "\"It's industry ___, we shouldn't deviate from it.\"",
    "The phrase for the standard, accepted way of doing something."
  ]},
  { id: "game-changer", answer: "game changer", display: "Game Changer", clues: [
    "A description applied to roughly 80% of all corporate initiatives, none of which change anything.",
    "What every product launch claims to be. What no product launch has actually been.",
    "\"This is gonna be a real ___ for the team.\"",
    "The phrase for something that will supposedly transform how everything works."
  ]},
  { id: "win-win", answer: "win-win", display: "Win-win", clues: [
    "A deal where one person definitely won, and the other person was told they did.",
    "A phrase used to make sure nobody asks who actually came out ahead.",
    "\"Honestly, this is a ___ for everyone.\"",
    "The phrase for a situation where both sides are supposed to benefit."
  ]},
  { id: "on-my-radar", answer: "on my radar", display: "On My Radar", clues: [
    "What you say about something you've been ignoring but want credit for noticing.",
    "A way to acknowledge a problem without committing to do anything about it.",
    "\"Yeah, that's been ___ for a while.\"",
    "The phrase for something you're aware of but haven't acted on."
  ]},
  { id: "sync-up", answer: "sync up", display: "Sync Up", clues: [
    "A 30-minute meeting where two people repeat what's already in the email thread.",
    "What your manager schedules to avoid actually answering your question over Slack.",
    "\"Let's ___ on this Thursday.\"",
    "The phrase for getting two people aligned on a topic in a quick meeting."
  ]},
  { id: "drill-down", answer: "drill down", display: "Drill Down", clues: [
    "What people say when they want to look thorough but don't actually understand the data.",
    "A phrase that turns a five-minute question into an hour-long meeting.",
    "\"Let's ___ on the Q3 numbers.\"",
    "The phrase for examining something in greater detail."
  ]},
  { id: "like-a-family", answer: "like a family", display: "Like a Family", clues: [
    "How a company describes itself right before laying off 15% of the family.",
    "A phrase used by leadership to justify boundary violations as closeness.",
    "\"We're really ___ here. Everyone looks out for each other.\"",
    "How a workplace describes itself when it wants you to feel personally invested."
  ]},
  { id: "level-set", answer: "level set", display: "Level Set", clues: [
    "What you say when you realize the meeting is going badly and you need to restart.",
    "A phrase used to politely inform everyone they've been wrong for the last 20 minutes.",
    "\"Let me just ___ real quick on where we are.\"",
    "The phrase for getting everyone on the same page before continuing."
  ]},
  { id: "data-driven", answer: "data-driven", display: "Data-driven", clues: [
    "A claim made by people who picked the chart that supported what they already wanted to do.",
    "A word used to make a gut decision sound like a research methodology.",
    "\"We need to be more ___ in how we approach this.\"",
    "The phrase for making decisions based on actual numbers rather than instinct."
  ]},
  { id: "agile", answer: "agile", display: "Agile", clues: [
    "A methodology that means \"we're making it up as we go\" but with daily standups.",
    "A framework everyone claims to follow and nobody actually understands.",
    "\"We're running an ___ process on this one.\"",
    "A software development approach that prioritizes flexibility and short iterations."
  ]},
  { id: "self-starter", answer: "self-starter", display: "Self-starter", clues: [
    "A job-description word meaning \"we will not manage you, train you, or give you direction.\"",
    "What a posting calls you when the role has no onboarding plan.",
    "\"We're really looking for a ___ — someone who can just figure it out.\"",
    "The phrase for a person who works independently without needing supervision."
  ]},
  { id: "team-player", answer: "team player", display: "Team Player", clues: [
    "A phrase that means \"you will be expected to do work outside your job description without complaining.\"",
    "How a manager describes the kind of person who never says no to extra work.",
    "\"We need someone who's a real ___.\"",
    "The phrase for someone who works well with others and contributes to group goals."
  ]},
  { id: "parking-lot", answer: "parking lot", display: "Parking Lot", clues: [
    "A list of topics that get added to it during meetings and are never reviewed again.",
    "Where ideas go to die a slow administrative death.",
    "\"Let's add that to the ___ and come back to it.\"",
    "A list of topics deferred from a meeting to be discussed at a later time, theoretically."
  ]},
  { id: "action-items", answer: "action items", display: "Action Items", clues: [
    "A list of things compiled at the end of every meeting that almost nobody opens again.",
    "The artifact that proves something happened in a meeting, even when nothing did.",
    "\"Let me just capture the ___ from this discussion.\"",
    "The list of tasks assigned at the end of a meeting."
  ]},
  { id: "next-steps", answer: "next steps", display: "Next Steps", clues: [
    "The phrase used to end a meeting without anyone having actually decided anything.",
    "Two words that imply forward motion regardless of whether any will occur.",
    "\"Okay, what are our ___ on this?\"",
    "The phrase for what people are supposed to do after a meeting ends."
  ]},
  { id: "cadence", answer: "cadence", display: "Cadence", clues: [
    "A scheduling pattern that exists because someone added a recurring meeting and nobody removed it.",
    "A musical word adopted to dignify the act of meeting too often.",
    "\"Let's set up a weekly ___ on this.\"",
    "The rhythm or frequency at which something recurs, usually a meeting."
  ]},
  { id: "loop-in", answer: "loop in", display: "Loop In", clues: [
    "The act of CCing someone so you can blame them later for not speaking up.",
    "A way to share responsibility by adding people to an email they didn't want.",
    "\"Make sure you ___ Sandy on this thread.\"",
    "The phrase for adding someone to a conversation or thread."
  ]},
  { id: "brain-dump", answer: "brain dump", display: "Brain Dump", clues: [
    "When someone hands you their unorganized thoughts and expects you to do the synthesis.",
    "What a manager calls it when they haven't prepared for a meeting.",
    "\"Let me just ___ here for a second.\"",
    "The phrase for emptying every thought on a topic, usually unstructured."
  ]},
  { id: "mission-critical", answer: "mission critical", display: "Mission Critical", clues: [
    "A label applied to whatever someone wants you to drop your other work for.",
    "How a project gets fast-tracked by claiming nothing else matters.",
    "\"This is ___, we need to move on it now.\"",
    "The phrase for something considered absolutely essential to the organization."
  ]},
  { id: "game-plan", answer: "game plan", display: "Game Plan", clues: [
    "A plan that exists for the duration of the meeting it was discussed in.",
    "A sports metaphor used by people who have not played sports in 20 years.",
    "\"What's the ___ for the rollout?\"",
    "The phrase for the strategy used to accomplish something."
  ]},
  { id: "roadmap", answer: "roadmap", display: "Roadmap", clues: [
    "A document showing where the company will be in 18 months, written by people who won't be there.",
    "A plan that's revised every quarter and never actually followed.",
    "\"Let me show you the ___ for the next six months.\"",
    "A document outlining a long-term plan with milestones."
  ]},
  { id: "big-picture", answer: "big picture", display: "Big Picture", clues: [
    "What leadership tells you to focus on right after they've made it your problem.",
    "A perspective invoked by people who don't want to talk about the actual details.",
    "\"Let's not get into the weeds — focus on the ___.\"",
    "The phrase for the overall view of something, ignoring specifics."
  ]},
  { id: "all-hands", answer: "all hands", display: "All Hands", clues: [
    "A meeting where leadership performs and you sit there pretending to listen.",
    "A monthly ritual designed to make you feel informed without actually informing you.",
    "\"There's an ___ on Friday at 4.\"",
    "A company-wide meeting where everyone is expected to attend."
  ]},
  { id: "fast-paced-environment", answer: "fast-paced environment", display: "Fast-paced Environment", clues: [
    "A job-listing phrase meaning \"we are dysfunctional and you will have no time to learn.\"",
    "How a posting describes a workplace that has no processes and won't build any.",
    "\"You'll thrive here if you like a ___.\"",
    "A workplace description meaning the work moves quickly and changes often."
  ]},
  { id: "hit-the-ground-running", answer: "hit the ground running", display: "Hit the Ground Running", clues: [
    "A phrase meaning \"we have no onboarding plan and you'll be drowning by week two.\"",
    "What postings say when they need someone to do the job before they understand the job.",
    "\"We need someone who can ___ on day one.\"",
    "The phrase for being immediately productive in a new role."
  ]},
  { id: "open-door-policy", answer: "open door policy", display: "Open Door Policy", clues: [
    "A claim of accessibility from people who are never actually in their offices.",
    "A leadership policy that exists in theory and is punished in practice.",
    "\"I have an ___, come find me anytime.\"",
    "The claim that leadership is always available to talk to employees."
  ]},
  { id: "bottom-line", answer: "bottom line", display: "Bottom Line", clues: [
    "The phrase used to admit that everything you said for the last 20 minutes didn't matter.",
    "Two words that signal you're about to actually say what you meant.",
    "\"___ — we're not gonna hit the deadline.\"",
    "The phrase for the most important point or final result of a discussion."
  ]},
  { id: "ramp-up", answer: "ramp up", display: "Ramp Up", clues: [
    "What hiring is called when a manager wants three new people they won't be allowed to hire.",
    "A phrase used to describe scaling that almost never actually happens on schedule.",
    "\"We're trying to ___ the team before Q3.\"",
    "The phrase for increasing capacity, usually by hiring more people."
  ]},
  { id: "reach-out", answer: "reach out", display: "Reach Out", clues: [
    "Three syllables of emotional padding around the act of sending an email.",
    "A phrase that makes a basic message sound like a personal favor.",
    "\"I'll ___ to him and see what he thinks.\"",
    "The phrase for contacting someone, usually for work purposes."
  ]},
  { id: "ping-me", answer: "ping me", display: "Ping Me", clues: [
    "A way to make a Slack message sound urgent so you don't have to write a full one.",
    "An async-era verb that pretends to respect your time while interrupting it constantly.",
    "\"___ when you're free.\"",
    "The phrase for sending someone a brief message to get their attention."
  ]},
  { id: "it-is-what-it-is", answer: "it is what it is", display: "It Is What It Is", clues: [
    "A phrase you say when you've given up but want to sound philosophical about it.",
    "Five words used to end a conversation about a problem nobody plans to fix.",
    "\"He just shrugged. Said, '___.'\"",
    "The phrase used to accept a bad situation that won't change."
  ]},
  { id: "agree-to-disagree", answer: "agree to disagree", display: "Agree to Disagree", clues: [
    "A phrase that means \"I am right, you are wrong, but I would like this conversation to end.\"",
    "How adults end an argument while pretending neither side lost.",
    "\"I think we'll just have to ___ on that one.\"",
    "The phrase for ending a disagreement without either side changing their position."
  ]},
  { id: "push-the-envelope", answer: "push the envelope", display: "Push the Envelope", clues: [
    "A claim of innovation usually applied to a minor tweak nobody asked for.",
    "A phrase used to make incremental change sound like rebellion.",
    "\"This is really gonna ___ for our category.\"",
    "The phrase for going beyond what's normally done or expected."
  ]},
  { id: "stakeholder-buy-in", answer: "stakeholder buy-in", display: "Stakeholder Buy-in", clues: [
    "Permission theater designed to ensure nobody can complain later.",
    "A process where you ask everyone's opinion knowing you've already decided.",
    "\"We need to make sure we have ___ before we move forward.\"",
    "The phrase for getting all relevant parties to agree to a plan."
  ]},
  { id: "cross-functional", answer: "cross-functional", display: "Cross-functional", clues: [
    "An adjective meaning \"no one person owns this and we'll fight about it for months.\"",
    "A way to describe a project that has a steering committee instead of a leader.",
    "\"This is a ___ initiative, we'll need reps from each team.\"",
    "An effort involving people from multiple departments or disciplines."
  ]},
  { id: "lessons-learned", answer: "lessons learned", display: "Lessons Learned", clues: [
    "A document compiled after every disaster, then ignored before the next disaster.",
    "Two words that pretend an organization is capable of memory.",
    "\"Let's document the ___ from this rollout.\"",
    "The phrase for what an organization is supposed to take away from a past experience."
  ]},
  { id: "pulse-check", answer: "pulse check", display: "Pulse Check", clues: [
    "A meeting ritual where leadership pretends to ask, while not really wanting to know.",
    "A medical metaphor for asking a team if they're okay, expecting them to say yes.",
    "\"Let's do a quick ___ on where everyone's at.\"",
    "A brief check-in to gauge how a project or team is doing."
  ]},
  { id: "quick-win", answer: "quick win", display: "Quick Win", clues: [
    "A small task chosen for visibility, not value, so leadership can claim momentum.",
    "What you ship when the actual project is too hard but a slide is due Friday.",
    "\"Let's find a ___ to show progress this quarter.\"",
    "A small, easy-to-complete task that demonstrates progress."
  ]},
  { id: "optics", answer: "optics", display: "Optics", clues: [
    "A word used when leadership cares more about how something looks than what it is.",
    "The actual reason most decisions get made, regardless of what's stated.",
    "\"It's not about the substance, it's about the ___.\"",
    "The phrase for how a decision or action will be perceived."
  ]},
  { id: "ill-drop-it-in-the-chat", answer: "i'll drop it in the chat", display: "I'll Drop It in the Chat", clues: [
    "A phrase used to end a topic by promising a link nobody will read.",
    "How you stop a conversation while looking like you're contributing to it.",
    "\"Don't worry about taking notes — ___.\"",
    "The promise to share something later in a meeting's chat window."
  ]},
  { id: "double-down", answer: "double down", display: "Double Down", clues: [
    "What leadership does when a strategy is failing — commit to it harder.",
    "A poker metaphor used to dignify refusing to admit you were wrong.",
    "\"We're gonna ___ on this approach.\"",
    "The phrase for committing more strongly to a current strategy."
  ]},
  { id: "friendly-reminder", answer: "friendly reminder", display: "Friendly Reminder", clues: [
    "The two-word preamble to passive-aggression in every corporate inbox.",
    "A phrase that means \"you forgot, I noticed, and I'm putting it in writing.\"",
    "\"Just a ___ that the deck is due tomorrow.\"",
    "A polite, often passive-aggressive prompt about something overdue."
  ]},
  { id: "lets-not-reinvent-the-wheel", answer: "let's not reinvent the wheel", display: "Let's Not Reinvent the Wheel", clues: [
    "A phrase used to shut down new ideas by pretending the old ones still work.",
    "What people say when they don't want to do new work and need an excuse.",
    "\"___ — let's just use what we already have.\"",
    "The phrase for not redoing work that's already been done."
  ]},
  { id: "one-hundred-percent", answer: "one hundred percent", display: "One Hundred Percent", clues: [
    "A way to say \"yes\" with manufactured enthusiasm so nobody questions whether you mean it.",
    "The verbal tic that has replaced \"I agree\" without adding any actual agreement.",
    "\"Yeah, ___, totally on board.\"",
    "The phrase used to express full agreement, often automatically."
  ]},
  { id: "not-to-beat-a-dead-horse", answer: "not to beat a dead horse", display: "Not to Beat a Dead Horse", clues: [
    "A phrase said immediately before beating a dead horse for the third time.",
    "The preamble that tells everyone you're about to repeat the point you already made.",
    "\"___, but I really think we need to revisit the timeline.\"",
    "The phrase used before bringing up something that's already been discussed."
  ]},
  { id: "let-me-push-back-a-little", answer: "let me push back a little", display: "Let Me Push Back a Little", clues: [
    "The polite preamble to telling someone they're wrong.",
    "A phrase used to disagree while pretending you're not really disagreeing.",
    "\"___ — I'm not sure that's the right approach.\"",
    "The phrase used before raising an objection or counterpoint."
  ]},
  { id: "surface-this", answer: "surface this", display: "Surface This", clues: [
    "An escalation verb that turns \"complaint\" into \"feedback.\"",
    "A way to raise an issue with leadership while pretending you're just being helpful.",
    "\"I think we need to ___ to the leadership team.\"",
    "The phrase for raising an issue or concern to higher levels."
  ]},
  { id: "temperature-check", answer: "temperature check", display: "Temperature Check", clues: [
    "A phrase used to ask the room if they're upset without using the word \"upset.\"",
    "A meeting ritual where you measure dissent before committing to a position.",
    "\"Let's do a quick ___ on this proposal.\"",
    "A brief poll of a group's feelings or opinions on something."
  ]},
  { id: "boots-on-the-ground", answer: "boots on the ground", display: "Boots on the Ground", clues: [
    "A military metaphor for the people who actually have to do the work.",
    "A phrase used by leadership to refer to whoever is below them.",
    "\"We need more ___ if we're gonna hit the deadline.\"",
    "The phrase for the people doing the actual on-site or hands-on work."
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
