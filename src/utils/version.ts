// Application version management for Corporate Bingo
// Used for cache-busting and state migration

export const APP_VERSION = '1.6.0';

// Version history for migration logic
export const VERSION_HISTORY = [
  '1.0.0', // Initial release
  '1.1.0', // Enhanced multiplayer
  '1.2.0', // Cache-busting implementation  
  '1.2.1', // Emergency cache-busting fix
];

// Check if current version is newer than stored version
export function needsStateMigration(storedVersion?: string): boolean {
  if (!storedVersion) return true;
  
  const currentIndex = VERSION_HISTORY.indexOf(APP_VERSION);
  const storedIndex = VERSION_HISTORY.indexOf(storedVersion);
  
  // If either version is not found, or current is newer, migrate
  return currentIndex === -1 || storedIndex === -1 || currentIndex > storedIndex;
}

// Log version information for debugging
export function logVersionInfo(storedVersion?: string): void {
  console.log(`[Corporate Bingo] Version Check:`, {
    currentVersion: APP_VERSION,
    storedVersion: storedVersion || 'none',
    needsMigration: needsStateMigration(storedVersion),
    timestamp: new Date().toISOString()
  });
}

// Emergency cache clearing function
export function emergencyCacheClear(): boolean {
  try {
    // Clear localStorage
    localStorage.removeItem('corporate-bingo-store');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Force reload without cache
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('[Corporate Bingo] Emergency cache clear failed:', error);
    return false;
  }
}