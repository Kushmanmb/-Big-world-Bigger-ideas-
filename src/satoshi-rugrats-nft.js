/**
 * Satoshi Rugrats NFT Collection
 * A fun mashup of Satoshi Nakamoto (Bitcoin creator) and Rugrats cartoon characters,
 * each with unique crypto-themed traits. ERC-721 compatible metadata.
 */

const COLLECTION_NAME = 'Satoshi Rugrats';
const COLLECTION_SYMBOL = 'SRUGRAT';
const COLLECTION_DESCRIPTION =
  'A 6-piece genesis NFT collection where the Rugrats babies discover the blockchain. ' +
  'Each character brings their own crypto personality to the decentralized playground.';
const TOTAL_SUPPLY = 6;

/**
 * NFT token metadata following the ERC-721 metadata JSON schema.
 * https://eips.ethereum.org/EIPS/eip-721
 */
const TOKENS = [
  {
    tokenId: 1,
    name: 'Tommy "Satoshi" Pickles',
    description:
      'The fearless leader who invented the first decentralized baby formula. ' +
      'His diaper features the original Bitcoin whitepaper and he never backs down from a HODL.',
    image: 'satoshi-rugrats/1-tommy-satoshi.png',
    external_url: 'https://kushmanmb.org/satoshi-rugrats/1',
    attributes: [
      { trait_type: 'Character', value: 'Tommy Pickles' },
      { trait_type: 'Crypto Role', value: 'Founder / Satoshi' },
      { trait_type: 'Accessory', value: 'Bitcoin Screwdriver' },
      { trait_type: 'Background', value: 'Genesis Block' },
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Network', value: 'Bitcoin' },
      { display_type: 'number', trait_type: 'Block Height', value: 0 }
    ]
  },
  {
    tokenId: 2,
    name: 'Chuckie "HODL" Finster',
    description:
      "The most nervous HODLer in the cryptosphere. Chuckie's portfolio is 100% BTC " +
      'because he is too scared to sell. His red hair turns orange every time the price dips.',
    image: 'satoshi-rugrats/2-chuckie-hodl.png',
    external_url: 'https://kushmanmb.org/satoshi-rugrats/2',
    attributes: [
      { trait_type: 'Character', value: 'Chuckie Finster' },
      { trait_type: 'Crypto Role', value: 'Diamond Hand HODLer' },
      { trait_type: 'Accessory', value: 'Paper Hands (But Refuses To Use Them)' },
      { trait_type: 'Background', value: 'Bear Market Red' },
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Network', value: 'Bitcoin' },
      { display_type: 'boost_percentage', trait_type: 'HODL Strength', value: 99 }
    ]
  },
  {
    tokenId: 3,
    name: 'Phil "Hash" DeVille',
    description:
      'One half of the twin mining operation. Phil handles the proof-of-work while ' +
      'his sister handles proof-of-stake. Together they control 51% of the sandbox hash rate.',
    image: 'satoshi-rugrats/3-phil-hash.png',
    external_url: 'https://kushmanmb.org/satoshi-rugrats/3',
    attributes: [
      { trait_type: 'Character', value: 'Phil DeVille' },
      { trait_type: 'Crypto Role', value: 'Proof-of-Work Miner' },
      { trait_type: 'Accessory', value: 'ASIC Mining Rattle' },
      { trait_type: 'Background', value: 'Mining Pool Green' },
      { trait_type: 'Rarity', value: 'Uncommon' },
      { trait_type: 'Network', value: 'Bitcoin' },
      { display_type: 'boost_percentage', trait_type: 'Hash Rate', value: 51 }
    ]
  },
  {
    tokenId: 4,
    name: 'Lil "Stake" DeVille',
    description:
      "Phil's twin sister who pivoted to proof-of-stake after the Merge. " +
      'Lil has her ETH staked in a validator node shaped like a rubber duck. ' +
      'She earns more yield than Phil ever will.',
    image: 'satoshi-rugrats/4-lil-stake.png',
    external_url: 'https://kushmanmb.org/satoshi-rugrats/4',
    attributes: [
      { trait_type: 'Character', value: 'Lil DeVille' },
      { trait_type: 'Crypto Role', value: 'Proof-of-Stake Validator' },
      { trait_type: 'Accessory', value: 'Validator Node Rubber Duck' },
      { trait_type: 'Background', value: 'Ethereum Purple' },
      { trait_type: 'Rarity', value: 'Uncommon' },
      { trait_type: 'Network', value: 'Ethereum' },
      { display_type: 'boost_percentage', trait_type: 'Staking APY', value: 4 }
    ]
  },
  {
    tokenId: 5,
    name: 'Angelica "Whale" Pickles',
    description:
      "The ultimate crypto whale who controls the playground's liquidity. Angelica's " +
      'Cynthia doll is wrapped in gold and she market-dumps on the other babies for sport. ' +
      '"You dumb babies don\'t even know about DCA."',
    image: 'satoshi-rugrats/5-angelica-whale.png',
    external_url: 'https://kushmanmb.org/satoshi-rugrats/5',
    attributes: [
      { trait_type: 'Character', value: 'Angelica Pickles' },
      { trait_type: 'Crypto Role', value: 'Market Whale' },
      { trait_type: 'Accessory', value: 'Golden Cynthia Doll' },
      { trait_type: 'Background', value: 'Bull Market Gold' },
      { trait_type: 'Rarity', value: 'Epic' },
      { trait_type: 'Network', value: 'Multi-Chain' },
      { display_type: 'number', trait_type: 'Wallet Balance (BTC)', value: 1000 }
    ]
  },
  {
    tokenId: 6,
    name: 'Susie "DeFi" Carmichael',
    description:
      'The smartest baby in the neighborhood and the only one who actually reads the ' +
      'smart contract code before signing. Susie deployed her first DeFi protocol at age 2 ' +
      'and has been collecting yield ever since.',
    image: 'satoshi-rugrats/6-susie-defi.png',
    external_url: 'https://kushmanmb.org/satoshi-rugrats/6',
    attributes: [
      { trait_type: 'Character', value: 'Susie Carmichael' },
      { trait_type: 'Crypto Role', value: 'DeFi Developer' },
      { trait_type: 'Accessory', value: 'Smart Contract Crayons' },
      { trait_type: 'Background', value: 'DeFi Blue' },
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Network', value: 'Ethereum' },
      { display_type: 'boost_percentage', trait_type: 'Yield APY', value: 20 }
    ]
  }
];

