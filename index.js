/**
 * Big World Bigger Ideas - Blockchain Documentation and Crypto Clarity Platform
 * 
 * A comprehensive toolkit for working with blockchain networks, NFTs, 
 * cryptocurrency data, and ISO 27001 certification management.
 * 
 * @module big-world-bigger-ideas
 * @author Matthew Brace <kushmanmb@gmx.com>
 * @license ISC
 */

// Wallet utilities
const { Wallet, GLOBAL_WALLET_LOCK } = require('./src/wallet.js');

// Feature flags management
const featureFlags = require('./src/feature-flags.js');

// ERC-721 NFT token utilities
const ERC721Fetcher = require('./src/erc721.js');

// ERC-20 token balance utilities
const ERC20Fetcher = require('./src/erc20.js');

// NFT ownership history tracker
const { TokenHistoryTracker, OwnershipEvent } = require('./src/token-history.js');

// Bitcoin mining data
const BitcoinMiningFetcher = require('./src/bitcoin-mining.js');

// Litecoin blockchain data
const LitecoinBlockchairFetcher = require('./src/litecoin-blockchair.js');

// ISO 27001 certification management
const ISO27001Fetcher = require('./src/iso27001.js');

// Consensus mechanism tracking
const { ConsensusTracker, CONSENSUS_TYPES, BLOCKCHAIN_NETWORKS } = require('./src/consensus-tracker.js');

// Address tracking and management
const { AddressTracker, AddressInfo } = require('./src/address-tracker.js');

// Address consolidation utility
const { AddressConsolidator, TRACKED_ADDRESSES } = require('./src/address-consolidator.js');

// Metadata utilities
const PackageMetadata = require('./src/metadata.js');

// Zero-knowledge PDF verification
const ZKPDFVerifier = require('./src/zkpdf.js');

// Contract ABI fetcher
const ContractABIFetcher = require('./src/contract-abi.js');

// Blockchain Council governance
const { BlockchainCouncil, MEMBER_ROLES, PROPOSAL_STATUS } = require('./src/blockchain-council.js');

// OP_RETURN cross-platform utilities
const OPReturnFetcher = require('./src/op-return.js');

// Ethereum eth_call RPC client
const EthCallClient = require('./src/eth-call.js');

// Withdrawal credentials management
const { WithdrawalCredentials, WITHDRAWAL_TYPES } = require('./src/withdraw-credentials.js');

// Multi-chain Blockchair API
const BlockchairFetcher = require('./src/blockchair.js');

// Ethereum Blockchair API with ENS support
const EthereumBlockchairFetcher = require('./src/ethereum-blockchair.js');

// Etherscan token balance fetcher
const EtherscanTokenBalanceFetcher = require('./src/etherscan-token-balance.js');

// Hello Bitcoin greeting module
const HelloBitcoin = require('./src/hello-bitcoin.js');

// Token UUID generator
const TokenUUID = require('./src/token-uuid.js');

// Resolver management
const Resolver = require('./src/resolver.js');

// Token manager
const TokenManager = require('./src/token-manager.js');

// Google API announcements
const GoogleAnnouncements = require('./src/google-announcements.js');

// Microsoft API announcements
const MicrosoftAnnouncements = require('./src/microsoft-announcements.js');

// Ownership announcement coordinator
const OwnershipAnnouncements = require('./src/ownership-announcements.js');

// Etherscan contract verification
const EtherscanVerifier = require('./src/etherscan-verify.js');

// Blockchain path fetcher
const { BlockchainPathFetcher, DEFAULT_OWNER } = require('./src/blockchain-path-fetcher.js');

/**
 * Main exports for the package
 */
module.exports = {
  // Wallet utilities
  Wallet,
  GLOBAL_WALLET_LOCK,
  
  // Feature flags (exported as object with methods)
  featureFlags,
  
  // NFT and token utilities
  ERC721Fetcher,
  ERC20Fetcher,
  TokenHistoryTracker,
  OwnershipEvent,
  TokenUUID,
  TokenManager,
  Resolver,
  
  // Blockchain data fetchers
  BitcoinMiningFetcher,
  LitecoinBlockchairFetcher,
  BlockchairFetcher,
  EthereumBlockchairFetcher,
  EtherscanTokenBalanceFetcher,
  
  // Compliance and certification
  ISO27001Fetcher,
  
  // Network and consensus tracking
  ConsensusTracker,
  CONSENSUS_TYPES,
  BLOCKCHAIN_NETWORKS,
  
  // Address tracking
  AddressTracker,
  AddressInfo,
  AddressConsolidator,
  TRACKED_ADDRESSES,
  
  // Metadata utilities
  PackageMetadata,
  
  // Zero-knowledge proofs
  ZKPDFVerifier,
  
  // Contract utilities
  ContractABIFetcher,
  EthCallClient,

  // Governance and council management
  BlockchainCouncil,
  MEMBER_ROLES,
  PROPOSAL_STATUS,

  // OP_RETURN utilities
  OPReturnFetcher,
  
  // Withdrawal credentials management
  WithdrawalCredentials,
  WITHDRAWAL_TYPES,
  
  // Announcement utilities
  GoogleAnnouncements,
  MicrosoftAnnouncements,
  OwnershipAnnouncements,

  // Etherscan contract verification
  EtherscanVerifier,

  // Blockchain path fetcher
  BlockchainPathFetcher,
  DEFAULT_OWNER,

  // Helper utilities
  HelloBitcoin
};
