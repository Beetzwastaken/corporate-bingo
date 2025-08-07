// TemplateSelector Component - Professional Template Selection UI
// Features dynamic SVG templates with category filtering

import React, { useState } from 'react';
import { MemeTemplate, EngineeringCategory } from '../types';

interface TemplateSelectorProps {
  templates: MemeTemplate[];
  selectedTemplate: MemeTemplate | null;
  onSelectTemplate: (template: MemeTemplate) => void;
  selectedCategory: EngineeringCategory | 'all';
  onCategoryChange: (category: EngineeringCategory | 'all') => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  selectedCategory,
  onCategoryChange
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories: Array<{key: EngineeringCategory | 'all', label: string, icon: string}> = [
    { key: 'all', label: 'All Templates', icon: '🎯' },
    { key: 'general', label: 'General', icon: '⚙️' },
    { key: 'mechanical', label: 'Mechanical', icon: '🔧' },
    { key: 'electrical', label: 'Electrical', icon: '⚡' },
    { key: 'software', label: 'Software', icon: '💻' },
    { key: 'civil', label: 'Civil', icon: '🏗️' },
    { key: 'chemical', label: 'Chemical', icon: '🧪' }
  ];

  const handleTemplateClick = (template: MemeTemplate) => {
    onSelectTemplate(template);
    
    // Update template popularity
    template.popularity = Math.min(100, template.popularity + 0.5);
    template.lastUsed = new Date();
  };

  const renderTemplateCard = (template: MemeTemplate) => (
    <div
      key={template.id}
      onClick={() => handleTemplateClick(template)}
      className={`template-card ${
        selectedTemplate?.id === template.id ? 'selected' : ''
      } relative group`}
    >
      {/* Template Preview */}
      <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden mb-2">
        {template.svgContent ? (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: template.svgContent }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-2xl">🎭</span>
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="p-2">
        <h4 className="font-medium text-sm text-gray-800 truncate">
          {template.name}
        </h4>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 capitalize">
            {template.category}
          </span>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-400">
              {template.painLevel}/10
            </span>
            {template.popularity > 50 && (
              <span className="text-xs">🔥</span>
            )}
          </div>
        </div>
      </div>

      {/* Hover overlay with details */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-75 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="text-white text-center px-2">
          <p className="text-xs font-medium mb-1">{template.name}</p>
          <p className="text-xs opacity-90 mb-2">{template.description}</p>
          <div className="flex justify-center space-x-2 text-xs">
            <span>Pain: {template.painLevel}/10</span>
            <span>•</span>
            <span>{template.textAreas.length} areas</span>
          </div>
        </div>
      </div>

      {/* Creation badge */}
      {template.createdBy === 'agent' && (
        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
          AI
        </div>
      )}
    </div>
  );

  const renderTemplateList = (template: MemeTemplate) => (
    <div
      key={template.id}
      onClick={() => handleTemplateClick(template)}
      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
        selectedTemplate?.id === template.id 
          ? 'bg-engineer-blue text-white' 
          : 'bg-white hover:bg-gray-50'
      }`}
    >
      {/* Template Thumbnail */}
      <div className="w-12 h-12 bg-gray-100 rounded-md mr-3 flex-shrink-0">
        {template.svgContent ? (
          <div 
            className="w-full h-full rounded-md overflow-hidden"
            dangerouslySetInnerHTML={{ __html: template.svgContent }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-lg">🎭</span>
          </div>
        )}
      </div>

      {/* Template Details */}
      <div className="flex-1">
        <h4 className="font-medium text-sm mb-1">{template.name}</h4>
        <div className="flex items-center space-x-3 text-xs opacity-75">
          <span className="capitalize">{template.category}</span>
          <span>Pain: {template.painLevel}/10</span>
          <span>{template.textAreas.length} text areas</span>
          {template.popularity > 70 && <span>🔥 Popular</span>}
        </div>
      </div>

      {/* Selection indicator */}
      {selectedTemplate?.id === template.id && (
        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center ml-3">
          <span className="text-engineer-blue text-sm">✓</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🎭</span>
          Choose Your Weapon
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Grid view"
          >
            <span className="text-sm">⊞</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="List view"
          >
            <span className="text-sm">☰</span>
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.key}
              onClick={() => onCategoryChange(category.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                selectedCategory === category.key
                  ? 'bg-engineer-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
              {category.key !== 'all' && (
                <span className="text-xs opacity-75">
                  ({templates.filter(t => t.category === category.key).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Template Count and Sort Info */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
        <span>
          {templates.length} templates available
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        </span>
        <span className="text-xs">
          Sorted by popularity
        </span>
      </div>

      {/* Templates Display */}
      {templates.length > 0 ? (
        <div className={viewMode === 'grid' ? 
          "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" : 
          "space-y-2"
        }>
          {templates.map(template => 
            viewMode === 'grid' ? 
              renderTemplateCard(template) : 
              renderTemplateList(template)
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎭</div>
          <p className="text-gray-600 mb-2">No templates found</p>
          <p className="text-sm text-gray-500">
            Try selecting a different category or wait for templates to load
          </p>
        </div>
      )}

      {/* Template Creation Hint */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-medium">💡 Pro Tip:</span> Describe your pain in the text box above, 
          and our AI agents will automatically suggest or create the perfect template for your suffering.
        </p>
      </div>
    </div>
  );
};