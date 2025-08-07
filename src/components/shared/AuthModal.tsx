import { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onModeChange: (mode: 'login' | 'signup') => void;
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-panel rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            <span className="terminal-accent">&gt;</span> {mode === 'login' ? 'Login' : 'Sign Up'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="control-input w-full p-3 border border-gray-600 rounded-lg text-sm"
              placeholder="engineer@company.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="control-input w-full p-3 border border-gray-600 rounded-lg text-sm"
              placeholder="••••••••"
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
            <span className="terminal-accent">$</span> {mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button 
            onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>🚧 Authentication coming soon</p>
          <p className="terminal-accent">// Currently in development</p>
        </div>
      </div>
    </div>
  );
}