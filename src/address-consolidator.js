/**
 * Address Consolidation Utility
 * Manages and tracks all Ethereum addresses relevant to kushmanmb
 * Provides consolidated ERC-20 token balance reporting
 */

const { AddressTracker } = require('./address-tracker.js');
const ERC20Fetcher = require('./erc20.js');
const fs = require('fs');
const path = require('path');

/**
 * Main addresses for tracking
 */
const TRACKED_ADDRESSES = {
  kushmanmb: 'kushmanmb.eth',
  yaketh: 'yaketh.eth'
};

class AddressConsolidator {
  /**
   * Creates a new Address Consolidator instance
   * @param {string} owner - Owner identifier (default: 'kushmanmb')
   */
  constructor(owner = 'kushmanmb') {
    this.owner = owner;
    this.tracker = new AddressTracker(owner);
    this.fetcher = new ERC20Fetcher();
    this.dataDir = path.join(process.cwd(), 'docs', 'address-data');
  }

  /**
   * Initialize the tracker with all addresses
   */
  initializeAddresses() {
    console.log(`Initializing address tracker for ${this.owner}...\n`);
    
    // Get all current addresses
    const currentAddresses = this.tracker.getAllAddresses().map(info => info.address.toLowerCase());
    
    // Add kushmanmb.eth - validate using ERC20Fetcher which supports ENS
    const kushmanmbValidated = this.fetcher.validateAddress(TRACKED_ADDRESSES.kushmanmb);
    if (!currentAddresses.includes(kushmanmbValidated.toLowerCase())) {
      try {
        this.tracker.addAddress(
          kushmanmbValidated,
          'ethereum',
          'Primary address - kushmanmb.eth'
        );
        console.log(`✓ Added ${TRACKED_ADDRESSES.kushmanmb}`);
      } catch (error) {
        console.warn(`⚠ Could not add ${TRACKED_ADDRESSES.kushmanmb}: ${error.message}`);
      }
    }

    // Add yaketh.eth - validate using ERC20Fetcher which supports ENS
    const yakethValidated = this.fetcher.validateAddress(TRACKED_ADDRESSES.yaketh);
    if (!currentAddresses.includes(yakethValidated.toLowerCase())) {
      try {
        this.tracker.addAddress(
          yakethValidated,
          'ethereum',
          'Secondary address - yaketh.eth'
        );
        console.log(`✓ Added ${TRACKED_ADDRESSES.yaketh}`);
      } catch (error) {
        console.warn(`⚠ Could not add ${TRACKED_ADDRESSES.yaketh}: ${error.message}`);
      }
    }

    console.log(`\nTotal addresses tracked: ${this.tracker.getAllAddresses().length}`);
  }

