// Jargon word pool. 20 buzzwords × 4 clues each (cryptic → giveaway).
// `answer` is the canonical pre-normalized form; matched via normalizeGuess().

export interface Word {
  id: string;
  answer: string;
  display: string;
  clues: [string, string, string, string];
}

export const WORD_POOL: Word[] = [
  {
    id: "synergy",
    answer: "synergy",
    display: "Synergy",
    clues: [
      "The reason given when two teams get smashed together and half the people get fired.",
      "A word executives use to make \"we're cutting costs\" sound like a strategy.",
      "\"Yeah, the merger's really about the ___ between the two teams.\"",
      "The vague upside that's supposed to come from combining things. It never actually does."
    ]
  },
  {
    id: "leverage",
    answer: "leverage",
    display: "Leverage",
    clues: [
      "A fancier word for \"use,\" invented so consultants could charge more.",
      "What you do with assets, relationships, and people right before something bad happens to them.",
      "\"We just need to ___ what we already have.\"",
      "The corporate word for using something you already have to get something else."
    ]
  },
  {
    id: "low-hanging-fruit",
    answer: "low-hanging fruit",
    display: "Low-hanging Fruit",
    clues: [
      "The easy shit nobody wants to do but everyone agrees should get done first.",
      "A farming metaphor used by people who have never touched a piece of fruit in their lives.",
      "\"Let's start with the ___ and build from there.\"",
      "The phrase for the simplest tasks available — the ones you should knock out first."
    ]
  },
  {
    id: "boil-the-ocean",
    answer: "boil the ocean",
    display: "Boil the Ocean",
    clues: [
      "What you say when someone proposes doing every fucking thing at once.",
      "A phrase used to describe a goal so big it's obviously not going to happen.",
      "\"Look, we don't need to ___ here. Let's just focus on phase one.\"",
      "The phrase for taking on a task that's way too big to actually finish."
    ]
  },
  {
    id: "move-the-needle",
    answer: "move the needle",
    display: "Move the Needle",
    clues: [
      "What every project claims it'll do. What no project has ever measurably done.",
      "A metric-flavored phrase used by people who haven't looked at the metrics.",
      "\"Yeah, this initiative is really gonna ___ for us.\"",
      "The phrase for actually making a difference on a number that matters."
    ]
  },
  {
    id: "bandwidth",
    answer: "bandwidth",
    display: "Bandwidth",
    clues: [
      "A way to say \"I'm fucking drowning\" without admitting it.",
      "What your manager asks if you have, right before piling more on you.",
      "\"I'd love to take that on but I really don't have the ___ right now.\"",
      "The corporate word for capacity. As in: you don't have any."
    ]
  },
  {
    id: "deep-dive",
    answer: "deep dive",
    display: "Deep Dive",
    clues: [
      "A 90-minute meeting that could have been a paragraph.",
      "What you propose when you don't understand something and don't want to admit it.",
      "\"Let's set up a ___ to really get into this.\"",
      "The phrase for a long, detailed examination of something — usually too detailed."
    ]
  },
  {
    id: "circle-back",
    answer: "circle back",
    display: "Circle Back",
    clues: [
      "A promise to deal with something later that everyone knows is a lie.",
      "What you say to shut down a topic in a meeting without admitting you're shutting it down.",
      "\"Great question — let's ___ on that next week.\"",
      "The phrase you use when you have no intention of revisiting something."
    ]
  },
  {
    id: "touch-base",
    answer: "touch base",
    display: "Touch Base",
    clues: [
      "A 15-minute meeting that accomplishes nothing.",
      "What your manager wants to do every Tuesday for reasons neither of you understand.",
      "\"Hey, just wanted to ___ real quick.\"",
      "The corporate phrase for a quick conversation to stay in contact."
    ]
  },
  {
    id: "take-this-offline",
    answer: "take this offline",
    display: "Take This Offline",
    clues: [
      "Said in a meeting to make absolutely sure something never gets discussed again.",
      "A polite way to bury a question that's making someone look bad in front of the room.",
      "\"Yeah, why don't we ___ and follow up after.\"",
      "What you say when you want to move a conversation out of the meeting."
    ]
  },
  {
    id: "run-it-up-the-flagpole",
    answer: "run it up the flagpole",
    display: "Run it Up the Flagpole",
    clues: [
      "What people without authority say when they want to look like they have authority.",
      "The act of asking permission from someone who also has to ask permission.",
      "\"Let me ___ and I'll get back to you.\"",
      "The phrase for floating an idea past leadership to see if they'll approve it."
    ]
  },
  {
    id: "herding-cats",
    answer: "herding cats",
    display: "Herding Cats",
    clues: [
      "How project managers describe their job to anyone who'll feel sorry for them.",
      "The metaphor for trying to align eight people who all want different shit.",
      "\"Honestly, getting alignment on this has been like ___.\"",
      "The phrase for managing a group of people who won't go in the same direction."
    ]
  },
  {
    id: "north-star",
    answer: "north star",
    display: "North Star",
    clues: [
      "A guiding principle leadership invokes once a year and abandons by Q2.",
      "The thing your company is \"aligned on\" that changes every six months.",
      "\"This is really our ___ for the next fiscal year.\"",
      "The phrase for the long-term goal that's supposed to guide every decision."
    ]
  },
  {
    id: "roi",
    answer: "roi",
    display: "ROI",
    clues: [
      "A three-letter acronym used to justify decisions that were already made.",
      "The number you back-calculate after the project ships to make it look intentional.",
      "\"What's the ___ on this initiative?\"",
      "The acronym for return on investment."
    ]
  },
  {
    id: "above-my-paygrade",
    answer: "above my paygrade",
    display: "Above My Paygrade",
    clues: [
      "The most honest sentence ever spoken in a corporate meeting.",
      "A polite way to say \"I'm not paid enough to give a shit about this.\"",
      "\"Honestly, that's ___ — you'd have to ask my manager.\"",
      "The phrase for a decision or topic that's not your responsibility."
    ]
  },
  {
    id: "culture-fit",
    answer: "culture fit",
    display: "Culture Fit",
    clues: [
      "The reason given for not hiring someone, which legally cannot be the real reason.",
      "A vague hiring criterion that means \"reminds me of myself but younger.\"",
      "\"Strong candidate, but we're not sure about the ___.\"",
      "The phrase for whether a person matches the vibe of the company."
    ]
  },
  {
    id: "throw-under-the-bus",
    answer: "throw under the bus",
    display: "Throw Under the Bus",
    clues: [
      "What your peer just did to you in the all-hands.",
      "The act of naming a coworker by name during a postmortem to save your own ass.",
      "\"I don't want to ___ anyone, but the issue was on Sandy's team.\"",
      "The phrase for blaming someone else to protect yourself."
    ]
  },
  {
    id: "youre-muted",
    answer: "you're muted",
    display: "You're Muted",
    clues: [
      "The two words that have replaced \"amen\" as the most-spoken phrase in professional life.",
      "What 60 million people heard for the first time in March 2020 and never stopped hearing.",
      "\"Hey, sorry — ___.\"",
      "What people say to you on a video call when your microphone is off."
    ]
  },
  {
    id: "hard-stop",
    answer: "hard stop",
    display: "Hard Stop",
    clues: [
      "The only sentence in a meeting anyone is genuinely excited to say.",
      "A boundary that exists because without it you would simply not stop.",
      "\"Just a heads up, I have a ___ at the top of the hour.\"",
      "A firm time you have to leave a meeting, no matter what."
    ]
  },
  {
    id: "back-to-back-meetings",
    answer: "back-to-back meetings",
    display: "Back-to-Back Meetings",
    clues: [
      "The reason you ate a granola bar over the sink at 2pm and called it lunch.",
      "A calendar pattern that should be illegal.",
      "\"Sorry I'm late — I've been in ___ all morning.\"",
      "When you have meetings scheduled directly one after another with no gap."
    ]
  }
];
