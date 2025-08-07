// Enhanced Buzzword Library for Multiplayer Bingo
// Provides comprehensive corporate buzzword collection with categorization

export interface BuzzwordCategory {
  name: string;
  description: string;
  popularity: number; // 0-100, how often these appear in meetings
  painLevel: number; // 1-10, how annoying they are
}

export interface Buzzword {
  text: string;
  category: string;
  popularity: number;
  painLevel: number;
  variants?: string[]; // Alternative forms of the same buzzword
  context?: string; // When this is commonly used
}

// Buzzword categories with metadata
export const BUZZWORD_CATEGORIES: Record<string, BuzzwordCategory> = {
  strategy: {
    name: 'Strategy & Vision',
    description: 'High-level thinking and planning buzzwords',
    popularity: 90,
    painLevel: 7,
  },
  project: {
    name: 'Project Management',
    description: 'Meeting and project coordination terms',
    popularity: 95,
    painLevel: 8,
  },
  technology: {
    name: 'Technology & Innovation',
    description: 'Tech buzzwords and digital transformation',
    popularity: 85,
    painLevel: 6,
  },
  agile: {
    name: 'Agile & Development',
    description: 'Software development and agile methodology',
    popularity: 80,
    painLevel: 5,
  },
  business: {
    name: 'Business & Operations',
    description: 'General business and operational terms',
    popularity: 88,
    painLevel: 7,
  },
  communication: {
    name: 'Communication & Collaboration',
    description: 'Meeting speak and team collaboration',
    popularity: 92,
    painLevel: 9,
  },
  performance: {
    name: 'Performance & Quality',
    description: 'Metrics, KPIs, and quality assurance',
    popularity: 75,
    painLevel: 6,
  },
  culture: {
    name: 'Culture & HR',
    description: 'Human resources and company culture',
    popularity: 70,
    painLevel: 8,
  },
  finance: {
    name: 'Finance & Business',
    description: 'Financial and business model terminology',
    popularity: 65,
    painLevel: 5,
  },
  meetings: {
    name: 'Meeting Classics',
    description: 'The most common meeting phrases',
    popularity: 98,
    painLevel: 10,
  },
};

