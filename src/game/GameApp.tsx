import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { CreateGame } from './pages/CreateGame';
import { JoinGame } from './pages/JoinGame';
import { Game } from './pages/Game';
import { History } from './pages/History';

export function GameApp() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="new" element={<CreateGame />} />
      <Route path="join/:gameId" element={<JoinGame />} />
      <Route path="game/:gameId" element={<Game />} />
      <Route path="game/:gameId/history" element={<History />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
