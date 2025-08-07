// MemeCanvas Component - Advanced SVG Meme Rendering with MCP Integration
// Supports dynamic SVG templates, professional text rendering, and OpenCV optimization

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MemeTemplate, TextArea } from '../types';

interface MemeCanvasProps {
  template: MemeTemplate;
  texts: { [key: string]: string };
  onGenerate: (dataUrl: string, svgContent: string) => void;
  className?: string;
  quality?: 'draft' | 'standard' | 'high';
  enableOptimization?: boolean;
}

export const MemeCanvas: React.FC<MemeCanvasProps> = ({
  template,
  texts,
  onGenerate,
  className = '',
  quality = 'standard',
  enableOptimization = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [optimizedTextAreas, setOptimizedTextAreas] = useState<TextArea[]>(template.textAreas);

  // Generate meme when template or texts change
  useEffect(() => {
    generateMeme();
  }, [template, texts, quality]);

  // Optimize text positioning using OpenCV MCP (if enabled)
  useEffect(() => {
    if (enableOptimization && template.svgContent) {
      optimizeTextPositioning();
    } else {
      setOptimizedTextAreas(template.textAreas);
    }
  }, [template, enableOptimization]);

  const optimizeTextPositioning = useCallback(async () => {
    try {
      // This would integrate with OpenCV MCP for intelligent text positioning
      // For now, use the original text areas with minor optimizations
      const optimized = template.textAreas.map(area => ({
        ...area,
        // Apply basic optimization rules
        fontSize: adjustFontSizeForText(area, texts[area.id] || area.placeholder),
        y: area.y, // Could be optimized based on image analysis
        strokeWidth: Math.max(1, Math.floor(area.fontSize / 12))
      }));
      
      setOptimizedTextAreas(optimized);
    } catch (error) {
      console.warn('Text positioning optimization failed:', error);
      setOptimizedTextAreas(template.textAreas);
    }
  }, [template, texts]);

  const generateMeme = useCallback(async () => {
    if (!template || isGenerating) return;

    setIsGenerating(true);

    try {
      // Generate SVG content with text overlays
      const svgContent = await renderMemeToSVG();
      
      // Convert SVG to high-quality PNG for sharing
      const dataUrl = await convertSVGToImage(svgContent);
      
      // Callback with both formats
      onGenerate(dataUrl, svgContent);
    } catch (error) {
      console.error('Meme generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [template, texts, optimizedTextAreas, quality]);

  const renderMemeToSVG = async (): Promise<string> => {
    const baseSVG = template.svgContent || generateFallbackSVG();
    
    // Parse the base SVG to add text elements
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(baseSVG, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // Add text elements for each text area
    optimizedTextAreas.forEach(area => {
      const text = texts[area.id] || area.placeholder;
      if (text.trim()) {
        const textElement = createSVGTextElement(area, text, svgElement);
        svgElement.appendChild(textElement);
      }
    });

    // Add quality-specific enhancements
    if (quality === 'high') {
      addHighQualityEffects(svgElement);
    }

    // Serialize back to string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svgElement);
  };

  const createSVGTextElement = (area: TextArea, text: string, svgElement: SVGSVGElement): SVGElement => {
    const svgNS = 'http://www.w3.org/2000/svg';
    
    // Get SVG dimensions
    const viewBox = svgElement.getAttribute('viewBox') || '0 0 800 800';
    const [, , width, height] = viewBox.split(' ').map(Number);
    
    // Calculate actual positions
    const x = (area.x / 100) * width;
    const y = (area.y / 100) * height;
    const maxWidth = (area.width / 100) * width;

    // Create text group for complex formatting
    const textGroup = document.createElementNS(svgNS, 'g');
    textGroup.setAttribute('class', `text-area-${area.id}`);

    // Handle word wrapping
    const lines = wrapText(text, area, maxWidth);
    const lineHeight = area.fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const startY = y - (totalHeight / 2) + (lineHeight / 2); // Center vertically

    lines.forEach((line, index) => {
      if (line.trim()) {
        // Create stroke (outline) text
        const strokeText = document.createElementNS(svgNS, 'text');
        strokeText.setAttribute('x', x.toString());
        strokeText.setAttribute('y', (startY + (index * lineHeight)).toString());
        strokeText.setAttribute('text-anchor', area.align);
        strokeText.setAttribute('dominant-baseline', area.verticalAlign);
        strokeText.setAttribute('font-family', area.fontFamily || 'Impact, Arial Black, sans-serif');
        strokeText.setAttribute('font-size', area.fontSize.toString());
        strokeText.setAttribute('font-weight', area.fontWeight || 'bold');
        strokeText.setAttribute('stroke', area.strokeColor);
        strokeText.setAttribute('stroke-width', area.strokeWidth.toString());
        strokeText.setAttribute('stroke-linejoin', 'round');
        strokeText.setAttribute('fill', 'none');
        strokeText.textContent = line;

        // Create fill text
        const fillText = document.createElementNS(svgNS, 'text');
        fillText.setAttribute('x', x.toString());
        fillText.setAttribute('y', (startY + (index * lineHeight)).toString());
        fillText.setAttribute('text-anchor', area.align);
        fillText.setAttribute('dominant-baseline', area.verticalAlign);
        fillText.setAttribute('font-family', area.fontFamily || 'Impact, Arial Black, sans-serif');
        fillText.setAttribute('font-size', area.fontSize.toString());
        fillText.setAttribute('font-weight', area.fontWeight || 'bold');
        fillText.setAttribute('fill', area.fontColor);
        fillText.textContent = line;

        textGroup.appendChild(strokeText);
        textGroup.appendChild(fillText);
      }
    });

    return textGroup;
  };

  const wrapText = (text: string, area: TextArea, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    // Create a temporary canvas to measure text width
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [text]; // Fallback if canvas not available
    
    ctx.font = `${area.fontWeight || 'bold'} ${area.fontSize}px ${area.fontFamily || 'Impact, Arial Black'}`;

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [text];
  };

  const addHighQualityEffects = (svgElement: SVGSVGElement): void => {
    const svgNS = 'http://www.w3.org/2000/svg';
    
    // Add filter definitions for high-quality effects
    const defs = document.createElementNS(svgNS, 'defs');
    
    // Drop shadow filter
    const filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', 'text-shadow');
    filter.setAttribute('x', '-20%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%');
    filter.setAttribute('height', '140%');

    const feGaussianBlur = document.createElementNS(svgNS, 'feGaussianBlur');
    feGaussianBlur.setAttribute('in', 'SourceAlpha');
    feGaussianBlur.setAttribute('stdDeviation', '2');
    feGaussianBlur.setAttribute('result', 'blur');

    const feOffset = document.createElementNS(svgNS, 'feOffset');
    feOffset.setAttribute('in', 'blur');
    feOffset.setAttribute('dx', '2');
    feOffset.setAttribute('dy', '2');
    feOffset.setAttribute('result', 'offsetBlur');

    const feFlood = document.createElementNS(svgNS, 'feFlood');
    feFlood.setAttribute('flood-color', '#000000');
    feFlood.setAttribute('flood-opacity', '0.5');

    const feComposite = document.createElementNS(svgNS, 'feComposite');
    feComposite.setAttribute('in2', 'offsetBlur');
    feComposite.setAttribute('operator', 'in');

    const feMerge = document.createElementNS(svgNS, 'feMerge');
    const feMergeNode1 = document.createElementNS(svgNS, 'feMergeNode');
    feMergeNode1.setAttribute('in', 'offsetBlur');
    const feMergeNode2 = document.createElementNS(svgNS, 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');

    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);

    filter.appendChild(feGaussianBlur);
    filter.appendChild(feOffset);
    filter.appendChild(feFlood);
    filter.appendChild(feComposite);
    filter.appendChild(feMerge);

    defs.appendChild(filter);
    svgElement.insertBefore(defs, svgElement.firstChild);

    // Apply shadow to text elements
    const textGroups = svgElement.querySelectorAll('g[class*="text-area"]');
    textGroups.forEach(group => {
      group.setAttribute('filter', 'url(#text-shadow)');
    });
  };

  const convertSVGToImage = async (svgContent: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas not available'));
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Set canvas size based on quality
      const scaleFactor = quality === 'high' ? 2 : quality === 'standard' ? 1.5 : 1;
      canvas.width = 800 * scaleFactor;
      canvas.height = 800 * scaleFactor;

      const img = new Image();
      img.onload = () => {
        // Clear canvas with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the SVG image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png', quality === 'high' ? 1.0 : 0.9);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load SVG for conversion'));
      };

      // Convert SVG to data URL for the image
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    });
  };

  const generateFallbackSVG = (): string => {
    return `
      <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
        <text x="400" y="400" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="#64748b">
          Engineering Meme Template
        </text>
      </svg>
    `.trim();
  };

  const adjustFontSizeForText = (area: TextArea, text: string): number => {
    const baseSize = area.fontSize;
    const textLength = text.length;
    
    // Adjust font size based on text length to ensure it fits
    if (textLength > area.maxLength * 0.8) {
      return Math.max(16, baseSize * 0.8);
    } else if (textLength < area.maxLength * 0.3) {
      return Math.min(48, baseSize * 1.1);
    }
    
    return baseSize;
  };

  return (
    <div className={`meme-canvas-container ${className}`}>
      {/* SVG Preview */}
      <div className="relative">
        <svg
          ref={svgRef}
          className="meme-canvas max-w-full h-auto"
          style={{ display: isGenerating ? 'none' : 'block' }}
          dangerouslySetInnerHTML={{ 
            __html: template.svgContent || generateFallbackSVG() 
          }}
        />
        
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-engineer-blue mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Generating meme...</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for image conversion */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={800}
        height={800}
      />

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-500">
          <p>Template: {template.name}</p>
          <p>Quality: {quality}</p>
          <p>Optimization: {enableOptimization ? 'enabled' : 'disabled'}</p>
          <p>Text Areas: {optimizedTextAreas.length}</p>
        </div>
      )}
    </div>
  );
};

export default MemeCanvas;