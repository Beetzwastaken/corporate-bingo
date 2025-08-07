// Dashboard Visual Content Strategy
// Professional graphics and visual humor for executive-level presentation

export interface DashboardVisualTheme {
  id: string;
  name: string;
  description: string;
  executiveAppropriate: boolean;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
    background: string;
    text: string;
  };
  corporateHumorLevel: number; // 0-100
  professionalGrade: number; // 0-100
}

export interface PerformanceVisualizationConfig {
  metricType: string;
  visualStyle: 'gauge' | 'chart' | 'indicator' | 'infographic';
  corporateMetaphor: string;
  executiveTitle: string;
  humorContext: string;
  svgPrompt: string;
  appropriatenessScore: number;
}

export interface StatusIconConfig {
  status: 'excellent' | 'good' | 'warning' | 'critical' | 'offline';
  corporateIcon: string;
  executiveDescription: string;
  humorContext: string;
  svgGeneration: {
    prompt: string;
    style: 'professional' | 'corporate' | 'minimal';
    colors: string[];
  };
}

// Executive-Appropriate Visual Themes
export const DASHBOARD_VISUAL_THEMES: DashboardVisualTheme[] = [
  {
    id: 'corporate-excellence',
    name: 'Corporate Excellence',
    description: 'Sophisticated professional design with subtle humor elements',
    executiveAppropriate: true,
    colorScheme: {
      primary: '#1E40AF',    // Professional blue
      secondary: '#6B7280',  // Corporate gray
      accent: '#059669',     // Success green
      success: '#10B981',    // Achievement green
      warning: '#F59E0B',    // Attention amber
      danger: '#EF4444',     // Executive red
      background: '#F8FAFC', // Clean white
      text: '#1F2937'        // Professional dark
    },
    corporateHumorLevel: 85,
    professionalGrade: 98
  },
  {
    id: 'executive-dashboard',
    name: 'C-Suite Ready',
    description: 'Board-room appropriate with maximum professional polish',
    executiveAppropriate: true,
    colorScheme: {
      primary: '#1D4ED8',
      secondary: '#374151',
      accent: '#0D9488',
      success: '#059669',
      warning: '#D97706',
      danger: '#DC2626',
      background: '#FFFFFF',
      text: '#111827'
    },
    corporateHumorLevel: 90,
    professionalGrade: 99
  },
  {
    id: 'innovation-leadership',
    name: 'Innovation Hub',
    description: 'Modern tech-forward design with strategic corporate messaging',
    executiveAppropriate: true,
    colorScheme: {
      primary: '#2563EB',
      secondary: '#4B5563',
      accent: '#0891B2',
      success: '#0F766E',
      warning: '#EA580C',
      danger: '#BE123C',
      background: '#F1F5F9',
      text: '#0F172A'
    },
    corporateHumorLevel: 82,
    professionalGrade: 96
  }
];

// Performance Visualization Configurations
export const PERFORMANCE_VISUALIZATIONS: PerformanceVisualizationConfig[] = [
  {
    metricType: 'meeting_survival_rate',
    visualStyle: 'gauge',
    corporateMetaphor: 'Corporate Engagement Thermometer',
    executiveTitle: 'Meeting Participation Excellence',
    humorContext: 'How well our team survives corporate gatherings',
    svgPrompt: 'Professional gauge showing meeting survival rate, corporate blue theme, clean minimal design with subtle humor elements, executive appropriate',
    appropriatenessScore: 96
  },
  {
    metricType: 'buzzword_velocity',
    visualStyle: 'chart',
    corporateMetaphor: 'Communication Efficiency Accelerator',
    executiveTitle: 'Strategic Terminology Adoption Rate',
    humorContext: 'Speed of corporate language integration',
    svgPrompt: 'Modern line chart showing buzzword velocity trends, professional corporate styling, clean data visualization, suitable for C-suite presentation',
    appropriatenessScore: 94
  },
  {
    metricType: 'peak_corporate_hours',
    visualStyle: 'infographic',
    corporateMetaphor: 'Prime Time Performance Matrix',
    executiveTitle: 'Optimal Engagement Windows',
    humorContext: 'When corporate magic happens most efficiently',
    svgPrompt: 'Clean infographic showing peak usage hours, corporate color scheme, professional data presentation with subtle corporate humor',
    appropriatenessScore: 92
  },
  {
    metricType: 'c_suite_engagement',
    visualStyle: 'indicator',
    corporateMetaphor: 'Executive Satisfaction Barometer',
    executiveTitle: 'Leadership Engagement Index',
    humorContext: 'How much executives love our corporate entertainment',
    svgPrompt: 'Elegant executive dashboard indicator, sophisticated design, corporate blues and grays, board-room ready presentation',
    appropriatenessScore: 98
  },
  {
    metricType: 'system_excellence',
    visualStyle: 'gauge',
    corporateMetaphor: 'Operational Perfection Meter',
    executiveTitle: 'Enterprise System Health',
    humorContext: 'Our commitment to bulletproof corporate infrastructure',
    svgPrompt: 'Professional system health gauge, corporate excellence theme, clean technical visualization, executive appropriate',
    appropriatenessScore: 97
  }
];

