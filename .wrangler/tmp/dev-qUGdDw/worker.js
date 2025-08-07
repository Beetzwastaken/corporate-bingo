var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-P5vEhy/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// worker.js
function corsHeaders(origin) {
  const allowedOrigins = [
    "https://engineer-memes-ai.netlify.app",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:5174",
    "http://localhost:5175"
  ];
  const validOrigin = allowedOrigins.includes(origin) ? origin : null;
  return {
    "Access-Control-Allow-Origin": validOrigin || "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders(origin)
      });
    }
    try {
      if (url.pathname === "/api/room/create" && request.method === "POST") {
        const body = await request.json();
        const { roomName, playerName } = validateRoomInput(body);
        if (!roomName || !playerName) {
          return new Response(JSON.stringify({ error: "Invalid room name or player name" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
          });
        }
        const roomCode = await generateRoomCode(env);
        const roomId = env.ROOMS.idFromName(roomCode);
        const roomObj = env.ROOMS.get(roomId);
        const response = await roomObj.fetch(new Request("https://dummy/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName, playerName, roomCode })
        }));
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
        });
      }
      if (url.pathname === "/api/room/join" && request.method === "POST") {
        const body = await request.json();
        const { roomCode, playerName } = validateJoinInput(body);
        if (!roomCode || !playerName) {
          return new Response(JSON.stringify({ error: "Invalid room code or player name" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
          });
        }
        const roomId = env.ROOMS.idFromName(roomCode);
        const roomObj = env.ROOMS.get(roomId);
        const response = await roomObj.fetch(new Request("https://dummy/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerName })
        }));
        if (response.status === 404) {
          return new Response(JSON.stringify({ error: "Room not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
          });
        }
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
        });
      }
      if (url.pathname.startsWith("/api/room/") && url.pathname.endsWith("/ws")) {
        const roomCode = url.pathname.split("/")[3];
        if (request.headers.get("Upgrade") !== "websocket") {
          return new Response("Expected WebSocket", { status: 400 });
        }
        const roomId = env.ROOMS.idFromName(roomCode);
        const roomObj = env.ROOMS.get(roomId);
        return roomObj.fetch(request);
      }
      if (url.pathname === "/api/dashboard/performance" && request.method === "GET") {
        const analytics = await getPerformanceMetrics(env);
        return new Response(JSON.stringify(analytics), {
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
        });
      }
      if (url.pathname === "/api/dashboard/players" && request.method === "GET") {
        const analytics = await getPlayerAnalytics(env);
        return new Response(JSON.stringify(analytics), {
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
        });
      }
      if (url.pathname === "/api/dashboard/buzzwords" && request.method === "GET") {
        const analytics = await getBuzzwordEffectiveness(env);
        return new Response(JSON.stringify(analytics), {
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
        });
      }
      if (url.pathname === "/api/dashboard/system" && request.method === "GET") {
        const health = await getSystemHealth(env);
        return new Response(JSON.stringify(health), {
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
        });
      }
      if (url.pathname === "/api/dashboard/ws") {
        if (request.headers.get("Upgrade") !== "websocket") {
          return new Response("Expected WebSocket", { status: 400 });
        }
        return handleDashboardWebSocket(request, env);
      }
      if (url.pathname === "/api/test") {
        return new Response(JSON.stringify({ message: "API is working", buzzwordCount: BUZZWORDS.length }), {
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
        });
      }
      return new Response("Not Found", {
        status: 404,
        headers: corsHeaders(origin)
      });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
      });
    }
  }
};
function validateRoomInput(body) {
  if (!body || typeof body !== "object") return {};
  const roomName = typeof body.roomName === "string" ? body.roomName.trim().slice(0, 50) : "";
  const playerName = typeof body.playerName === "string" ? body.playerName.trim().slice(0, 30) : "";
  const sanitizedRoomName = roomName.replace(/[<>'"&]/g, "");
  const sanitizedPlayerName = playerName.replace(/[<>'"&]/g, "");
  return {
    roomName: sanitizedRoomName.length >= 1 ? sanitizedRoomName : null,
    playerName: sanitizedPlayerName.length >= 1 ? sanitizedPlayerName : null
  };
}
__name(validateRoomInput, "validateRoomInput");
function validateJoinInput(body) {
  if (!body || typeof body !== "object") return {};
  const roomCode = typeof body.roomCode === "string" ? body.roomCode.trim().toUpperCase() : "";
  const playerName = typeof body.playerName === "string" ? body.playerName.trim().slice(0, 30) : "";
  const sanitizedRoomCode = /^[A-Z0-9]{6}$/.test(roomCode) ? roomCode : null;
  const sanitizedPlayerName = playerName.replace(/[<>'"&]/g, "");
  return {
    roomCode: sanitizedRoomCode,
    playerName: sanitizedPlayerName.length >= 1 ? sanitizedPlayerName : null
  };
}
__name(validateJoinInput, "validateJoinInput");
async function generateRoomCode(env) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  const roomCode = Array.from(
    array,
    (byte) => chars[byte % chars.length]
  ).join("");
  return roomCode;
}
__name(generateRoomCode, "generateRoomCode");
function fisherYatesShuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
__name(fisherYatesShuffle, "fisherYatesShuffle");
var BUZZWORDS = [
  // Classic Corporate Speak (The Absolute Worst)
  "Synergy",
  "Leverage",
  "Deep Dive",
  "Circle Back",
  "Touch Base",
  "Low-hanging Fruit",
  "Move the Needle",
  "Paradigm Shift",
  "Think Outside the Box",
  "Best Practice",
  "Core Competency",
  "Value-add",
  "Game Changer",
  "Win-win",
  "Right-size",
  "Optimize",
  "Streamline",
  "Ideate",
  "Impactful",
  // Meeting & Communication Gems  
  "Take it Offline",
  "Ping Me",
  "Loop In",
  "Bandwidth",
  "On My Radar",
  "Align on This",
  "Sync Up",
  "Park That",
  "Table This",
  "Double Click",
  "Drill Down",
  "Level Set",
  "Socialize",
  "Evangelize",
  "Champion",
  "Cascade Down",
  "Run it Up",
  "Put a Pin In",
  "Peel the Onion",
  "Boil the Ocean",
  "Circle Back Later",
  "Take That Offline",
  "Sync Up Tomorrow",
  "Revisit This",
  "Follow Up Separately",
  "Schedule a Follow-up",
  "Set Up Time",
  "Grab Time",
  "Quick Sync",
  "Brain Dump",
  "Download You",
  "Get You Up to Speed",
  "Bring Everyone Along",
  "Get Buy-in",
  "Surface This Up",
  "Bubble Up",
  // Meeting Theater & Corporate Comedy
  "Let's Take This Offline",
  "We Need to Socialize This",
  "Run it by Legal",
  "Get Finance Involved",
  "Check with Compliance",
  "Validate with Leadership",
  "Vet This Through",
  "Pressure Test the Idea",
  "Stress Test Assumptions",
  "Sanity Check Numbers",
  "Gut Check the Plan",
  "Reality Check Timeline",
  "Can You Speak to That?",
  "What's Your Take?",
  "How Do You See This?",
  "Where Do You Land?",
  "What's Your Comfort Level?",
  "Any Concerns?",
  "Red Flags?",
  "Deal Breakers?",
  "Showstoppers?",
  "Blockers?",
  "Circle Back on Monday",
  "Let's Unpack This",
  "Thoughts?",
  "Does That Resonate?",
  // Virtual Meeting Comedy Gold
  "You're Muted",
  "Can You Hear Me?",
  "Are You There?",
  "Hello? Hello?",
  "Can Everyone See My Screen?",
  "Are You Presenting?",
  "Who's Presenting?",
  "Let Me Share My Screen",
  "Can You See This?",
  "Is This Visible?",
  "Sorry, I Was Muted",
  "You Cut Out There",
  "Your Audio is Breaking Up",
  "Can You Repeat That?",
  "Sorry, Can You Say That Again?",
  "I Didn't Catch That",
  "Let Me Stop Sharing",
  "I Think You're Still Muted",
  "We Can't Hear You",
  "Your Video is Frozen",
  "You're Breaking Up",
  "Bad Connection",
  "Can Someone Else Drive?",
  "Who Has the Deck?",
  "Next Slide Please",
  "Sorry, I'm Having Technical Issues",
  "Let Me Try Again",
  "Can You Try Now?",
  "I'll Send the Link in Chat",
  "Check the Chat",
  "Posted in Chat",
  "Sorry, I'm Late",
  "Traffic Was Terrible",
  "Had Back-to-Back Meetings",
  "Can We Get Started?",
  "Let's Give It Two More Minutes",
  "Waiting for Everyone",
  "Someone Else Just Joined",
  "I Think We're All Here",
  "Let's Begin",
  "Can You Make Me Presenter?",
  "I Need Presenter Rights",
  "Who's the Organizer?",
  "Let Me Make You Presenter",
  "I'll Give You Control",
  "Taking Control Back",
  "Echo on the Line",
  "Hearing an Echo",
  "Someone's Not Muted",
  "Feedback Loop",
  "Can Everyone Mute?",
  "Please Mute When Not Speaking",
  "Dog is Barking",
  "Kids in Background",
  "Sorry About the Noise",
  "Construction Outside",
  "Leaf Blower",
  "Lawnmower Outside",
  "I Have a Hard Stop",
  "Need to Drop in 10 Minutes",
  "Another Meeting Starting",
  "Double Booked",
  "Conflict with Another Meeting",
  "Need to Jump to Another Call",
  "Can We Record This?",
  "Is This Being Recorded?",
  "I'll Start Recording",
  "Meeting Notes",
  "Action Items",
  "Who's Taking Notes?",
  "I'll Send a Recap",
  "Follow-up Email",
  "Meeting Summary",
  "Can You Put That in Chat?",
  "Link in the Chat",
  "I Shared in Chat",
  "Private Chat",
  "Sidebar Conversation",
  "Offline Discussion",
  "Breakout Rooms",
  "Let's Split into Groups",
  "Back to Main Room",
  // Corporate Speak Poetry & Fluff
  "At the End of the Day",
  "When All is Said and Done",
  "Bottom Line",
  "Net-Net",
  "Long Story Short",
  "To Be Completely Transparent",
  "If I'm Being Honest",
  "To Level Set",
  "For Context",
  "Background Info",
  "Quick Backstory",
  "History Lesson",
  "Let Me Paint a Picture",
  "Here's the Situation",
  "Here's Where We Are",
  "Current State",
  "Moving Forward",
  "Going Forward",
  "Path Forward",
  "Next Steps",
  // Absurd Corporate Priorities  
  "Client-centric Solutions",
  "Customer Success Journey",
  "Stakeholder Alignment",
  "Cross-functional Collaboration",
  "Omnichannel Experience",
  "End-to-end Solutions",
  "Holistic Approach",
  "Strategic Roadmap",
  "Digital-first Mindset",
  "Data-driven Decisions",
  "Growth Mindset",
  "Innovation Pipeline",
  "Transformation Journey",
  "Change Management",
  "Process Optimization",
  "Operational Excellence",
  "Best-in-class",
  "World-class",
  "Industry-leading",
  "Market-leading",
  "Award-winning",
  "Cutting-edge",
  // Hilarious Consultant Word Salad
  "Value Creation",
  "Competitive Advantage",
  "Thought Leadership",
  "Subject Matter Expert",
  "Industry Best Practices",
  "Benchmarking Studies",
  "Gap Analysis",
  "SWOT Analysis",
  "Root Cause Analysis",
  "Impact Assessment",
  "Business Case Development",
  "ROI Analysis",
  "Cost-benefit Analysis",
  "Risk Mitigation",
  "Strategic Planning",
  "Implementation Roadmap",
  "Phase Gate Reviews",
  "Milestone Tracking",
  "Performance Metrics",
  "Success Criteria",
  "Key Performance Indicators",
  "Return on Investment",
  "Total Cost of Ownership",
  // Meeting Types & Corporate Events
  "All Hands Meeting",
  "Town Hall",
  "Skip Level",
  "One-on-One",
  "Check-in",
  "Stand-up",
  "Scrum",
  "Sprint Planning",
  "Retrospective",
  "Post-mortem",
  "Brainstorming Session",
  "Ideation Workshop",
  "Design Thinking",
  "Innovation Lab",
  "Hackathon",
  "Deep Dive Session",
  "Working Session",
  "Strategic Offsite",
  "Leadership Retreat",
  "Team Building",
  "Culture Session",
  "Values Workshop",
  "Kick-off Meeting",
  "Status Update",
  "Checkpoint Review",
  "Quarterly Business Review",
  // Startup & Business Development Nonsense
  "Product-Market Fit",
  "Go-to-Market Strategy",
  "Minimum Viable Product",
  "User Feedback",
  "Iteration Cycle",
  "Pivot Strategy",
  "Scale Operations",
  "Market Penetration",
  "Customer Acquisition",
  "Revenue Streams",
  "Business Model",
  "Value Proposition",
  "Competitive Landscape",
  "Market Opportunity",
  "Total Addressable Market",
  "Monetization Strategy",
  "Customer Lifecycle",
  "User Experience",
  "Customer Experience",
  "Brand Experience",
  // People & Culture Comedy
  "Culture Fit",
  "Team Player",
  "Self-starter",
  "Go-getter",
  "Problem Solver",
  "Strategic Thinker",
  "Detail-oriented",
  "Results-driven",
  "Customer-focused",
  "Collaborative Leader",
  "Change Agent",
  "Innovation Champion",
  "Brand Ambassador",
  "Cross-functional Partner",
  "Stakeholder Manager",
  "Relationship Builder",
  "Culture Carrier",
  "People Person",
  "Servant Leader",
  "Thought Partner",
  "Executive Presence",
  "Leadership Potential",
  "High Performer",
  "Top Talent",
  // Modern Business Buzzwords  
  "Digital Transformation",
  "Cloud-first",
  "AI-powered",
  "Machine Learning",
  "Data Analytics",
  "Business Intelligence",
  "Predictive Analytics",
  "Automation",
  "Scalable Solutions",
  "Agile Methodology",
  "DevOps",
  "Continuous Improvement",
  "Innovation Culture",
  "Disruptive Technology",
  "Emerging Technologies",
  "Future-ready",
  "Next-generation",
  "State-of-the-art",
  "Revolutionary",
  "Groundbreaking",
  // Sales & Marketing Theater
  "Customer Journey",
  "Buyer Persona",
  "Lead Generation",
  "Sales Funnel",
  "Conversion Rate",
  "Customer Acquisition Cost",
  "Lifetime Value",
  "Retention Strategy",
  "Churn Analysis",
  "Upselling",
  "Cross-selling",
  "Market Segmentation",
  "Target Audience",
  "Brand Positioning",
  "Content Marketing",
  "Inbound Strategy",
  "Outbound Campaigns",
  "Multi-touch Attribution",
  "Lead Nurturing",
  "Sales Enablement",
  // Project Management Comedy
  "Scope Creep",
  "Requirements Change",
  "Budget Overrun",
  "Schedule Slip",
  "Resource Constraint",
  "Dependencies",
  "Critical Path",
  "Milestone",
  "Deliverable",
  "Work Package",
  "Action Item",
  "Follow-up Item",
  "Risk Register",
  "Issue Log",
  "Change Request",
  "Status Report",
  "Project Charter",
  "Statement of Work",
  "Work Breakdown Structure",
  "Gantt Chart",
  // Executive & Leadership Speak
  "Strategic Vision",
  "Mission Critical",
  "Core Values",
  "Company Culture",
  "Organizational Excellence",
  "Leadership Development",
  "Succession Planning",
  "Talent Management",
  "Performance Management",
  "Engagement Survey",
  "Employee Experience",
  "Workplace Culture",
  "Diversity & Inclusion",
  "Corporate Social Responsibility",
  "Sustainability Initiative",
  "ESG Compliance",
  "Governance Framework",
  "Risk Management",
  "Compliance Program",
  "Audit Trail",
  // Finance & Operations Fluff
  "Financial Planning",
  "Budget Cycle",
  "Cost Center",
  "Profit Center",
  "Revenue Recognition",
  "Cash Flow",
  "Working Capital",
  "EBITDA",
  "Gross Margin",
  "Operating Margin",
  "Capital Expenditure",
  "Operating Expenditure",
  "Accounts Receivable",
  "Accounts Payable",
  "Invoice Processing",
  "Purchase Order",
  "Vendor Management",
  "Supplier Relations",
  "Procurement Process",
  "Supply Chain Management",
  // Light Engineering Humor (Relatable but Not Technical)
  "Technical Debt",
  "Legacy System",
  "System Upgrade",
  "Maintenance Window",
  "Code Review",
  "Quality Control",
  "Testing Phase",
  "User Acceptance Testing",
  "Hot Fix",
  "Patch Release",
  "Version Control",
  "Change Management",
  "Documentation",
  "Knowledge Transfer",
  "Training Program",
  "Best Practices Guide"
];
var BingoRoom = class {
  static {
    __name(this, "BingoRoom");
  }
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = /* @__PURE__ */ new Map();
    this.players = /* @__PURE__ */ new Map();
    this.playerRateLimits = /* @__PURE__ */ new Map();
    this.gameState = {
      roomCode: "",
      roomName: "",
      hostId: "",
      roundNumber: 1,
      isActive: true,
      created: Date.now(),
      lastActivity: Date.now(),
      pendingVerifications: /* @__PURE__ */ new Map()
    };
    this.MAX_MESSAGES_PER_MINUTE = 30;
    this.MAX_PENDING_VERIFICATIONS_PER_PLAYER = 3;
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (request.headers.get("Upgrade") === "websocket") {
      return this.handleWebSocket(request);
    }
    if (url.pathname === "/create" && request.method === "POST") {
      const { roomName, playerName, roomCode } = await request.json();
      this.gameState.roomCode = roomCode;
      this.gameState.roomName = roomName;
      this.gameState.hostId = generatePlayerId();
      const hostPlayer = {
        id: this.gameState.hostId,
        name: playerName,
        isHost: true,
        board: this.generateUniqueBoard(),
        markedSquares: new Array(25).fill(false),
        currentScore: 0,
        totalScore: 0,
        joinedAt: Date.now(),
        bingoAchievedThisRound: false
      };
      this.players.set(this.gameState.hostId, hostPlayer);
      return new Response(JSON.stringify({
        success: true,
        roomCode,
        playerId: this.gameState.hostId,
        board: hostPlayer.board,
        isHost: true
      }));
    }
    if (url.pathname === "/probe" && request.method === "GET") {
      return new Response(null, {
        status: this.gameState.isActive ? 200 : 404
      });
    }
    if (url.pathname === "/join" && request.method === "POST") {
      const { playerName } = await request.json();
      if (!this.gameState.isActive) {
        return new Response(JSON.stringify({ error: "Room is not active" }), { status: 404 });
      }
      if (this.players.size >= 10) {
        return new Response(JSON.stringify({ error: "Room is full" }), { status: 400 });
      }
      const playerId = generatePlayerId();
      const newPlayer = {
        id: playerId,
        name: playerName,
        isHost: false,
        board: this.generateUniqueBoard(),
        // Each player gets unique board!
        markedSquares: new Array(25).fill(false),
        currentScore: 0,
        totalScore: 0,
        joinedAt: Date.now(),
        bingoAchievedThisRound: false
      };
      this.players.set(playerId, newPlayer);
      this.broadcast({
        type: "PLAYER_JOINED",
        player: { id: playerId, name: playerName },
        playerCount: this.players.size
      }, playerId);
      return new Response(JSON.stringify({
        success: true,
        playerId,
        board: newPlayer.board,
        // Only their unique board
        roomName: this.gameState.roomName,
        playerCount: this.players.size,
        roundNumber: this.gameState.roundNumber
      }));
    }
    return new Response("Not found", { status: 404 });
  }
  // Generate unique 5x5 bingo board for each player
  generateUniqueBoard() {
    const shuffled = fisherYatesShuffle(BUZZWORDS);
    const selected = shuffled.slice(0, 24);
    const board = [];
    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        board.push("FREE SPACE");
      } else {
        const termIndex = i < 12 ? i : i - 1;
        board.push(selected[termIndex]);
      }
    }
    return board;
  }
  // Handle WebSocket connections for real-time gameplay
  async handleWebSocket(request) {
    const url = new URL(request.url);
    const playerId = url.searchParams.get("playerId");
    if (!playerId || !this.players.has(playerId)) {
      return new Response("Invalid player ID", { status: 400 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.sessions.set(playerId, {
      socket: server,
      player: this.players.get(playerId)
    });
    server.addEventListener("message", async (event) => {
      try {
        const data = JSON.parse(event.data);
        await this.handleMessage(playerId, data);
      } catch (error) {
        console.error("WebSocket message error:", error);
        try {
          server.send(JSON.stringify({
            type: "ERROR",
            message: "Invalid message format",
            timestamp: Date.now()
          }));
        } catch (sendError) {
          console.error("Failed to send error response:", sendError);
          server.close(1011, "Invalid message format");
        }
      }
    });
    server.addEventListener("close", () => {
      this.sessions.delete(playerId);
      this.cleanupPlayerVerifications(playerId);
      this.playerRateLimits.delete(playerId);
      const player = this.players.get(playerId);
      if (player) {
        this.players.delete(playerId);
        console.log(`Player ${player.name} disconnected and removed from room`);
        if (this.players.size === 0) {
          this.gameState.isActive = false;
          console.log("Room marked inactive - all players left");
        }
        this.broadcast({
          type: "PLAYER_LEFT",
          playerId,
          playerName: player.name,
          playerCount: this.players.size
        });
      }
    });
    server.send(JSON.stringify({
      type: "ROOM_STATE",
      players: Array.from(this.players.values()).map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        currentScore: p.currentScore,
        totalScore: p.totalScore
      })),
      roundNumber: this.gameState.roundNumber
    }));
    return new Response(null, { status: 101, webSocket: client });
  }
  // Handle real-time messages from players with input validation and rate limiting
  async handleMessage(playerId, data) {
    const player = this.players.get(playerId);
    if (!player) {
      console.warn("Message from unknown player:", playerId);
      return;
    }
    if (!this.checkRateLimit(playerId)) {
      console.warn("Rate limit exceeded for player:", playerId);
      const session = this.sessions.get(playerId);
      if (session) {
        try {
          session.socket.send(JSON.stringify({
            type: "ERROR",
            message: "Rate limit exceeded. Please slow down.",
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error("Failed to send rate limit warning:", error);
        }
      }
      return;
    }
    if (!data || typeof data !== "object" || typeof data.type !== "string") {
      console.warn("Invalid message format from player:", playerId, data);
      return;
    }
    this.gameState.lastActivity = Date.now();
    switch (data.type) {
      case "CLAIM_BUZZWORD":
        if (typeof data.buzzword !== "string" || typeof data.squareIndex !== "number" || data.squareIndex < 0 || data.squareIndex > 24) {
          console.warn("Invalid CLAIM_BUZZWORD data:", data);
          return;
        }
        await this.handleBuzzwordClaim(playerId, data.buzzword, data.squareIndex);
        break;
      case "VERIFY_VOTE":
        if (typeof data.verificationId !== "string" || !["approve", "reject"].includes(data.vote) || typeof data.speaker !== "string") {
          console.warn("Invalid VERIFY_VOTE data:", data);
          return;
        }
        await this.handleVerificationVote(playerId, data.verificationId, data.vote, data.speaker);
        break;
      case "PING":
        const session = this.sessions.get(playerId);
        if (session) {
          try {
            session.socket.send(JSON.stringify({ type: "PONG", timestamp: Date.now() }));
          } catch (error) {
            console.error("Failed to send PONG to player:", playerId, error);
          }
        }
        break;
      default:
        console.warn("Unknown message type:", data.type, "from player:", playerId);
    }
  }
  // Handle buzzword claims with real-time verification
  async handleBuzzwordClaim(playerId, buzzword, squareIndex) {
    const player = this.players.get(playerId);
    if (!player) return;
    const playerPendingCount = Array.from(this.gameState.pendingVerifications.values()).filter((v) => v.claimedBy === playerId).length;
    if (playerPendingCount >= this.MAX_PENDING_VERIFICATIONS_PER_PLAYER) {
      console.warn(`Player ${player.name} has too many pending verifications: ${playerPendingCount}`);
      return;
    }
    if (player.markedSquares[squareIndex] === true) {
      console.warn(`Player ${player.name} tried to claim already marked square ${squareIndex}`);
      return;
    }
    if (player.board[squareIndex] !== buzzword) {
      console.warn(`Buzzword mismatch: ${buzzword} vs ${player.board[squareIndex]} for player ${player.name}`);
      return;
    }
    if (buzzword === "FREE SPACE") {
      player.markedSquares[squareIndex] = true;
      player.currentScore += 5;
      this.broadcast({
        type: "CLAIM_APPROVED",
        claimerName: player.name,
        buzzword: "FREE SPACE",
        points: 5
      });
      this.checkForBingo(playerId);
      return;
    }
    const verificationId = generatePlayerId();
    const verification = {
      id: verificationId,
      claimedBy: playerId,
      claimerName: player.name,
      buzzword,
      squareIndex,
      votes: /* @__PURE__ */ new Map(),
      speakerVotes: /* @__PURE__ */ new Map(),
      timestamp: Date.now(),
      requiredVotes: Math.max(1, Math.floor(this.sessions.size / 2))
      // Majority needed
    };
    this.gameState.pendingVerifications.set(verificationId, verification);
    this.broadcast({
      type: "VERIFY_BUZZWORD",
      verificationId,
      claimerName: player.name,
      buzzword,
      question: `Who said "${buzzword}"?`,
      options: [
        "Manager/Boss",
        "Client",
        player.name,
        // The claimer (self-claim detection)
        "Other teammate",
        "Someone else"
      ]
    }, playerId);
    const timeoutId = setTimeout(() => {
      this.resolveVerification(verificationId, true);
    }, 3e4);
    verification.timeoutId = timeoutId;
  }
  // Handle verification votes with anti-cheat detection
  async handleVerificationVote(playerId, verificationId, vote, speaker) {
    const verification = this.gameState.pendingVerifications.get(verificationId);
    if (!verification) return;
    verification.votes.set(playerId, vote);
    verification.speakerVotes.set(playerId, speaker);
    if (verification.votes.size >= verification.requiredVotes) {
      this.resolveVerification(verificationId, false);
    }
  }
  // Resolve verification with anti-cheat logic (atomic resolution)
  resolveVerification(verificationId, isTimeout = false) {
    const verification = this.gameState.pendingVerifications.get(verificationId);
    if (!verification || verification.resolved) return;
    verification.resolved = true;
    if (verification.timeoutId) {
      clearTimeout(verification.timeoutId);
      verification.timeoutId = null;
    }
    const claimingPlayer = this.players.get(verification.claimedBy);
    if (!claimingPlayer) {
      this.gameState.pendingVerifications.delete(verificationId);
      return;
    }
    if (isTimeout) {
      this.broadcast({
        type: "CLAIM_REJECTED",
        reason: "TIMEOUT",
        claimerName: claimingPlayer.name,
        buzzword: verification.buzzword,
        message: `Verification timeout - not enough players voted on "${verification.buzzword}"`
      });
      this.gameState.pendingVerifications.delete(verificationId);
      return;
    }
    const approvals = Array.from(verification.votes.values()).filter((v) => v === "approve").length;
    const rejections = verification.votes.size - approvals;
    const speakerCounts = {};
    verification.speakerVotes.forEach((speaker) => {
      speakerCounts[speaker] = (speakerCounts[speaker] || 0) + 1;
    });
    const topSpeaker = Object.keys(speakerCounts).reduce(
      (a, b) => speakerCounts[a] > speakerCounts[b] ? a : b,
      ""
    );
    if (topSpeaker === claimingPlayer.name && speakerCounts[topSpeaker] > verification.votes.size / 2) {
      claimingPlayer.currentScore = Math.max(0, claimingPlayer.currentScore - 50);
      this.broadcast({
        type: "CLAIM_REJECTED",
        reason: "SELF_CLAIM",
        claimerName: claimingPlayer.name,
        buzzword: verification.buzzword,
        message: `${claimingPlayer.name} can't mark buzzwords they said themselves! (-50 points)`,
        penalty: -50
      });
      this.gameState.pendingVerifications.delete(verificationId);
      return;
    }
    if (approvals > rejections) {
      claimingPlayer.markedSquares[verification.squareIndex] = true;
      claimingPlayer.currentScore += 10;
      this.broadcast({
        type: "CLAIM_APPROVED",
        claimerName: claimingPlayer.name,
        buzzword: verification.buzzword,
        points: 10
      });
      this.checkForBingo(verification.claimedBy);
    } else {
      this.broadcast({
        type: "CLAIM_REJECTED",
        reason: "INSUFFICIENT_VOTES",
        claimerName: claimingPlayer.name,
        buzzword: verification.buzzword,
        message: `Not enough people heard "${verification.buzzword}"`
      });
    }
    this.gameState.pendingVerifications.delete(verificationId);
  }
  // Check if player achieved bingo (5 in a row)
  checkForBingo(playerId) {
    const player = this.players.get(playerId);
    if (!player || player.bingoAchievedThisRound) return;
    const marked = player.markedSquares;
    const patterns = [
      // Rows
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12, 13, 14],
      [15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24],
      // Columns  
      [0, 5, 10, 15, 20],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24],
      [4, 8, 12, 16, 20]
    ];
    for (const pattern of patterns) {
      if (pattern.every((i) => marked[i] || i === 12)) {
        this.handleBingoAchieved(playerId, pattern);
        return;
      }
    }
  }
  // Handle bingo win - award points and trigger new round for everyone
  async handleBingoAchieved(playerId, winningPattern) {
    const player = this.players.get(playerId);
    if (!player) return;
    player.bingoAchievedThisRound = true;
    player.currentScore += 500;
    player.totalScore += player.currentScore;
    this.broadcast({
      type: "BINGO_ACHIEVED",
      winner: player.name,
      score: player.currentScore,
      pattern: winningPattern,
      message: `\u{1F389} ${player.name} got BINGO! New cards in 3 seconds...`
    });
    setTimeout(() => {
      this.regenerateAllBoards();
    }, 3e3);
  }
  // Generate new unique boards for all players (auto-reshuffle)
  regenerateAllBoards() {
    this.gameState.roundNumber++;
    this.players.forEach((player) => {
      player.totalScore += player.currentScore;
      player.board = this.generateUniqueBoard();
      player.markedSquares = new Array(25).fill(false);
      player.currentScore = 0;
      player.bingoAchievedThisRound = false;
    });
    this.sessions.forEach((session, playerId) => {
      const player = this.players.get(playerId);
      session.socket.send(JSON.stringify({
        type: "NEW_BOARD",
        board: player.board,
        // Each player gets their unique new board
        totalScore: player.totalScore,
        currentScore: 0,
        roundNumber: this.gameState.roundNumber
      }));
    });
    this.broadcast({
      type: "NEW_ROUND",
      roundNumber: this.gameState.roundNumber,
      leaderboard: this.getLeaderboard()
    });
  }
  // Get current leaderboard
  getLeaderboard() {
    return Array.from(this.players.values()).sort((a, b) => b.totalScore - a.totalScore).map((p) => ({
      name: p.name,
      totalScore: p.totalScore,
      currentScore: p.currentScore
    }));
  }
  // Rate limiting check for players
  checkRateLimit(playerId) {
    const now = Date.now();
    const windowStart = now - 6e4;
    let playerLimits = this.playerRateLimits.get(playerId);
    if (!playerLimits) {
      playerLimits = [];
      this.playerRateLimits.set(playerId, playerLimits);
    }
    while (playerLimits.length > 0 && playerLimits[0] < windowStart) {
      playerLimits.shift();
    }
    if (playerLimits.length >= this.MAX_MESSAGES_PER_MINUTE) {
      return false;
    }
    playerLimits.push(now);
    return true;
  }
  // Clean up player verifications when player disconnects
  cleanupPlayerVerifications(playerId) {
    const toRemove = [];
    this.gameState.pendingVerifications.forEach((verification, verificationId) => {
      if (verification.claimedBy === playerId) {
        if (verification.timeoutId) {
          clearTimeout(verification.timeoutId);
        }
        toRemove.push(verificationId);
      }
    });
    toRemove.forEach((verificationId) => {
      this.gameState.pendingVerifications.delete(verificationId);
    });
    console.log(`Cleaned up ${toRemove.length} pending verifications for player ${playerId}`);
  }
  // Broadcast message to all connected players (with optional exclusion)
  broadcast(message, excludePlayerId = null) {
    const failedConnections = [];
    this.sessions.forEach((session, playerId) => {
      if (playerId !== excludePlayerId) {
        try {
          session.socket.send(JSON.stringify(message));
        } catch (error) {
          console.error("Broadcast error to player", playerId, error);
          if (error.name === "TypeError" || error.message.includes("closed")) {
            failedConnections.push(playerId);
          }
        }
      }
    });
    failedConnections.forEach((playerId) => {
      console.log(`Removing failed connection for player: ${playerId}`);
      this.sessions.delete(playerId);
      this.cleanupPlayerVerifications(playerId);
      this.playerRateLimits.delete(playerId);
      const player = this.players.get(playerId);
      if (player) {
        this.players.delete(playerId);
        this.broadcast({
          type: "PLAYER_LEFT",
          playerId,
          playerName: player.name,
          playerCount: this.players.size
        });
      }
    });
  }
};
function generatePlayerId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(
    array,
    (byte) => byte.toString(16).padStart(2, "0")
  ).join("");
}
__name(generatePlayerId, "generatePlayerId");

// C:/Users/Ryan/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/Ryan/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-P5vEhy/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// C:/Users/Ryan/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-P5vEhy/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  BingoRoom,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
