/**
 * Consensus Mechanism Tracker Module
 * Tracks Proof of Work (PoW) and Proof of Stake (PoS) across multiple blockchain networks
 * Provides comprehensive consensus mechanism information and network statistics
 */

/**
 * Supported consensus mechanisms
 */
const CONSENSUS_TYPES = {
  POW: 'Proof of Work',
  POS: 'Proof of Stake',
  HYBRID: 'Hybrid (PoW/PoS)',
  OTHER: 'Other'
};

/**
 * Blockchain network configuration with consensus information
 */
const BLOCKCHAIN_NETWORKS = {
  // Bitcoin - Proof of Work
  bitcoin: {
    name: 'Bitcoin',
    chainId: null,
    consensus: CONSENSUS_TYPES.POW,
    symbol: 'BTC',
    blockTime: 600, // seconds
    algorithm: 'SHA-256',
    launched: '2009-01-03',
    explorerUrl: 'https://blockchair.com/bitcoin',
    details: {
      miningAlgorithm: 'SHA-256',
      difficulty: 'Dynamic',
      blockReward: 3.125, // BTC (post-2024 halving in April 2024)
      energyIntensive: true
    }
  },
  
  // Ethereum - Proof of Stake (post-Merge)
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    consensus: CONSENSUS_TYPES.POS,
    symbol: 'ETH',
    blockTime: 12, // seconds
    algorithm: 'Gasper (PoS)',
    launched: '2015-07-30',
    mergeDate: '2022-09-15',
    explorerUrl: 'https://etherscan.io',
    details: {
      minimumStake: 32, // ETH
      validatorCount: null, // Dynamic, can be fetched
      slashing: true,
      energyEfficient: true,
      annualRewards: '3-5%' // Variable APR
    }
  },
  
  // Ethereum Beacon Chain
  beacon: {
    name: 'Ethereum Beacon Chain',
    chainId: null,
    consensus: CONSENSUS_TYPES.POS,
    symbol: 'ETH',
    blockTime: 12, // seconds (slot time)
    algorithm: 'Gasper (PoS)',
    launched: '2020-12-01',
    explorerUrl: 'https://beaconcha.in',
    details: {
      minimumStake: 32, // ETH per validator
      slotsPerEpoch: 32,
      epochDuration: 384, // seconds (6.4 minutes)
      validatorActivationQueue: true,
      withdrawalEnabled: true,
      withdrawalCredentials: {
        // BLS withdrawal credentials start with 0x00
        // Execution withdrawal credentials start with 0x01
        prefixBLS: '0x00',
        prefixExecution: '0x01',
        description: 'Validators must set withdrawal credentials to receive rewards and withdrawals',
        updateAvailable: true, // Can update from BLS to execution credentials
        required: true
      }
    }
  },
  
  // Base (Layer 2 on Ethereum)
  base: {
    name: 'Base',
    chainId: 8453,
    consensus: CONSENSUS_TYPES.POS,
    symbol: 'ETH',
    blockTime: 2, // seconds
    algorithm: 'Optimistic Rollup',
    launched: '2023-08-09',
    explorerUrl: 'https://basescan.org',
    details: {
      layer: 2,
      parentChain: 'Ethereum',
      sequencer: 'Coinbase',
      finality: 'Inherits from Ethereum'
    }
  },
  
  // Litecoin - Proof of Work
  litecoin: {
    name: 'Litecoin',
    chainId: null,
    consensus: CONSENSUS_TYPES.POW,
    symbol: 'LTC',
    blockTime: 150, // seconds (2.5 minutes)
    algorithm: 'Scrypt',
    launched: '2011-10-13',
    explorerUrl: 'https://blockchair.com/litecoin',
    details: {
      miningAlgorithm: 'Scrypt',
      blockReward: 6.25, // LTC (post-August 2023 halving)
      maxSupply: 84000000,
      halving: true
    }
  },
  
  // Polygon - Proof of Stake
  polygon: {
    name: 'Polygon',
    chainId: 137,
    consensus: CONSENSUS_TYPES.POS,
    symbol: 'MATIC',
    blockTime: 2, // seconds
    algorithm: 'PoS (Heimdall + Bor)',
    launched: '2020-05-30',
    explorerUrl: 'https://polygonscan.com',
    details: {
      checkpointInterval: '30 minutes',
      validatorCount: 100,
      minimumStake: 1, // MATIC (for delegation)
      securedBy: 'Ethereum'
    }
  }
};

/**
 * Consensus Tracker Class
 * Provides methods to track and analyze consensus mechanisms across blockchains
 */
class ConsensusTracker {
  /**
   * Creates a new Consensus Tracker instance
   */
  constructor() {
    this.networks = BLOCKCHAIN_NETWORKS;
    this.consensusTypes = CONSENSUS_TYPES;
  }

  /**
   * Gets information about a specific blockchain network
   * @param {string} networkName - The network name (e.g., 'bitcoin', 'ethereum')
   * @returns {object} Network information
   * @throws {Error} If network is not found
   */
  getNetworkInfo(networkName) {
    const network = this.networks[networkName.toLowerCase()];
    if (!network) {
      throw new Error(`Network '${networkName}' not found. Available networks: ${Object.keys(this.networks).join(', ')}`);
    }
    return { ...network, id: networkName.toLowerCase() };
  }

  /**
   * Gets all networks using a specific consensus mechanism
   * @param {string} consensusType - The consensus type (e.g., 'Proof of Work', 'Proof of Stake')
   * @returns {array} Array of networks using the specified consensus
   */
  getNetworksByConsensus(consensusType) {
    const networks = [];
    for (const [id, network] of Object.entries(this.networks)) {
      if (network.consensus === consensusType) {
        networks.push({ ...network, id });
      }
    }
    return networks;
  }

