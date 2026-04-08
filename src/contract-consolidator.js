/**
 * Contract Consolidator Module
 * Analyzes token contracts and identifies those with zero or minimal balances
 * for consolidation and deprecation to reduce management overhead
 */

const TokenManager = require('./token-manager');
const fs = require('fs');
const path = require('path');

/**
 * Contract Consolidator Class
 * Identifies and manages the consolidation of token contracts with no balances
 */
class ContractConsolidator {
  /**
   * Creates a new Contract Consolidator instance
   * @param {object} options - Configuration options
   * @param {number} options.minBalanceThreshold - Minimum balance to consider active (default: 0)
   * @param {string} options.tokenManagersPath - Path to token-managers.json
   */
  constructor(options = {}) {
    this.minBalanceThreshold = options.minBalanceThreshold || 0;
    this.tokenManagersPath = options.tokenManagersPath || 
      path.join(process.cwd(), 'token-managers.json');
    this.recommendations = [];
  }

  /**
   * Analyzes consolidated balance data to identify contracts for consolidation
   * @param {object} consolidatedData - Consolidated token data from address-consolidator
   * @returns {object} Analysis results with recommendations
   */
  analyzeContracts(consolidatedData) {
    if (!consolidatedData || !consolidatedData.tokens) {
      throw new Error('Invalid consolidated data: tokens array is required');
    }

    const analysis = {
      totalContracts: consolidatedData.tokens.length,
      activeContracts: [],
      zeroBalanceContracts: [],
      minimalBalanceContracts: [],
      timestamp: Date.now()
    };

    // Analyze each token
    consolidatedData.tokens.forEach(token => {
      const totalBalance = parseFloat(token.totalBalance) || 0;
      
      const contractInfo = {
        tokenAddress: token.tokenAddress,
        tokenName: token.tokenName,
        tokenSymbol: token.tokenSymbol,
        totalBalance,
        holders: token.holders || [],
        usdValue: token.totalUsdValue || null
      };

      if (totalBalance === 0) {
        analysis.zeroBalanceContracts.push(contractInfo);
      } else if (this.minBalanceThreshold > 0 && totalBalance <= this.minBalanceThreshold) {
        analysis.minimalBalanceContracts.push(contractInfo);
      } else if (totalBalance > 0) {
        analysis.activeContracts.push(contractInfo);
      }
    });

    // Generate recommendations
    this.recommendations = this._generateRecommendations(analysis);
    analysis.recommendations = this.recommendations;

    return analysis;
  }

  /**
   * Generates recommendations for contract consolidation
   * @param {object} analysis - Analysis results
   * @returns {array} Array of recommendations
   * @private
   */
  _generateRecommendations(analysis) {
    const recommendations = [];

    // Recommend deprecating zero balance contracts
    analysis.zeroBalanceContracts.forEach(contract => {
      recommendations.push({
        tokenAddress: contract.tokenAddress,
        tokenName: contract.tokenName,
        tokenSymbol: contract.tokenSymbol,
        action: 'deprecate',
        reason: 'Zero balance across all addresses',
        priority: 'high',
        impact: 'low'
      });
    });

    // Recommend reviewing minimal balance contracts
    analysis.minimalBalanceContracts.forEach(contract => {
      recommendations.push({
        tokenAddress: contract.tokenAddress,
        tokenName: contract.tokenName,
        tokenSymbol: contract.tokenSymbol,
        action: 'review',
        reason: `Minimal balance (${contract.totalBalance.toFixed(6)}) below threshold`,
        priority: 'medium',
        impact: 'low'
      });
    });

    return recommendations;
  }

  /**
   * Loads token managers configuration from file
   * @returns {object} Token managers configuration
   */
  loadTokenManagers() {
    if (!fs.existsSync(this.tokenManagersPath)) {
      throw new Error(`Token managers file not found: ${this.tokenManagersPath}`);
    }

    const configData = fs.readFileSync(this.tokenManagersPath, 'utf8');
    return JSON.parse(configData);
  }

  /**
   * Saves updated token managers configuration to file
   * @param {object} config - Token managers configuration to save
   */
  saveTokenManagers(config) {
    fs.writeFileSync(
      this.tokenManagersPath, 
      JSON.stringify(config, null, 2)
    );
  }

  /**
   * Applies deprecation recommendations to token managers configuration
   * @param {array} recommendations - Recommendations to apply (optional, uses stored recommendations if not provided)
   * @param {boolean} dryRun - If true, only shows what would be done without making changes
   * @returns {object} Results of the deprecation process
   */
  applyDeprecations(recommendations = null, dryRun = false) {
    const recsToApply = recommendations || this.recommendations;
    
    if (recsToApply.length === 0) {
      return {
        success: true,
        message: 'No recommendations to apply',
        deprecated: [],
        dryRun
      };
    }

    // Load current configuration
    const config = this.loadTokenManagers();
    
    // Filter recommendations for deprecation action only
    const deprecateRecs = recsToApply.filter(rec => rec.action === 'deprecate');
    
    const results = {
      success: true,
      deprecated: [],
      skipped: [],
      errors: [],
      dryRun
    };

    deprecateRecs.forEach(rec => {
      try {
        // Find the manager in active list
        const managerIndex = config.managers.findIndex(
          m => m.tokenAddress.toLowerCase() === rec.tokenAddress.toLowerCase()
        );

        if (managerIndex === -1) {
          results.skipped.push({
            tokenAddress: rec.tokenAddress,
            reason: 'Not found in active managers'
          });
          return;
        }

        const manager = config.managers[managerIndex];

        if (!dryRun) {
          // Remove from active managers
          config.managers.splice(managerIndex, 1);

          // Add to deprecated list
          if (!config.deprecated) {
            config.deprecated = [];
          }

          config.deprecated.push({
            tokenAddress: manager.tokenAddress,
            managerAddress: manager.managerAddress,
            deprecatedAt: new Date().toISOString(),
            reason: rec.reason,
            metadata: manager.metadata
          });

          // Update lastUpdated timestamp
          config.lastUpdated = new Date().toISOString();
        }

        results.deprecated.push({
          tokenAddress: manager.tokenAddress,
          tokenName: manager.metadata?.tokenName || 'Unknown',
          tokenSymbol: manager.metadata?.tokenSymbol || 'N/A',
          reason: rec.reason
        });

      } catch (error) {
        results.errors.push({
          tokenAddress: rec.tokenAddress,
          error: error.message
        });
        results.success = false;
      }
    });

    // Save updated configuration if not dry run
    if (!dryRun && results.deprecated.length > 0) {
      this.saveTokenManagers(config);
    }

    return results;
  }

