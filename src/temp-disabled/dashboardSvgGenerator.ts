// Dashboard SVG Generation Engine
// Professional corporate graphics with executive-appropriate humor themes
// Integrated with SVGMaker MCP server for enhanced visual content

import { PERFORMANCE_VISUALIZATIONS, STATUS_ICONS, DASHBOARD_VISUAL_THEMES } from '../data/dashboard-visual-content-strategy';
import { DASHBOARD_TERMINOLOGY } from '../data/dashboard-corporate-terminology';

export interface SVGGenerationRequest {
  type: 'performance_metric' | 'status_indicator' | 'infographic' | 'loading_animation';
  context: 'executive_presentation' | 'team_meeting' | 'technical_review';
  metricValue?: number;
  status?: 'excellent' | 'good' | 'warning' | 'critical' | 'offline';
  corporateTheme: string;
  dimensions: { width: number; height: number };
  professionalGrade: number; // 85-99 for executive appropriateness
}

export interface GeneratedSVGContent {
  svgContent: string;
  executiveAppropriate: boolean;
  corporateHumorLevel: number;
  professionalGrade: number;
  usageRecommendations: string[];
  alternativeVersions?: {
    conservative: string;
    moderate: string;
    bold: string;
  };
}

export interface DashboardVisualizationSpec {
  id: string;
  title: string;
  corporateTitle: string;
  executiveTitle: string;
  svgPrompt: string;
  colorScheme: string[];
  appropriatenessScore: number;
  targetAudience: 'c_suite' | 'management' | 'team' | 'technical';
}

class DashboardSVGGenerator {
  private mcpServerAvailable: boolean = true;
  private generationCache: Map<string, GeneratedSVGContent> = new Map();

  constructor() {
    this.checkMCPServerAvailability();
  }

  /**
   * Generate performance metric visualization with corporate humor
   */
  public async generatePerformanceVisualization(
    metricType: string, 
    value: number, 
    context: SVGGenerationRequest['context']
  ): Promise<GeneratedSVGContent> {
    const cacheKey = `${metricType}_${value}_${context}`;
    
    if (this.generationCache.has(cacheKey)) {
      return this.generationCache.get(cacheKey)!;
    }

    const visualization = PERFORMANCE_VISUALIZATIONS.find(v => v.metricType === metricType);
    if (!visualization) {
      throw new Error(`Unknown metric type: ${metricType}`);
    }

    const svgSpec = this.createVisualizationSpec(visualization, value, context);
    const generatedContent = await this.generateWithMCP(svgSpec);
    
    this.generationCache.set(cacheKey, generatedContent);
    return generatedContent;
  }

  /**
   * Generate status indicator with corporate personality
   */
  public async generateStatusIndicator(
    status: 'excellent' | 'good' | 'warning' | 'critical' | 'offline',
    context: SVGGenerationRequest['context']
  ): Promise<GeneratedSVGContent> {
    const statusConfig = STATUS_ICONS.find(s => s.status === status);
    if (!statusConfig) {
      throw new Error(`Unknown status: ${status}`);
    }

    const svgPrompt = this.createContextualPrompt(statusConfig.svgGeneration.prompt, context);
    const generatedContent = await this.generateWithMCP({
      type: 'status_indicator',
      context,
      svgPrompt,
      colors: statusConfig.svgGeneration.colors,
      professionalGrade: context === 'executive_presentation' ? 98 : 90
    });

    return generatedContent;
  }

  /**
   * Generate corporate infographic elements
   */
  public async generateCorporateInfographic(
    title: string,
    data: any[],
    context: SVGGenerationRequest['context']
  ): Promise<GeneratedSVGContent> {
    const corporateTitle = this.convertToCorporateTitle(title);
    const infographicPrompt = this.createInfographicPrompt(corporateTitle, data, context);
    
    return await this.generateWithMCP({
      type: 'infographic',
      context,
      svgPrompt: infographicPrompt,
      colors: this.getContextualColors(context),
      professionalGrade: context === 'executive_presentation' ? 99 : 92
    });
  }

  /**
   * Generate loading animation with corporate humor
   */
  public async generateLoadingAnimation(
    message: string,
    context: SVGGenerationRequest['context']
  ): Promise<GeneratedSVGContent> {
    const corporateMessage = this.convertToCorporateMessage(message);
    const animationPrompt = `Professional loading animation with text "${corporateMessage}", corporate styling, ${context === 'executive_presentation' ? 'C-suite appropriate' : 'meeting friendly'}, smooth animation, minimal and clean`;

    return await this.generateWithMCP({
      type: 'loading_animation',
      context,
      svgPrompt: animationPrompt,
      colors: this.getContextualColors(context),
      professionalGrade: 95
    });
  }

