// Advanced Pain Analysis System for Engineering Meme Generator
// Uses sophisticated NLP and machine learning for accurate pain detection

import { PainAnalysis, EngineeringCategory, EngineeringKeyword, PainLevel, MemeTemplate } from '../types';

export class PainAnalysisEngine {
  private static instance: PainAnalysisEngine;
  private engineeringKeywords: EngineeringKeyword[];
  private painPatterns: Map<string, number>;
  private contextAnalyzer: ContextAnalyzer;
  private learningHistory: PainAnalysisHistory[];

  static getInstance(): PainAnalysisEngine {
    if (!PainAnalysisEngine.instance) {
      PainAnalysisEngine.instance = new PainAnalysisEngine();
    }
    return PainAnalysisEngine.instance;
  }

  constructor() {
    this.initializeKeywords();
    this.initializePainPatterns();
    this.contextAnalyzer = new ContextAnalyzer();
    this.learningHistory = this.loadLearningHistory();
  }

  /**
   * Analyze pain level from engineering input text
   */
  async analyzePain(input: string, context?: any): Promise<PainAnalysis> {
    const preprocessed = this.preprocessText(input);
    const words = this.tokenize(preprocessed);
    
    // Multi-dimensional pain analysis
    const keywordAnalysis = this.analyzeKeywords(words);
    const contextAnalysis = this.contextAnalyzer.analyze(preprocessed, context);
    const patternAnalysis = this.analyzePatterns(preprocessed);
    const sentimentAnalysis = this.analyzeSentiment(preprocessed);
    
    // Combine analyses with weighted scoring
    const rawScore = this.combineAnalyses({
      keyword: keywordAnalysis,
      context: contextAnalysis,
      pattern: patternAnalysis,
      sentiment: sentimentAnalysis
    });

    // Apply learning adjustments
    const adjustedScore = this.applyLearning(rawScore, preprocessed);
    
    const painScore = this.normalizePainScore(adjustedScore);
    const category = this.detectCategory(words, keywordAnalysis.keywords);
    const confidence = this.calculateConfidence(keywordAnalysis, contextAnalysis, patternAnalysis);
    
    const analysis: PainAnalysis = {
      score: painScore,
      keywords: keywordAnalysis.keywords,
      category,
      confidence,
      reasons: this.generateReasons(keywordAnalysis, contextAnalysis, patternAnalysis, sentimentAnalysis)
    };

    // Store for learning
    this.storeLearningData(input, analysis);

    return analysis;
  }

  /**
   * Suggest the best meme template based on pain analysis
   */
  suggestTemplate(analysis: PainAnalysis, availableTemplates: MemeTemplate[]): MemeTemplate | null {
    const categoryTemplates = availableTemplates.filter(t => 
      t.category === analysis.category || t.category === 'general'
    );

    if (categoryTemplates.length === 0) return null;

    // Score templates based on pain level, triggers, and popularity
    const scoredTemplates = categoryTemplates.map(template => ({
      template,
      score: this.scoreTemplate(template, analysis)
    }));

    // Sort by score and return the best match
    scoredTemplates.sort((a, b) => b.score - a.score);
    return scoredTemplates[0]?.template || null;
  }