/**
 * Satoshi Rugrats NFT Collection class.
 * Provides ERC-721 compatible metadata lookups and collection-level helpers.
 */
class SatoshiRugratsNFT {
  constructor() {
    this.name = COLLECTION_NAME;
    this.symbol = COLLECTION_SYMBOL;
    this.description = COLLECTION_DESCRIPTION;
    this.totalSupply = TOTAL_SUPPLY;
    this.tokens = TOKENS;
  }

  /**
   * Returns metadata for a specific token by its ID (1-indexed).
   * @param {number} tokenId - The token ID to look up
   * @returns {object} Token metadata object
   * @throws {Error} If the tokenId is out of range
   */
  getToken(tokenId) {
    const token = this.tokens.find(t => t.tokenId === tokenId);
    if (!token) {
      throw new Error(
        `Token #${tokenId} does not exist. Valid range: 1-${this.totalSupply}.`
      );
    }
    return token;
  }

  /**
   * Returns all tokens in the collection.
   * @returns {Array} Array of all token metadata objects
   */
  getAllTokens() {
    return this.tokens;
  }

  /**
   * Returns collection-level metadata (contract-level metadata standard).
   * @returns {object} Collection metadata
   */
  getCollectionMetadata() {
    return {
      name: this.name,
      symbol: this.symbol,
      description: this.description,
      totalSupply: this.totalSupply,
      tokens: this.tokens.map(t => ({
        tokenId: t.tokenId,
        name: t.name,
        rarity: (t.attributes.find(a => a.trait_type === 'Rarity') || {}).value || 'Unknown'
      }))
    };
  }

  /**
   * Returns tokens filtered by a specific trait type and value.
   * @param {string} traitType - The trait type to filter by
   * @param {string} traitValue - The trait value to match
   * @returns {Array} Matching token metadata objects
   */
  getTokensByTrait(traitType, traitValue) {
    return this.tokens.filter(token =>
      token.attributes.some(
        attr => attr.trait_type === traitType && attr.value === traitValue
      )
    );
  }
}

module.exports = {
  SatoshiRugratsNFT,
  COLLECTION_NAME,
  COLLECTION_SYMBOL,
  TOTAL_SUPPLY,
  TOKENS
};