  /**
   * Generate dashboard component graphics
   */
  public async generateDashboardComponent(
    componentType: 'header' | 'metric_card' | 'chart_container' | 'footer',
    branding: 'corporate' | 'executive' | 'technical',
    context: SVGGenerationRequest['context']
  ): Promise<GeneratedSVGContent> {
    const componentPrompt = this.createComponentPrompt(componentType, branding, context);
    
    return await this.generateWithMCP({
      type: 'infographic',
      context,
      svgPrompt: componentPrompt,
      colors: this.getBrandingColors(branding),
      professionalGrade: branding === 'executive' ? 99 : 93
    });
  }

  /**
   * Generate A/B testing variants for visual content
   */
  public async generateContentVariants(
    basePrompt: string,
    context: SVGGenerationRequest['context']
  ): Promise<{
    conservative: GeneratedSVGContent;
    moderate: GeneratedSVGContent;
    bold: GeneratedSVGContent;
  }> {
    const variants = {
      conservative: await this.generateWithMCP({
        type: 'performance_metric',
        context,
        svgPrompt: `${basePrompt}, extremely professional, minimal corporate humor, C-suite safe`,
        colors: ['#1E40AF', '#374151', '#F8FAFC'],
        professionalGrade: 99
      }),
      moderate: await this.generateWithMCP({
        type: 'performance_metric',
        context,
        svgPrompt: `${basePrompt}, professional with subtle corporate humor, meeting appropriate`,
        colors: ['#2563EB', '#4B5563', '#F1F5F9'],
        professionalGrade: 92
      }),
      bold: await this.generateWithMCP({
        type: 'performance_metric',
        context,
        svgPrompt: `${basePrompt}, engaging corporate humor, team-friendly, more creative`,
        colors: ['#1D4ED8', '#059669', '#FFFFFF'],
        professionalGrade: 88
      })
    };

    return variants;
  }

  /**
   * Validate SVG content for executive appropriateness
   */
  public validateExecutiveAppropriateness(svgContent: string): {
    appropriate: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    // Analyze SVG content for executive appropriateness
    const score = this.calculateAppropriatenessScore(svgContent);
    const issues = this.identifyPotentialIssues(svgContent);
    const recommendations = this.generateImprovementRecommendations(svgContent, issues);

    return {
      appropriate: score >= 90,
      score,
      issues,
      recommendations
    };
  }

  // Private implementation methods

  private async checkMCPServerAvailability(): Promise<void> {
    try {
      // Check if SVGMaker MCP server is available
      // In real implementation, this would ping the MCP server
      this.mcpServerAvailable = true;
    } catch (error) {
      console.warn('SVGMaker MCP server unavailable, using fallback generation');
      this.mcpServerAvailable = false;
    }
  }

  private createVisualizationSpec(
    visualization: typeof PERFORMANCE_VISUALIZATIONS[0],
    value: number,
    context: SVGGenerationRequest['context']
  ): any {
    const contextualPrompt = this.createContextualPrompt(visualization.svgPrompt, context);
    const valueContext = this.createValueContext(value, visualization.metricType);
    
    return {
      type: 'performance_metric',
      context,
      svgPrompt: `${contextualPrompt}, showing value ${valueContext}, ${visualization.corporateMetaphor}`,
      colors: this.getContextualColors(context),
      professionalGrade: visualization.appropriatenessScore
    };
  }

  private createContextualPrompt(basePrompt: string, context: SVGGenerationRequest['context']): string {
    const contextModifiers = {
      executive_presentation: 'C-suite ready, board room appropriate, maximum professionalism',
      team_meeting: 'meeting friendly, professional with subtle humor, team appropriate',
      technical_review: 'engineering focused, technical accuracy, professional with relevant humor'
    };

    return `${basePrompt}, ${contextModifiers[context]}`;
  }

  private createValueContext(value: number, metricType: string): string {
    // Convert numeric values to corporate-appropriate descriptions
    const performanceLevels = {
      excellent: 'exceeding expectations',
      good: 'meeting targets',
      average: 'baseline performance',
      concern: 'improvement opportunity'
    };

    if (value >= 90) return performanceLevels.excellent;
    if (value >= 75) return performanceLevels.good;
    if (value >= 60) return performanceLevels.average;
    return performanceLevels.concern;
  }

