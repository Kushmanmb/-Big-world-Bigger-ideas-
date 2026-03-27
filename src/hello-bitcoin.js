/**
 * Hello Bitcoin Module
 * Provides a simple greeting system for Bitcoin with customizable messages
 * Perfect as a starting point for Bitcoin-related applications
 */

class HelloBitcoin {
  /**
   * Creates a new Hello Bitcoin instance
   * @param {string} name - The name to greet (default: 'World')
   */
  constructor(name = 'World') {
    this.name = name;
    this.greetingCount = 0;
    this.greetings = [];
  }

  /**
   * Generates a simple Bitcoin greeting
   * @returns {string} The Bitcoin greeting message
   */
  greet() {
    this.greetingCount++;
    const message = `Hello Bitcoin from ${this.name}! 🌍`;
    this.greetings.push({
      message,
      timestamp: new Date(),
      count: this.greetingCount
    });
    return message;
  }

  /**
   * Generates a Bitcoin greeting with custom message
   * @param {string} customMessage - Custom message to include
   * @returns {string} The custom Bitcoin greeting
   */
  greetWithMessage(customMessage) {
    if (!customMessage || typeof customMessage !== 'string') {
      throw new Error('Custom message must be a non-empty string');
    }
    
    this.greetingCount++;
    const message = `Hello Bitcoin! ${customMessage} - from ${this.name}`;
    this.greetings.push({
      message,
      timestamp: new Date(),
      count: this.greetingCount
    });
    return message;
  }

  /**
   * Generates a formal Bitcoin greeting
   * @returns {string} The formal Bitcoin greeting
   */
  formalGreet() {
    this.greetingCount++;
    const message = `Greetings from ${this.name}. Welcome to the Bitcoin network, the first decentralized cryptocurrency!`;
    this.greetings.push({
      message,
      timestamp: new Date(),
      count: this.greetingCount
    });
    return message;
  }

  /**
   * Generates a Bitcoin greeting with emoji
   * @returns {string} The emoji Bitcoin greeting
   */
  greetWithEmoji() {
    this.greetingCount++;
    const emojis = ['₿', '🚀', '💰', '⚡', '🌟', '🔗', '💎', '🌙'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const message = `${randomEmoji} Hello Bitcoin ${randomEmoji} - ${this.name} says hi!`;
    this.greetings.push({
      message,
      timestamp: new Date(),
      count: this.greetingCount
    });
    return message;
  }

  /**
   * Gets information about Bitcoin
   * @returns {object} Bitcoin information
   */
  getBitcoinInfo() {
    return {
      name: 'Bitcoin',
      symbol: 'BTC',
      creator: 'Satoshi Nakamoto',
      launched: '2009',
      type: 'Cryptocurrency',
      consensus: 'Proof of Work',
      maxSupply: '21,000,000 BTC',
      blockTime: '~10 minutes',
      description: 'The first decentralized cryptocurrency'
    };
  }

  /**
   * Gets greeting history
   * @returns {array} Array of greeting objects
   */
  getHistory() {
    return this.greetings;
  }

  /**
   * Gets the total number of greetings
   * @returns {number} The greeting count
   */
  getGreetingCount() {
    return this.greetingCount;
  }

  /**
   * Resets the greeting counter and history
   */
  reset() {
    this.greetingCount = 0;
    this.greetings = [];
  }

  /**
   * Changes the name used in greetings
   * @param {string} newName - The new name to use
   */
  setName(newName) {
    if (!newName || typeof newName !== 'string') {
      throw new Error('Name must be a non-empty string');
    }
    this.name = newName;
  }

  /**
   * Formats the greeting history for display
   * @returns {string} Formatted history
   */
  formatHistory() {
    if (this.greetings.length === 0) {
      return 'No greetings yet!';
    }

    let output = 'Hello Bitcoin Greeting History\n';
    output += '================================\n\n';
    output += `Total Greetings: ${this.greetingCount}\n`;
    output += `Name: ${this.name}\n\n`;

    this.greetings.forEach((greeting, index) => {
      output += `${index + 1}. ${greeting.message}\n`;
      output += `   Time: ${greeting.timestamp.toISOString()}\n`;
      output += `   Count: ${greeting.count}\n\n`;
    });

    return output;
  }
}

// Export the class
module.exports = HelloBitcoin;
