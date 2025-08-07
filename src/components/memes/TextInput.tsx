// TextInput Component - Dynamic Text Area Editor
// Supports multiple text areas with real-time preview and validation

import React, { useState } from 'react';
import { MemeTemplate, TextArea } from '../types';

interface TextInputProps {
  template: MemeTemplate;
  texts: { [key: string]: string };
  onChange: (areaId: string, text: string) => void;
  className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  template,
  texts,
  onChange,
  className = ''
}) => {
  const [focusedArea, setFocusedArea] = useState<string | null>(null);

  const getCharacterLimit = (area: TextArea): number => {
    return area.maxLength || 100;
  };

  const getCharacterCount = (areaId: string): number => {
    return (texts[areaId] || '').length;
  };

  const getProgressColor = (used: number, max: number): string => {
    const percentage = (used / max) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleTextChange = (areaId: string, value: string) => {
    const area = template.textAreas.find(a => a.id === areaId);
    if (!area) return;

    // Enforce character limit
    const limit = getCharacterLimit(area);
    const truncatedValue = value.slice(0, limit);
    
    onChange(areaId, truncatedValue);
  };

  const getTextAreaLabel = (area: TextArea): string => {
    const labels: { [key: string]: string } = {
      'top': 'Top Text',
      'bottom': 'Bottom Text',
      'left': 'Left Text',
      'right': 'Right Text',
      'center': 'Center Text',
      'reject': 'Reject/No',
      'accept': 'Accept/Yes',
      'boyfriend': 'Person',
      'girlfriend': 'Current Thing',
      'other_woman': 'New Thing',
      'button1': 'Option 1',
      'button2': 'Option 2',
      'title': 'Title',
      'subtitle': 'Subtitle'
    };
    
    return labels[area.id] || `Text Area ${area.id}`;
  };

  const getSuggestions = (area: TextArea): string[] => {
    const suggestions: { [key: string]: string[] } = {
      'top': [
        "When the deadline is tomorrow",
        "Client changes requirements",
        "When code works in dev",
        "Project manager says it's easy"
      ],
      'bottom': [
        "And you haven't started",
        "After you finish coding",
        "But not in production",
        "Narrator: It was not easy"
      ],
      'reject': [
        "Following the documented spec",
        "Using the approved design",
        "Testing before deployment",
        "Proper code review process"
      ],
      'accept': [
        "Last-minute scope changes", 
        "Client's 'quick fix' ideas",
        "Deploy directly to prod",
        "Just push it live"
      ]
    };

    return suggestions[area.id] || [
      "Engineering humor",
      "Technical difficulties",
      "Project management",
      "Code quality"
    ];
  };

  const applySuggestion = (areaId: string, suggestion: string) => {
    onChange(areaId, suggestion);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">✏️</span>
        Meme Text Editor
      </h2>

      {/* Template Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {template.name}
          </span>
          <span className="text-xs text-gray-500">
            {template.textAreas.length} text areas
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {template.description}
        </p>
      </div>

      {/* Text Areas */}
      <div className="space-y-4">
        {template.textAreas.map((area) => {
          const currentText = texts[area.id] || '';
          const charCount = getCharacterCount(area.id);
          const charLimit = getCharacterLimit(area);
          const isFocused = focusedArea === area.id;

          return (
            <div key={area.id} className="border border-gray-200 rounded-lg p-4">
              {/* Area Header */}
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {getTextAreaLabel(area)}
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {charCount}/{charLimit}
                  </span>
                  <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getProgressColor(charCount, charLimit)}`}
                      style={{ width: `${Math.min(100, (charCount / charLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Text Input */}
              <textarea
                value={currentText}
                onChange={(e) => handleTextChange(area.id, e.target.value)}
                onFocus={() => setFocusedArea(area.id)}
                onBlur={() => setFocusedArea(null)}
                placeholder={area.placeholder}
                rows={2}
                className={`w-full p-3 border rounded-lg text-sm resize-none transition-all ${
                  isFocused 
                    ? 'border-engineer-blue ring-2 ring-engineer-blue ring-opacity-25' 
                    : 'border-gray-300 hover:border-gray-400'
                } ${charCount >= charLimit ? 'border-red-300' : ''}`}
                style={{
                  fontFamily: area.fontFamily || 'Impact, Arial Black, sans-serif',
                  fontWeight: area.fontWeight || 'bold'
                }}
              />

              {/* Area Properties Preview */}
              {isFocused && (
                <div className="mt-2 text-xs text-gray-500 flex items-center space-x-4">
                  <span>Font: {area.fontSize}px</span>
                  <span>Align: {area.align}</span>
                  <span>Color: {area.fontColor}</span>
                  <span>Position: {area.x}%, {area.y}%</span>
                </div>
              )}

              {/* Suggestions */}
              {isFocused && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Quick suggestions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {getSuggestions(area).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => applySuggestion(area.id, suggestion)}
                        className="px-2 py-1 bg-gray-100 hover:bg-engineer-blue hover:text-white text-xs rounded transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Character Limit Warning */}
              {charCount >= charLimit * 0.9 && (
                <div className="mt-2 text-xs text-yellow-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  Approaching character limit
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global Actions */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => {
            template.textAreas.forEach(area => {
              onChange(area.id, area.placeholder);
            });
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset to Defaults
        </button>

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>💡 Tip: Text updates automatically in the preview</span>
        </div>
      </div>

      {/* Text Statistics */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Total Characters:</span>
            <span className="ml-2 text-blue-600">
              {Object.values(texts).join('').length}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Words:</span>
            <span className="ml-2 text-blue-600">
              {Object.values(texts).join(' ').split(/\s+/).filter(w => w.length > 0).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};