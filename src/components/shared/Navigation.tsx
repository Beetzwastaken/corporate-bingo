import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  totalMemes: number;
}

export function Navigation({ totalMemes }: NavigationProps) {
  const location = useLocation();

  const navItems = [
    {
      path: '/memes',
      name: 'Meme Generator',
      icon: '🎭',
      description: 'Turn suffering into content'
    },
    {
      path: '/bingo',
      name: 'Buzzword Bingo',
      icon: '🎯',
      description: 'Corporate survival game'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: '📊',
      description: 'Performance analytics'
    }
  ];

  return (
    <nav className="glass-panel border-b border-gray-600">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 py-4">
              <span className="text-2xl">😅</span>
              <div>
                <h1 className="text-xl font-bold text-white">
                  <span className="terminal-accent">$</span> Corporate Suffering Suite
                </h1>
                <p className="text-xs text-gray-400 terminal-accent">// Making pain profitable</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="hidden md:block">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <div className="terminal-accent font-mono">{totalMemes}</div>
              <div className="text-gray-400 text-xs">Total Memes</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}