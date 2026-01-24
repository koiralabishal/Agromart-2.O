/**
 * Cache utility with automatic expiration
 * Stores data in localStorage with a timestamp
 */

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Set cache with expiration timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} duration - Cache duration in milliseconds (default: 30 minutes)
 */
export const setCache = (key, data, duration = CACHE_DURATION) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration,
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Error setting cache for ${key}:`, error);
  }
};

/**
 * Get cache if not expired, otherwise return null
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
export const getCache = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache has expired
    if (now > cacheData.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error(`Error getting cache for ${key}:`, error);
    return null;
  }
};

/**
 * Check if cache exists and is valid
 * @param {string} key - Cache key
 * @returns {boolean} - True if cache exists and is not expired
 */
export const isCacheValid = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return false;

    const cacheData = JSON.parse(cached);
    return Date.now() <= cacheData.expiresAt;
  } catch (error) {
    return false;
  }
};

/**
 * Clear specific cache
 * @param {string} key - Cache key
 */
export const clearCache = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error clearing cache for ${key}:`, error);
  }
};

/**
 * Clear all expired caches
 */
export const clearExpiredCaches = () => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach((key) => {
      if (key.startsWith("cached_")) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheData = JSON.parse(cached);
            if (cacheData.expiresAt && now > cacheData.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          // Skip invalid cache entries
        }
      }
    });
  } catch (error) {
    console.error("Error clearing expired caches:", error);
  }
};

/**
 * Get cache age in minutes
 * @param {string} key - Cache key
 * @returns {number|null} - Age in minutes or null if not found
 */
export const getCacheAge = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    const ageMs = Date.now() - cacheData.timestamp;
    return Math.floor(ageMs / 60000); // Convert to minutes
  } catch (error) {
    return null;
  }
};
