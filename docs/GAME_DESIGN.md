# Game Design Document

Complete game design specification for Corporate Buzzword Bingo multiplayer experience.

## Game Overview

**Corporate Buzzword Bingo** is a real-time multiplayer party game designed to make corporate meetings more entertaining. Players compete to complete bingo cards filled with common corporate buzzwords and phrases while participating in actual business meetings.

### Core Concept
Transform the tedium of corporate meetings into an engaging social game where players listen for ridiculous business jargon and compete in real-time verification challenges.

## Target Audience

### Primary Players
- **Corporate employees** in meeting-heavy environments
- **Remote workers** on video calls
- **Teams** looking for meeting engagement tools
- **Consultants and contractors** attending client meetings

### Demographics
- Age: 25-50 years old
- Work environment: Corporate, startup, consulting
- Tech comfort: Moderate to high (comfortable with web apps)
- Meeting frequency: Daily to weekly

### Player Motivations
- **Entertainment**: Make boring meetings fun
- **Social bonding**: Shared experience with teammates  
- **Stress relief**: Humor during difficult meetings
- **Competition**: Friendly rivalry and achievement

## Game Mechanics

### Core Gameplay Loop
```
1. Join/Create Room → 2. Get Unique Board → 3. Listen for Buzzwords → 
4. Claim Squares → 5. Vote on Claims → 6. Complete Bingo → 7. New Round
```

### Room System
- **6-character room codes** for easy sharing
- **Host-based creation** with invitation system
- **Drop-in/drop-out** gameplay (players can join mid-game)
- **10 player maximum** per room for optimal social dynamics

### Board Generation
- **5x5 grid** with center FREE SPACE
- **24 unique buzzwords** per player from 369+ term library
- **Fisher-Yates shuffle** ensures true randomization
- **No duplicate boards** - every player gets different terms

### Verification System
The core innovation that prevents cheating and creates social interaction:

#### Democratic Voting
- **Claim triggers vote**: When player marks square, others vote
- **Majority rule**: 50%+ approval needed to confirm
- **"Who said it?" question**: Voters identify the speaker
- **Real-time resolution**: Votes tallied immediately

#### Anti-Cheat Protection  
- **Self-claim detection**: Can't mark words you said yourself
- **Claim rejection**: Self-claims are rejected without penalty
- **Speaker attribution**: Voters identify who actually said the word
- **Timeout system**: 30-second limit on verification votes

### Scoring System
- **+10 points** per verified square
- **0 points** for FREE SPACE (no bonus)
- **Progressive Line Multipliers**:
  - **+50 bonus points** for 3-in-a-row achievement
  - **+100 bonus points** for 4-in-a-row achievement
  - **+200 bonus points** for bingo completion (reduced from 500)
- **No penalties** (self-claims are rejected without point deduction)
- **Cumulative scoring** across multiple rounds

### Round Structure
- **Continuous play** - no set time limits
- **Bingo triggers new round** - winner announced, everyone gets new boards
- **3-second celebration** before board refresh
- **Persistent leaderboard** tracks total scores
- **Unlimited rounds** per session

## User Experience Design

### Onboarding Flow
```
1. Landing page with clear "Create Room" / "Join Room" options
2. Name entry (required for all players)
3. Room creation (host) or code entry (joining)
4. Board display with "How to Play" tutorial
5. Waiting for other players (optional)
6. Game begins immediately
```

### Interface Design Philosophy
- **Meeting-friendly**: Subtle, non-distracting visuals
- **One-hand operation**: Easy to use during calls
- **Quick access**: Fast square claiming and voting
- **Clear feedback**: Immediate visual/audio confirmation
- **Mobile-first**: Optimized for phone use during meetings

### Core UI Elements

#### Bingo Board
- **Responsive grid** adapts to screen size
- **Clear typography** for easy reading
- **Color coding**: Unmarked (white), marked (blue), winning (green)
- **Tap-friendly** sizing for mobile interaction
- **Smooth animations** for state changes

#### Verification Modal
- **Non-blocking design** allows continued gameplay
- **Clear question**: "Who said [buzzword]?"
- **Multiple choice options**: Boss, Client, Player Name, Teammate, Someone Else
- **Approve/Reject buttons** with vote count
- **Timer indication** showing 30-second countdown

#### Room Status Panel
- **Player list** with names and scores
- **Room code** prominently displayed
- **Round counter** and game state
- **Connection status** indicators

### Accessibility Features
- **Keyboard navigation** support
- **Screen reader compatibility** with proper ARIA labels
- **High contrast** mode for visual impairments
- **Scalable text** sizing options
- **Offline mode** for single-player practice

## Social Mechanics

### Competitive Elements
- **Real-time leaderboard** with current and total scores
- **Bingo celebration** with winner announcement
- **Achievement system** (first bingo, most verifications, etc.)
- **Round statistics** showing verification accuracy

### Collaborative Elements
- **Democratic verification** requires group participation
- **Shared buzzword discovery** - finding new ridiculous terms
- **Team bonding** through shared corporate pain
- **Meeting commentary** via verification votes

### Communication Systems
- **Verification voting** as primary communication
- **Visual feedback** for all player actions
- **Subtle notifications** for room events
- **No chat system** (intentionally meeting-focused)

## Content Design

### Buzzword Categories (369 total terms)

#### 1. Classic Corporate Speak (20 terms)
**Philosophy**: The absolute worst traditional business jargon
**Examples**: "Synergy", "Leverage", "Deep Dive", "Circle Back", "Low-hanging Fruit"

