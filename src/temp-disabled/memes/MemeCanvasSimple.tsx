// Simplified MemeCanvas for MVP
import React, { useRef, useEffect } from 'react';

interface SimpleMemeCanvasProps {
  template: any;
  texts: { [key: string]: string };
  onGenerate: (dataUrl: string, svgContent: string) => void;
}

export const MemeCanvasSimple: React.FC<SimpleMemeCanvasProps> = ({
  template,
  texts,
  onGenerate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (template && template.svgContent) {
      // Generate a simple meme
      const svgContent = template.svgContent;
      
      // Convert SVG to canvas and generate data URL
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Set canvas size
          canvas.width = 800;
          canvas.height = 800;
          
          // Fill with white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add simple text
          ctx.fillStyle = '#000000';
          ctx.font = '32px Arial Black';
          ctx.textAlign = 'center';
          
          // Add top text
          if (texts.top) {
            ctx.fillText(texts.top, canvas.width / 2, 60);
          }
          
          // Add bottom text
          if (texts.bottom) {
            ctx.fillText(texts.bottom, canvas.width / 2, canvas.height - 40);
          }
          
          // Generate data URL
          const dataUrl = canvas.toDataURL('image/png');
          onGenerate(dataUrl, svgContent);
        }
      }
    }
  }, [template, texts, onGenerate]);

  return (
    <div className="meme-canvas">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto border-2 border-gray-300 rounded-lg shadow-lg"
        width={800}
        height={800}
      />
      
      {!template && (
        <div className="bg-gray-100 rounded-lg flex items-center justify-center h-80">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">Select a template to begin</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemeCanvasSimple;