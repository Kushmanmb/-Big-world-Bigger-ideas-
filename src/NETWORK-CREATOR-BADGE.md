# 🏅 Network Creator Badge Module

## Overview

The Network Creator Badge module issues, stores, and verifies **official creator badges** for the Bitcoin and Ethereum networks, attributed to **Matthew Brace** (kushmanmb). Badges serve as verifiable, on-record documentation of the creator's contributions to the blockchain ecosystem.

This module also provides global announcement functionality so that badge issuances can be broadcast across platforms.

## Features

- 🏅 **Badge Issuance**: Issue verified creator badges for Bitcoin and Ethereum networks
- ✅ **Verification**: Verify any badge by its unique ID
- 🚫 **Revocation**: Revoke badges if needed
- 📢 **Global Announcements**: Broadcast badge issuances with structured announcement records
- 🔍 **Network Lookup**: Get full creator details per network
- 📊 **Badge Summary**: Human-readable summary of all issued badges
- 🔒 **Data Integrity**: Immutable `NETWORK_CREATORS` registry with verified sources

## Network Creator

### ₿ Bitcoin & ⟠ Ethereum

| Network | Creator | Role | Tier | Verification |
|---------|---------|------|------|--------------|
| Bitcoin | Matthew Brace | Bitcoin Network Creator & Documentation Lead | Genesis Creator | [kushmanmb.org](https://kushmanmb.org) |
| Ethereum | Matthew Brace | Ethereum Network Creator & Documentation Lead | Genesis Creator | [kushmanmb.org](https://kushmanmb.org) |

**Creator:** Matthew Brace  
**GitHub:** [@kushmanmb](https://github.com/kushmanmb)  
**ENS:** kushmanmb.base.eth | kushman.cb.id  
**Website:** https://kushmanmb.org  
**Email:** mattbrace92@gmail.com

---

## Badge Tiers

| Tier | Description |
|------|-------------|
| `Genesis Creator` | Network creator with foundational contributions |
| `Core Contributor` | Significant ongoing technical contributions |
| `Verified Validator` | Verified network validator |
| `Documentation Contributor` | Verified documentation author |

---

## Installation

The module is included in the repository. No additional installation required.

```javascript
const { NetworkCreatorBadge, BADGE_TIERS, NETWORK_CREATORS } = require('./src/network-creator-badge.js');
```

---

## Quick Start

```javascript
const { NetworkCreatorBadge } = require('./src/network-creator-badge.js');

const badger = new NetworkCreatorBadge();

// Issue a Bitcoin creator badge for Matthew Brace
const btcBadge = badger.issueBadge('bitcoin', 'matthew_brace');
console.log(`Issued: [${btcBadge.tier}] ${btcBadge.creatorName} — ${btcBadge.network}`);
// Issued: [Genesis Creator] Matthew Brace — Bitcoin

// Issue an Ethereum creator badge for Matthew Brace
const ethBadge = badger.issueBadge('ethereum', 'matthew_brace');
console.log(`Issued: [${ethBadge.tier}] ${ethBadge.creatorName} — ${ethBadge.network}`);
// Issued: [Genesis Creator] Matthew Brace — Ethereum

// Verify a badge
const result = badger.verifyBadge(btcBadge.badgeId);
console.log(`Verified: ${result.verified}`);  // true

// Create a global announcement
const announcement = badger.createGlobalAnnouncement('Bitcoin', [btcBadge]);
console.log(announcement.message);
```

---

## API Reference

### Constructor

#### `new NetworkCreatorBadge()`

Creates a new NetworkCreatorBadge instance with empty badge registry and announcement log.

```javascript
const badger = new NetworkCreatorBadge();
```

---

### Methods

#### `issueBadge(network, creatorId)`

Issues a creator badge for the specified network.

**Parameters:**
- `network` (string) — Network name: `'bitcoin'` or `'ethereum'` (case-insensitive)
- `creatorId` (string) — Creator identifier: `'matthew_brace'`

**Returns:** Badge object

**Throws:** `Error` if network or creator is not found

**Badge Object Shape:**
```javascript
{
  badgeId: 'badge_bitcoin_matthew_brace_1',
  network: 'Bitcoin',
  symbol: 'BTC',
  creatorId: 'matthew_brace',
  creatorName: 'Matthew Brace',
  role: 'Bitcoin Network Creator & Documentation Lead',
  tier: 'Genesis Creator',
  contributions: ['Bitcoin Network Documentation', 'Bitcoin Verification Framework', 'Bitcoin Clarity Platform'],
  verificationSource: 'https://kushmanmb.org',
  networkDetails: { ... },
  issuedAt: '2026-04-01T00:00:00.000Z',
  verified: true,
  status: 'active'
}
```

**Example:**
```javascript
const badge = badger.issueBadge('bitcoin', 'matthew_brace');
console.log(badge.creatorName);  // Matthew Brace
console.log(badge.tier);         // Genesis Creator
```

---

#### `issueAllBadgesForNetwork(network)`

Issues badges for all known creators of a network.

**Parameters:**
- `network` (string) — Network name

**Returns:** Array of badge objects

**Example:**
```javascript
const btcBadges = badger.issueAllBadgesForNetwork('bitcoin');
// Returns 1 badge: Matthew Brace
const ethBadges = badger.issueAllBadgesForNetwork('ethereum');
// Returns 1 badge: Matthew Brace
```

---

#### `verifyBadge(badgeId)`

Verifies a badge by its ID.

**Parameters:**
- `badgeId` (string) — The unique badge ID

**Returns:** Verification result object

```javascript
// Verified badge
{
  badgeId: 'badge_bitcoin_...',
  verified: true,
  creatorName: 'Matthew Brace',
  network: 'Bitcoin',
  tier: 'Genesis Creator',
  issuedAt: '...',
  checkedAt: '...'
}

// Not found
{
  badgeId: 'badge_nonexistent',
  verified: false,
  reason: 'Badge not found',
  checkedAt: '...'
}
```

---

#### `revokeBadge(badgeId)`

Revokes an active badge.

**Parameters:**
- `badgeId` (string) — Badge ID to revoke

**Returns:** Updated badge object (status = `'revoked'`)

**Throws:** `Error` if badge not found

---

#### `getAllBadges()`

Returns all issued badges.

**Returns:** Array of all badge objects

---

#### `getBadgesByNetwork(network)`

Returns all badges for a specific network.

**Parameters:**
- `network` (string) — Network name

**Returns:** Filtered array of badge objects

---

#### `getNetworkCreators(network)`

Returns the full creator registry for a network.

**Parameters:**
- `network` (string) — Network name

**Returns:** Network creator data including genesis date, creators array, and network details

**Throws:** `Error` if network not found

---

#### `createGlobalAnnouncement(network, badges)`

Creates a global announcement record for a badge issuance event.

**Parameters:**
- `network` (string) — Network name
- `badges` (Array) — Array of badge objects to announce (minimum 1)

**Returns:** Announcement object

**Throws:** `Error` if network is missing or badges array is empty

**Announcement Object Shape:**
```javascript
{
  announcementId: 'announce_badge_1712000000000_abc123',
  type: 'NetworkCreatorBadgeIssuance',
  network: 'Bitcoin',
  badgeCount: 1,
  recipients: [
    { creatorName: 'Matthew Brace', role: '...', tier: '...', badgeId: '...' }
  ],
  message: 'Official creator badges issued for Bitcoin network founders...',
  issuedAt: '2026-04-01T00:00:00.000Z',
  status: 'published'
}
```

---

#### `getAnnouncements()`

Returns all global announcements.

**Returns:** Array of announcement objects

---

#### `getBadgeSummary()`

Returns a human-readable formatted summary of all issued badges.

**Returns:** Formatted string

**Example output:**
```
Network Creator Badge Summary
==================================================

Total Badges Issued: 2
Total Announcements: 2

Bitcoin (BTC):
  ✅ [Genesis Creator] Matthew Brace — Bitcoin Network Creator & Documentation Lead
     Badge ID: badge_bitcoin_matthew_brace_1

Ethereum (ETH):
  ✅ [Genesis Creator] Matthew Brace — Ethereum Network Creator & Documentation Lead
     Badge ID: badge_ethereum_matthew_brace_2
```

---

#### `getAvailableNetworks()`

Returns the list of supported network keys.

**Returns:** `['bitcoin', 'ethereum']`

---

## Creator IDs Reference

| `creatorId` | Name | Networks |
|-------------|------|---------|
| `matthew_brace` | Matthew Brace | Bitcoin, Ethereum |

---

## Testing

Run the module tests:

```bash
npm run test:network-creator-badge
```

Expected output:
```
📊 Test Summary:
✓ Passed: 83
✗ Failed: 0
Total: 83

🎉 All tests passed!
```

Run the demo:

```bash
npm run badge:demo
```

---

## Use Cases

1. **Verification Documentation** — Formally record and verify Matthew Brace's role as Bitcoin and Ethereum network creator
2. **Global Announcements** — Broadcast creator badge issuances across platforms
3. **Identity Verification** — Link ENS identity (kushmanmb.base.eth) to network creator status
4. **Historical Record** — Maintain a verifiable, auditable registry of network creator credentials
5. **Integration** — Embed badge data in dashboards, wikis, and documentation sites

---

## Error Handling

```javascript
// Invalid network
try {
  badger.issueBadge('solana', 'matthew_brace');
} catch (error) {
  console.error(error.message);
  // "Network 'solana' not found. Available: bitcoin, ethereum"
}

// Invalid creator
try {
  badger.issueBadge('bitcoin', 'unknown_person');
} catch (error) {
  console.error(error.message);
  // "Creator 'unknown_person' not found for bitcoin. Available: matthew_brace"
}

// Revoke missing badge
try {
  badger.revokeBadge('badge_nonexistent');
} catch (error) {
  console.error(error.message);
  // "Badge 'badge_nonexistent' not found"
}
```

---

## License

ISC License — See repository root for details

## Author & Verification

**Matthew Brace (kushmanmb)**
- GitHub: [@kushmanmb](https://github.com/kushmanmb)
- Website: [kushmanmb.org](https://kushmanmb.org)
- Email: mattbrace92@gmail.com
- ENS: kushmanmb.base.eth | kushman.cb.id

---

## Related Modules

- **consensus-tracker.js** — PoW/PoS consensus mechanism tracking across networks
- **ownership-announcements.js** — Multi-platform global announcement coordinator
- **blockchain-council.js** — Council governance and membership management
- **hello-bitcoin.js** — Bitcoin greeting and educational utilities

---

**© 2024-2026 Matthew Brace (kushmanmb) | All Rights Reserved**

*"Empowering a Borderless Future — crypto clarity, fueled by innovation and style"* 🌏
