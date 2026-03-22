# Copilot Instructions for Big-world-Bigger-ideas

## Repository Overview

This is a blockchain documentation and crypto clarity platform that provides multiple tools and utilities for working with blockchain networks, NFTs, and cryptocurrency data. The project is a JavaScript/Node.js application with a web interface component.

**Key Information:**
- **Language:** JavaScript (Node.js CommonJS modules)
- **Size:** Small to medium repository (~30 source files)
- **Main Focus:** Blockchain utilities, NFT tracking, feature flags, and web documentation
- **Owner:** Matthew Brace (kushmanmb)

## Project Structure

**Root Directory Files:**
- `package.json` - Project configuration and dependencies
- `index.html` - Main HTML documentation page
- `editor.html` - Interactive web editor with live markdown preview
- `styles.css` - Stylesheet with Tailwind CSS
- `tailwind.config.js`, `postcss.config.js` - CSS build configuration
- `feature-flags.json` - Runtime feature flag configuration

**Source Directory (`src/`):**
Core JavaScript modules:
- `wallet.js` - Wallet encryption/decryption utilities
- `feature-flags.js` - Feature flag management system
- `erc721.js` - ERC-721 NFT token fetcher
- `token-history.js` - Git-style NFT ownership history tracker
- `bitcoin-mining.js` - Bitcoin mining data fetcher (mempool.space API)
- `metadata.js` - Metadata processing utilities

Each module has:
- `*.test.js` - Test file
- `*-example.js` - Usage demo file
- `*.md` - Module documentation (e.g., `ERC721.md`, `BITCOIN-MINING.md`)

**GitHub Configuration (`.github/`):**
- `.github/copilot-instructions.md` - This file

**Documentation:**
- `README.md` - Comprehensive repository documentation
- `src/*.md` - Module-specific documentation

**Contracts Directory (`contracts/`):**
- Contains blockchain contract-related files

## Build, Test, and Validation

### Dependencies Installation

**ALWAYS** run `npm install` or `npm ci` before running any commands after a fresh clone:
```bash
npm ci  # For CI/CD (recommended)
# OR
npm install  # For local development
```

### Testing

**Test Commands (defined in `package.json`):**
```bash
# Run ALL tests (recommended before committing)
npm test

# Run individual module tests
npm run test:wallet
npm run test:feature-flags
npm run test:erc721
npm run test:token-history
npm run test:bitcoin-mining
```

**Test Execution:**
- Tests currently use Node.js directly without an external test framework
- Each test file is self-contained and outputs results to console
- Expected output: "✅ All tests passed!" for successful tests
- Tests complete quickly (typically < 5 seconds total)
- All tests must pass before merging code

### Demo Commands

Each module has a demo script to see functionality in action:
```bash
npm run wallet:demo
npm run feature-flags:demo
npm run erc721:demo
npm run token-history:demo
npm run bitcoin-mining:demo
npm run metadata:demo
```

### CSS Build (Tailwind CSS)

Build CSS for production:
```bash
npm run build:css
```

Watch CSS for development (auto-rebuild on changes):
```bash
npm run watch:css
```

**Note:** CSS files are built into `./dist/output.css` from `./src/input.css`

## GitHub Actions & CI/CD

## Coding Guidelines

### Module System
- **Use CommonJS** (`require`/`module.exports`), NOT ES modules
- The `package.json` specifies `"type": "commonjs"`

### Error Handling
- Always validate inputs (addresses, token IDs, flags, passwords)
- Throw descriptive errors for invalid inputs
- Use try-catch blocks for external API calls

### Testing Conventions
- Test files are named `*.test.js`
- Tests log results with ✓ for pass, ✗ for fail
- Tests count passed/failed and report at end
- No external test framework - use plain Node.js

### Feature Flags
- Stored in `feature-flags.json` at repository root
- Managed via `src/feature-flags.js` module
- Updated programmatically via the module API
- Format: `{ "flags": { "flag_name": { "enabled": true, "updatedAt": "..." } } }`

## Common Patterns

### Address Validation (Blockchain)
All blockchain modules validate Ethereum addresses:
- Must be 42 characters (with 0x prefix) or 40 characters (without)
- Must be hexadecimal
- Example: `0x1234567890123456789012345678901234567890`

### Token ID Validation
- Must be non-negative integer or string representation
- Supports large numbers (BigInt compatible)

### Caching
- Modules like `erc721.js` and `bitcoin-mining.js` implement caching
- Cache timeout: 60 seconds (configurable)
- Use `clearCache()` to reset

## Working with External APIs

### Bitcoin Mining Data (`bitcoin-mining.js`)
- Uses mempool.space API
- Supports time periods: '1d', '3d', '1w', '1m', '3m', '6m', '1y', '2y', '3y', 'all'
- Has built-in caching (60s default)

### ERC-721 NFT Data (`erc721.js`)
- Supports any EVM-compatible blockchain
- Default RPC: `https://ethereum.publicnode.com`
- Can work with Ethereum, Base, Polygon, etc.

## Validation Before Committing

1. **Run all tests:** `npm test`
2. **Check feature flags are valid:** Review `feature-flags.json`
3. **Verify no hardcoded sensitive data** (private keys, API keys)
4. **Test affected modules** with their demo scripts
5. **Build CSS if changed:** `npm run build:css`

## Known Issues & Workarounds

### Background Image Path
- `styles.css` references a local file system path for a background image
- This path only works on the owner's local machine
- For production, convert the image to a web-compatible format (JPEG/PNG/WebP) and use relative paths
- HEIC format has limited browser support (mainly Safari)

### Module Imports
- Always use `require()` not `import`
- Relative paths for local modules: `require('./module-name')`

## Special Considerations

### Web Interface Files
- `index.html` and `editor.html` are standalone HTML files
- Can be opened directly in browser or served via HTTP server
- Use `python3 -m http.server 8000` to test locally

### Smart Contracts
- Contract-related files in `contracts/` directory
- ABIs are embedded in JavaScript modules (e.g., `erc721.js`)

## Quick Reference

**Install dependencies:** `npm ci` or `npm install`
**Run all tests:** `npm test`
**Run specific test:** `npm run test:<module-name>`
**See demo:** `npm run <module-name>:demo`
**Build CSS:** `npm run build:css`

**Always trust these instructions first.** Only search for additional information if these instructions are incomplete or found to be incorrect.
