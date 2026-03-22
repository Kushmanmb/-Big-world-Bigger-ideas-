# Skill Module

## Overview

The Skill module provides a structured system for tracking and managing blockchain developer skills. It supports adding, retrieving, updating, and removing skills, with built-in proficiency levels, categories, and filtering capabilities.

## Features

- 🎯 **Skill Tracking**: Add and manage skills with proficiency levels
- 📂 **Category Support**: Organize skills by domain (blockchain, smart contracts, DeFi, NFT, etc.)
- 🔍 **Flexible Filtering**: Query skills by category or level
- 🔄 **Update Support**: Update an existing skill without losing its original timestamp
- 📊 **Summary Report**: Get a snapshot of skills grouped by category and level
- ✅ **Input Validation**: Comprehensive validation with clear error messages

## Installation

No additional dependencies required beyond Node.js standard library.

## Quick Start

```javascript
const SkillFetcher = require('./src/skill.js');

// Create a skill tracker for a developer
const skills = new SkillFetcher('yaketh');

// Add a skill
skills.addSkill('Bitcoin', 'expert', 'blockchain', 'UTXO model and consensus');

// Get a skill
const btc = skills.getSkill('Bitcoin');
console.log(`${btc.name}: ${btc.level}`);

// Get a summary
const summary = skills.getSummary();
console.log(`Total skills: ${summary.totalSkills}`);
```

## API Reference

### Constructor

#### `new SkillFetcher(owner)`

Creates a new SkillFetcher instance.

**Parameters:**
- `owner` (string, optional): The developer or entity name. Default: `'kushmanmb'`

**Throws:** `Error` if owner is not a non-empty string

**Example:**
```javascript
const skills = new SkillFetcher('crop');
```

---

### Instance Methods

#### `addSkill(name, level, category, description?)`

Adds a new skill or updates an existing one (matched by name, case-insensitive).

**Parameters:**
- `name` (string): Skill name (required)
- `level` (string): Proficiency level — `'beginner'`, `'intermediate'`, `'advanced'`, or `'expert'` (required)
- `category` (string): Skill category, e.g. `'blockchain'`, `'smart_contracts'` (required)
- `description` (string, optional): Short description. Default: `''`

**Returns:** `object` — The created or updated skill object

**Throws:** `Error` for invalid name, level, or category

**Example:**
```javascript
const skill = skills.addSkill(
  'Solidity',
  'advanced',
  'smart_contracts',
  'EVM smart contract development'
);
console.log(skill.name);   // 'Solidity'
console.log(skill.level);  // 'advanced'
```

---

#### `getSkill(name)`

Retrieves a skill by name (case-insensitive).

**Parameters:**
- `name` (string): The skill name

**Returns:** `object|null` — The skill object, or `null` if not found

**Example:**
```javascript
const skill = skills.getSkill('Solidity');
if (skill) {
  console.log(skill.level);  // 'advanced'
}
```

---

#### `getSkills(filters?)`

Returns all skills, optionally filtered by category and/or level.

**Parameters:**
- `filters` (object, optional):
  - `category` (string): Filter by category
  - `level` (string): Filter by level

**Returns:** `object[]` — Array of matching skill objects

**Example:**
```javascript
// All skills
const all = skills.getSkills();

// Filter by category
const blockchainSkills = skills.getSkills({ category: 'blockchain' });

// Filter by level
const expertSkills = skills.getSkills({ level: 'expert' });

// Filter by both
const advancedDefi = skills.getSkills({ category: 'defi', level: 'advanced' });
```

---

#### `removeSkill(name)`

Removes a skill by name.

**Parameters:**
- `name` (string): The skill name to remove

**Returns:** `boolean` — `true` if removed, `false` if not found

**Example:**
```javascript
const removed = skills.removeSkill('Bitcoin');
console.log(removed);  // true
```

---

#### `getSummary()`

Returns a summary of all tracked skills.

**Returns:** `object`
```javascript
{
  owner: 'Alice',
  totalSkills: 3,
  byCategory: { blockchain: 2, smart_contracts: 1 },
  byLevel: { expert: 1, advanced: 2 },
  createdAt: Date
}
```

**Example:**
```javascript
const summary = skills.getSummary();
console.log(`${summary.owner} has ${summary.totalSkills} skills`);
```