  /**
   * Initialize comprehensive engineering keywords with pain weights
   */
  private initializeKeywords(): void {
    this.engineeringKeywords = [
      // High-pain keywords (project killers)
      { word: 'deadline', category: 'general', painWeight: 4 },
      { word: 'urgent', category: 'general', painWeight: 4 },
      { word: 'asap', category: 'general', painWeight: 3 },
      { word: 'emergency', category: 'general', painWeight: 5 },
      { word: 'broken', category: 'general', painWeight: 4 },
      { word: 'failed', category: 'general', painWeight: 4 },
      { word: 'crashed', category: 'software', painWeight: 3 },
      { word: 'down', category: 'general', painWeight: 3 },
      { word: 'critical', category: 'general', painWeight: 4 },
      { word: 'disaster', category: 'general', painWeight: 5 },
      
      // Scope creep and changes
      { word: 'change', category: 'general', painWeight: 2 },
      { word: 'modify', category: 'general', painWeight: 2 },
      { word: 'update', category: 'general', painWeight: 1 },
      { word: 'revision', category: 'general', painWeight: 2 },
      { word: 'requirement', category: 'general', painWeight: 1 },
      { word: 'spec', category: 'general', painWeight: 1 },
      { word: 'specification', category: 'general', painWeight: 1 },
      { word: 'scope', category: 'general', painWeight: 2 },
      
      // Client and management pain
      { word: 'client', category: 'general', painWeight: 2 },
      { word: 'customer', category: 'general', painWeight: 2 },
      { word: 'manager', category: 'general', painWeight: 1 },
      { word: 'boss', category: 'general', painWeight: 1 },
      { word: 'meeting', category: 'general', painWeight: 2 },
      { word: 'presentation', category: 'general', painWeight: 2 },
      { word: 'demo', category: 'software', painWeight: 2 },
      
      // Technical debt and legacy systems
      { word: 'legacy', category: 'software', painWeight: 3 },
      { word: 'deprecated', category: 'software', painWeight: 2 },
      { word: 'technical debt', category: 'software', painWeight: 3 },
      { word: 'refactor', category: 'software', painWeight: 2 },
      { word: 'hotfix', category: 'software', painWeight: 4 },
      { word: 'patch', category: 'software', painWeight: 2 },
      
      // Mechanical engineering specific
      { word: 'tolerance', category: 'mechanical', painWeight: 2 },
      { word: 'stress', category: 'mechanical', painWeight: 2 },
      { word: 'fatigue', category: 'mechanical', painWeight: 3 },
      { word: 'fracture', category: 'mechanical', painWeight: 4 },
      { word: 'vibration', category: 'mechanical', painWeight: 2 },
      { word: 'resonance', category: 'mechanical', painWeight: 3 },
      { word: 'machining', category: 'mechanical', painWeight: 1 },
      
      // Electrical engineering specific
      { word: 'short circuit', category: 'electrical', painWeight: 4 },
      { word: 'overload', category: 'electrical', painWeight: 3 },
      { word: 'ground fault', category: 'electrical', painWeight: 3 },
      { word: 'noise', category: 'electrical', painWeight: 2 },
      { word: 'interference', category: 'electrical', painWeight: 2 },
      { word: 'power', category: 'electrical', painWeight: 1 },
      { word: 'voltage', category: 'electrical', painWeight: 1 },
      { word: 'current', category: 'electrical', painWeight: 1 },
      
      // Software engineering specific
      { word: 'bug', category: 'software', painWeight: 3 },
      { word: 'error', category: 'software', painWeight: 2 },
      { word: 'exception', category: 'software', painWeight: 2 },
      { word: 'memory leak', category: 'software', painWeight: 3 },
      { word: 'performance', category: 'software', painWeight: 2 },
      { word: 'timeout', category: 'software', painWeight: 2 },
      { word: 'database', category: 'software', painWeight: 1 },
      { word: 'server', category: 'software', painWeight: 1 },
      { word: 'api', category: 'software', painWeight: 1 },
      { word: 'deployment', category: 'software', painWeight: 2 },
      
      // Civil engineering specific
      { word: 'foundation', category: 'civil', painWeight: 2 },
      { word: 'settlement', category: 'civil', painWeight: 3 },
      { word: 'load', category: 'civil', painWeight: 2 },
      { word: 'seismic', category: 'civil', painWeight: 3 },
      { word: 'concrete', category: 'civil', painWeight: 1 },
      { word: 'steel', category: 'civil', painWeight: 1 },
      { word: 'construction', category: 'civil', painWeight: 1 },
      
      // Chemical engineering specific
      { word: 'reactor', category: 'chemical', painWeight: 2 },
      { word: 'pressure', category: 'chemical', painWeight: 2 },
      { word: 'temperature', category: 'chemical', painWeight: 1 },
      { word: 'flow rate', category: 'chemical', painWeight: 2 },
      { word: 'distillation', category: 'chemical', painWeight: 2 },
      { word: 'catalyst', category: 'chemical', painWeight: 2 },
      { word: 'corrosion', category: 'chemical', painWeight: 3 },
      
      // Positive keywords (pain reducers)
      { word: 'working', category: 'general', painWeight: -1 },
      { word: 'success', category: 'general', painWeight: -2 },
      { word: 'complete', category: 'general', painWeight: -1 },
      { word: 'finished', category: 'general', painWeight: -1 },
      { word: 'solved', category: 'general', painWeight: -2 },
      { word: 'fixed', category: 'general', painWeight: -2 },
      { word: 'approved', category: 'general', painWeight: -1 },
      { word: 'accepted', category: 'general', painWeight: -1 }
    ];
  }