  /**
   * Fetch and consolidate ERC-20 token balances for all tracked addresses
   * @returns {Promise<object>} Consolidated token data
   */
  async fetchConsolidatedBalances() {
    console.log('\nFetching ERC-20 token balances...\n');

    const addresses = this.tracker.getAllAddresses().map(info => info.address);
    
    if (addresses.length === 0) {
      throw new Error('No addresses to fetch balances for');
    }

    console.log(`Fetching balances for ${addresses.length} address(es):`);
    addresses.forEach((addr, i) => {
      console.log(`  ${i + 1}. ${addr}`);
    });
    console.log('');

    try {
      const consolidated = await this.fetcher.consolidateTokens(addresses);
      
      console.log('✓ Successfully fetched token balances');
      console.log(`  - Unique tokens: ${consolidated.uniqueTokens}`);
      console.log(`  - Total addresses: ${consolidated.totalAddresses}\n`);

      // Record tokens for each address
      for (const [address, tokens] of Object.entries(consolidated.byAddress)) {
        if (this.tracker.isTracking(address)) {
          tokens.forEach(token => {
            this.tracker.recordToken(address, {
              tokenAddress: token.tokenAddress,
              tokenName: token.tokenName,
              tokenSymbol: token.tokenSymbol,
              balance: token.balance,
              usdValue: token.usdValue
            });
          });
        }
      }

      return consolidated;
    } catch (error) {
      console.error(`✗ Error fetching balances: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save consolidated data to files
   * @param {object} data - Consolidated token data
   */
  saveConsolidatedData(data) {
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Save consolidated JSON
    const jsonPath = path.join(this.dataDir, 'consolidated-balances.json');
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log(`✓ Saved consolidated data to ${jsonPath}`);

    // Save tracker data
    const trackerPath = path.join(this.dataDir, 'address-tracker.json');
    fs.writeFileSync(trackerPath, JSON.stringify(this.tracker.toJSON(), null, 2));
    console.log(`✓ Saved tracker data to ${trackerPath}`);

    // Generate markdown report
    const reportPath = path.join(this.dataDir, 'report.md');
    const report = this.generateMarkdownReport(data);
    fs.writeFileSync(reportPath, report);
    console.log(`✓ Generated report at ${reportPath}`);

    // Generate HTML dashboard
    const htmlPath = path.join(this.dataDir, 'index.html');
    const html = this.generateHTMLDashboard(data);
    fs.writeFileSync(htmlPath, html);
    console.log(`✓ Generated HTML dashboard at ${htmlPath}`);
  }

  /**
   * Generate markdown report
   * @param {object} data - Consolidated token data
   * @returns {string} Markdown report
   */
  generateMarkdownReport(data) {
    let report = `# Address Consolidation Report\n\n`;
    report += `**Owner:** ${this.owner}\n`;
    report += `**Generated:** ${new Date(data.timestamp).toISOString()}\n\n`;
    report += `---\n\n`;

    // Summary
    report += `## Summary\n\n`;
    report += `- **Total Addresses:** ${data.totalAddresses}\n`;
    report += `- **Unique Tokens:** ${data.uniqueTokens}\n`;
    
    const totalValue = data.tokens.reduce((sum, token) => 
      sum + (token.totalUsdValue || 0), 0
    );
    report += `- **Total Portfolio Value:** $${totalValue.toFixed(2)}\n\n`;

    // Addresses
    report += `## Tracked Addresses\n\n`;
    data.addresses.forEach((addr, i) => {
      report += `${i + 1}. \`${addr}\`\n`;
    });
    report += `\n`;

    // Tokens
    if (data.tokens && data.tokens.length > 0) {
      report += `## Token Holdings\n\n`;
      report += `| # | Token | Symbol | Total Balance | USD Value | Holders |\n`;
      report += `|---|-------|--------|---------------|-----------|----------|\n`;
      
      const sortedTokens = [...data.tokens].sort((a, b) => 
        (b.totalUsdValue || 0) - (a.totalUsdValue || 0)
      );
      
      sortedTokens.forEach((token, index) => {
        const usdValue = token.totalUsdValue !== null 
          ? `$${token.totalUsdValue.toFixed(2)}` 
          : 'N/A';
        report += `| ${index + 1} | ${token.tokenName} | ${token.tokenSymbol} | ${token.totalBalance.toFixed(4)} | ${usdValue} | ${token.holders.length} |\n`;
      });
    }

    report += `\n---\n\n`;
    report += `*Data source: [Blockchair API](https://blockchair.com/api/docs)*\n`;

    return report;
  }

  /**
   * Generate HTML dashboard
   * @param {object} data - Consolidated token data
   * @returns {string} HTML content
   */
  generateHTMLDashboard(data) {
    const totalValue = data.tokens.reduce((sum, token) => 
      sum + (token.totalUsdValue || 0), 0
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Address Consolidation Dashboard - ${this.owner}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      max-width: 1200px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      background: #f6f8fa;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #24292e;
      border-bottom: 3px solid #0366d6;
      padding-bottom: 10px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .stat-card {
      background: #f6f8fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e1e4e8;
    }
    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #0366d6;
    }
    .stat-label {
      color: #586069;
      font-size: 0.9em;
      margin-top: 5px;
    }
    .addresses {
      background: #f6f8fa;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .address-item {
      font-family: monospace;
      padding: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e1e4e8;
    }
    th {
      background: #f6f8fa;
      font-weight: 600;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e1e4e8;
      color: #586069;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Address Consolidation Dashboard</h1>
    <p><strong>Owner:</strong> ${this.owner}</p>
    <p><small>Last updated: ${new Date(data.timestamp).toISOString()}</small></p>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${data.totalAddresses}</div>
        <div class="stat-label">Tracked Addresses</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.uniqueTokens}</div>
        <div class="stat-label">Unique Tokens</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">$${totalValue.toFixed(2)}</div>
        <div class="stat-label">Total Portfolio Value</div>
      </div>
    </div>

    <h2>Tracked Addresses</h2>
    <div class="addresses">
      ${data.addresses.map((addr, i) => 
        `<div class="address-item">${i + 1}. ${addr}</div>`
      ).join('')}
    </div>

    <h2>Token Holdings</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Token</th>
          <th>Symbol</th>
          <th>Total Balance</th>
          <th>USD Value</th>
          <th>Holders</th>
        </tr>
      </thead>
      <tbody>
        ${data.tokens.sort((a, b) => 
          (b.totalUsdValue || 0) - (a.totalUsdValue || 0)
        ).map((token, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${token.tokenName}</td>
            <td><strong>${token.tokenSymbol}</strong></td>
            <td>${token.totalBalance.toFixed(4)}</td>
            <td>${token.totalUsdValue ? '$' + token.totalUsdValue.toFixed(2) : 'N/A'}</td>
            <td>${token.holders.length}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>Data fetched from <a href="https://blockchair.com/api/docs" target="_blank">Blockchair API</a></p>
      <p>Generated by <a href="https://github.com/kushmanmb-org/-Big-world-Bigger-ideas-" target="_blank">Big World Bigger Ideas</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Display statistics
   */
  displayStatistics() {
    console.log('\n' + '='.repeat(70));
    console.log(this.tracker.formatStatistics());
    console.log('='.repeat(70) + '\n');
  }

  /**
   * Run the complete consolidation workflow
   */
  async run() {
    try {
      console.log('\n🚀 Starting Address Consolidation Workflow\n');
      console.log('='.repeat(70) + '\n');

      // Initialize addresses
      this.initializeAddresses();

      // Fetch consolidated balances
      const consolidated = await this.fetchConsolidatedBalances();

      // Save data
      console.log('\nSaving data...\n');
      this.saveConsolidatedData(consolidated);

      // Display statistics
      this.displayStatistics();

      // Display formatted output
      console.log('\n📋 Consolidated Report:\n');
      console.log(this.fetcher.formatConsolidatedTokens(consolidated));

      console.log('\n✅ Consolidation workflow completed successfully!\n');
      return consolidated;
    } catch (error) {
      console.error('\n❌ Error during consolidation:', error.message);
      throw error;
    }
  }
}

// Export for use as a module
module.exports = { AddressConsolidator, TRACKED_ADDRESSES };

// Run if executed directly
if (require.main === module) {
  const consolidator = new AddressConsolidator('kushmanmb');
  consolidator.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
