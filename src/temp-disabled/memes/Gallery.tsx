// Gallery Component - Professional Meme History Display
// Features filtering, sorting, and detailed meme analytics

import React, { useState, useMemo } from 'react';
import { GeneratedMeme, EngineeringCategory } from '../types';

interface GalleryProps {
  memes: GeneratedMeme[];
  className?: string;
}

export const Gallery: React.FC<GalleryProps> = ({ memes, className = '' }) => {
  const [filter, setFilter] = useState<EngineeringCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'pain' | 'category'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMeme, setSelectedMeme] = useState<GeneratedMeme | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedMemes = useMemo(() => {
    let filtered = memes;

    // Apply category filter
    if (filter !== 'all') {
      filtered = filtered.filter(meme => meme.category === filter);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(meme => 
        Object.values(meme.texts).some(text => 
          text.toLowerCase().includes(term)
        ) ||
        meme.metadata.userInput.toLowerCase().includes(term) ||
        meme.category.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'pain':
          return b.painScore - a.painScore;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [memes, filter, sortBy, searchTerm]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(memes.map(m => m.category)));
    return cats.map(cat => ({
      key: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: memes.filter(m => m.category === cat).length
    }));
  }, [memes]);

  const handleDownload = (meme: GeneratedMeme) => {
    if (meme.imageDataUrl) {
      const link = document.createElement('a');
      link.download = `meme-${meme.id}.png`;
      link.href = meme.imageDataUrl;
      link.click();
    }
  };

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPainEmoji = (painScore: number): string => {
    if (painScore <= 3) return "😐";
    if (painScore <= 6) return "😤";
    if (painScore <= 8) return "😫";
    return "🤯";
  };

  const renderGridItem = (meme: GeneratedMeme) => (
    <div 
      key={meme.id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => setSelectedMeme(meme)}
    >
      {/* Meme Image */}
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {meme.imageDataUrl ? (
          <img 
            src={meme.imageDataUrl} 
            alt="Generated meme"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🎭</span>
          </div>
        )}
      </div>

      {/* Meme Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium capitalize text-gray-700">
            {meme.category}
          </span>
          <div className="flex items-center space-x-1">
            <span className="text-lg">{getPainEmoji(meme.painScore)}</span>
            <span className="text-sm font-bold text-gray-800">
              {meme.painScore}/10
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-600 truncate mb-2">
          {meme.metadata.userInput}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatDate(meme.timestamp)}</span>
          <span>Quality: {meme.metadata.quality}%</span>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="text-white text-center">
          <p className="font-medium mb-2">View Details</p>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(meme);
              }}
              className="px-3 py-1 bg-white bg-opacity-20 rounded text-sm hover:bg-opacity-30 transition-all"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderListItem = (meme: GeneratedMeme) => (
    <div 
      key={meme.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedMeme(meme)}
    >
      <div className="flex items-center space-x-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {meme.imageDataUrl ? (
            <img 
              src={meme.imageDataUrl} 
              alt="Meme thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xl">🎭</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium capitalize text-gray-700">
              {meme.category} Engineering
            </span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="text-sm">{getPainEmoji(meme.painScore)}</span>
                <span className="text-sm font-bold">{meme.painScore}/10</span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(meme.timestamp)}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-800 mb-1">
            {meme.metadata.userInput}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Quality: {meme.metadata.quality}%</span>
              <span>Gen: {meme.metadata.generationTime.toFixed(0)}ms</span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(meme);
              }}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🖼️</span>
          Meme Gallery ({memes.length})
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <span className="text-sm">⊞</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <span className="text-sm">☰</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search memes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-engineer-blue focus:border-engineer-blue"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as EngineeringCategory | 'all')}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-engineer-blue focus:border-engineer-blue"
            >
              <option value="all">All Categories ({memes.length})</option>
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>
                  {cat.label} ({cat.count})
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'pain' | 'category')}
              className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-engineer-blue focus:border-engineer-blue"
            >
              <option value="date">Date Created</option>
              <option value="pain">Pain Level</option>
              <option value="category">Category</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedMemes.length} of {memes.length} memes
            </div>
          </div>
        </div>
      </div>

      {/* Memes Display */}
      {filteredAndSortedMemes.length > 0 ? (
        <div className={viewMode === 'grid' ? 
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
          "space-y-4"
        }>
          {filteredAndSortedMemes.map(meme => 
            viewMode === 'grid' ? renderGridItem(meme) : renderListItem(meme)
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {memes.length === 0 ? 'No memes created yet' : 'No memes match your search'}
          </h3>
          <p className="text-gray-600 mb-4">
            {memes.length === 0 
              ? 'Start creating some corporate bingo content to build your gallery!'
              : 'Try adjusting your search terms or filters.'
            }
          </p>
          {memes.length === 0 && (
            <button className="engineer-button">
              Create Your First Meme
            </button>
          )}
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedMeme && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Meme Details</h3>
                <button
                  onClick={() => setSelectedMeme(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Meme Image */}
              <div className="mb-6">
                {selectedMeme.imageDataUrl ? (
                  <img 
                    src={selectedMeme.imageDataUrl} 
                    alt="Selected meme"
                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">🎭</span>
                  </div>
                )}
              </div>

              {/* Meme Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Category</label>
                    <p className="text-lg capitalize">{selectedMeme.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pain Level</label>
                    <p className="text-lg flex items-center space-x-1">
                      <span>{getPainEmoji(selectedMeme.painScore)}</span>
                      <span>{selectedMeme.painScore}/10</span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Original Pain Input</label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                    {selectedMeme.metadata.userInput}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Meme Text</label>
                  <div className="space-y-2">
                    {Object.entries(selectedMeme.texts).map(([key, text]) => (
                      <div key={key} className="bg-gray-50 p-2 rounded">
                        <span className="text-xs text-gray-500 capitalize">{key}:</span>
                        <p className="text-sm">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="text-xs text-gray-500">Created</label>
                    <p>{formatDate(selectedMeme.timestamp)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Quality</label>
                    <p>{selectedMeme.metadata.quality}%</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Generation Time</label>
                    <p>{selectedMeme.metadata.generationTime.toFixed(0)}ms</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleDownload(selectedMeme)}
                  className="engineer-button flex-1"
                >
                  Download Meme
                </button>
                <button
                  onClick={() => setSelectedMeme(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};