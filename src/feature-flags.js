/**
 * Feature Flags Management Module
 * Provides functionality to manage feature flags for the application
 */

const fs = require('fs');
const path = require('path');

const FEATURE_FLAGS_FILE = path.join(__dirname, '..', 'feature-flags.json');

// In-memory cache to avoid redundant disk reads on every flag operation.
// Populated on first load and kept in sync after every write.
// Note: this module is designed for single-threaded use. If worker threads
// share this module they should call invalidateCache() before reading so each
// thread reloads from disk rather than relying on a potentially stale cache.
let _cache = null;

/**
 * Loads feature flags from the in-memory cache, falling back to the JSON file
 * on the first call (or after the cache has been explicitly invalidated).
 * @returns {object} Feature flags object
 */
function loadFlags() {
  if (_cache !== null) {
    return _cache;
  }
  try {
    if (fs.existsSync(FEATURE_FLAGS_FILE)) {
      const data = fs.readFileSync(FEATURE_FLAGS_FILE, 'utf8');
      _cache = JSON.parse(data);
      return _cache;
    }
  } catch (error) {
    console.error('Error loading feature flags:', error.message);
  }
  _cache = { flags: {}, lastUpdated: null };
  return _cache;
}

/**
 * Saves feature flags to the JSON file and updates the in-memory cache.
 * @param {object} flagsData - Feature flags data object
 */
function saveFlags(flagsData) {
  try {
    fs.writeFileSync(
      FEATURE_FLAGS_FILE,
      JSON.stringify(flagsData, null, 2),
      'utf8'
    );
    _cache = flagsData;
  } catch (error) {
    console.error('Error saving feature flags:', error.message);
    throw error;
  }
}

/**
 * Invalidates the in-memory cache, forcing the next read to reload from disk.
 * Useful when the flags file has been modified externally.
 */
function invalidateCache() {
  _cache = null;
}

/**
 * Sets a feature flag value
 * @param {string} flagName - Name of the feature flag
 * @param {boolean} value - Value to set (true/false)
 * @returns {object} Updated feature flags object
 */
function setFlag(flagName, value) {
  if (!flagName || typeof flagName !== 'string') {
    throw new Error('Flag name must be a non-empty string');
  }
  
  if (typeof value !== 'boolean') {
    throw new Error('Flag value must be a boolean');
  }
  
  const flagsData = loadFlags();
  flagsData.flags[flagName] = {
    enabled: value,
    updatedAt: new Date().toISOString()
  };
  flagsData.lastUpdated = new Date().toISOString();
  
  saveFlags(flagsData);
  return flagsData;
}

/**
 * Gets a feature flag value
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} Feature flag value (defaults to false if not found)
 */
function getFlag(flagName) {
  if (!flagName || typeof flagName !== 'string') {
    throw new Error('Flag name must be a non-empty string');
  }
  
  const flagsData = loadFlags();
  return flagsData.flags[flagName]?.enabled || false;
}

/**
 * Lists all feature flags
 * @returns {object} All feature flags with their values
 */
function listFlags() {
  const flagsData = loadFlags();
  return flagsData;
}

/**
 * Removes a feature flag
 * @param {string} flagName - Name of the feature flag to remove
 * @returns {object} Updated feature flags object
 */
function removeFlag(flagName) {
  if (!flagName || typeof flagName !== 'string') {
    throw new Error('Flag name must be a non-empty string');
  }
  
  const flagsData = loadFlags();
  if (flagsData.flags[flagName]) {
    delete flagsData.flags[flagName];
    flagsData.lastUpdated = new Date().toISOString();
    saveFlags(flagsData);
  }
  
  return flagsData;
}

/**
 * Checks if a feature flag exists
 * @param {string} flagName - Name of the feature flag
 * @returns {boolean} True if the flag exists
 */
function hasFlag(flagName) {
  if (!flagName || typeof flagName !== 'string') {
    throw new Error('Flag name must be a non-empty string');
  }
  
  const flagsData = loadFlags();
  return flagName in flagsData.flags;
}

module.exports = {
  setFlag,
  getFlag,
  listFlags,
  removeFlag,
  hasFlag,
  invalidateCache
};
