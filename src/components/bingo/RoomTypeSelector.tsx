import { useState, useEffect } from 'react';
import type { RoomType } from '../../stores/multiRoomStore';

interface RoomTypeSelectorProps {
  selectedType: RoomType;
  onTypeChange: (type: RoomType) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function RoomTypeSelector({ selectedType, onTypeChange, disabled = false, compact }: RoomTypeSelectorProps) {
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
          Room Type
        </label>
        
        {/* Compact segmented control */}
        <div className={`
          flex rounded-lg border border-apple-border bg-apple-darkest overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          {/* Single Meeting Option */}
          <button
            onClick={() => !disabled && onTypeChange('single')}
            disabled={disabled}
            className={`
              room-type-compact-button flex-1 flex items-center justify-center px-3 py-2.5 text-sm font-medium 
              transition-all duration-200 relative overflow-hidden
              ${selectedType === 'single'
                ? 'text-white room-type-selected-gradient shadow-sm' 
                : 'text-apple-secondary hover:text-apple-text hover:bg-apple-hover'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <span className="text-base mr-2">⏱️</span>
            Meeting
          </button>
          
          {/* Persistent Team Option */}
          <button
            onClick={() => !disabled && onTypeChange('persistent')}
            disabled={disabled}
            className={`
              room-type-compact-button flex-1 flex items-center justify-center px-3 py-2.5 text-sm font-medium 
              transition-all duration-200 relative overflow-hidden border-l border-apple-border
              ${selectedType === 'persistent'
                ? 'text-white room-type-selected-gradient shadow-sm' 
                : 'text-apple-secondary hover:text-apple-text hover:bg-apple-hover'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <span className="text-base mr-2">♾️</span>
            Team
          </button>
        </div>
        
        {/* Brief description */}
        <p className="text-xs text-apple-secondary leading-relaxed">
          {selectedType === 'single' 
            ? 'One-time meeting room that auto-expires after 24 hours'
            : 'Persistent team room with cumulative scoring and leaderboards'
          }
        </p>
      </div>
    );
  }

  // Mobile/expanded mode - keep original card design
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-apple-secondary mb-2">
        Room Type
      </label>
      
      <div className="space-y-3">
        {/* Single Meeting Room Option */}
        <div 
          className={`
            relative p-4 rounded-lg border cursor-pointer transition-all duration-200
            ${selectedType === 'single' 
              ? 'border-cyan-500 bg-cyan-500/10' 
              : 'border-apple-border bg-apple-darkest hover:bg-apple-darkest/80'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => !disabled && onTypeChange('single')}
        >
          {/* Selection indicator */}
          <div className={`
            absolute top-3 right-3 w-4 h-4 rounded-full border-2 transition-all
            ${selectedType === 'single' 
              ? 'border-cyan-500 bg-cyan-500' 
              : 'border-apple-border bg-transparent'
            }
          `}>
            {selectedType === 'single' && (
              <div className="w-full h-full rounded-full bg-white scale-50 transform"></div>
            )}
          </div>
          
          {/* Icon and content */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">⏱️</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-apple-text text-sm mb-1">
                Single Meeting
              </h3>
              <p className="text-xs text-apple-secondary leading-relaxed">
                One-time use for specific meetings. Auto-expires after 24 hours or 2 hours of inactivity.
              </p>
              <div className="mt-2 flex items-center space-x-2 text-xs text-apple-secondary">
                <span className="px-2 py-1 bg-blue-500/20 rounded text-blue-400 font-mono">
                  MTG-XXXX
                </span>
                <span>•</span>
                <span>Perfect for one-off meetings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Persistent Room Option */}
        <div 
          className={`
            relative p-4 rounded-lg border cursor-pointer transition-all duration-200
            ${selectedType === 'persistent' 
              ? 'border-cyan-500 bg-cyan-500/10' 
              : 'border-apple-border bg-apple-darkest hover:bg-apple-darkest/80'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => !disabled && onTypeChange('persistent')}
        >
          {/* Selection indicator */}
          <div className={`
            absolute top-3 right-3 w-4 h-4 rounded-full border-2 transition-all
            ${selectedType === 'persistent' 
              ? 'border-cyan-500 bg-cyan-500' 
              : 'border-apple-border bg-transparent'
            }
          `}>
            {selectedType === 'persistent' && (
              <div className="w-full h-full rounded-full bg-white scale-50 transform"></div>
            )}
          </div>
          
          {/* Icon and content */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">♾️</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-apple-text text-sm mb-1">
                Persistent Team
              </h3>
              <p className="text-xs text-apple-secondary leading-relaxed">
                Long-running room for teams. Maintains cumulative scores and leaderboards over time.
              </p>
              <div className="mt-2 flex items-center space-x-2 text-xs text-apple-secondary">
                <span className="px-2 py-1 bg-green-500/20 rounded text-green-400 font-mono">
                  TEAM-XXXX
                </span>
                <span>•</span>
                <span>Never expires</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional info based on selection */}
      <div className="mt-3 p-3 bg-apple-darkest/50 rounded-lg">
        {selectedType === 'single' ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              <span className="text-apple-secondary">
                Room automatically expires after 24 hours or 2 hours of inactivity
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              <span className="text-apple-secondary">
                Perfect for one-time meetings, workshops, or events
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              <span className="text-apple-secondary">
                Scores reset with each new game session
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-green-400 rounded-full"></span>
              <span className="text-apple-secondary">
                Room persists indefinitely with cumulative scoring
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-green-400 rounded-full"></span>
              <span className="text-apple-secondary">
                Weekly and monthly leaderboards track long-term performance
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-1 h-1 bg-green-400 rounded-full"></span>
              <span className="text-apple-secondary">
                Ideal for teams, departments, or ongoing groups
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}