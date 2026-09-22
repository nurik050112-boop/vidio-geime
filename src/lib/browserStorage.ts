// Storage can be unavailable in private browsing or when the device is full.
export const browserStorage = {
  getItem(key: string): string | null {
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  setItem(key: string, value: string): boolean {
    try { window.localStorage.setItem(key, value); return true; } catch { return false; }
  },
  removeItem(key: string) {
    try { window.localStorage.removeItem(key); } catch { /* The game can continue in memory. */ }
  },
};