// Comprehensive buzzword library
export const CORPORATE_BUZZWORDS: Buzzword[] = [
  // Strategy & Vision
  {
    text: 'Synergy',
    category: 'strategy',
    popularity: 95,
    painLevel: 9,
    variants: ['Synergies', 'Synergistic', 'Synergize'],
    context: 'When combining teams or companies',
  },
  {
    text: 'Paradigm Shift',
    category: 'strategy',
    popularity: 85,
    painLevel: 8,
    variants: ['Paradigm Change', 'Shift in Paradigm'],
    context: 'Major strategic changes',
  },
  {
    text: 'Game Changer',
    category: 'strategy',
    popularity: 90,
    painLevel: 7,
    variants: ['Game Changing', 'Change the Game'],
    context: 'New products or strategies',
  },
  {
    text: 'Win-win',
    category: 'strategy',
    popularity: 88,
    painLevel: 6,
    variants: ['Win-win Situation', 'Mutual Win'],
    context: 'Negotiations and partnerships',
  },
  {
    text: 'Best Practice',
    category: 'strategy',
    popularity: 85,
    painLevel: 6,
    variants: ['Best Practices', 'Industry Best Practice'],
    context: 'Process improvement discussions',
  },
  {
    text: 'Core Competency',
    category: 'strategy',
    popularity: 75,
    painLevel: 7,
    variants: ['Core Competencies', 'Core Strength'],
    context: 'Strategic planning sessions',
  },
  {
    text: 'Value Proposition',
    category: 'strategy',
    popularity: 82,
    painLevel: 6,
    variants: ['Value Prop', 'Unique Value Proposition'],
    context: 'Marketing and sales discussions',
  },
  {
    text: 'Strategic Alignment',
    category: 'strategy',
    popularity: 78,
    painLevel: 7,
    variants: ['Align Strategically', 'Strategic Fit'],
    context: 'Organizational planning',
  },
  {
    text: 'Vision Statement',
    category: 'strategy',
    popularity: 70,
    painLevel: 5,
    variants: ['Company Vision', 'Strategic Vision'],
    context: 'Executive presentations',
  },
  {
    text: 'Mission Critical',
    category: 'strategy',
    popularity: 80,
    painLevel: 7,
    variants: ['Business Critical', 'Critical to Success'],
    context: 'Priority discussions',
  },

  // Project Management
  {
    text: 'Deep Dive',
    category: 'project',
    popularity: 95,
    painLevel: 9,
    variants: ['Dive Deep', 'Deep Dive Analysis'],
    context: 'When more analysis is needed',
  },
  {
    text: 'Circle Back',
    category: 'project',
    popularity: 98,
    painLevel: 10,
    variants: ['Circle Back On', 'Come Back To'],
    context: 'Postponing decisions',
  },
  {
    text: 'Touch Base',
    category: 'project',
    popularity: 92,
    painLevel: 8,
    variants: ['Touch Base With', 'Base Touch'],
    context: 'Follow-up meetings',
  },
  {
    text: 'Take it Offline',
    category: 'project',
    popularity: 90,
    painLevel: 8,
    variants: ['Take Offline', 'Discuss Offline'],
    context: 'Sidebar conversations needed',
  },
  {
    text: 'Loop In',
    category: 'project',
    popularity: 85,
    painLevel: 7,
    variants: ['Bring Into Loop', 'Keep In Loop'],
    context: 'Including stakeholders',
  },
  {
    text: 'Actionable Items',
    category: 'project',
    popularity: 88,
    painLevel: 6,
    variants: ['Action Items', 'Actionables'],
    context: 'Meeting conclusions',
  },
  {
    text: 'Deliverables',
    category: 'project',
    popularity: 82,
    painLevel: 5,
    variants: ['Deliverable', 'Key Deliverables'],
    context: 'Project planning',
  },
  {
    text: 'Milestones',
    category: 'project',
    popularity: 75,
    painLevel: 4,
    variants: ['Milestone', 'Key Milestones'],
    context: 'Project timelines',
  },
  {
    text: 'Timeline',
    category: 'project',
    popularity: 80,
    painLevel: 5,
    variants: ['Timelines', 'Project Timeline'],
    context: 'Scheduling discussions',
  },
  {
    text: 'Scope Creep',
    category: 'project',
    popularity: 70,
    painLevel: 6,
    variants: ['Feature Creep', 'Expanding Scope'],
    context: 'Project management issues',
  },

  // Technology & Innovation
  {
    text: 'Digital Transformation',
    category: 'technology',
    popularity: 95,
    painLevel: 8,
    variants: ['Digital Transform', 'Go Digital'],
    context: 'Technology modernization',
  },
  {
    text: 'Cloud Migration',
    category: 'technology',
    popularity: 85,
    painLevel: 6,
    variants: ['Move to Cloud', 'Cloud Adoption'],
    context: 'Infrastructure discussions',
  },
  {
    text: 'AI/ML Integration',
    category: 'technology',
    popularity: 90,
    painLevel: 7,
    variants: ['Artificial Intelligence', 'Machine Learning'],
    context: 'Innovation initiatives',
  },
  {
    text: 'DevOps',
    category: 'technology',
    popularity: 75,
    painLevel: 5,
    variants: ['Development Operations', 'DevOps Culture'],
    context: 'Software development',
  },
  {
    text: 'Microservices',
    category: 'technology',
    popularity: 70,
    painLevel: 6,
    variants: ['Microservice Architecture', 'Service-oriented'],
    context: 'Architecture discussions',
  },
  {
    text: 'API Gateway',
    category: 'technology',
    popularity: 65,
    painLevel: 4,
    variants: ['API Management', 'Service Gateway'],
    context: 'Technical architecture',
  },
  {
    text: 'Containerization',
    category: 'technology',
    popularity: 68,
    painLevel: 5,
    variants: ['Docker', 'Container Technology'],
    context: 'Deployment strategies',
  },
  {
    text: 'Infrastructure as Code',
    category: 'technology',
    popularity: 60,
    painLevel: 4,
    variants: ['IaC', 'Code-defined Infrastructure'],
    context: 'DevOps implementations',
  },
  {
    text: 'Technical Debt',
    category: 'technology',
    popularity: 72,
    painLevel: 6,
    variants: ['Tech Debt', 'Legacy Code Issues'],
    context: 'Code quality discussions',
  },
  {
    text: 'Scalability',
    category: 'technology',
    popularity: 78,
    painLevel: 5,
    variants: ['Scalable', 'Scale Out'],
    context: 'Performance planning',
  },

  // Agile & Development
  {
    text: 'Agile Transformation',
    category: 'agile',
    popularity: 85,
    painLevel: 7,
    variants: ['Agile Adoption', 'Going Agile'],
    context: 'Process improvement',
  },
  {
    text: 'Sprint Planning',
    category: 'agile',
    popularity: 75,
    painLevel: 5,
    variants: ['Sprint Plan', 'Iteration Planning'],
    context: 'Agile ceremonies',
  },
  {
    text: 'Retrospective',
    category: 'agile',
    popularity: 70,
    painLevel: 6,
    variants: ['Retro', 'Sprint Retrospective'],
    context: 'Team improvement sessions',
  },
  {
    text: 'Stand-up',
    category: 'agile',
    popularity: 80,
    painLevel: 6,
    variants: ['Daily Standup', 'Standup Meeting'],
    context: 'Daily team meetings',
  },
  {
    text: 'User Stories',
    category: 'agile',
    popularity: 72,
    painLevel: 5,
    variants: ['User Story', 'Story Points'],
    context: 'Requirements gathering',
  },
  {
    text: 'Acceptance Criteria',
    category: 'agile',
    popularity: 68,
    painLevel: 4,
    variants: ['Definition of Done', 'Acceptance Tests'],
    context: 'Requirements definition',
  },
  {
    text: 'Velocity',
    category: 'agile',
    popularity: 65,
    painLevel: 5,
    variants: ['Team Velocity', 'Sprint Velocity'],
    context: 'Performance metrics',
  },
  {
    text: 'Backlog Grooming',
    category: 'agile',
    popularity: 70,
    painLevel: 6,
    variants: ['Backlog Refinement', 'Story Grooming'],
    context: 'Requirements prioritization',
  },

  // Business & Operations
  {
    text: 'Low-hanging Fruit',
    category: 'business',
    popularity: 92,
    painLevel: 9,
    variants: ['Easy Wins', 'Quick Wins'],
    context: 'Identifying easy opportunities',
  },
  {
    text: 'Move the Needle',
    category: 'business',
    popularity: 88,
    painLevel: 8,
    variants: ['Needle Moving', 'Make an Impact'],
    context: 'Significant business impact',
  },
  {
    text: 'Think Outside the Box',
    category: 'business',
    popularity: 90,
    painLevel: 8,
    variants: ['Outside the Box Thinking', 'Creative Solutions'],
    context: 'Innovation brainstorming',
  },
  {
    text: 'Leverage',
    category: 'business',
    popularity: 95,
    painLevel: 8,
    variants: ['Leveraging', 'Utilize'],
    context: 'Using existing resources',
  },
  {
    text: 'Optimize',
    category: 'business',
    popularity: 85,
    painLevel: 6,
    variants: ['Optimization', 'Optimizing'],
    context: 'Process improvement',
  },
  {
    text: 'Streamline',
    category: 'business',
    popularity: 82,
    painLevel: 7,
    variants: ['Streamlining', 'Streamlined Process'],
    context: 'Efficiency improvements',
  },
  {
    text: 'Right-size',
    category: 'business',
    popularity: 75,
    painLevel: 7,
    variants: ['Right-sizing', 'Optimize Size'],
    context: 'Resource allocation',
  },
  {
    text: 'Scale Up',
    category: 'business',
    popularity: 80,
    painLevel: 6,
    variants: ['Scale', 'Scaling Up'],
    context: 'Growth initiatives',
  },
  {
    text: 'Pivot',
    category: 'business',
    popularity: 78,
    painLevel: 7,
    variants: ['Strategic Pivot', 'Business Pivot'],
    context: 'Strategy changes',
  },
  {
    text: 'Disrupt',
    category: 'business',
    popularity: 85,
    painLevel: 8,
    variants: ['Disruption', 'Market Disruption'],
    context: 'Innovation discussions',
  },

  // Communication & Collaboration
  {
    text: 'Ping Me',
    category: 'communication',
    popularity: 95,
    painLevel: 8,
    variants: ['Ping', 'Send Me a Ping'],
    context: 'Quick follow-up requests',
  },
  {
    text: 'Reach Out',
    category: 'communication',
    popularity: 90,
    painLevel: 7,
    variants: ['Reach Out To', 'Contact'],
    context: 'Making connections',
  },
  {
    text: 'Follow Up',
    category: 'communication',
    popularity: 88,
    painLevel: 6,
    variants: ['Follow-up', 'Following Up'],
    context: 'Post-meeting actions',
  },
  {
    text: 'On My Radar',
    category: 'communication',
    popularity: 82,
    painLevel: 7,
    variants: ['On the Radar', 'Radar Screen'],
    context: 'Awareness and tracking',
  },
  {
    text: 'Bandwidth',
    category: 'communication',
    popularity: 85,
    painLevel: 8,
    variants: ['Available Bandwidth', 'Limited Bandwidth'],
    context: 'Capacity discussions',
  },
  {
    text: 'Ideate',
    category: 'communication',
    popularity: 75,
    painLevel: 7,
    variants: ['Ideation', 'Brainstorm'],
    context: 'Creative sessions',
  },
  {
    text: 'Workshop',
    category: 'communication',
    popularity: 80,
    painLevel: 6,
    variants: ['Workshop It', 'Working Session'],
    context: 'Collaborative problem-solving',
  },

  // Meeting Classics
  {
    text: 'Let\'s Take This Offline',
    category: 'meetings',
    popularity: 98,
    painLevel: 10,
    variants: ['Take Offline', 'Offline Discussion'],
    context: 'Avoiding meeting derailment',
  },
  {
    text: 'Can Everyone See My Screen?',
    category: 'meetings',
    popularity: 99,
    painLevel: 9,
    variants: ['Screen Sharing', 'Can You See This?'],
    context: 'Virtual meeting technical issues',
  },
  {
    text: 'You\'re on Mute',
    category: 'meetings',
    popularity: 99,
    painLevel: 10,
    variants: ['Still Muted', 'Unmute Yourself'],
    context: 'Virtual meeting audio issues',
  },
  {
    text: 'Can You Repeat That?',
    category: 'meetings',
    popularity: 95,
    painLevel: 8,
    variants: ['Say That Again', 'Could You Repeat'],
    context: 'Communication breakdowns',
  },
  {
    text: 'I Have a Hard Stop',
    category: 'meetings',
    popularity: 90,
    painLevel: 7,
    variants: ['Hard Stop At', 'Time Constraint'],
    context: 'Meeting time limits',
  },
  {
    text: 'Thanks for Your Time',
    category: 'meetings',
    popularity: 85,
    painLevel: 5,
    variants: ['Thank You All', 'Thanks Everyone'],
    context: 'Meeting conclusions',
  },
  {
    text: 'Next Steps',
    category: 'meetings',
    popularity: 88,
    painLevel: 6,
    variants: ['Action Steps', 'Moving Forward'],
    context: 'Meeting wrap-up',
  },
  {
    text: 'At the End of the Day',
    category: 'meetings',
    popularity: 92,
    painLevel: 8,
    variants: ['Bottom Line', 'When All Is Said and Done'],
    context: 'Summary statements',
  },
  {
    text: 'It Is What It Is',
    category: 'meetings',
    popularity: 88,
    painLevel: 9,
    variants: ['That\'s Just How It Is', 'We Are Where We Are'],
    context: 'Accepting difficult situations',
  },
];

