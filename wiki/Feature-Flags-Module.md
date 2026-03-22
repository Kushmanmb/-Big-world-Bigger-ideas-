# Feature Flags Module

Runtime feature flag management system for enabling/disabling features without code deployment.

## 🎚️ Overview

The Feature Flags module provides:
- Runtime feature toggling
- Persistent flag storage
- Programmatic management
- Flag state tracking with timestamps
- Simple API for checking feature status

## 📦 Installation

```javascript
const featureFlags = require('big-world-bigger-ideas').featureFlags;
// or
const featureFlags = require('big-world-bigger-ideas/src/feature-flags');
```

## 🚀 Usage

### Check if Feature is Enabled

```javascript
if (featureFlags.getFlag('dark_mode')) {
  // Enable dark mode
  applyDarkMode();
}

if (featureFlags.getFlag('beta_features')) {
  // Show beta features
  showBetaFeatures();
}
```

### Set Feature Flags

```javascript
// Enable a feature
featureFlags.setFlag('new_ui', true);

// Disable a feature
featureFlags.setFlag('old_checkout', false);
```

### List All Flags

```javascript
const allFlags = featureFlags.listFlags();
console.log('All flags:', allFlags);

// Output:
// {
//   flags: {
//     dark_mode: { enabled: true, updatedAt: "2026-02-23T12:00:00.000Z" },
//     beta_features: { enabled: false, updatedAt: "2026-02-23T12:00:00.000Z" }
//   },
//   lastUpdated: "2026-02-23T12:00:00.000Z"
// }
```

### Check if Flag Exists

```javascript
if (featureFlags.hasFlag('experimental_feature')) {
  console.log('Flag exists');
} else {
  console.log('Flag does not exist');
}
```

### Remove a Flag

```javascript
featureFlags.removeFlag('deprecated_feature');
```

## 📊 API Reference

### Methods

#### `getFlag(flagName)`
Get the value of a feature flag.

**Parameters:**
- `flagName` (string): Name of the feature flag

**Returns:** `boolean` - True if enabled, false if disabled or doesn't exist

**Example:**
```javascript
const isDarkMode = featureFlags.getFlag('dark_mode');
```

#### `setFlag(flagName, value)`
Set a feature flag value.

**Parameters:**
- `flagName` (string): Name of the feature flag
- `value` (boolean): True to enable, false to disable

**Returns:** `object` - Updated flags object

**Throws:** Error if parameters are invalid

**Example:**
```javascript
featureFlags.setFlag('new_dashboard', true);
```

#### `listFlags()`
List all feature flags.

**Returns:** `object` - Object containing all flags and metadata

**Example:**
```javascript
const flags = featureFlags.listFlags();
Object.entries(flags.flags).forEach(([name, data]) => {
  console.log(`${name}: ${data.enabled ? 'ON' : 'OFF'}`);
});
```

#### `hasFlag(flagName)`
Check if a feature flag exists.

**Parameters:**
- `flagName` (string): Name of the feature flag

**Returns:** `boolean` - True if flag exists, false otherwise

**Example:**
```javascript
if (featureFlags.hasFlag('beta_program')) {
  console.log('Beta program flag is configured');
}
```

#### `removeFlag(flagName)`
Remove a feature flag.

**Parameters:**
- `flagName` (string): Name of the feature flag to remove

**Returns:** `object` - Updated flags object

**Example:**
```javascript
featureFlags.removeFlag('old_feature');
```

## 🗄️ Storage

Feature flags are stored in `feature-flags.json` at the repository root:

```json
{
  "flags": {
    "dark_mode": {
      "enabled": true,
      "updatedAt": "2026-02-23T12:00:00.000Z"
    },
    "beta_features": {
      "enabled": false,
      "updatedAt": "2026-02-23T12:00:00.000Z"
    }
  },
  "lastUpdated": "2026-02-23T12:00:00.000Z"
}
```

## 🚩 Programmatic Flag Management

Manage flags directly via the API:

**Enable a flag:**
```javascript
featureFlags.setFlag('dark_mode', true);
```

**Disable a flag:**
```javascript
featureFlags.setFlag('experimental_ui', false);
```

**List all flags:**
```javascript
featureFlags.listFlags();
```

## 💡 Use Cases

### UI Feature Toggles

```javascript
class DynamicUI {
  render() {
    let ui = '<div>';
    
    // Conditional features
    if (featureFlags.getFlag('new_header')) {
      ui += this.renderNewHeader();
    } else {
      ui += this.renderOldHeader();
    }
    
    if (featureFlags.getFlag('dark_mode')) {
      ui += '<style>.app { background: #1a1a1a; color: #fff; }</style>';
    }
    
    if (featureFlags.getFlag('beta_badge')) {
      ui += '<span class="beta">BETA</span>';
    }
    
    ui += '</div>';
    return ui;
  }
}
```

### A/B Testing

