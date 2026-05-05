import { Routes, Route } from 'react-router-dom';
import { LegacyApp } from './LegacyApp';
import { DecodeApp } from './decode/DecodeApp';

function App() {
  return (
    <Routes>
      <Route path="/decode/*" element={<DecodeApp />} />
      <Route path="*" element={<LegacyApp />} />
    </Routes>
  );
}

export default App;
