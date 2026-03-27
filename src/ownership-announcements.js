/**
 * Ownership Announcement Coordinator
 * 
 * Coordinates global announcements of blockchain ownership across multiple platforms
 * using Google and Microsoft APIs
 * 
 * @module ownership-announcements
 */

const GoogleAnnouncements = require('./google-announcements');
const MicrosoftAnnouncements = require('./microsoft-announcements');

/**
 * Ownership Announcements class for coordinating multi-platform announcements
 */
class OwnershipAnnouncements {
  /**
   * Create a new OwnershipAnnouncements coordinator
   * @param {Object} config - Configuration object
   * @param {Object} config.google - Google API configuration
   * @param {Object} config.microsoft - Microsoft API configuration
   */
  constructor(config = {}) {
    this.google = new GoogleAnnouncements(config.google || {});
    this.microsoft = new MicrosoftAnnouncements(config.microsoft || {});
    this.globalAnnouncements = [];
  }

  /**
   * Validate Ethereum address format
   * @param {string} address - Ethereum address to validate
   * @returns {boolean} True if valid
   */
  isValidEthereumAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }
    
    // Remove 0x prefix if present
    const cleanAddress = address.toLowerCase().replace('0x', '');
    
    // Check if it's 40 hex characters
    return /^[0-9a-f]{40}$/.test(cleanAddress);
  }

  /**
   * Create a comprehensive ownership announcement
   * @param {Object} ownershipData - Ownership claim data
   * @param {string} ownershipData.domain - Domain being claimed (e.g., "ethereum.org")
   * @param {string} ownershipData.owner - Owner identifier (e.g., "kushmanmb")
   * @param {string} ownershipData.ethereumAddress - Ethereum address of owner (optional)
   * @param {string} ownershipData.evidence - Evidence URL or documentation
   * @param {string} ownershipData.description - Additional description
   * @returns {Object} Formatted announcement data
   */
  createOwnershipAnnouncement(ownershipData) {
    if (!ownershipData || typeof ownershipData !== 'object') {
      throw new Error('Ownership data must be an object');
    }
    
    if (!ownershipData.domain) {
      throw new Error('Domain is required for ownership announcement');
    }
    
    if (!ownershipData.owner) {
      throw new Error('Owner identifier is required');
    }

    // Validate Ethereum address if provided
    if (ownershipData.ethereumAddress && !this.isValidEthereumAddress(ownershipData.ethereumAddress)) {
      throw new Error('Invalid Ethereum address format');
    }

    const announcement = {
      title: `Global Ownership Announcement: ${ownershipData.domain}`,
      domain: ownershipData.domain,
      owner: ownershipData.owner,
      ethereumAddress: ownershipData.ethereumAddress || null,
      evidence: ownershipData.evidence || 'No evidence provided',
      description: ownershipData.description || 'Blockchain ownership claim',
      timestamp: new Date().toISOString(),
      announcementId: `announce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'created'
    };

    return announcement;
  }

  /**
   * Publish ownership announcement to all platforms
   * @param {Object} ownershipData - Ownership claim data
   * @returns {Object} Publication results from all platforms
   */
  async publishGlobalAnnouncement(ownershipData) {
    const announcement = this.createOwnershipAnnouncement(ownershipData);
    
    // Create platform-specific announcements
    const googleAnnouncement = this.google.createOwnershipAnnouncement(ownershipData);
    const microsoftAnnouncement = this.microsoft.createOwnershipAnnouncement(ownershipData);

    // Publish to all platforms
    const [googleResults, microsoftResults] = await Promise.all([
      this.google.publishToAll(googleAnnouncement),
      this.microsoft.publishToAll(microsoftAnnouncement)
    ]);

    const result = {
      announcementId: announcement.announcementId,
      success: true,
      domain: ownershipData.domain,
      owner: ownershipData.owner,
      publishedAt: new Date().toISOString(),
      platforms: {
        google: googleResults,
        microsoft: microsoftResults
      },
      totalPlatforms: 6, // Google Docs, Sheets, Drive + OneDrive, SharePoint, Teams
      summary: this.createPublicationSummary(googleResults, microsoftResults)
    };

    this.globalAnnouncements.push(result);
    return result;
  }

  /**
   * Create a publication summary
   * @param {Object} googleResults - Google publication results
   * @param {Object} microsoftResults - Microsoft publication results
   * @returns {Object} Summary of publications
   */
  createPublicationSummary(googleResults, microsoftResults) {
    const allResults = [
      ...googleResults.results,
      ...microsoftResults.results
    ];

    return {
      totalPublications: allResults.length,
      successfulPublications: allResults.filter(r => r.success).length,
      failedPublications: allResults.filter(r => !r.success).length,
      platforms: allResults.map(r => r.platform),
      urls: allResults.map(r => r.url)
    };
  }

  /**
   * Announce ethereum.org ownership via kushmanmb
   * This is the specific use case mentioned in the requirements
   * @param {Object} additionalData - Additional ownership data (optional)
   * @returns {Object} Publication results
   */
  async announceEthereumOrgOwnership(additionalData = {}) {
    const ownershipData = {
      domain: 'ethereum.org',
      owner: 'kushmanmb',
      description: 'Blockchain documentation and verification claim for ethereum.org',
      evidence: additionalData.evidence || 'https://kushmanmb.org',
      ethereumAddress: additionalData.ethereumAddress || null,
      ...additionalData
    };

    return await this.publishGlobalAnnouncement(ownershipData);
  }

  /**
   * Get all global announcements
   * @returns {Array} List of all announcements
   */
  getGlobalAnnouncements() {
    return this.globalAnnouncements;
  }

  /**
   * Get announcement by ID
   * @param {string} announcementId - Announcement ID to retrieve
   * @returns {Object|null} Announcement or null if not found
   */
  getAnnouncementById(announcementId) {
    return this.globalAnnouncements.find(a => a.announcementId === announcementId) || null;
  }

  /**
   * Get announcements by domain
   * @param {string} domain - Domain to filter by
   * @returns {Array} Announcements for the specified domain
   */
  getAnnouncementsByDomain(domain) {
    return this.globalAnnouncements.filter(a => a.domain === domain);
  }

  /**
   * Get announcements by owner
   * @param {string} owner - Owner to filter by
   * @returns {Array} Announcements by the specified owner
   */
  getAnnouncementsByOwner(owner) {
    return this.globalAnnouncements.filter(a => a.owner === owner);
  }

  /**
   * Clear all announcements (for testing)
   */
  clearAllAnnouncements() {
    this.globalAnnouncements = [];
    this.google.clearAnnouncements();
    this.microsoft.clearAnnouncements();
  }

  /**
   * Get statistics about announcements
   * @returns {Object} Statistics
   */
  getStatistics() {
    const uniqueDomains = new Set(this.globalAnnouncements.map(a => a.domain));
    const uniqueOwners = new Set(this.globalAnnouncements.map(a => a.owner));
    
    return {
      totalAnnouncements: this.globalAnnouncements.length,
      uniqueDomains: uniqueDomains.size,
      uniqueOwners: uniqueOwners.size,
      googlePublications: this.google.getAnnouncements().length,
      microsoftPublications: this.microsoft.getAnnouncements().length,
      domains: Array.from(uniqueDomains),
      owners: Array.from(uniqueOwners)
    };
  }

  /**
   * Get configuration status
   * @returns {Object} Configuration status
   */
  getConfigStatus() {
    return {
      google: this.google.getConfigInfo(),
      microsoft: this.microsoft.getConfigInfo()
    };
  }
}

module.exports = OwnershipAnnouncements;
