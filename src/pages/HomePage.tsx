import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="terminal-accent">$</span> Corporate Suffering Suite
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Making corporate pain slightly more bearable
          </p>
          <p className="text-gray-400 terminal-accent text-sm">
            // Professional suffering solutions since 2025
          </p>
        </div>

        {/* Tool Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Meme Generator */}
          <Link to="/memes" className="group">
            <div className="glass-panel rounded-lg p-8 h-full transition-all duration-200 hover:scale-105 border border-gray-600/50 hover:border-blue-500/50">
              <div className="text-center">
                <div className="text-6xl mb-4">🎭</div>
                <h2 className="text-2xl font-bold text-white mb-3">Meme Generator</h2>
                <p className="text-gray-300 mb-4">Turn suffering into content</p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p><span className="terminal-accent">•</span> AI-powered text generation</p>
                  <p><span className="terminal-accent">•</span> Engineering-specific templates</p>
                  <p><span className="terminal-accent">•</span> Pain level analysis</p>
                  <p><span className="terminal-accent">•</span> Professional sharing tools</p>
                </div>
                <div className="mt-6">
                  <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg group-hover:bg-blue-500 transition-colors">
                    <span className="terminal-accent">$</span> Generate Memes
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Buzzword Bingo */}
          <Link to="/bingo" className="group">
            <div className="glass-panel rounded-lg p-8 h-full transition-all duration-200 hover:scale-105 border border-gray-600/50 hover:border-emerald-500/50">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-white mb-3">Buzzword Bingo</h2>
                <p className="text-gray-300 mb-4">Corporate survival game</p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p><span className="terminal-accent">•</span> Real-time multiplayer rooms</p>
                  <p><span className="terminal-accent">•</span> Corporate buzzword library</p>
                  <p><span className="terminal-accent">•</span> Achievement system</p>
                  <p><span className="terminal-accent">•</span> Meeting survival stats</p>
                </div>
                <div className="mt-6">
                  <span className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg group-hover:bg-emerald-500 transition-colors">
                    <span className="terminal-accent">$</span> Play Bingo
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="glass-panel rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            <span className="terminal-accent">&gt;</span> Why Choose Suffering Suite?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-gray-400 text-sm">
                Advanced algorithms trained on years of corporate suffering to generate perfect content
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="text-lg font-semibold text-white mb-2">Gamified Experience</h3>
              <p className="text-gray-400 text-sm">
                Turn boring meetings into competitive experiences with achievements and stats
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="text-lg font-semibent text-white mb-2">Corporate Ready</h3>
              <p className="text-gray-400 text-sm">
                Professional tools designed by engineers who understand the daily pain points
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4 terminal-accent">
            // Ready to transform your corporate suffering?
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link 
              to="/memes"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Start Creating Memes
            </Link>
            <Link 
              to="/bingo"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Play Bingo Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}