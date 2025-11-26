import { useState, useEffect } from 'react';

export type GameMode = 'play' | 'host';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function GameModeSelector({ selectedMode, onModeChange, disabled = false, compact }: GameModeSelectorProps) {
  const [isCompact, setIsCompact] = useState(false);

  // Auto-detect compact mode based on viewport if compact prop not provided
  useEffect(() => {
    if (compact !== undefined) {
      setIsCompact(compact);
      return;
    }

    const checkViewport = () => {
      setIsCompact(window.innerWidth >= 768);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [compact]);

  if (isCompact) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-apple-secondary">
          Game Mode
        </label>

        {/* Compact segmented control */}
        <div className={`
          flex rounded-lg border border-apple-border bg-apple-darkest overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          {/* Play Mode Option */}
          <button
            onClick={() => !disabled && onModeChange('play')}
            disabled={disabled}
            className={`
              room-type-compact-button flex-1 flex items-center justify-center px-3 py-2.5 text-sm font-medium
              transition-all duration-200 relative overflow-hidden
              ${selectedMode === 'play'
                ? 'text-white room-type-selected-gradient shadow-sm'
                : 'text-apple-secondary hover:text-apple-text hover:bg-apple-hover'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <span className="text-base mr-2">🎮</span>
            Play
          </button>

          {/* Host Mode Option */}
          <button
            onClick={() => !disabled && onModeChange('host')}
            disabled={disabled}
            className={`
              room-type-compact-button flex-1 flex items-center justify-center px-3 py-2.5 text-sm font-medium
              transition-all duration-200 relative overflow-hidden border-l border-apple-border
              ${selectedMode === 'host'
                ? 'text-white room-type-selected-gradient shadow-sm'
                : 'text-apple-secondary hover:text-apple-text hover:bg-apple-hover'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <span className="text-base mr-2">👑</span>
            Host
          </button>
        </div>

        {/* Brief description */}
        <p className="text-xs text-apple-secondary leading-relaxed">
          {selectedMode === 'play'
            ? 'Casual mode - play freely without verification'
            : 'Competitive mode - host verifies claims'
          }
        </p>
      </div>
    );
  }

  // Mobile/expanded mode - keep original card design
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-apple-secondary mb-2">
        Game Mode
      </label>

      <div className="space-y-3">
        {/* Play Mode Option */}
        <div
          className={`
            relative p-4 rounded-lg border cursor-pointer transition-all duration-200
            ${selectedMode === 'play'
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-apple-border bg-apple-darkest hover:bg-apple-darkest/80'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => !disabled && onModeChange('play')}
        >
          {/* Selection indicator */}
          <div className={`
            absolute top-3 right-3 w-4 h-4 rounded-full border-2 transition-all
            ${selectedMode === 'play'
              ? 'border-cyan-500 bg-cyan-500'
              : 'border-apple-border bg-transparent'
            }
          `}>
            {selectedMode === 'play' && (
              <div className="w-full h-full rounded-full bg-white scale-50 transform"></div>
            )}
          </div>

          {/* Icon and content */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🎮</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-apple-text text-sm mb-1">
                Play Mode
              </h3>
              <p className="text-xs text-apple-secondary leading-relaxed">
                Casual play - mark squares freely without verification. Great for fun meetings!
              </p>
              <div className="mt-2 flex items-center space-x-2 text-xs text-apple-secondary">
                <span className="px-2 py-1 bg-blue-500/20 rounded text-blue-400">
                  Casual
                </span>
                <span>•</span>
                <span>No verification needed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Host Mode Option */}
        <div
          className={`
            relative p-4 rounded-lg border cursor-pointer transition-all duration-200
            ${selectedMode === 'host'
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-apple-border bg-apple-darkest hover:bg-apple-darkest/80'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => !disabled && onModeChange('host')}
        >
          {/* Selection indicator */}
          <div className={`
            absolute top-3 right-3 w-4 h-4 rounded-full border-2 transition-all
            ${selectedMode === 'host'
              ? 'border-cyan-500 bg-cyan-500'
              : 'border-apple-border bg-transparent'
            }
          `}>
            {selectedMode === 'host' && (
              <div className="w-full h-full rounded-full bg-white scale-50 transform"></div>
            )}
          </div>

          {/* Icon and content */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">👑</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-apple-text text-sm mb-1">
                Host Mode
              </h3>
              <p className="text-xs text-apple-secondary leading-relaxed">
                Competitive play - host verifies all claims. Perfect for serious competitions!
              </p>
              <div className="mt-2 flex items-center space-x-2 text-xs text-apple-secondary">
                <span className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-400">
                  Competitive
                </span>
                <span>•</span>
                <span>Claims require verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional info based on selection */}
      <div className="mt-3 p-3 bg-apple-darkest/50 rounded-lg">
        {selectedMode === 'play' ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              <span className="text-apple-secondary">
                Players can mark squares freely
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              <span className="text-apple-secondary">
                No approval needed for claims
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              <span className="text-apple-secondary">
                Perfect for casual play and fun
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
              <span className="text-apple-secondary">
                Host must approve all square claims
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
              <span className="text-apple-secondary">
                Fair competition with verified plays
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
              <span className="text-apple-secondary">
                Perfect for serious competitions
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
