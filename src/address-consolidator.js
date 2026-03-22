/**
 * Address Consolidation Utility
 * Manages and tracks all Ethereum addresses relevant to kushmanmb
 * Provides consolidated ERC-20 token balance reporting and transfer plans
 * to consolidate all token balances to a single destination address
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

/**
 * Destination address for token consolidation transfers
 */
const DESTINATION_ADDRESS = 'yaketh.eth';

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
   * Loads ENS names and any hex addresses found in resolvers.json
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

    // Load additional hex addresses from resolvers.json
    const resolversPath = path.join(process.cwd(), 'resolvers.json');
    if (fs.existsSync(resolversPath)) {
      try {
        const resolversData = JSON.parse(fs.readFileSync(resolversPath, 'utf8'));
        const resolverAddresses = resolversData.resolvers || [];
        resolverAddresses.forEach(entry => {
          if (entry.address) {
            const addr = entry.address.toLowerCase();
            if (!currentAddresses.includes(addr)) {
              try {
                this.tracker.addAddress(
                  entry.address,
                  'ethereum',
                  entry.metadata && entry.metadata.notes ? entry.metadata.notes : 'Address from resolvers.json'
                );
                console.log(`✓ Added ${entry.address} (from resolvers.json)`);
              } catch (error) {
                console.warn(`⚠ Could not add ${entry.address}: ${error.message}`);
              }
            }
          }
        });
      } catch (error) {
        console.warn(`⚠ Could not load resolvers.json: ${error.message}`);
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
   * Encodes an ERC-20 transfer(address,uint256) function calldata
   * @param {string} to - Recipient address (must be 0x hex address)
   * @param {string|number} amount - Raw token amount in smallest unit
   * @returns {string} ABI-encoded calldata hex string
   * @private
   */
  _encodeTransferCalldata(to, amount) {
    // ERC-20 transfer(address,uint256) function selector
    const selector = '0xa9059cbb';

    // Pad address to 32 bytes (remove 0x prefix, left-pad to 64 hex chars)
    const paddedAddress = to.replace(/^0x/, '').toLowerCase().padStart(64, '0');

    // Convert amount to BigInt hex, pad to 32 bytes (64 hex chars)
    let amountHex;
    try {
      amountHex = BigInt(amount).toString(16).padStart(64, '0');
    } catch (e) {
      amountHex = '0'.padStart(64, '0');
    }

    return selector + paddedAddress + amountHex;
  }

  /**
   * Generates a transfer plan to consolidate all token balances to a destination address
   * For each non-destination address that holds tokens, creates ERC-20 transfer instructions
   * @param {object} consolidatedData - Consolidated token data from fetchConsolidatedBalances
   * @param {string} destinationAddress - Destination address (default: yaketh.eth)
   * @returns {object} Transfer plan with instructions for each required transfer
   */
  generateTransferPlan(consolidatedData, destinationAddress = DESTINATION_ADDRESS) {
    if (!consolidatedData || !consolidatedData.byAddress) {
      throw new Error('Invalid consolidated data: byAddress property is required');
    }

    const normalizedDestination = destinationAddress.toLowerCase();
    // Determine if destination can be ABI-encoded (requires resolved hex address)
    const isHexDestination = /^0x[0-9a-f]{40}$/i.test(normalizedDestination);
    const transfers = [];

    for (const [address, tokens] of Object.entries(consolidatedData.byAddress)) {
      const normalizedAddress = address.toLowerCase();

      // Skip the destination address — tokens already there need no transfer
      if (normalizedAddress === normalizedDestination) {
        continue;
      }

      tokens.forEach(token => {
        const rawBalance = token.balance || '0';
        let hasBalance = false;
        try {
          hasBalance = BigInt(rawBalance) > 0n;
        } catch (e) {
          hasBalance = parseFloat(rawBalance) > 0;
        }

        if (hasBalance) {
          const transfer = {
            from: address,
            to: destinationAddress,
            tokenAddress: token.tokenAddress,
            tokenName: token.tokenName,
            tokenSymbol: token.tokenSymbol,
            rawBalance,
            approximateBalance: token.balanceApproximate || parseFloat(rawBalance),
            usdValue: token.usdValue,
            calldata: isHexDestination
              ? this._encodeTransferCalldata(normalizedDestination, rawBalance)
              : null,
            note: isHexDestination
              ? null
              : `Resolve ENS '${destinationAddress}' to a hex address before encoding calldata`
          };

          transfers.push(transfer);
        }
      });
    }

    return {
      destination: destinationAddress,
      totalTransfers: transfers.length,
      tokensToConsolidate: new Set(transfers.map(t => t.tokenAddress)).size,
      sourceAddresses: [...new Set(transfers.map(t => t.from))],
      transfers,
      timestamp: Date.now()
    };
  }

  /**
   * Formats the transfer plan for display
   * @param {object} plan - Transfer plan from generateTransferPlan
   * @returns {string} Formatted output
   */
  formatTransferPlan(plan) {
    if (!plan || typeof plan !== 'object') {
      return 'No transfer plan available';
    }

    let output = `Token Transfer Consolidation Plan\n`;
    output += `${'='.repeat(70)}\n\n`;
    output += `Destination:           ${plan.destination}\n`;
    output += `Total Transfers:       ${plan.totalTransfers}\n`;
    output += `Tokens to Consolidate: ${plan.tokensToConsolidate}\n`;
    output += `Source Addresses:      ${plan.sourceAddresses.length}\n`;
    output += `Generated:             ${new Date(plan.timestamp).toISOString()}\n\n`;

    if (plan.transfers.length > 0) {
      output += `Transfer Instructions:\n`;
      output += `${'-'.repeat(70)}\n\n`;

      plan.transfers.forEach((transfer, index) => {
        output += `${index + 1}. Transfer ${transfer.tokenName} (${transfer.tokenSymbol})\n`;
        output += `   From:     ${transfer.from}\n`;
        output += `   To:       ${transfer.to}\n`;
        output += `   Contract: ${transfer.tokenAddress}\n`;
        output += `   Balance:  ${transfer.rawBalance} (raw)\n`;
        if (transfer.usdValue !== null && transfer.usdValue !== undefined) {
          output += `   USD Value: $${parseFloat(transfer.usdValue).toFixed(2)}\n`;
        }
        if (transfer.calldata) {
          output += `   Calldata: ${transfer.calldata}\n`;
        }
        if (transfer.note) {
          output += `   Note:     ${transfer.note}\n`;
        }
        output += '\n';
      });
    } else {
      output += 'No transfers needed — all tokens are already at the destination address.\n';
    }

    return output;
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
   * Run the complete consolidation workflow and generate a transfer plan to yaketh.eth
   * @param {string} destinationAddress - Destination for token transfers (default: yaketh.eth)
   */
  async run(destinationAddress = DESTINATION_ADDRESS) {
    try {
      console.log('\n🚀 Starting Address Consolidation Workflow\n');
      console.log('='.repeat(70) + '\n');
      console.log(`📍 Consolidating all token balances to: ${destinationAddress}\n`);

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

      // Generate and display transfer plan
      const transferPlan = this.generateTransferPlan(consolidated, destinationAddress);
      console.log('\n💸 Transfer Plan:\n');
      console.log(this.formatTransferPlan(transferPlan));

      console.log('\n✅ Consolidation workflow completed successfully!\n');
      return { consolidated, transferPlan };
    } catch (error) {
      console.error('\n❌ Error during consolidation:', error.message);
      throw error;
    }
  }
}

// Export for use as a module
module.exports = { AddressConsolidator, TRACKED_ADDRESSES, DESTINATION_ADDRESS };

// Run if executed directly
if (require.main === module) {
  const consolidator = new AddressConsolidator('kushmanmb');
  consolidator.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