  /**
   * Generates a consolidation report
   * @param {object} analysis - Analysis results
   * @returns {string} Formatted report
   */
  generateReport(analysis) {
    if (!analysis) {
      return 'No analysis data available';
    }

    let report = 'Contract Consolidation Analysis Report\n';
    report += '='.repeat(70) + '\n\n';
    report += `Generated: ${new Date(analysis.timestamp).toISOString()}\n`;
    report += `Total Contracts Analyzed: ${analysis.totalContracts}\n\n`;

    // Summary
    report += 'Summary:\n';
    report += '-'.repeat(70) + '\n';
    report += `  Active Contracts:          ${analysis.activeContracts.length}\n`;
    report += `  Zero Balance Contracts:    ${analysis.zeroBalanceContracts.length}\n`;
    report += `  Minimal Balance Contracts: ${analysis.minimalBalanceContracts.length}\n\n`;

    // Recommendations
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      report += 'Recommendations:\n';
      report += '-'.repeat(70) + '\n\n';

      const deprecateRecs = analysis.recommendations.filter(r => r.action === 'deprecate');
      const reviewRecs = analysis.recommendations.filter(r => r.action === 'review');

      if (deprecateRecs.length > 0) {
        report += `DEPRECATE (${deprecateRecs.length} contracts):\n\n`;
        deprecateRecs.forEach((rec, index) => {
          report += `  ${index + 1}. ${rec.tokenName} (${rec.tokenSymbol})\n`;
          report += `     Address: ${rec.tokenAddress}\n`;
          report += `     Reason:  ${rec.reason}\n`;
          report += `     Priority: ${rec.priority}, Impact: ${rec.impact}\n\n`;
        });
      }

      if (reviewRecs.length > 0) {
        report += `REVIEW (${reviewRecs.length} contracts):\n\n`;
        reviewRecs.forEach((rec, index) => {
          report += `  ${index + 1}. ${rec.tokenName} (${rec.tokenSymbol})\n`;
          report += `     Address: ${rec.tokenAddress}\n`;
          report += `     Reason:  ${rec.reason}\n`;
          report += `     Priority: ${rec.priority}, Impact: ${rec.impact}\n\n`;
        });
      }
    } else {
      report += 'No recommendations - all contracts have active balances.\n';
    }

    // Active contracts detail
    if (analysis.activeContracts.length > 0) {
      report += '\nActive Contracts (with balances):\n';
      report += '-'.repeat(70) + '\n\n';
      analysis.activeContracts.forEach((contract, index) => {
        report += `  ${index + 1}. ${contract.tokenName} (${contract.tokenSymbol})\n`;
        report += `     Address: ${contract.tokenAddress}\n`;
        report += `     Balance: ${contract.totalBalance.toFixed(6)}\n`;
        if (contract.usdValue !== null) {
          report += `     USD Value: $${contract.usdValue.toFixed(2)}\n`;
        }
        report += `     Holders: ${contract.holders.length}\n\n`;
      });
    }

    return report;
  }

  /**
   * Formats deprecation results for display
   * @param {object} results - Results from applyDeprecations
   * @returns {string} Formatted output
   */
  formatDeprecationResults(results) {
    let output = '';
    
    if (results.dryRun) {
      output += '🔍 DRY RUN - No changes were made\n\n';
    }

    output += 'Deprecation Results:\n';
    output += '='.repeat(70) + '\n\n';

    if (results.deprecated.length > 0) {
      output += `✓ Deprecated ${results.deprecated.length} contract(s):\n\n`;
      results.deprecated.forEach((item, index) => {
        output += `  ${index + 1}. ${item.tokenName} (${item.tokenSymbol})\n`;
        output += `     Address: ${item.tokenAddress}\n`;
        output += `     Reason:  ${item.reason}\n\n`;
      });
    } else {
      output += 'No contracts were deprecated.\n\n';
    }

    if (results.skipped.length > 0) {
      output += `⚠ Skipped ${results.skipped.length} contract(s):\n\n`;
      results.skipped.forEach((item, index) => {
        output += `  ${index + 1}. ${item.tokenAddress}\n`;
        output += `     Reason: ${item.reason}\n\n`;
      });
    }

    if (results.errors.length > 0) {
      output += `✗ Errors (${results.errors.length}):\n\n`;
      results.errors.forEach((item, index) => {
        output += `  ${index + 1}. ${item.tokenAddress}\n`;
        output += `     Error: ${item.error}\n\n`;
      });
    }

    if (results.success) {
      output += results.dryRun 
        ? '✓ Dry run completed successfully\n'
        : '✓ Deprecation completed successfully\n';
    } else {
      output += '✗ Deprecation completed with errors\n';
    }

    return output;
  }
}

module.exports = ContractConsolidator;