  /**
   * Gets all Proof of Work networks
   * @returns {array} Array of PoW networks
   */
  getPowNetworks() {
    return this.getNetworksByConsensus(CONSENSUS_TYPES.POW);
  }

  /**
   * Gets all Proof of Stake networks
   * @returns {array} Array of PoS networks
   */
  getPosNetworks() {
    return this.getNetworksByConsensus(CONSENSUS_TYPES.POS);
  }

  /**
   * Gets all available networks
   * @returns {array} Array of all networks
   */
  getAllNetworks() {
    return Object.entries(this.networks).map(([id, network]) => ({
      ...network,
      id
    }));
  }

  /**
   * Gets consensus statistics across all networks
   * @returns {object} Statistics object
   */
  getConsensusStatistics() {
    const stats = {
      totalNetworks: Object.keys(this.networks).length,
      byConsensus: {},
      averageBlockTime: 0,
      energyEfficient: 0,
      energyIntensive: 0
    };

    let totalBlockTime = 0;
    let networksWithBlockTime = 0;

    for (const [id, network] of Object.entries(this.networks)) {
      // Count by consensus type
      stats.byConsensus[network.consensus] = (stats.byConsensus[network.consensus] || 0) + 1;

      // Calculate average block time
      if (network.blockTime) {
        totalBlockTime += network.blockTime;
        networksWithBlockTime++;
      }

      // Count energy efficiency
      if (network.details.energyEfficient) {
        stats.energyEfficient++;
      }
      if (network.details.energyIntensive) {
        stats.energyIntensive++;
      }
    }

    stats.averageBlockTime = networksWithBlockTime > 0 
      ? Math.round(totalBlockTime / networksWithBlockTime) 
      : 0;

    return stats;
  }

  /**
   * Compares two networks by their consensus mechanisms
   * @param {string} network1 - First network name
   * @param {string} network2 - Second network name
   * @returns {object} Comparison object
   */
  compareNetworks(network1, network2) {
    const net1 = this.getNetworkInfo(network1);
    const net2 = this.getNetworkInfo(network2);

    return {
      networks: [net1.name, net2.name],
      consensus: [net1.consensus, net2.consensus],
      sameConsensus: net1.consensus === net2.consensus,
      blockTime: {
        [net1.name]: net1.blockTime,
        [net2.name]: net2.blockTime,
        faster: net1.blockTime < net2.blockTime ? net1.name : net2.name
      },
      comparison: {
        consensusDifference: net1.consensus !== net2.consensus,
        blockTimeDifference: Math.abs(net1.blockTime - net2.blockTime),
        algorithm: [net1.algorithm, net2.algorithm]
      }
    };
  }

  /**
   * Checks if a network uses Proof of Work
   * @param {string} networkName - The network name
   * @returns {boolean} True if network uses PoW
   */
  isProofOfWork(networkName) {
    const network = this.getNetworkInfo(networkName);
    return network.consensus === CONSENSUS_TYPES.POW;
  }

  /**
   * Checks if a network uses Proof of Stake
   * @param {string} networkName - The network name
   * @returns {boolean} True if network uses PoS
   */
  isProofOfStake(networkName) {
    const network = this.getNetworkInfo(networkName);
    return network.consensus === CONSENSUS_TYPES.POS;
  }

  /**
   * Formats network information for display
   * @param {string} networkName - The network name
   * @returns {string} Formatted network information
   */
  formatNetworkInfo(networkName) {
    const network = this.getNetworkInfo(networkName);
    
    let output = `
${network.name} Network Information
${'='.repeat(50)}

Network ID: ${network.id}
Consensus: ${network.consensus}
Symbol: ${network.symbol}
Block Time: ${network.blockTime} seconds
Algorithm: ${network.algorithm}
Launched: ${network.launched}
Explorer: ${network.explorerUrl}
`;

    if (network.chainId) {
      output += `Chain ID: ${network.chainId}\n`;
    }

    if (network.mergeDate) {
      output += `Merge Date: ${network.mergeDate}\n`;
    }

    output += '\nDetails:\n';
    for (const [key, value] of Object.entries(network.details)) {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      output += `  ${formattedKey}: ${value}\n`;
    }

    return output;
  }

  /**
   * Exports all network data as JSON
   * @returns {string} JSON string of all networks
   */
  toJSON() {
    return JSON.stringify(this.networks, null, 2);
  }

  /**
   * Gets a summary of all consensus mechanisms
   * @returns {string} Formatted summary
   */
  getConsensusSummary() {
    const stats = this.getConsensusStatistics();
    const powNets = this.getPowNetworks();
    const posNets = this.getPosNetworks();

    return `
Blockchain Consensus Mechanism Summary
${'='.repeat(50)}

Total Networks Tracked: ${stats.totalNetworks}
Average Block Time: ${stats.averageBlockTime} seconds

Consensus Distribution:
  Proof of Work (PoW): ${powNets.length} networks
    - ${powNets.map(n => n.name).join(', ')}
  
  Proof of Stake (PoS): ${posNets.length} networks
    - ${posNets.map(n => n.name).join(', ')}

Energy Profile:
  Energy Efficient: ${stats.energyEfficient} networks
  Energy Intensive: ${stats.energyIntensive} networks
`;
  }
}

module.exports = { ConsensusTracker, CONSENSUS_TYPES, BLOCKCHAIN_NETWORKS };