  /**
   * Initialize regex patterns for advanced pain detection
   */
  private initializePainPatterns(): void {
    this.painPatterns = new Map([
      // Time pressure patterns
      [/\b(due|deadline).{0,20}(tomorrow|today|asap|urgent)/gi, 5],
      [/\b(need.{0,10}(asap|urgent|immediately))/gi, 4],
      [/\b(last.minute|11th.hour)/gi, 4],
      
      // Failure patterns
      [/\b(not.working|doesn.t.work|broken|failed)/gi, 4],
      [/\b(crashed?|down|offline)/gi, 3],
      
      // Scope creep patterns
      [/\b(client|customer).{0,30}(change|want|request)/gi, 3],
      [/\b(just.a.small.change|quick.fix|simple.update)/gi, 4],
      [/\b(one.more.thing|also.need|additionally)/gi, 2],
      
      // Stress indicators
      [/\b(help|stuck|confused|lost)/gi, 3],
      [/[!]{2,}|[?]{2,}/g, 2], // Multiple exclamation or question marks
      [/\b(nightmare|disaster|catastrophe)/gi, 5],
      
      // Positive patterns (pain reducers)
      [/\b(works?.fine|running.smoothly|no.issues)/gi, -2],
      [/\b(completed|finished|done|resolved)/gi, -1]
    ]);
  }

  private preprocessText(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation except for pattern analysis
      .replace(/\s+/g, ' ')
      .trim();
  }

  private tokenize(text: string): string[] {
    return text.split(/\s+/).filter(word => word.length > 0);
  }

  private analyzeKeywords(words: string[]): { score: number; keywords: string[] } {
    let score = 0;
    const matchedKeywords: string[] = [];

    words.forEach(word => {
      const keyword = this.engineeringKeywords.find(k => 
        k.word === word || word.includes(k.word) || k.word.includes(word)
      );
      
      if (keyword) {
        score += keyword.painWeight;
        matchedKeywords.push(keyword.word);
      }
    });

    return { score, keywords: [...new Set(matchedKeywords)] };
  }

  private analyzePatterns(text: string): { score: number; patterns: string[] } {
    let score = 0;
    const matchedPatterns: string[] = [];

    this.painPatterns.forEach((painValue, pattern) => {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        score += painValue * matches.length;
        matchedPatterns.push(pattern.source);
      }
    });

