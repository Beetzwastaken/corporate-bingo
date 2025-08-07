// Bingo game engine for corporate buzzword bingo

export interface BingoSquare {
  id: string;
  text: string;
  isMarked: boolean;
  isFree?: boolean;
}

export interface BingoResult {
  hasWon: boolean;
  winningPattern?: 'row' | 'column' | 'diagonal';
  winningCells?: number[];
}

// Comprehensive corporate buzzword library
export const CORPORATE_BUZZWORDS = [
  // Strategy & Vision
  'Synergy', 'Paradigm Shift', 'Game Changer', 'Win-win', 'Best Practice',
  'Core Competency', 'Value Proposition', 'Strategic Alignment', 'Vision Statement',
  'Mission Critical', 'Key Performance Indicator', 'Return on Investment',
  
  // Project Management
  'Deep Dive', 'Circle Back', 'Touch Base', 'Take it Offline', 'Loop In',
  'Actionable Items', 'Deliverables', 'Milestones', 'Timeline', 'Scope Creep',
  'Resource Allocation', 'Risk Mitigation', 'Stakeholder Buy-in',
  
  // Technology & Innovation
  'Digital Transformation', 'Cloud Migration', 'AI/ML Integration', 'DevOps',
  'Microservices', 'API Gateway', 'Containerization', 'Kubernetes',
  'Infrastructure as Code', 'CI/CD Pipeline', 'Serverless', 'Edge Computing',
  'Technical Debt', 'Scalability', 'Automation', 'Legacy System',
  
  // Agile & Development
  'Agile Transformation', 'Sprint Planning', 'Retrospective', 'Stand-up',
  'User Stories', 'Acceptance Criteria', 'Definition of Done', 'Velocity',
  'Backlog Grooming', 'Cross-functional Team', 'Scrum Master', 'Product Owner',
  
  // Business & Operations
  'Low-hanging Fruit', 'Move the Needle', 'Think Outside the Box', 'Leverage',
  'Optimize', 'Streamline', 'Right-size', 'Scale Up', 'Pivot', 'Disrupt',
  'Innovation', 'Growth Hacking', 'Market Penetration', 'Competitive Advantage',
  
  // Communication & Collaboration
  'Ping Me', 'Reach Out', 'Follow Up', 'Keep in Mind', 'FYI', 'Heads Up',
  'On My Radar', 'Bandwidth', 'Capacity', 'Ideate', 'Brainstorm', 'Workshop',
  'Knowledge Share', 'Best Practices', 'Lessons Learned', 'Post-mortem',
  
  // Performance & Quality
  'Metrics-driven', 'Data-driven', 'KPI', 'SLA', 'Quality Assurance',
  'Continuous Improvement', 'Excellence', 'Standard Operating Procedure',
  'Benchmarking', 'Performance Optimization', 'Efficiency Gains',
  
  // Culture & HR
  'Culture Fit', 'Team Player', 'Proactive', 'Own It', 'Drive Results',
  'Customer-centric', 'Solution-focused', 'Results-oriented', 'Self-starter',
  'Detail-oriented', 'Fast-paced Environment', 'Wear Many Hats', 'Hit the Ground Running',
  
  // Finance & Business
  'Cost Center', 'Profit Center', 'Budget Allocation', 'Cost Optimization',
  'Revenue Stream', 'Business Model', 'Market Share', 'Customer Acquisition',
  'Retention Rate', 'Conversion Funnel', 'Unit Economics', 'Burn Rate',
  
  // Meeting Classics
  'Let\'s Take This Offline', 'Can Everyone See My Screen?', 'You\'re on Mute',
  'Can You Repeat That?', 'Let\'s Circle Back', 'I Have a Hard Stop',
  'Thanks for Your Time', 'Action Items', 'Next Steps', 'Moving Forward',
  'At the End of the Day', 'It Is What It Is', 'Think Out Loud'
];

