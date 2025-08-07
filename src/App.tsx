// Corporate Suffering Suite - Multi-tool Application
// Professional meme generator and buzzword bingo suite

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/shared/Navigation';
import { HomePage } from './pages/HomePage';
import { MemePage } from './pages/MemePage';
import { BingoPage } from './pages/BingoPage';
import { useMemeStore } from './utils/store';
import './App.css';

function App() {
  const { generatedMemes } = useMemeStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Navigation totalMemes={generatedMemes.length} />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/memes" element={<MemePage />} />
          <Route path="/bingo" element={<BingoPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>

        {/* Footer */}
        <footer className="glass-panel border-t border-gray-600/50 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <p className="text-lg text-white">
              Made with 😅 by engineers, for engineers
            </p>
            <p className="text-gray-400 mt-2 terminal-accent text-sm">
              // Professional suffering solutions since 2025
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
