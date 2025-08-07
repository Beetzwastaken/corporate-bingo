// Corporate Bingo - Real-time multiplayer buzzword bingo game
// Version: 1.2.1 - Force correct deployment activation

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/shared/Navigation';
import { HomePage } from './pages/HomePage';
import { BingoPage } from './pages/BingoPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Navigation activeRooms={0} />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bingo" element={<BingoPage />} />
          <Route path="*" element={<BingoPage />} />
        </Routes>

        {/* Footer */}
        <footer className="glass-panel border-t border-gray-600/50 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <p className="text-lg text-white">
              🎯 Corporate Bingo - Real-time Multiplayer Buzzword Game
            </p>
            <p className="text-gray-400 mt-2 text-sm">
              Transform boring meetings into interactive games since 2025
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
