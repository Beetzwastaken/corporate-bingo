import { Routes, Route } from 'react-router-dom';
import { DecodeHome } from './pages/DecodeHome';
import { CreateGame } from './pages/CreateGame';
import { JoinGame } from './pages/JoinGame';
import { Game } from './pages/Game';
import { History } from './pages/History';

export function DecodeApp() {
  return (
    <Routes>
      <Route path="/" element={<DecodeHome />} />
      <Route path="new" element={<CreateGame />} />
      <Route path="join/:gameId" element={<JoinGame />} />
      <Route path="game/:gameId" element={<Game />} />
      <Route path="game/:gameId/history" element={<History />} />
      <Route path="*" element={<DecodeHome />} />
    </Routes>
  );
}
