# Ownership Announcements API

A comprehensive system for making global blockchain ownership announcements using Google and Microsoft API frameworks.

## Overview

The Ownership Announcements API provides a unified interface for publishing blockchain ownership claims across multiple platforms including Google Docs, Google Sheets, Google Drive, OneDrive, SharePoint, and Microsoft Teams. This module is designed for documentation, verification, and announcement purposes in blockchain applications.

## Features

- ✅ **Multi-Platform Publishing**: Publish to 6+ platforms simultaneously
- ✅ **Google API Integration**: Google Docs, Sheets, and Drive support
- ✅ **Microsoft API Integration**: OneDrive, SharePoint, and Teams support
- ✅ **Ethereum Address Validation**: Built-in address format verification
- ✅ **Ownership Tracking**: Query announcements by domain, owner, or ID
- ✅ **Statistics & Analytics**: Track announcement metrics
- ✅ **Type-Safe**: Full input validation with descriptive errors

## Installation

```bash
npm install big-world-bigger-ideas
```

## Quick Start

### Basic Usage

```javascript
const OwnershipAnnouncements = require('big-world-bigger-ideas/src/ownership-announcements');

// Create coordinator instance
const announcer = new OwnershipAnnouncements({
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    clientId: process.env.GOOGLE_CLIENT_ID
  },
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    tenantId: process.env.MICROSOFT_TENANT_ID
  }
});

// Announce ethereum.org ownership (main use case)
const result = await announcer.announceEthereumOrgOwnership({
  evidence: 'https://kushmanmb.org/proof',
  ethereumAddress: '0x1234567890123456789012345678901234567890'
});

console.log(`Published to ${result.totalPlatforms} platforms`);
console.log(`Announcement ID: ${result.announcementId}`);
```

## API Reference

### OwnershipAnnouncements

Main coordinator class for multi-platform announcements.

#### Constructor

```javascript
new OwnershipAnnouncements(config)
```

**Parameters:**
- `config` (Object): Configuration object
  - `config.google` (Object): Google API configuration
    - `apiKey` (string): Google API key
    - `clientId` (string): Google OAuth client ID
    - `clientSecret` (string): Google OAuth client secret
  - `config.microsoft` (Object): Microsoft API configuration
    - `clientId` (string): Azure AD client ID
    - `clientSecret` (string): Azure AD client secret
    - `tenantId` (string): Azure AD tenant ID

#### Methods

##### `announceEthereumOrgOwnership(additionalData)`

Announce ethereum.org ownership via kushmanmb (primary use case).

**Parameters:**
- `additionalData` (Object, optional): Additional ownership data
  - `evidence` (string): Evidence URL
  - `ethereumAddress` (string): Ethereum address of owner
  - `description` (string): Additional description

**Returns:** Promise<Object> - Publication results

**Example:**
```javascript
const result = await announcer.announceEthereumOrgOwnership({
  evidence: 'https://kushmanmb.org',
  ethereumAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
});
```

##### `publishGlobalAnnouncement(ownershipData)`

Publish a custom ownership announcement to all platforms.

**Parameters:**
- `ownershipData` (Object): Ownership claim data
  - `domain` (string, required): Domain being claimed
  - `owner` (string, required): Owner identifier
  - `ethereumAddress` (string, optional): Ethereum address
  - `evidence` (string, optional): Evidence URL
  - `description` (string, optional): Description

**Returns:** Promise<Object> - Publication results with:
  - `announcementId` (string): Unique announcement ID
  - `success` (boolean): Publication success status
  - `totalPlatforms` (number): Number of platforms published to
  - `platforms` (Object): Platform-specific results
  - `summary` (Object): Publication summary

**Example:**
```javascript
const result = await announcer.publishGlobalAnnouncement({
  domain: 'my-project.org',
  owner: 'project-owner',
  ethereumAddress: '0x...',
  evidence: 'https://verification.com',
  description: 'Project ownership claim'
});
```

##### `createOwnershipAnnouncement(ownershipData)`

Create an announcement object without publishing.

**Parameters:**
- `ownershipData` (Object): Same as `publishGlobalAnnouncement`

**Returns:** Object - Formatted announcement data

##### `getGlobalAnnouncements()`

Retrieve all published announcements.

**Returns:** Array<Object> - List of all announcements

##### `getAnnouncementById(announcementId)`

Get a specific announcement by its ID.

**Parameters:**
- `announcementId` (string): Announcement ID

**Returns:** Object|null - Announcement or null if not found

##### `getAnnouncementsByDomain(domain)`

Get all announcements for a specific domain.

**Parameters:**
- `domain` (string): Domain to filter by

**Returns:** Array<Object> - Matching announcements

##### `getAnnouncementsByOwner(owner)`

Get all announcements by a specific owner.

**Parameters:**
- `owner` (string): Owner to filter by

**Returns:** Array<Object> - Matching announcements

##### `getStatistics()`

Get statistics about published announcements.

**Returns:** Object - Statistics including:
  - `totalAnnouncements` (number)
  - `uniqueDomains` (number)
  - `uniqueOwners` (number)
  - `googlePublications` (number)
  - `microsoftPublications` (number)
  - `domains` (Array<string>)
  - `owners` (Array<string>)

##### `isValidEthereumAddress(address)`

Validate an Ethereum address format.

**Parameters:**
- `address` (string): Address to validate