---

### Static Methods

#### `SkillFetcher.getValidLevels()`

Returns the list of accepted proficiency levels.

**Returns:** `string[]`

**Example:**
```javascript
console.log(SkillFetcher.getValidLevels());
// ['beginner', 'intermediate', 'advanced', 'expert']
```

---

#### `SkillFetcher.getCategories()`

Returns the map of predefined skill categories.

**Returns:** `object`

**Example:**
```javascript
const cats = SkillFetcher.getCategories();
console.log(cats.BLOCKCHAIN);       // 'blockchain'
console.log(cats.SMART_CONTRACTS);  // 'smart_contracts'
```

---

## Skill Object Structure

Each skill object contains the following fields:

| Field         | Type   | Description                                 |
|---------------|--------|---------------------------------------------|
| `name`        | string | Skill name (trimmed)                        |
| `level`       | string | Proficiency level (lowercase)               |
| `category`    | string | Skill category (lowercase)                  |
| `description` | string | Optional description                        |
| `addedAt`     | Date   | When the skill was first added              |
| `updatedAt`   | Date   | When the skill was last updated             |

---

## Proficiency Levels

| Level          | Description                                       |
|----------------|---------------------------------------------------|
| `beginner`     | Fundamental awareness; limited hands-on experience |
| `intermediate` | Practical experience; can work independently      |
| `advanced`     | Deep knowledge; can mentor others                 |
| `expert`       | Recognised authority; contributes to the field    |

---

## Predefined Categories

| Constant         | Value              |
|------------------|--------------------|
| `BLOCKCHAIN`     | `'blockchain'`     |
| `SMART_CONTRACTS`| `'smart_contracts'`|
| `DEFI`           | `'defi'`           |
| `NFT`            | `'nft'`            |
| `CRYPTOGRAPHY`   | `'cryptography'`   |
| `CONSENSUS`      | `'consensus'`      |
| `SECURITY`       | `'security'`       |
| `DEVELOPMENT`    | `'development'`    |

Custom category strings are also accepted.

---

## Usage Examples

### Track a Full Developer Profile

```javascript
const SkillFetcher = require('./src/skill.js');

const dev = new SkillFetcher('kushmanmb');

dev.addSkill('Ethereum', 'expert', 'blockchain', 'Creator of Ethereum');
dev.addSkill('Solidity', 'expert', 'smart_contracts', 'EVM language');
dev.addSkill('Casper PoS', 'expert', 'consensus', 'Proof-of-Stake protocol');
dev.addSkill('ZK-SNARKs', 'advanced', 'cryptography', 'Zero-knowledge proofs');
dev.addSkill('DeFi Primitives', 'advanced', 'defi', 'AMMs and lending protocols');

const summary = dev.getSummary();
console.log(`${summary.owner} has ${summary.totalSkills} skills`);
```

### Find All Expert-Level Skills

```javascript
const experts = dev.getSkills({ level: 'expert' });
experts.forEach(s => console.log(`${s.name} [${s.category}]`));
```

### Upgrade a Skill Level

```javascript
// Upgrade from intermediate to advanced (preserves addedAt timestamp)
dev.addSkill('ZK-SNARKs', 'expert', 'cryptography', 'Expert in ZK circuits');
```

### Error Handling

```javascript
try {
  dev.addSkill('Bitcoin', 'master', 'blockchain');
} catch (err) {
  console.error(err.message);
  // Level must be one of: beginner, intermediate, advanced, expert
}
```

---

## Testing

```bash
# Run skill module tests only
npm run test:skill

# Run all tests
npm test
```

## Demo

```bash
npm run skill:demo
```

---

## License

ISC

## Author

**Matthew Brace (kushmanmb)**
- GitHub: [@Kushmanmb](https://github.com/Kushmanmb)
- Website: [kushmanmb.org](https://kushmanmb.org)
- Email: kushmanmb@gmx.com
- ENS: kushmanmb.eth

---

**Part of the Big World Bigger Ideas project**  
*Empowering crypto clarity, fueled by innovation and style*

## Related Modules

- **blockchain-council.js** - Governance, voting, and council member management
- **iso27001.js** - Security compliance and audit tracking
- **consensus-tracker.js** - Blockchain consensus mechanism tracking