export class BuzzwordLibrary {
  private static instance: BuzzwordLibrary;
  private buzzwords: Buzzword[];
  private categorizedBuzzwords: Map<string, Buzzword[]>;

  constructor() {
    this.buzzwords = [...CORPORATE_BUZZWORDS];
    this.categorizedBuzzwords = new Map();
    this.initializeCategories();
  }

  static getInstance(): BuzzwordLibrary {
    if (!BuzzwordLibrary.instance) {
      BuzzwordLibrary.instance = new BuzzwordLibrary();
    }
    return BuzzwordLibrary.instance;
  }

  private initializeCategories(): void {
    this.buzzwords.forEach(buzzword => {
      const category = buzzword.category;
      if (!this.categorizedBuzzwords.has(category)) {
        this.categorizedBuzzwords.set(category, []);
      }
      this.categorizedBuzzwords.get(category)!.push(buzzword);
    });
  }

  /**
   * Get all buzzwords
   */
  getAllBuzzwords(): Buzzword[] {
    return [...this.buzzwords];
  }

  /**
   * Get buzzwords by category
   */
  getBuzzwordsByCategory(category: string): Buzzword[] {
    return this.categorizedBuzzwords.get(category) || [];
  }

  /**
   * Get random buzzwords for bingo card generation
   */
  getRandomBuzzwords(count: number, excludeCategories: string[] = []): Buzzword[] {
    let availableBuzzwords = this.buzzwords;
    
    if (excludeCategories.length > 0) {
      availableBuzzwords = this.buzzwords.filter(
        buzzword => !excludeCategories.includes(buzzword.category)
      );
    }

    // Shuffle and select
    const shuffled = [...availableBuzzwords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get weighted random buzzwords (higher popularity = higher chance)
   */
  getWeightedRandomBuzzwords(count: number, excludeCategories: string[] = []): Buzzword[] {
    let availableBuzzwords = this.buzzwords;
    
    if (excludeCategories.length > 0) {
      availableBuzzwords = this.buzzwords.filter(
        buzzword => !excludeCategories.includes(buzzword.category)
      );
    }

    const selected: Buzzword[] = [];
    const remaining = [...availableBuzzwords];

    while (selected.length < count && remaining.length > 0) {
      // Calculate total weight
      const totalWeight = remaining.reduce((sum, buzzword) => sum + buzzword.popularity, 0);
      
      // Random selection based on weight
      let random = Math.random() * totalWeight;
      let selectedIndex = 0;
      
      for (let i = 0; i < remaining.length; i++) {
        random -= remaining[i].popularity;
        if (random <= 0) {
          selectedIndex = i;
          break;
        }
      }
      
      selected.push(remaining[selectedIndex]);
      remaining.splice(selectedIndex, 1);
    }

    return selected;
  }

  /**
   * Get buzzwords that commonly appear together
   */
  getRelatedBuzzwords(buzzword: Buzzword, maxCount: number = 3): Buzzword[] {
    // Get buzzwords from same category
    const sameCategory = this.getBuzzwordsByCategory(buzzword.category)
      .filter(b => b.text !== buzzword.text)
      .slice(0, maxCount);

    // If not enough, add high-popularity buzzwords from other categories
    if (sameCategory.length < maxCount) {
      const others = this.buzzwords
        .filter(b => b.category !== buzzword.category && b.popularity >= 80)
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, maxCount - sameCategory.length);
      
      return [...sameCategory, ...others];
    }

    return sameCategory;
  }

  /**
   * Get category statistics
   */
  getCategoryStats(): Array<{
    category: string;
    name: string;
    count: number;
    averagePopularity: number;
    averagePainLevel: number;
  }> {
    return Array.from(this.categorizedBuzzwords.entries()).map(([category, buzzwords]) => {
      const categoryInfo = BUZZWORD_CATEGORIES[category];
      const avgPopularity = buzzwords.reduce((sum, b) => sum + b.popularity, 0) / buzzwords.length;
      const avgPainLevel = buzzwords.reduce((sum, b) => sum + b.painLevel, 0) / buzzwords.length;

      return {
        category,
        name: categoryInfo?.name || category,
        count: buzzwords.length,
        averagePopularity: Math.round(avgPopularity),
        averagePainLevel: Math.round(avgPainLevel * 10) / 10,
      };
    });
  }

  /**
   * Find buzzwords matching text (for search/filtering)
   */
  searchBuzzwords(query: string): Buzzword[] {
    const lowercaseQuery = query.toLowerCase();
    return this.buzzwords.filter(buzzword => 
      buzzword.text.toLowerCase().includes(lowercaseQuery) ||
      buzzword.context?.toLowerCase().includes(lowercaseQuery) ||
      buzzword.variants?.some(variant => 
        variant.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  /**
   * Get the most painful buzzwords (highest pain level)
   */
  getMostPainfulBuzzwords(count: number = 10): Buzzword[] {
    return [...this.buzzwords]
      .sort((a, b) => b.painLevel - a.painLevel)
      .slice(0, count);
  }

  /**
   * Get the most popular buzzwords (highest usage)
   */
  getMostPopularBuzzwords(count: number = 10): Buzzword[] {
    return [...this.buzzwords]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, count);
  }

  /**
   * Create a themed bingo card (focus on specific categories)
   */
  createThemedCard(theme: 'meetings' | 'technology' | 'agile' | 'strategy', cardSize: number = 24): Buzzword[] {
    const themeMapping = {
      meetings: ['meetings', 'communication', 'project'],
      technology: ['technology', 'agile'],
      agile: ['agile', 'project'],
      strategy: ['strategy', 'business'],
    };

    const categories = themeMapping[theme] || ['meetings'];
    const themeBuzzwords = categories.flatMap(cat => this.getBuzzwordsByCategory(cat));
    
    // If not enough themed buzzwords, supplement with popular ones
    if (themeBuzzwords.length < cardSize) {
      const supplementary = this.getMostPopularBuzzwords(cardSize)
        .filter(b => !themeBuzzwords.some(tb => tb.text === b.text));
      return [...themeBuzzwords, ...supplementary].slice(0, cardSize);
    }

    return this.getWeightedRandomBuzzwords(cardSize, []).filter(b => 
      categories.includes(b.category)
    ).slice(0, cardSize);
  }
}