// Status Icons with Corporate Personality
export const STATUS_ICONS: StatusIconConfig[] = [
  {
    status: 'excellent',
    corporateIcon: 'trophy-excellence',
    executiveDescription: 'Exceeding All Expectations',
    humorContext: 'Operating like a well-oiled corporate machine',
    svgGeneration: {
      prompt: 'Professional trophy icon with corporate styling, gold and blue colors, subtle success celebration, executive appropriate',
      style: 'professional',
      colors: ['#FFD700', '#1E40AF', '#059669']
    }
  },
  {
    status: 'good',
    corporateIcon: 'thumbs-up-professional',
    executiveDescription: 'Meeting Strategic Objectives',
    humorContext: 'Corporate happiness achieved',
    svgGeneration: {
      prompt: 'Clean thumbs up icon with professional styling, corporate blue theme, positive business indicator',
      style: 'corporate',
      colors: ['#1E40AF', '#10B981', '#F8FAFC']
    }
  },
  {
    status: 'warning',
    corporateIcon: 'attention-corporate',
    executiveDescription: 'Strategic Realignment In Progress',
    humorContext: 'Minor corporate headwinds detected',
    svgGeneration: {
      prompt: 'Professional attention icon, corporate warning styling, amber and blue corporate colors, executive friendly',
      style: 'professional',
      colors: ['#F59E0B', '#1E40AF', '#6B7280']
    }
  },
  {
    status: 'critical',
    corporateIcon: 'escalation-protocol',
    executiveDescription: 'Executive Oversight Engaged',
    humorContext: 'All hands on deck for corporate excellence',
    svgGeneration: {
      prompt: 'Professional escalation icon, corporate red and blue theme, serious but controlled, C-suite appropriate',
      style: 'corporate',
      colors: ['#EF4444', '#1E40AF', '#374151']
    }
  },
  {
    status: 'offline',
    corporateIcon: 'connectivity-pause',
    executiveDescription: 'Temporary Communication Gap',
    humorContext: 'Corporate connectivity timeout',
    svgGeneration: {
      prompt: 'Clean offline indicator icon, professional gray and blue styling, temporary status indication, executive appropriate',
      style: 'minimal',
      colors: ['#6B7280', '#1E40AF', '#F3F4F6']
    }
  }
];

// Corporate Loading Animation Concepts
export const LOADING_ANIMATIONS = [
  {
    name: 'strategic-alignment',
    description: 'Circular arrows forming corporate synergy',
    corporateContext: 'Aligning stakeholder perspectives',
    svgPrompt: 'Professional loading animation with circular arrows, corporate blue theme, clean minimal design, executive appropriate'
  },
  {
    name: 'data-synthesis',
    description: 'Data points converging into insights',
    corporateContext: 'Synthesizing actionable intelligence',
    svgPrompt: 'Clean data visualization loading animation, professional corporate styling, blue and gray color scheme'
  },
  {
    name: 'excellence-calibration',
    description: 'Precision measurement indicators',
    corporateContext: 'Calibrating performance excellence',
    svgPrompt: 'Professional calibration animation, corporate gauge elements, sophisticated blue and gold styling'
  }
];