```javascript
function selectExperiment() {
  if (featureFlags.getFlag('experiment_variant_a')) {
    return 'variant-a';
  } else if (featureFlags.getFlag('experiment_variant_b')) {
    return 'variant-b';
  } else {
    return 'control';
  }
}

const variant = selectExperiment();
console.log(`User assigned to: ${variant}`);
```

### Feature Rollout

```javascript
class FeatureRollout {
  constructor() {
    this.features = [
      { name: 'new_checkout', rolloutPercentage: 10 },
      { name: 'enhanced_search', rolloutPercentage: 50 },
      { name: 'beta_analytics', rolloutPercentage: 5 }
    ];
  }
  
  isFeatureEnabled(featureName, userId) {
    // Check global flag first
    if (!featureFlags.getFlag(featureName)) {
      return false;
    }
    
    // Check rollout percentage
    const feature = this.features.find(f => f.name === featureName);
    if (!feature) return true; // If no rollout config, enable for all
    
    // Use user ID to determine if in rollout percentage
    const userHash = this.hashUserId(userId);
    return (userHash % 100) < feature.rolloutPercentage;
  }
  
  hashUserId(userId) {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
```

### Emergency Kill Switch

```javascript
async function processTransaction(transaction) {
  // Check emergency flag
  if (featureFlags.getFlag('emergency_maintenance')) {
    throw new Error('Service temporarily unavailable - maintenance mode');
  }
  
  // Disable specific features in emergency
  if (featureFlags.getFlag('disable_withdrawals')) {
    if (transaction.type === 'withdrawal') {
      throw new Error('Withdrawals temporarily disabled');
    }
  }
  
  // Process transaction
  return await executeTransaction(transaction);
}
```

### Environment-Specific Features

```javascript
// Development features
if (process.env.NODE_ENV === 'development') {
  featureFlags.setFlag('debug_mode', true);
  featureFlags.setFlag('verbose_logging', true);
}

// Staging features
if (process.env.NODE_ENV === 'staging') {
  featureFlags.setFlag('beta_features', true);
  featureFlags.setFlag('test_payments', true);
}

// Production - only stable features
if (process.env.NODE_ENV === 'production') {
  featureFlags.setFlag('beta_features', false);
  featureFlags.setFlag('experimental_ui', false);
}
```

## ⚠️ Best Practices

### 1. Descriptive Names

```javascript
// ✅ Good
featureFlags.setFlag('dark_mode', true);
featureFlags.setFlag('new_checkout_flow', true);

// ❌ Bad
featureFlags.setFlag('dm', true);
featureFlags.setFlag('ncf', true);
```

### 2. Clean Up Old Flags

```javascript
// Remove flags for fully rolled out features
featureFlags.removeFlag('beta_2023_feature');
featureFlags.removeFlag('experimental_old_ui');
```

### 3. Document Flags

```javascript
/**
 * Feature Flags:
 * 
 * - dark_mode: Enable dark mode UI theme
 * - beta_features: Show beta features to users
 * - new_checkout: Use new checkout flow (rollout in progress)
 * - experimental_ai: AI-powered features (internal testing)
 */
```

### 4. Default to Safe

```javascript
// Always default to false for new/risky features
const enableRiskyFeature = featureFlags.getFlag('risky_feature') || false;

// Use || false to handle undefined flags
if (featureFlags.getFlag('new_feature') || false) {
  // Feature code
}
```

### 5. Monitor Flag Usage

```javascript
function trackFeatureUsage(flagName) {
  const isEnabled = featureFlags.getFlag(flagName);
  
  // Log analytics
  analytics.track('feature_flag_checked', {
    flag: flagName,
    enabled: isEnabled,
    timestamp: new Date().toISOString()
  });
  
  return isEnabled;
}
```

## 🧪 Testing

Run tests:

```bash
npm run test:feature-flags
```

Run demo:

```bash
npm run feature-flags:demo
```

## 🔗 Related

- [GitHub Actions](GitHub-Actions) - Automated flag updates
- [API Reference](API-Reference) - Complete API documentation

## 💡 Advanced Usage

### Flag Dependencies

```javascript
function checkFeatureDependencies() {
  // Some features depend on others
  if (featureFlags.getFlag('advanced_analytics')) {
    // Advanced analytics requires basic analytics
    if (!featureFlags.getFlag('basic_analytics')) {
      featureFlags.setFlag('basic_analytics', true);
      console.log('Auto-enabled basic_analytics for advanced_analytics');
    }
  }
}
```

### Flag Validation

```javascript
function validateFlags() {
  const flags = featureFlags.listFlags();
  const requiredFlags = ['security_mode', 'maintenance_mode'];
  
  for (const required of requiredFlags) {
    if (!featureFlags.hasFlag(required)) {
      console.warn(`Missing required flag: ${required}`);
      featureFlags.setFlag(required, false); // Set default
    }
  }
}
```

---

**Next**: [Wallet Module](Wallet-Module)