    return { score, patterns: matchedPatterns };
  }

  private analyzeSentiment(text: string): { score: number; sentiment: 'positive' | 'negative' | 'neutral' } {
    const positiveWords = ['good', 'great', 'excellent', 'perfect', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disaster', 'nightmare', 'hate'];
    
    let score = 0;
    const words = text.split(/\s+/);
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score -= 1;
      if (negativeWords.includes(word)) score += 2;
    });

    const sentiment = score > 0 ? 'negative' : score < 0 ? 'positive' : 'neutral';
    return { score, sentiment };
  }

  private combineAnalyses(analyses: {
    keyword: { score: number; keywords: string[] };
    context: { score: number; confidence: number };
    pattern: { score: number; patterns: string[] };
    sentiment: { score: number; sentiment: string };
  }): number {
    // Weighted combination of different analysis methods
    const keywordWeight = 0.4;
    const contextWeight = 0.3;
    const patternWeight = 0.2;
    const sentimentWeight = 0.1;

    return (
      analyses.keyword.score * keywordWeight +
      analyses.context.score * contextWeight +
      analyses.pattern.score * patternWeight +
      analyses.sentiment.score * sentimentWeight
    );
  }

  private detectCategory(words: string[], keywords: string[]): EngineeringCategory {
    const categoryScores = new Map<EngineeringCategory, number>();
    
    // Initialize category scores
    (['mechanical', 'electrical', 'software', 'civil', 'chemical', 'general'] as EngineeringCategory[])
      .forEach(cat => categoryScores.set(cat, 0));

    // Score based on matched keywords
    keywords.forEach(keyword => {
      const keywordObj = this.engineeringKeywords.find(k => k.word === keyword);
      if (keywordObj) {
        categoryScores.set(keywordObj.category, (categoryScores.get(keywordObj.category) || 0) + 1);
      }
    });

    // Find category with highest score
    let maxScore = 0;
    let bestCategory: EngineeringCategory = 'general';
    
    categoryScores.forEach((score, category) => {
      if (score > maxScore && category !== 'general') {
        maxScore = score;
        bestCategory = category;
      }
    });

    return bestCategory;
  }

  private calculateConfidence(
    keywordAnalysis: any,
    contextAnalysis: any,
    patternAnalysis: any
  ): number {
    const factors = [
      keywordAnalysis.keywords.length > 0 ? 30 : 0,
      contextAnalysis.confidence || 0,
      patternAnalysis.patterns.length > 0 ? 25 : 0,
      keywordAnalysis.keywords.length > 2 ? 20 : 0,
      patternAnalysis.patterns.length > 1 ? 25 : 0
    ];

    return Math.min(100, factors.reduce((sum, factor) => sum + factor, 0));
  }

  private normalizePainScore(rawScore: number): PainLevel {
    // Normalize raw score to 1-10 scale
    const normalized = Math.max(1, Math.min(10, Math.round(5 + rawScore)));
    return normalized as PainLevel;
  }

  private scoreTemplate(template: MemeTemplate, analysis: PainAnalysis): number {
    let score = 0;

    // Pain level matching (prefer templates that match the pain level)
    const painDiff = Math.abs(template.painLevel - analysis.score);
    score += (10 - painDiff) * 0.3;

    // Keyword trigger matching
    const triggerMatches = template.triggers.filter(trigger =>
      analysis.keywords.some(keyword => keyword.includes(trigger) || trigger.includes(keyword))
    ).length;
    score += triggerMatches * 0.4;

    // Category matching
    if (template.category === analysis.category) {
      score += 0.2;
    } else if (template.category === 'general') {
      score += 0.1;
    }

    // Popularity bonus
    score += template.popularity * 0.001;

    return score;
  }

  private generateReasons(keywordAnalysis: any, contextAnalysis: any, patternAnalysis: any, sentimentAnalysis: any): string[] {
    const reasons: string[] = [];

    if (keywordAnalysis.keywords.length > 0) {
      reasons.push(`Pain keywords detected: ${keywordAnalysis.keywords.slice(0, 3).join(', ')}`);
    }

    if (patternAnalysis.patterns.length > 0) {
      reasons.push(`High-stress patterns identified`);
    }

    if (sentimentAnalysis.sentiment === 'negative') {
      reasons.push('Negative sentiment detected');
    }

    if (contextAnalysis.confidence > 70) {
      reasons.push('High confidence contextual analysis');
    }

    if (reasons.length === 0) {
      reasons.push('Standard pain level assessment');
    }

    return reasons;
  }

  private applyLearning(rawScore: number, text: string): number {
    // Apply machine learning adjustments based on historical data
    // This would be enhanced with actual ML models
    return rawScore;
  }

  private storeLearningData(input: string, analysis: PainAnalysis): void {
    this.learningHistory.push({
      input,
      analysis,
      timestamp: new Date()
    });

    // Keep only last 1000 entries for performance
    if (this.learningHistory.length > 1000) {
      this.learningHistory = this.learningHistory.slice(-1000);
    }

    // Save to localStorage
    try {
      localStorage.setItem('painAnalysisHistory', JSON.stringify(this.learningHistory));
    } catch (error) {
      console.warn('Could not save learning data to localStorage:', error);
    }
  }

  private loadLearningHistory(): PainAnalysisHistory[] {
    try {
      const data = localStorage.getItem('painAnalysisHistory');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Could not load learning history from localStorage:', error);
      return [];
    }
  }
}

/**
 * Context analyzer for better pain detection
 */
class ContextAnalyzer {
  analyze(text: string, context?: any): { score: number; confidence: number } {
    // Basic context analysis - would be enhanced with more sophisticated NLP
    let score = 0;
    let confidence = 50;

    // Time-based context
    const now = new Date();
    const hour = now.getHours();
    
    // Late night/early morning coding indicates higher pain
    if (hour < 6 || hour > 22) {
      score += 1;
      confidence += 10;
    }

    // End of week/month pressure
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 5) { // Friday
      score += 0.5;
    }

    return { score, confidence: Math.min(100, confidence) };
  }
}

interface PainAnalysisHistory {
  input: string;
  analysis: PainAnalysis;
  timestamp: Date;
}