#### 2. Meeting Theater & Corporate Comedy (20 terms)  
**Philosophy**: Performative business language
**Examples**: "Let's Take This Offline", "Run it by Legal", "Pressure Test the Idea"

#### 3. Virtual Meeting Comedy Gold (47 terms)
**Philosophy**: Remote work call disasters and common phrases
**Examples**: "You're Muted", "Can Everyone See My Screen?", "Dog is Barking"

#### 4. Consultant Word Salad (26 terms)
**Philosophy**: Professional services meaningless language
**Examples**: "Value Creation", "Thought Leadership", "ROI Analysis"

#### 5. People & Culture Comedy (20 terms)
**Philosophy**: HR and team dynamics buzzwords
**Examples**: "Culture Fit", "Self-starter", "Go-getter", "Servant Leader"

### Content Curation Principles
- **Humor over accuracy**: Prioritize funny over technically correct
- **Universal recognition**: Terms most corporate workers know
- **Meeting context**: Words likely to appear in actual meetings
- **Avoiding offense**: No terms targeting specific groups or roles
- **Regular updates**: Quarterly addition of new trending terms

### Difficulty Balancing
- **Common terms**: 60% frequently used buzzwords (Synergy, Deep Dive)
- **Uncommon terms**: 30% less frequent but recognizable (Thought Leadership)
- **Rare gems**: 10% extremely specific corporate speak (ESG Compliance)

## Technical Design Requirements

### Performance Targets
- **Sub-200ms response time** for square claiming
- **Real-time verification** with <1 second vote tallying
- **Support for 10 concurrent players** per room
- **Global deployment** with <100ms latency worldwide
- **99.9% uptime** reliability

### Platform Requirements
- **Web-based**: No app download required
- **Cross-platform**: Works on desktop, tablet, mobile
- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **No plugins**: Pure HTML/CSS/JavaScript
- **Offline fallback**: Single-player mode when disconnected

### Data Requirements
- **Minimal storage**: Only essential game state
- **Real-time sync**: Instant updates across all players
- **Session persistence**: Survive page refresh/reconnection
- **Privacy focused**: No personal data collection
- **GDPR compliant**: No tracking or analytics

## Monetization Strategy

### Free-to-Play Model
- **Core gameplay**: Completely free
- **No advertisements**: Clean, distraction-free experience  
- **Open source**: Transparent and community-driven
- **Self-hostable**: Organizations can run their own instances

### Premium Features (Optional Future)
- **Custom buzzword sets**: Upload team-specific terminology
- **Analytics dashboard**: Meeting buzzword frequency tracking
- **Team tournaments**: Multi-room competitive events
- **White-label branding**: Custom styling for organizations

### Cost Structure
- **Serverless hosting**: Pay-per-use Cloudflare Workers
- **No fixed costs**: Scales with usage automatically
- **Open source**: Community contributions reduce development costs

## Success Metrics

### Engagement Metrics
- **Daily Active Users** (DAU)
- **Average session duration**
- **Rooms created per day**
- **Players per room average**
- **Return visitor rate**

### Quality Metrics
- **Verification accuracy rate** (legitimate claims approved)
- **False positive rate** (illegitimate claims approved)
- **Player satisfaction** (subjective feedback)
- **Technical uptime** and response times

### Growth Metrics
- **Viral coefficient** (invites sent per player)
- **Word-of-mouth sharing** on social media
- **Corporate adoption** rate
- **Geographic distribution**

### Success Targets (6 months post-launch)
- **1,000+ daily active users**
- **50+ concurrent rooms** during peak hours
- **85%+ verification accuracy** rate
- **4.5+ star rating** from user feedback
- **95%+ uptime** reliability

## Risk Assessment

### Technical Risks
- **WebSocket scaling** limits with current architecture
- **Cloudflare Workers** cost escalation with success
- **Real-time synchronization** complexity
- **Mobile browser** compatibility issues

### Business Risks
- **Corporate firewall** blocking WebSocket connections
- **IT security** concerns about external tools
- **Meeting culture** resistance to "distracting" games
- **Competitive pressure** from similar tools

### Mitigation Strategies
- **Progressive enhancement**: Fallback modes for limited connections
- **Enterprise sales**: Direct B2B outreach to IT departments
- **Documentation**: Security and privacy transparency
- **Community building**: Word-of-mouth marketing focus

## Future Roadmap

### Phase 1: MVP (Completed)
- ✅ Real multiplayer functionality
- ✅ Verification system with anti-cheat  
- ✅ 369+ buzzword library
- ✅ Responsive web interface
- ✅ Room-based gameplay

### Phase 2: Enhancement (Next 3 months)
- **Custom buzzword sets**: Upload team terminology
- **Meeting integration**: Slack/Teams app versions
- **Advanced statistics**: Personal and room analytics
- **Sound effects**: Subtle audio feedback options
- **Accessibility improvements**: Screen reader support

### Phase 3: Scale (6-12 months)
- **Enterprise features**: White-label deployment
- **Tournament mode**: Multi-room competitions
- **API integrations**: Calendar app connections
- **Mobile apps**: Native iOS/Android versions
- **International expansion**: Multi-language support

### Phase 4: Platform (12+ months)
- **Content creator tools**: Custom game modes
- **Community features**: Global leaderboards
- **Meeting insights**: Corporate culture analytics
- **Franchise opportunities**: Industry-specific versions

This game design balances entertainment with professional appropriateness, creating a unique social experience that enhances rather than disrupts corporate meetings.