  private convertToCorporateTitle(title: string): string {
    const terminology = DASHBOARD_TERMINOLOGY.find(t => 
      title.toLowerCase().includes(t.original.toLowerCase())
    );
    
    return terminology?.corporateHumor || title;
  }

  private convertToCorporateMessage(message: string): string {
    // Convert technical messages to corporate-friendly versions
    const corporateReplacements = {
      'loading': 'optimizing performance',
      'processing': 'synthesizing insights',
      'calculating': 'analyzing strategic metrics',
      'updating': 'refreshing intelligence',
      'connecting': 'establishing stakeholder alignment'
    };

    let corporateMessage = message;
    Object.entries(corporateReplacements).forEach(([tech, corp]) => {
      corporateMessage = corporateMessage.replace(new RegExp(tech, 'gi'), corp);
    });

    return corporateMessage;
  }

  private createInfographicPrompt(title: string, data: any[], context: SVGGenerationRequest['context']): string {
    const dataDescription = this.analyzeDataForVisualization(data);
    return `Professional infographic titled "${title}", ${dataDescription}, corporate styling, ${context === 'executive_presentation' ? 'C-suite appropriate' : 'team friendly'}, clean data visualization`;
  }

  private createComponentPrompt(
    componentType: string, 
    branding: string, 
    context: SVGGenerationRequest['context']
  ): string {
    const componentDescriptions = {
      header: 'Professional dashboard header with corporate branding',
      metric_card: 'Clean metric display card with performance indicators',
      chart_container: 'Professional chart container with corporate styling',
      footer: 'Clean dashboard footer with corporate elements'
    };

    const brandingModifiers = {
      corporate: 'standard corporate styling, professional blue and gray colors',
      executive: 'premium C-suite styling, sophisticated color palette, maximum professionalism',
      technical: 'engineering-focused styling, technical accuracy, professional with subtle humor'
    };

    return `${componentDescriptions[componentType]}, ${brandingModifiers[branding]}, ${context} context`;
  }

  private getContextualColors(context: SVGGenerationRequest['context']): string[] {
    const contextColors = {
      executive_presentation: ['#1E40AF', '#374151', '#F8FAFC', '#059669', '#DC2626'],
      team_meeting: ['#2563EB', '#4B5563', '#F1F5F9', '#10B981', '#EF4444'],
      technical_review: ['#1D4ED8', '#6B7280', '#FFFFFF', '#0D9488', '#BE123C']
    };

    return contextColors[context];
  }

  private getBrandingColors(branding: string): string[] {
    const brandingColors = {
      corporate: ['#1E40AF', '#374151', '#F8FAFC'],
      executive: ['#1D4ED8', '#111827', '#FFFFFF'],
      technical: ['#2563EB', '#4B5563', '#F1F5F9']
    };

    return brandingColors[branding] || brandingColors.corporate;
  }

  private analyzeDataForVisualization(data: any[]): string {
    if (!data || data.length === 0) return 'placeholder data visualization';
    
    const dataType = typeof data[0];
    const dataSize = data.length;
    
    if (dataSize <= 5) return 'key metrics display';
    if (dataSize <= 15) return 'comprehensive data overview';
    return 'detailed analytics visualization';
  }

  private async generateWithMCP(spec: any): Promise<GeneratedSVGContent> {
    if (this.mcpServerAvailable) {
      try {
        // Call SVGMaker MCP server
        return await this.callSVGMakerMCP(spec);
      } catch (error) {
        console.warn('MCP generation failed, using fallback', error);
        return this.generateFallbackSVG(spec);
      }
    } else {
      return this.generateFallbackSVG(spec);
    }
  }

  private async callSVGMakerMCP(spec: any): Promise<GeneratedSVGContent> {
    // This would integrate with the actual SVGMaker MCP server
    // For now, we'll simulate the response structure
    
    const mockSVGContent = this.generateMockSVG(spec);
    
    return {
      svgContent: mockSVGContent,
      executiveAppropriate: spec.professionalGrade >= 90,
      corporateHumorLevel: this.calculateHumorLevel(spec),
      professionalGrade: spec.professionalGrade || 92,
      usageRecommendations: this.generateUsageRecommendations(spec),
      alternativeVersions: spec.generateVariants ? {
        conservative: this.generateMockSVG({...spec, style: 'conservative'}),
        moderate: this.generateMockSVG({...spec, style: 'moderate'}),
        bold: this.generateMockSVG({...spec, style: 'bold'})
      } : undefined
    };
  }

