// Performance Dashboard Corporate Humor Content
// Professional terminology with engineering humor context for executive-level dashboards

export interface DashboardTerminology {
  original: string;
  corporateHumor: string;
  executiveContext: string;
  appropriatenessScore: number; // 0-100
  engineeringRelevance: number; // 0-100
  viralPotential: number; // 0-100
}

export interface PerformanceStatusMessage {
  status: 'healthy' | 'warning' | 'critical' | 'loading' | 'error';
  message: string;
  executiveMessage: string;
  meetingFriendly: string;
  technicalNote?: string;
}

export interface CorporateAnalyticsCategory {
  category: string;
  humorContext: string;
  professionalDescription: string;
  executiveSummary: string;
  buzzwordEffectiveness: number;
}

// Executive-Friendly Performance Metric Names
export const DASHBOARD_TERMINOLOGY: DashboardTerminology[] = [
  // System Performance Metrics
  {
    original: "User Retention Rate",
    corporateHumor: "Meeting Survival Rate",
    executiveContext: "Percentage of participants who complete the full corporate entertainment experience",
    appropriatenessScore: 98,
    engineeringRelevance: 85,
    viralPotential: 92
  },
  {
    original: "Content Engagement Speed",
    corporateHumor: "Buzzword Velocity",
    executiveContext: "Rate at which corporate terminology triggers audience engagement responses",
    appropriatenessScore: 95,
    engineeringRelevance: 88,
    viralPotential: 89
  },
  {
    original: "High Traffic Periods",
    corporateHumor: "Peak Corporate Hours",
    executiveContext: "Prime time for maximum corporate networking and team engagement activities",
    appropriatenessScore: 97,
    engineeringRelevance: 82,
    viralPotential: 86
  },
  {
    original: "Premium User Metrics",
    corporateHumor: "C-Suite Engagement Index",
    executiveContext: "Executive-level participation and satisfaction metrics for leadership review",
    appropriatenessScore: 99,
    engineeringRelevance: 80,
    viralPotential: 94
  },
  {
    original: "System Load Average",
    corporateHumor: "Meeting Room Utilization",
    executiveContext: "Optimal capacity management for corporate entertainment infrastructure",
    appropriatenessScore: 96,
    engineeringRelevance: 91,
    viralPotential: 83
  },
  {
    original: "Error Rate",
    corporateHumor: "Misalignment Coefficient",
    executiveContext: "Frequency of temporary process optimization opportunities",
    appropriatenessScore: 94,
    engineeringRelevance: 89,
    viralPotential: 87
  },
  {
    original: "Response Time",
    corporateHumor: "Executive Responsiveness",
    executiveContext: "Speed of professional decision-making and action-item completion",
    appropriatenessScore: 98,
    engineeringRelevance: 93,
    viralPotential: 85
  },
  {
    original: "Concurrent Users",
    corporateHumor: "Simultaneous Stakeholders",
    executiveContext: "Number of engaged professionals participating in real-time collaboration",
    appropriatenessScore: 97,
    engineeringRelevance: 86,
    viralPotential: 88
  },
  {
    original: "Data Processing Speed",
    corporateHumor: "Intelligence Synthesis Rate",
    executiveContext: "Efficiency of transforming raw information into actionable corporate insights",
    appropriatenessScore: 96,
    engineeringRelevance: 92,
    viralPotential: 81
  },
  {
    original: "Memory Usage",
    corporateHumor: "Institutional Knowledge Load",
    executiveContext: "Utilization of collective corporate wisdom and historical precedent",
    appropriatenessScore: 95,
    engineeringRelevance: 88,
    viralPotential: 84
  }
];