**Returns:** boolean - True if valid

##### `clearAllAnnouncements()`

Clear all announcements (for testing).

### GoogleAnnouncements

Google API integration module.

#### Methods

- `createOwnershipAnnouncement(ownershipData)` - Create announcement
- `publishToGoogleDocs(announcement)` - Publish to Google Docs
- `publishToGoogleSheets(announcement)` - Publish to Google Sheets
- `publishToGoogleDrive(announcement)` - Publish to Google Drive
- `publishToAll(announcement)` - Publish to all Google platforms
- `getAnnouncements()` - Get all announcements
- `clearAnnouncements()` - Clear announcements

### MicrosoftAnnouncements

Microsoft API integration module.

#### Methods

- `createOwnershipAnnouncement(ownershipData)` - Create announcement
- `publishToOneDrive(announcement)` - Publish to OneDrive
- `publishToSharePoint(announcement)` - Publish to SharePoint
- `publishToTeams(announcement)` - Publish to Microsoft Teams
- `publishToAll(announcement)` - Publish to all Microsoft platforms
- `getAnnouncements()` - Get all announcements
- `clearAnnouncements()` - Clear announcements

## Examples

### Example 1: Basic ethereum.org Announcement

```javascript
const OwnershipAnnouncements = require('big-world-bigger-ideas/src/ownership-announcements');

const announcer = new OwnershipAnnouncements();

// Announce ethereum.org ownership
const result = await announcer.announceEthereumOrgOwnership();

console.log(`Domain: ${result.domain}`);
console.log(`Owner: ${result.owner}`);
console.log(`Platforms: ${result.totalPlatforms}`);
```

### Example 2: Custom Domain Announcement

```javascript
const result = await announcer.publishGlobalAnnouncement({
  domain: 'my-blockchain.org',
  owner: 'blockchain-owner',
  ethereumAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  evidence: 'https://proof.example.com',
  description: 'Official blockchain project ownership'
});
```

### Example 3: Query Announcements

```javascript
// Get all announcements
const all = announcer.getGlobalAnnouncements();

// Get by domain
const ethAnnouncements = announcer.getAnnouncementsByDomain('ethereum.org');

// Get by owner
const myAnnouncements = announcer.getAnnouncementsByOwner('kushmanmb');

// Get statistics
const stats = announcer.getStatistics();
console.log(`Total announcements: ${stats.totalAnnouncements}`);
console.log(`Unique domains: ${stats.uniqueDomains}`);
```

### Example 4: Platform-Specific Publishing

```javascript
const GoogleAnnouncements = require('big-world-bigger-ideas/src/google-announcements');

const google = new GoogleAnnouncements({
  apiKey: process.env.GOOGLE_API_KEY
});

const announcement = google.createOwnershipAnnouncement({
  domain: 'ethereum.org',
  owner: 'kushmanmb'
});

// Publish only to Google Docs
const result = await google.publishToGoogleDocs(announcement);
console.log(`Published: ${result.url}`);
```

## Configuration

### Environment Variables

Set up environment variables for API credentials:

```bash
# Google APIs
export GOOGLE_API_KEY="your-google-api-key"
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Microsoft APIs
export MICROSOFT_CLIENT_ID="your-azure-client-id"
export MICROSOFT_CLIENT_SECRET="your-azure-client-secret"
export MICROSOFT_TENANT_ID="your-azure-tenant-id"
```

### .env File

```env
# Google API Configuration
GOOGLE_API_KEY=your-google-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft API Configuration
MICROSOFT_CLIENT_ID=your-azure-client-id
MICROSOFT_CLIENT_SECRET=your-azure-client-secret
MICROSOFT_TENANT_ID=your-azure-tenant-id
```

## Testing

```bash
# Run all announcement tests
npm run test:google-announcements
npm run test:microsoft-announcements
npm run test:ownership-announcements

# Run demos
npm run google-announcements:demo
npm run microsoft-announcements:demo
npm run ownership-announcements:demo
```

## Important Notes

⚠️ **Demonstration Mode**: The current implementation simulates API calls for demonstration purposes. In production:

1. **Implement actual Google API calls** using:
   - Google Docs API: `https://developers.google.com/docs/api`
   - Google Sheets API: `https://developers.google.com/sheets/api`
   - Google Drive API: `https://developers.google.com/drive/api`

2. **Implement actual Microsoft Graph API calls** using:
   - OneDrive API: `https://docs.microsoft.com/graph/onedrive-concept-overview`
   - SharePoint API: `https://docs.microsoft.com/graph/sharepoint-concept-overview`
   - Teams API: `https://docs.microsoft.com/graph/teams-concept-overview`

3. **Add proper authentication**:
   - OAuth 2.0 for Google APIs
   - Azure AD authentication for Microsoft APIs

4. **Implement rate limiting and error handling**

5. **Add proper API request/response handling**

## Security Considerations

- 🔐 Never commit API keys or secrets to version control
- 🔒 Use environment variables for sensitive configuration
- ✅ Validate all user input before processing
- 📝 Verify ownership claims independently
- ⚠️ This module is for documentation purposes - verify all claims through official channels

## License

ISC

## Author

Matthew Brace (kushmanmb)
- Email: kushmanmb@gmx.com
- Website: https://kushmanmb.org

## Support

For issues and questions:
- GitHub Issues: https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-/issues
- Email: kushmanmb@gmx.com
