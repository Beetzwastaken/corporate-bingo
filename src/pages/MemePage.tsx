import { useEffect, useState } from 'react';
import { useMemeStore } from '../utils/store';
import { MemeCanvas } from '../components/memes/MemeCanvas';
import { PainAnalyzer } from '../components/memes/PainAnalyzer';
import { TemplateSelector } from '../components/memes/TemplateSelector';
import { TextInput } from '../components/memes/TextInput';
import { ShareButtons } from '../components/memes/ShareButtons';
import { Gallery } from '../components/memes/Gallery';
import { AgentStatus } from '../components/AgentStatus';
import type { GeneratedMeme } from '../types';

export function MemePage() {
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
  const [useAI, setUseAI] = useState(false);

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
        console.error('Failed to initialize meme generator:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const generateMemeText = async (pain: string, useAI: boolean = false) => {
    if (useAI) {
      // TODO: Integrate with AI backend
      // For now, return enhanced versions of pain
      const aiEnhancements = {
        'client': ['Scope creep specialist', 'Requirements archaeologist'],
        'deadline': ['Impossible timeline achiever', 'Miracle worker'],
        'bug': ['Feature enhancement', 'Undocumented behavior'],
        'meeting': ['Knowledge transfer session', 'Decision postponement gathering'],
        'spec': ['Living document', 'Creative interpretation guide']
      };
      
      const lowerPain = pain.toLowerCase();
      for (const [key, enhancements] of Object.entries(aiEnhancements)) {
        if (lowerPain.includes(key)) {
          return {
            topText: enhancements[0],
            bottomText: enhancements[1]
          };
        }
      }
      
      return {
        topText: 'Engineering Excellence',
        bottomText: 'Professional Suffering'
      };
    }
    
    // Existing keyword matching logic
    return {
      topText: pain.slice(0, 40) + (pain.length > 40 ? '...' : ''),
      bottomText: 'This is fine'
    };
  };

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
          suggestedBy: useAI ? 'ai' : 'user',
          generationTime: Math.random() * 2000 + 500,
          quality: 95
        }
      };

      addGeneratedMeme(newMeme);
    }
  };

  const handleAutoGenerate = async () => {
    if (!userInput || !selectedTemplate) return;
    
    const generatedText = await generateMemeText(userInput, useAI);
    
    // Update text inputs with generated content
    selectedTemplate.textAreas.forEach((area, index) => {
      if (index === 0) updateText(area.id, generatedText.topText);
      if (index === 1) updateText(area.id, generatedText.bottomText);
    });
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white">Initializing Meme Generator</h2>
          <p className="text-gray-400 terminal-accent">// Loading templates and starting agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Agent Status Bar */}
      <div className="glass-panel border-b border-gray-600/50">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <AgentStatus agents={agents} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-panel border-b border-gray-600/50">
        <div className="max-w-7xl mx-auto px-4">
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
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Controls */}
            <div className="space-y-6">
              
              {/* Pain Input */}
              <div className="glass-panel rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  <span className="terminal-accent">&gt;</span> Describe your engineering pain
                </h2>
                <textarea 
                  id="painInput" 
                  className="control-input w-full p-3 border border-gray-600 rounded-lg resize-none" 
                  rows={4} 
                  placeholder="e.g., Client wants to change the spec after we finished fabrication and testing..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                
                <div className="flex items-center justify-between mt-4">
                  <PainAnalyzer painScore={painScore} />
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm text-gray-300">
                      <input 
                        type="checkbox" 
                        checked={useAI}
                        onChange={(e) => setUseAI(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-blue-500"
                        disabled
                      />
                      <span>✨ AI Mode</span>
                      <span className="text-xs text-gray-500">(Coming Soon)</span>
                    </label>
                    <button 
                      onClick={handleAutoGenerate}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      disabled={!userInput || !selectedTemplate}
                    >
                      <span className="terminal-accent">$</span> Auto-Generate
                    </button>
                  </div>
                </div>
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

            {/* Right Column - Preview */}
            <div className="space-y-6">
              
              {/* Meme Preview */}
              <div className="glass-panel rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  <span className="terminal-accent">&gt;</span> Preview
                </h2>
                
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <MemeCanvas
                      template={selectedTemplate}
                      texts={currentTexts}
                      onGenerate={handleMemeGenerated}
                      quality="standard"
                      enableOptimization={true}
                    />
                    
                    {generatedMemeUrl && (
                      <ShareButtons
                        imageUrl={generatedMemeUrl}
                        onDownload={handleDownload}
                        memeData={selectedTemplate ? {
                          template: selectedTemplate.name,
                          painScore,
                          category: selectedTemplate.category
                        } : undefined}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80 bg-gray-800 rounded-lg border border-gray-600">
                    <div className="text-center text-gray-400">
                      <p className="text-lg font-medium">Select a template to begin</p>
                      <p className="text-sm">Choose from the templates on the left</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Memes Preview */}
              {generatedMemes.length > 0 && (
                <div className="glass-panel rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    <span className="terminal-accent">&gt;</span> Recent Memes
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {generatedMemes.slice(0, 4).map((meme) => (
                      <div key={meme.id} className="relative group">
                        <img
                          src={meme.imageDataUrl}
                          alt="Recent meme"
                          className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity border border-gray-600"
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
          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              <span className="terminal-accent">&gt;</span> Engineering Humor Analytics
            </h2>
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-600/20 border border-blue-500/30 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-400">Total Memes Generated</h3>
                  <p className="text-3xl font-bold text-blue-300 terminal-accent">{analytics.totalMemes}</p>
                </div>
                <div className="bg-red-600/20 border border-red-500/30 p-6 rounded-lg">
                  <h3 className="font-bold text-red-400">Average Pain Level</h3>
                  <p className="text-3xl font-bold text-red-300 terminal-accent">{analytics.averagePainLevel.toFixed(1)}/10</p>
                </div>
                <div className="bg-emerald-600/20 border border-emerald-500/30 p-6 rounded-lg">
                  <h3 className="font-bold text-emerald-400">Most Popular Category</h3>
                  <p className="text-xl font-bold text-emerald-300 capitalize terminal-accent">
                    {analytics.popularCategories[0]?.category || 'None'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No analytics data available yet.</p>
                <p className="text-sm text-gray-500 mt-2 terminal-accent">// Create some memes to see your pain patterns!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}