// Professional Status Messages with Corporate Humor
export const PERFORMANCE_STATUS_MESSAGES: PerformanceStatusMessage[] = [
  // Healthy Status
  {
    status: 'healthy',
    message: "All systems operational",
    executiveMessage: "Operating with C-suite efficiency",
    meetingFriendly: "Running like a well-oiled corporate machine",
    technicalNote: "Performance metrics within optimal parameters"
  },
  {
    status: 'healthy',
    message: "Performance optimal",
    executiveMessage: "Exceeding quarterly expectations",
    meetingFriendly: "Delivering results ahead of schedule",
    technicalNote: "All KPIs tracking above baseline targets"
  },
  
  // Warning Status
  {
    status: 'warning',
    message: "Performance degradation detected",
    executiveMessage: "Experiencing minor headwinds",
    meetingFriendly: "Navigating some temporary challenges",
    technicalNote: "Monitoring elevated response times"
  },
  {
    status: 'warning',
    message: "Resource utilization high",
    executiveMessage: "Operating at peak productivity levels",
    meetingFriendly: "Maximum corporate engagement achieved",
    technicalNote: "System resources approaching capacity limits"
  },
  
  // Critical Status  
  {
    status: 'critical',
    message: "System performance compromised",
    executiveMessage: "Implementing strategic realignment",
    meetingFriendly: "Pivoting to contingency protocols",
    technicalNote: "Critical performance thresholds exceeded"
  },
  {
    status: 'critical',
    message: "Multiple service disruptions",
    executiveMessage: "Managing cross-functional dependencies",
    meetingFriendly: "Coordinating enterprise-wide optimization",
    technicalNote: "Multiple systems reporting degraded performance"
  },
  
  // Loading Status
  {
    status: 'loading',
    message: "Initializing performance metrics",
    executiveMessage: "Calibrating corporate intelligence",
    meetingFriendly: "Preparing executive dashboard",
    technicalNote: "Loading real-time performance data"
  },
  {
    status: 'loading',
    message: "Synchronizing data sources",
    executiveMessage: "Aligning stakeholder perspectives",
    meetingFriendly: "Harmonizing cross-functional insights",
    technicalNote: "Aggregating multi-source analytics"
  },
  
  // Error Status
  {
    status: 'error',
    message: "Connection failed",
    executiveMessage: "Experiencing connectivity challenges",
    meetingFriendly: "Temporary communication gap",
    technicalNote: "WebSocket connection unavailable"
  },
  {
    status: 'error',
    message: "Data unavailable",
    executiveMessage: "Information pending validation",
    meetingFriendly: "Awaiting final approvals",
    technicalNote: "Unable to retrieve current metrics"
  }
];

// Corporate Analytics Categories with Humor Context
export const ANALYTICS_CATEGORIES: CorporateAnalyticsCategory[] = [
  {
    category: "Performance Excellence",
    humorContext: "How efficiently we're exceeding expectations",
    professionalDescription: "Comprehensive performance metrics and operational efficiency indicators",
    executiveSummary: "Real-time assessment of organizational productivity and goal achievement",
    buzzwordEffectiveness: 94
  },
  {
    category: "Stakeholder Engagement",
    humorContext: "Measuring corporate participation enthusiasm",
    professionalDescription: "User engagement patterns and interaction quality metrics",
    executiveSummary: "Analysis of professional community involvement and satisfaction levels",
    buzzwordEffectiveness: 91
  },
  {
    category: "System Reliability",
    humorContext: "Our commitment to bulletproof operations",
    professionalDescription: "Infrastructure stability and service availability monitoring",
    executiveSummary: "Enterprise-grade reliability metrics and uptime performance",
    buzzwordEffectiveness: 96
  },
  {
    category: "Innovation Velocity",
    humorContext: "Speed of cutting-edge solution delivery",
    professionalDescription: "Development cycle efficiency and feature deployment metrics",
    executiveSummary: "Rate of continuous improvement and technology advancement",
    buzzwordEffectiveness: 89
  },
  {
    category: "Market Intelligence",
    humorContext: "Understanding what makes corporate hearts sing",
    professionalDescription: "User behavior analytics and content effectiveness analysis",
    executiveSummary: "Strategic insights into professional entertainment preferences",
    buzzwordEffectiveness: 87
  },
  {
    category: "Operational Excellence",
    humorContext: "Mastery of corporate-grade service delivery",
    professionalDescription: "End-to-end process optimization and quality assurance metrics",
    executiveSummary: "Systematic approach to world-class professional entertainment",
    buzzwordEffectiveness: 93
  }
];

// Loading Messages with Corporate Flavor
export const LOADING_MESSAGES = [
  "Synergizing cross-functional data streams...",
  "Optimizing enterprise-grade user experience...",
  "Calibrating C-suite visibility metrics...",
  "Harmonizing stakeholder perspectives...",
  "Implementing best-practice methodologies...",
  "Leveraging core competencies for maximum impact...",
  "Orchestrating seamless integration protocols...",
  "Executing strategic realignment procedures...",
  "Deploying next-generation analytics framework...",
  "Activating corporate intelligence systems..."
];