export class BingoEngine {
  /**
   * Generate a new bingo card with random buzzwords
   */
  static generateCard(): BingoSquare[] {
    const shuffled = [...CORPORATE_BUZZWORDS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 24); // 24 + 1 free space = 25
    
    const card: BingoSquare[] = [];
    
    for (let i = 0; i < 25; i++) {
      if (i === 12) { // Center square (free space)
        card.push({
          id: `square-${i}`,
          text: 'FREE SPACE',
          isMarked: true,
          isFree: true
        });
      } else {
        const textIndex = i < 12 ? i : i - 1;
        card.push({
          id: `square-${i}`,
          text: selected[textIndex],
          isMarked: false
        });
      }
    }
    
    return card;
  }

  /**
   * Check if the current card has a bingo
   */
  static checkBingo(squares: BingoSquare[]): BingoResult {
    // Check rows
    for (let row = 0; row < 5; row++) {
      const rowStart = row * 5;
      const rowSquares = squares.slice(rowStart, rowStart + 5);
      if (rowSquares.every(square => square.isMarked)) {
        return {
          hasWon: true,
          winningPattern: 'row',
          winningCells: Array.from({ length: 5 }, (_, i) => rowStart + i)
        };
      }
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
      const colSquares = squares.filter((_, index) => index % 5 === col);
      if (colSquares.every(square => square.isMarked)) {
        return {
          hasWon: true,
          winningPattern: 'column',
          winningCells: Array.from({ length: 5 }, (_, i) => i * 5 + col)
        };
      }
    }
    
    // Check diagonals
    const diagonal1Indices = [0, 6, 12, 18, 24];
    const diagonal2Indices = [4, 8, 12, 16, 20];
    
    const diagonal1 = diagonal1Indices.map(i => squares[i]);
    const diagonal2 = diagonal2Indices.map(i => squares[i]);
    
    if (diagonal1.every(square => square.isMarked)) {
      return {
        hasWon: true,
        winningPattern: 'diagonal',
        winningCells: diagonal1Indices
      };
    }
    
    if (diagonal2.every(square => square.isMarked)) {
      return {
        hasWon: true,
        winningPattern: 'diagonal',
        winningCells: diagonal2Indices
      };
    }
    
    return { hasWon: false };
  }

  /**
   * Calculate completion percentage of the card
   */
  static getCompletionPercentage(squares: BingoSquare[]): number {
    const markedCount = squares.filter(square => square.isMarked).length;
    return (markedCount / squares.length) * 100;
  }

  /**
   * Get statistics about marked squares
   */
  static getSquareStats(squares: BingoSquare[]) {
    const marked = squares.filter(s => s.isMarked && !s.isFree);
    const total = squares.filter(s => !s.isFree).length;
    
    return {
      marked: marked.length,
      total,
      percentage: (marked.length / total) * 100,
      remaining: total - marked.length
    };
  }

  /**
   * Suggest squares that are commonly marked together
   */
  static getSuggestedSquares(squares: BingoSquare[]): string[] {
    const markedTexts = squares
      .filter(s => s.isMarked && !s.isFree)
      .map(s => s.text);
    
    // Common combinations in corporate meetings
    const combinations = [
      ['Synergy', 'Paradigm Shift', 'Game Changer'],
      ['Deep Dive', 'Circle Back', 'Touch Base'],
      ['AI/ML Integration', 'Digital Transformation', 'Cloud Migration'],
      ['Agile Transformation', 'Sprint Planning', 'Stand-up'],
      ['Low-hanging Fruit', 'Move the Needle', 'Think Outside the Box']
    ];
    
    const suggestions: string[] = [];
    
    for (const combo of combinations) {
      const markedInCombo = combo.filter(term => markedTexts.includes(term));
      if (markedInCombo.length > 0) {
        const unmarked = combo.filter(term => 
          !markedTexts.includes(term) && 
          squares.some(s => s.text === term && !s.isMarked)
        );
        suggestions.push(...unmarked);
      }
    }
    
    return [...new Set(suggestions)].slice(0, 3); // Return unique suggestions
  }
}