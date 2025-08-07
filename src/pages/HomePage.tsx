import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎯 Corporate Bingo
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Transform boring meetings into interactive multiplayer games
          </p>
          <p className="text-gray-400 text-sm">
            Real-time buzzword bingo with colleagues - make meetings fun again!
          </p>
        </div>

        {/* Game Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Real-time Multiplayer */}
          <div className="glass-panel rounded-lg p-6 text-center border border-gray-600/50">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-white mb-3">Real-time Multiplayer</h3>
            <p className="text-gray-300 text-sm">
              Create or join rooms with colleagues. Play bingo together during meetings with instant synchronization.
            </p>
          </div>

          {/* Buzzword Library */}
          <div className="glass-panel rounded-lg p-6 text-center border border-gray-600/50">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-white mb-3">400+ Buzzwords</h3>
            <p className="text-gray-300 text-sm">
              Curated corporate buzzwords and meeting phrases. From "synergy" to "circle back" - we've got them all.
            </p>
          </div>

          {/* Easy to Play */}
          <div className="glass-panel rounded-lg p-6 text-center border border-gray-600/50">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">Quick Setup</h3>
            <p className="text-gray-300 text-sm">
              No registration required. Create a room, share the code with teammates, and start playing instantly.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-16">
          <Link 
            to="/bingo"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            🎯 Start Playing Now
          </Link>
          <p className="text-gray-400 mt-4 text-sm">
            Join the fun - make your next meeting more engaging!
          </p>
        </div>

        {/* How It Works */}
        <div className="glass-panel rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            How to Play Corporate Bingo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">1️⃣</div>
              <h3 className="text-lg font-semibold text-white mb-2">Create or Join Room</h3>
              <p className="text-gray-400 text-sm">
                Start a new game room or join an existing one with a 6-character room code shared by a colleague.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">2️⃣</div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Your Bingo Card</h3>
              <p className="text-gray-400 text-sm">
                Each player gets a unique 5x5 bingo card filled with corporate buzzwords and meeting phrases.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">3️⃣</div>
              <h3 className="text-lg font-semibold text-white mb-2">Mark & Win</h3>
              <p className="text-gray-400 text-sm">
                Mark off buzzwords as you hear them in your meeting. First to get 5 in a row wins!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}