// Executive Progress Indicators
export const PROGRESS_INDICATORS = [
  { range: [0, 25], message: "Initiating strategic alignment", tone: "professional" },
  { range: [26, 50], message: "Building operational momentum", tone: "confident" },
  { range: [51, 75], message: "Approaching optimal performance", tone: "optimistic" },
  { range: [76, 90], message: "Delivering exceptional results", tone: "enthusiastic" },
  { range: [91, 100], message: "Exceeding all expectations", tone: "triumphant" }
];

// Corporate Incident Management Terminology
export const INCIDENT_TERMINOLOGY = {
  severity: {
    low: {
      corporate: "Minor process enhancement opportunity",
      executive: "Routine optimization initiative",
      meeting: "Small improvement identified",
      technical: "Low-impact performance variation"
    },
    medium: {
      corporate: "Strategic realignment in progress",
      executive: "Coordinated response initiative",
      meeting: "Cross-team collaboration activated",
      technical: "Moderate performance deviation"
    },
    high: {
      corporate: "Enterprise-wide coordination required",
      executive: "Executive oversight engaged",
      meeting: "All-hands optimization effort",
      technical: "Significant performance impact"
    },
    critical: {
      corporate: "Mission-critical response protocol",
      executive: "C-suite leadership activation",
      meeting: "Emergency stakeholder alignment",
      technical: "System-wide performance emergency"
    }
  },
  
  status: {
    investigating: "Conducting thorough analysis",
    identified: "Root cause successfully isolated",
    fixing: "Implementing strategic solution",
    monitoring: "Validating optimal performance",
    resolved: "Excellence restored and enhanced"
  }
};

// Humor Effectiveness Scoring System
export interface HumorEffectivenessMetrics {
  corporateRecognition: number; // 0-100: How universally recognized in corporate settings
  professionalAppropriateness: number; // 0-100: Suitable for executive presentation
  engineeringRelevance: number; // 0-100: Relevance to technical professionals
  meetingDisruptionMinimal: number; // 0-100: Won't derail productive meetings
  viralPotential: number; // 0-100: Likelihood of organic sharing
  executiveSafety: number; // 0-100: Safe for C-suite presentation
}

export const HUMOR_EFFECTIVENESS_THRESHOLDS = {
  executive_ready: 85, // Must score 85+ for C-suite presentation
  meeting_safe: 80,   // Must score 80+ for general meetings
  workplace_appropriate: 75, // Must score 75+ for workplace use
  engineering_relevant: 70,  // Must score 70+ for technical relevance
  viral_worthy: 85    // Must score 85+ for social sharing potential
};

// Corporate Buzzword Performance Categories
export const BUZZWORD_PERFORMANCE_CATEGORIES = [
  {
    name: "Classic Corporate Excellence",
    description: "Time-tested professional terminology with proven track record",
    examples: ["Synergy", "Leverage", "Best Practices", "Core Competencies"],
    targetEffectiveness: 95,
    appropriatenessLevel: "C-Suite Ready"
  },
  {
    name: "Virtual Meeting Mastery", 
    description: "Modern remote work terminology for digital-first professionals",
    examples: ["Can you see my screen?", "You're on mute", "Hybrid approach"],
    targetEffectiveness: 90,
    appropriatenessLevel: "Meeting Safe"
  },
  {
    name: "Innovation Leadership",
    description: "Forward-thinking terminology for technology-driven organizations",
    examples: ["Digital transformation", "Agile methodology", "Data-driven insights"],
    targetEffectiveness: 88,
    appropriatenessLevel: "Executive Appropriate"
  },
  {
    name: "Operational Excellence",
    description: "Process optimization and efficiency-focused professional language",
    examples: ["Continuous improvement", "Streamlined workflows", "Quality assurance"],
    targetEffectiveness: 92,
    appropriatenessLevel: "Management Ready"
  },
  {
    name: "Strategic Communications",
    description: "High-level planning and coordination terminology",
    examples: ["Strategic alignment", "Cross-functional collaboration", "Stakeholder engagement"],
    targetEffectiveness: 94,
    appropriatenessLevel: "Board Room Approved"
  }
];

export default {
  DASHBOARD_TERMINOLOGY,
  PERFORMANCE_STATUS_MESSAGES,
  ANALYTICS_CATEGORIES,
  LOADING_MESSAGES,
  PROGRESS_INDICATORS,
  INCIDENT_TERMINOLOGY,
  HUMOR_EFFECTIVENESS_THRESHOLDS,
  BUZZWORD_PERFORMANCE_CATEGORIES
};