// EngineerMemes.AI - Main Application Component
// Professional engineering meme generator with MCP integration

import { useEffect, useState } from 'react';
import { useMemeStore } from './utils/store';
import MemeCanvas from './components/MemeCanvas';
import { PainAnalyzer } from './components/PainAnalyzer';
import { TemplateSelector } from './components/TemplateSelector';
import { TextInput } from './components/TextInput';
import { ShareButtons } from './components/ShareButtons';
import { Gallery } from './components/Gallery';
import { AgentStatus } from './components/AgentStatus';
import type { GeneratedMeme } from './types';

function App() {
  const {
    selectedTemplate,
    currentTexts,
    painScore,
    userInput,
    generatedMemeUrl,
    templates,
    filteredTemplates,
    selectedCategory,
    generatedMemes,
    analytics,
    agents,
    setSelectedTemplate,
    updateText,
    setPainScore,
    setUserInput,
    setGeneratedMemeUrl,
    addGeneratedMeme,
    filterTemplates,
    initializeDefaultTemplates
  } = useMemeStore();

  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'create' | 'gallery' | 'analytics'>('create');

  // Initialize the application
  useEffect(() => {
    const init = async () => {
      try {
        if (templates.length === 0) {
          await initializeDefaultTemplates();
        }
        filterTemplates('all');
        
        // Select first template if none selected
        if (!selectedTemplate && filteredTemplates.length > 0) {
          setSelectedTemplate(filteredTemplates[0]);
        }
      } catch (error) {
        console.error('Failed to initialize application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleMemeGenerated = (dataUrl: string, svgContent: string) => {
    setGeneratedMemeUrl(dataUrl);

    if (selectedTemplate) {
      const newMeme: GeneratedMeme = {
        id: `meme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateId: selectedTemplate.id,
        texts: { ...currentTexts },
        painScore,
        timestamp: new Date(),
        category: selectedTemplate.category,
        imageDataUrl: dataUrl,
        svgContent,
        metadata: {
          userInput: userInput || 'Direct template usage',
          suggestedBy: 'user',
          generationTime: Math.random() * 2000 + 500, // Simulated generation time
          quality: 95 // High quality by default
        }
      };

      addGeneratedMeme(newMeme);
    }
  };

  const handleDownload = () => {
    if (generatedMemeUrl) {
      const link = document.createElement('a');
      link.download = `engineering-meme-${Date.now()}.png`;
      link.href = generatedMemeUrl;
      link.click();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-engineer-blue mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">Initializing EngineerMemes.AI</h2>
          <p className="text-gray-600">Loading templates and starting autonomous agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-engineer-blue to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                EngineerMemes.AI
              </h1>
              <p className="text-blue-100 mt-1">
                Because crying is unprofessional — {generatedMemes.length} memes generated
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm">Current Pain Level</p>
                <p className="text-2xl font-bold">{painScore}/10</p>
              </div>
              {analytics && (
                <div className="text-right">
                  <p className="text-sm">Avg Team Pain</p>
                  <p className="text-2xl font-bold">{analytics.averagePainLevel.toFixed(1)}/10</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'create', label: 'Create Meme', icon: '🎨' },
              { key: 'gallery', label: 'Gallery', icon: '🖼️', badge: generatedMemes.length },
              { key: 'analytics', label: 'Analytics', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key as typeof currentTab)}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  currentTab === tab.key
                    ? 'border-engineer-blue text-engineer-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="bg-engineer-blue text-white text-xs rounded-full px-2 py-1 ml-2">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Agent Status Bar */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-2">
          <AgentStatus agents={agents} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentTab === 'create' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Input and Controls */}
            <div className="xl:col-span-1 space-y-6">
              {/* Pain Input */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">😤</span>
                  What's Your Engineering Pain?
                </h2>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-engineer-blue focus:border-transparent"
                  rows={4}
                  placeholder="e.g., 'Client wants to change the spec after we finished fabrication and testing...'"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <PainAnalyzer painScore={painScore} />
              </div>

              {/* Template Selector */}
              <TemplateSelector
                templates={filteredTemplates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
                selectedCategory={selectedCategory}
                onCategoryChange={filterTemplates}
              />

              {/* Text Input System */}
              {selectedTemplate && (
                <TextInput
                  template={selectedTemplate}
                  texts={currentTexts}
                  onChange={updateText}
                />
              )}
            </div>

            {/* Center Column - Meme Canvas */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🎨</span>
                  Your Suffering, Visualized
                </h2>
                {selectedTemplate ? (
                  <MemeCanvas
                    template={selectedTemplate}
                    texts={currentTexts}
                    onGenerate={handleMemeGenerated}
                    quality="standard"
                    enableOptimization={true}
                  />
                ) : (
                  <div className="meme-canvas bg-gray-100 rounded-lg flex items-center justify-center h-80">
                    <div className="text-center text-gray-500">
                      <p className="text-lg font-medium">Select a template to begin</p>
                      <p className="text-sm">Choose from the templates on the left</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Share and Analytics */}
            <div className="xl:col-span-1 space-y-6">
              {/* Share Buttons */}
              {generatedMemeUrl && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <ShareButtons
                    imageUrl={generatedMemeUrl}
                    onDownload={handleDownload}
                    memeData={selectedTemplate ? {
                      template: selectedTemplate.name,
                      painScore,
                      category: selectedTemplate.category
                    } : undefined}
                  />
                </div>
              )}

              {/* Quick Analytics */}
              {analytics && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-engineer-blue">{analytics.totalMemes}</p>
                      <p className="text-sm text-gray-600">Total Memes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-pain-red">{analytics.averagePainLevel.toFixed(1)}</p>
                      <p className="text-sm text-gray-600">Avg Pain Level</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Top Categories</p>
                    {analytics.popularCategories.slice(0, 3).map((cat, index) => (
                      <div key={cat.category} className="flex justify-between text-sm">
                        <span className="capitalize">{cat.category}</span>
                        <span className="font-medium">{cat.count} memes</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Memes Preview */}
              {generatedMemes.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">🕒</span>
                    Recent Memes
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {generatedMemes.slice(0, 4).map((meme) => (
                      <div key={meme.id} className="relative group">
                        <img
                          src={meme.imageDataUrl}
                          alt="Recent meme"
                          className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => setCurrentTab('gallery')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-25 rounded-lg transition-all flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                            View
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'gallery' && (
          <Gallery memes={generatedMemes} />
        )}

        {currentTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Engineering Humor Analytics</h2>
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-800">Total Memes Generated</h3>
                  <p className="text-3xl font-bold text-blue-600">{analytics.totalMemes}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
                  <h3 className="font-bold text-red-800">Average Pain Level</h3>
                  <p className="text-3xl font-bold text-red-600">{analytics.averagePainLevel.toFixed(1)}/10</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                  <h3 className="font-bold text-green-800">Most Popular Category</h3>
                  <p className="text-xl font-bold text-green-600 capitalize">
                    {analytics.popularCategories[0]?.category || 'None'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No analytics data available yet.</p>
                <p className="text-sm text-gray-500 mt-2">Create some memes to see your team's pain patterns!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg">
            Made with 😅 by engineers, for engineers
          </p>
          <p className="text-gray-400 mt-2">
            Current Pain Level: {painScore}/10 | 
            Autonomous Agents Active: {agents.filter(a => a.active).length}/{agents.length} | 
            Professional Suffering Since 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
