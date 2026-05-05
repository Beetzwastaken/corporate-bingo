// Jargon identity: localStorage-backed userId + name.
// Future migration note: when email auth is added, userId remains the stable
// key; backend records map userId → email account, so existing games carry over.

const USER_ID_KEY = 'jargon.userId';
const USER_NAME_KEY = 'jargon.userName';
// Old keys from prior naming. Read once on first access, then drop.
const LEGACY_USER_ID_KEY = 'jargon.decode.userId';
const LEGACY_USER_NAME_KEY = 'jargon.decode.userName';

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function migrateLegacy(): void {
  const legacyId = localStorage.getItem(LEGACY_USER_ID_KEY);
  if (legacyId && !localStorage.getItem(USER_ID_KEY)) {
    localStorage.setItem(USER_ID_KEY, legacyId);
  }
  const legacyName = localStorage.getItem(LEGACY_USER_NAME_KEY);
  if (legacyName && !localStorage.getItem(USER_NAME_KEY)) {
    localStorage.setItem(USER_NAME_KEY, legacyName);
  }
  localStorage.removeItem(LEGACY_USER_ID_KEY);
  localStorage.removeItem(LEGACY_USER_NAME_KEY);
}

export function getOrCreateUserId(): string {
  migrateLegacy();
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function getUserName(): string | null {
  migrateLegacy();
  return localStorage.getItem(USER_NAME_KEY);
}

export function setUserName(name: string): void {
  localStorage.setItem(USER_NAME_KEY, name.trim().slice(0, 40));
}

export function clearIdentity(): void {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
}