  private generateFallbackSVG(spec: any): GeneratedSVGContent {
    const fallbackSVG = `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#F8FAFC" stroke="#1E40AF" stroke-width="2"/>
        <text x="150" y="100" text-anchor="middle" fill="#1E40AF" font-family="Arial" font-size="16">
          Corporate Dashboard Element
        </text>
        <text x="150" y="130" text-anchor="middle" fill="#374151" font-family="Arial" font-size="12">
          Professional Grade: ${spec.professionalGrade || 92}%
        </text>
      </svg>
    `;

    return {
      svgContent: fallbackSVG,
      executiveAppropriate: true,
      corporateHumorLevel: 80,
      professionalGrade: spec.professionalGrade || 92,
      usageRecommendations: ['Professional fallback visualization generated'],
    };
  }

  private generateMockSVG(spec: any): string {
    // Generate appropriate mock SVG based on spec
    const colors = spec.colors || ['#1E40AF', '#374151', '#F8FAFC'];
    
    return `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="corpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:0.8" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#corpGradient)" rx="8"/>
        <text x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="18" font-weight="bold">
          ${spec.type === 'performance_metric' ? 'Performance Excellence' : 'Corporate Dashboard'}
        </text>
        <text x="200" y="180" text-anchor="middle" fill="${colors[2]}" font-family="Arial" font-size="14">
          Professional Grade: ${spec.professionalGrade || 92}%
        </text>
      </svg>
    `;
  }

  private calculateHumorLevel(spec: any): number {
    const baseHumor = spec.context === 'executive_presentation' ? 85 : 80;
    const adjustment = spec.professionalGrade > 95 ? 5 : 0;
    return Math.min(baseHumor + adjustment, 95);
  }

  private generateUsageRecommendations(spec: any): string[] {
    const recommendations = [];
    
    if (spec.context === 'executive_presentation') {
      recommendations.push('Suitable for C-suite presentations and board meetings');
    }
    
    if (spec.professionalGrade >= 95) {
      recommendations.push('Executive-ready with maximum professional appropriateness');
    }
    
    if (spec.type === 'performance_metric') {
      recommendations.push('Ideal for performance dashboard and metrics visualization');
    }

    return recommendations;
  }

  private calculateAppropriatenessScore(svgContent: string): number {
    // Analyze SVG content for executive appropriateness factors
    let score = 85; // Base score
    
    if (svgContent.includes('professional') || svgContent.includes('corporate')) score += 5;
    if (svgContent.includes('C-suite') || svgContent.includes('executive')) score += 8;
    if (svgContent.includes('humor') && svgContent.includes('subtle')) score += 2;
    
    return Math.min(score, 99);
  }

  private identifyPotentialIssues(svgContent: string): string[] {
    const issues = [];
    
    if (svgContent.includes('bold') || svgContent.includes('flashy')) {
      issues.push('Visual style may be too bold for executive presentations');
    }
    
    if (svgContent.length < 200) {
      issues.push('SVG content appears minimal, may need more professional detail');
    }
    
    return issues;
  }

  private generateImprovementRecommendations(svgContent: string, issues: string[]): string[] {
    const recommendations = [];
    
    if (issues.some(issue => issue.includes('bold'))) {
      recommendations.push('Consider using more subtle colors and professional styling');
    }
    
    if (issues.some(issue => issue.includes('minimal'))) {
      recommendations.push('Add more corporate branding elements and professional details');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const dashboardSVGGenerator = new DashboardSVGGenerator();

// Utility functions for easy integration
export async function generateExecutiveMetricVisualization(
  metricType: string, 
  value: number
): Promise<GeneratedSVGContent> {
  return dashboardSVGGenerator.generatePerformanceVisualization(
    metricType, 
    value, 
    'executive_presentation'
  );
}

export async function generateTeamStatusIndicator(
  status: 'excellent' | 'good' | 'warning' | 'critical' | 'offline'
): Promise<GeneratedSVGContent> {
  return dashboardSVGGenerator.generateStatusIndicator(status, 'team_meeting');
}

export async function generateTechnicalInfographic(
  title: string, 
  data: any[]
): Promise<GeneratedSVGContent> {
  return dashboardSVGGenerator.generateCorporateInfographic(title, data, 'technical_review');
}

export default dashboardSVGGenerator;