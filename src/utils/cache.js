// Utility for unified session storage caching
export const cache = {
  get: (key) => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Backward compatibility check for unwrapped sessionStorage items
      if (data && typeof data === "object" && "value" in data && "timestamp" in data) {
        return data.value;
      }
      return data;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      const item = { value, timestamp: Date.now() };
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.error(`Error setting cache key "${key}":`, e);
    }
  },
  isStale: (key, ttlMs = 120000) => { // Default TTL: 2 minutes (120000ms)
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return true;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object" || !("timestamp" in data)) return true;
      return Date.now() - data.timestamp > ttlMs;
    } catch {
      return true;
    }
  },
  clear: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }
};