// Executive Color Palettes for Different Contexts
export const EXECUTIVE_COLOR_PALETTES = {
  board_room: {
    primary: '#1E40AF',
    secondary: '#374151',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    neutral: '#F8FAFC'
  },
  quarterly_review: {
    primary: '#2563EB',
    secondary: '#4B5563',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    neutral: '#F1F5F9'
  },
  strategic_planning: {
    primary: '#1D4ED8',
    secondary: '#6B7280',
    success: '#0D9488',
    warning: '#EA580C',
    danger: '#BE123C',
    neutral: '#FFFFFF'
  }
};

// Professional Infographic Elements
export const INFOGRAPHIC_ELEMENTS = [
  {
    type: 'corporate_arrow_growth',
    usage: 'Performance improvement trends',
    description: 'Upward trending arrow with corporate styling',
    humorContext: 'Success trajectory visualization',
    svgPrompt: 'Professional upward arrow with corporate styling, growth indicator, executive blue and gold colors'
  },
  {
    type: 'stakeholder_collaboration',
    usage: 'Team engagement metrics',
    description: 'Connected professionals illustration',
    humorContext: 'Corporate teamwork visualization',
    svgPrompt: 'Clean illustration of connected business professionals, corporate collaboration theme, professional styling'
  },
  {
    type: 'excellence_badge',
    usage: 'Achievement indicators',
    description: 'Professional achievement emblem',
    humorContext: 'Corporate success celebration',
    svgPrompt: 'Professional achievement badge, corporate excellence theme, gold and blue styling, C-suite appropriate'
  },
  {
    type: 'innovation_lightbulb',
    usage: 'Creative solution indicators',
    description: 'Modern innovation symbol',
    humorContext: 'Breakthrough thinking visualization',
    svgPrompt: 'Contemporary lightbulb icon, innovation theme, corporate blue and gold colors, professional styling'
  }
];

// Dashboard Layout Configurations
export const DASHBOARD_LAYOUTS = {
  executive_summary: {
    name: 'Executive Summary View',
    description: 'High-level overview for C-suite consumption',
    components: ['key_metrics', 'status_indicators', 'trend_overview'],
    humorLevel: 95, // Maximum professional appropriateness
    complexity: 'minimal'
  },
  operational_details: {
    name: 'Operational Excellence View',
    description: 'Detailed metrics for operational managers',
    components: ['detailed_charts', 'performance_breakdowns', 'system_health'],
    humorLevel: 88, // Professional with subtle humor
    complexity: 'moderate'
  },
  technical_insights: {
    name: 'Technical Performance View',
    description: 'Engineering-focused metrics and system details',
    components: ['technical_metrics', 'system_diagnostics', 'performance_graphs'],
    humorLevel: 85, // Engineering humor appropriate
    complexity: 'detailed'
  }
};

// Content Effectiveness Tracking
export interface ContentEffectivenessMetrics {
  visualElement: string;
  executiveApproval: number; // 0-100
  professionalRecognition: number; // 0-100
  corporateAppropriateHumor: number; // 0-100
  shareability: number; // 0-100
  engagementRate: number; // 0-100
  brandAlignment: number; // 0-100
}

export const CONTENT_EFFECTIVENESS_TARGETS = {
  executive_presentation: {
    minApproval: 90,
    maxHumor: 95,
    minProfessionalism: 95,
    targetEngagement: 85
  },
  team_meetings: {
    minApproval: 80,
    maxHumor: 90,
    minProfessionalism: 85,
    targetEngagement: 90
  },
  corporate_sharing: {
    minApproval: 85,
    maxHumor: 92,
    minProfessionalism: 88,
    targetEngagement: 95
  }
};

export default {
  DASHBOARD_VISUAL_THEMES,
  PERFORMANCE_VISUALIZATIONS,
  STATUS_ICONS,
  LOADING_ANIMATIONS,
  EXECUTIVE_COLOR_PALETTES,
  INFOGRAPHIC_ELEMENTS,
  DASHBOARD_LAYOUTS,
  CONTENT_EFFECTIVENESS_TARGETS
};