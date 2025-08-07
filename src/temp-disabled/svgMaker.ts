// SVGMaker MCP Integration for Dynamic Meme Template Generation
// Provides professional-grade SVG meme templates for engineering humor

import type { MemeTemplate, TextArea, EngineeringCategory, SVGMakerRequest } from '../types';

export class SVGMakerService {
  private static instance: SVGMakerService;
  private templateCache = new Map<string, string>();
  
  static getInstance(): SVGMakerService {
    if (!SVGMakerService.instance) {
      SVGMakerService.instance = new SVGMakerService();
    }
    return SVGMakerService.instance;
  }

  /**
   * Generate a meme template using SVGMaker MCP
   */
  async generateMemeTemplate(prompt: string, category: EngineeringCategory): Promise<MemeTemplate> {
    try {
      // Create engineering-specific prompt for better results
      const engineeringPrompt = this.createEngineeringPrompt(prompt, category);
      
      const request: SVGMakerRequest = {
        prompt: engineeringPrompt,
        style: 'meme',
        size: '800x800',
        background: 'white'
      };

      // Call SVGMaker MCP to generate the template
      const svgContent = await this.callSVGMaker(request);
      
      // Create text areas based on the template type
      const textAreas = this.generateTextAreas(prompt, category);
      
      // Create the template object
      const template: MemeTemplate = {
        id: `svg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: this.generateTemplateName(prompt),
        description: `Dynamically generated ${category} meme template`,
        category,
        textAreas,
        triggers: this.extractTriggers(prompt),
        painLevel: this.estimatePainLevel(prompt),
        svgContent,
        tags: [category, 'dynamic', 'generated'],
        popularity: 0,
        createdBy: 'agent',
        createdAt: new Date()
      };

      // Cache the generated template
      this.templateCache.set(template.id, svgContent);
      
      return template;
    } catch (error) {
      console.error('Failed to generate SVG template:', error);
      // Return fallback template
      return this.createFallbackTemplate(prompt, category);
    }
  }

  /**
   * Generate multiple template variations
   */
  async generateTemplateVariations(basePrompt: string, count: number = 3): Promise<MemeTemplate[]> {
    const variations = [
      basePrompt,
      `${basePrompt} with dramatic lighting`,
      `${basePrompt} minimalist style`,
      `${basePrompt} with engineering diagrams`
    ];

    const promises = variations.slice(0, count).map((prompt, index) => 
      this.generateMemeTemplate(`${prompt} variation ${index + 1}`, 'general')
    );

    return Promise.all(promises);
  }

  /**
   * Update existing template with new content
   */
  async updateTemplate(templateId: string, newPrompt: string): Promise<string> {
    const request: SVGMakerRequest = {
      prompt: newPrompt,
      style: 'meme',
      size: '800x800',
      background: 'white'
    };

    const svgContent = await this.callSVGMaker(request);
    this.templateCache.set(templateId, svgContent);
    return svgContent;
  }

  /**
   * Create engineering-specific prompt for better SVG generation
   */
  private createEngineeringPrompt(prompt: string, category: EngineeringCategory): string {
    const categoryPrompts = {
      mechanical: 'mechanical engineering theme with gears, tools, and industrial elements',
      electrical: 'electrical engineering theme with circuits, wires, and electronic components',
      software: 'software engineering theme with code, computers, and digital elements',
      civil: 'civil engineering theme with buildings, bridges, and construction elements',
      chemical: 'chemical engineering theme with pipelines, reactors, and process equipment',
      general: 'professional engineering theme with technical elements'
    };

    return `Create a professional meme template with ${categoryPrompts[category]}. ${prompt}. Style: clean, readable text areas, professional color scheme, engineering aesthetics, suitable for workplace humor.`;
  }

  /**
   * Generate appropriate text areas based on meme type and category
   */
  private generateTextAreas(prompt: string, category: EngineeringCategory): TextArea[] {
    // Determine meme format from prompt
    if (prompt.toLowerCase().includes('drake') || prompt.toLowerCase().includes('pointing')) {
      return this.createDrakeStyleTextAreas();
    } else if (prompt.toLowerCase().includes('this is fine') || prompt.toLowerCase().includes('fire')) {
      return this.createThisIsFineTextAreas();
    } else if (prompt.toLowerCase().includes('distracted') || prompt.toLowerCase().includes('boyfriend')) {
      return this.createDistractedBoyfriendTextAreas();
    } else {
      // Default: top and bottom text areas
      return this.createDefaultTextAreas();
    }
  }

  private createDrakeStyleTextAreas(): TextArea[] {
    return [
      {
        id: 'reject',
        x: 50, y: 25, width: 45, height: 20,
        fontSize: 24, fontColor: '#000000',
        strokeColor: '#FFFFFF', strokeWidth: 2,
        align: 'left', verticalAlign: 'middle',
        placeholder: 'The approved design spec',
        maxLength: 100,
        fontFamily: 'Arial Black, sans-serif',
        fontWeight: 'bold'
      },
      {
        id: 'accept',
        x: 50, y: 75, width: 45, height: 20,
        fontSize: 24, fontColor: '#000000',
        strokeColor: '#FFFFFF', strokeWidth: 2,
        align: 'left', verticalAlign: 'middle',
        placeholder: 'Last-minute client changes',
        maxLength: 100,
        fontFamily: 'Arial Black, sans-serif',
        fontWeight: 'bold'
      }
    ];
  }

  private createThisIsFineTextAreas(): TextArea[] {
    return [
      {
        id: 'top',
        x: 50, y: 15, width: 80, height: 15,
        fontSize: 28, fontColor: '#FFFFFF',
        strokeColor: '#000000', strokeWidth: 3,
        align: 'center', verticalAlign: 'middle',
        placeholder: 'The project deadline is tomorrow',
        maxLength: 80,
        fontFamily: 'Impact, Arial Black',
        fontWeight: 'bold'
      },
      {
        id: 'bottom',
        x: 50, y: 85, width: 80, height: 10,
        fontSize: 24, fontColor: '#FFFFFF',
        strokeColor: '#000000', strokeWidth: 2,
        align: 'center', verticalAlign: 'middle',
        placeholder: 'This is fine',
        maxLength: 50,
        fontFamily: 'Impact, Arial Black',
        fontWeight: 'bold'
      }
    ];
  }

  private createDistractedBoyfriendTextAreas(): TextArea[] {
    return [
      {
        id: 'boyfriend',
        x: 25, y: 85, width: 20, height: 10,
        fontSize: 20, fontColor: '#FFFFFF',
        strokeColor: '#000000', strokeWidth: 2,
        align: 'center', verticalAlign: 'middle',
        placeholder: 'Me',
        maxLength: 30,
        fontFamily: 'Arial Black',
        fontWeight: 'bold'
      },
      {
        id: 'girlfriend',
        x: 15, y: 75, width: 25, height: 10,
        fontSize: 20, fontColor: '#FFFFFF',
        strokeColor: '#000000', strokeWidth: 2,
        align: 'center', verticalAlign: 'middle',
        placeholder: 'Current project',
        maxLength: 40,
        fontFamily: 'Arial Black',
        fontWeight: 'bold'
      },
      {
        id: 'other_woman',
        x: 75, y: 70, width: 20, height: 10,
        fontSize: 20, fontColor: '#FFFFFF',
        strokeColor: '#000000', strokeWidth: 2,
        align: 'center', verticalAlign: 'middle',
        placeholder: 'New shiny project',
        maxLength: 40,
        fontFamily: 'Arial Black',
        fontWeight: 'bold'
      }
    ];
  }

  private createDefaultTextAreas(): TextArea[] {
    return [
      {
        id: 'top',
        x: 50, y: 15, width: 90, height: 20,
        fontSize: 32, fontColor: '#FFFFFF',
        strokeColor: '#000000', strokeWidth: 3,
        align: 'center', verticalAlign: 'middle',
        placeholder: 'When the specs change',
        maxLength: 100,
        fontFamily: 'Impact, Arial Black',
        fontWeight: 'bold'
      },
      {
        id: 'bottom',
        x: 50, y: 85, width: 90, height: 15,
        fontSize: 28, fontColor: '#FFFFFF',
        strokeColor: '#000000', strokeWidth: 3,
        align: 'center', verticalAlign: 'middle',
        placeholder: 'After you finish coding',
        maxLength: 100,
        fontFamily: 'Impact, Arial Black',
        fontWeight: 'bold'
      }
    ];
  }

  /**
   * Call the SVGMaker MCP server to generate SVG content
   */
  private async callSVGMaker(request: SVGMakerRequest): Promise<string> {
    try {
      // Note: This would typically call the MCP server directly
      // For now, we'll generate a placeholder SVG
      return this.generatePlaceholderSVG(request);
    } catch (error) {
      console.error('SVGMaker MCP call failed:', error);
      return this.generateFallbackSVG(request);
    }
  }

  /**
   * Generate a placeholder SVG while MCP integration is being set up
   */
  private generatePlaceholderSVG(request: SVGMakerRequest): string {
    const [width, height] = request.size.split('x').map(Number);
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)" stroke="#cbd5e1" stroke-width="2"/>
        <circle cx="${width/2}" cy="${height/2}" r="100" fill="#1e40af" opacity="0.1"/>
        <text x="${width/2}" y="${height/2 - 50}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#1e40af">
          Engineering Meme Template
        </text>
        <text x="${width/2}" y="${height/2 + 20}" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#64748b">
          Generated with SVGMaker MCP
        </text>
        <text x="${width/2}" y="${height/2 + 50}" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#94a3b8">
          ${request.prompt.substring(0, 60)}...
        </text>
      </svg>
    `.trim();
  }

  /**
   * Generate a basic fallback SVG if all else fails
   */
  private generateFallbackSVG(request: SVGMakerRequest): string {
    const [width, height] = request.size.split('x').map(Number);
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
        <text x="${width/2}" y="${height/2}" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="#64748b">
          Meme Template
        </text>
      </svg>
    `.trim();
  }

  private generateTemplateName(prompt: string): string {
    const words = prompt.split(' ').slice(0, 3);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  private extractTriggers(prompt: string): string[] {
    const commonTriggers = prompt.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 5);
    
    return [...commonTriggers, 'engineering', 'work', 'project'];
  }

  private estimatePainLevel(prompt: string): number {
    const painKeywords = {
      high: ['deadline', 'urgent', 'asap', 'broken', 'failed', 'disaster', 'emergency'],
      medium: ['change', 'modify', 'update', 'meeting', 'review', 'delay'],
      low: ['new', 'plan', 'design', 'create', 'build']
    };

    const lowerPrompt = prompt.toLowerCase();
    let painScore = 5; // Base level

    painKeywords.high.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) painScore += 2;
    });
    
    painKeywords.medium.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) painScore += 1;
    });
    
    painKeywords.low.forEach(keyword => {
      if (lowerPrompt.includes(keyword)) painScore -= 1;
    });

    return Math.max(1, Math.min(10, painScore)) as number;
  }

  private createFallbackTemplate(prompt: string, category: EngineeringCategory): MemeTemplate {
    return {
      id: `fallback-${Date.now()}`,
      name: 'Fallback Template',
      description: 'Basic fallback template when SVG generation fails',
      category,
      textAreas: this.createDefaultTextAreas(),
      triggers: ['fallback'],
      painLevel: 5,
      svgContent: this.generateFallbackSVG({ prompt, style: 'meme', size: '800x800', background: 'white' }),
      tags: [category, 'fallback'],
      popularity: 0,
      createdBy: 'system',
      createdAt: new Date()
    };
  }

  /**
   * Get cached template SVG content
   */
  getCachedTemplate(templateId: string): string | undefined {
    return this.templateCache.get(templateId);
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; templates: string[] } {
    return {
      size: this.templateCache.size,
      templates: Array.from(this.templateCache.keys())
    };
  }
}