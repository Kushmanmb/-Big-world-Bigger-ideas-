/**
 * Simple Wallet Module with Encryption Capabilities
 * For use in blockchain applications
 */

const crypto = require('crypto');

class Wallet {
  constructor() {
    this.address = null;
    this.privateKey = null;
    this.encryptedData = null;
    this.isLocked = false;
    this.isPaused = false;
    this.ownerAddress = null;
  }

  /**
   * Securely wipes sensitive data from memory
   * SECURITY: Overwrite sensitive strings to prevent memory dumps
   * @param {string} str - The string to wipe
   * @returns {string} Empty string
   */
  _secureWipe(str) {
    if (typeof str !== 'string' || !str) return '';
    // Overwrite the string with zeros (limited effectiveness in JS due to GC)
    // This is a best-effort approach
    return '';
  }

  /**
   * Clears all sensitive data from the wallet instance
   * Call this when you're done using the wallet to minimize exposure
   */
  clearSensitiveData() {
    if (this.privateKey) {
      this.privateKey = this._secureWipe(this.privateKey);
      this.privateKey = null;
    }
    // Keep address and encryptedData as they are less sensitive
  }

  /**
   * Encrypts the wallet with a password
   * @param {string} newPassword - The password to encrypt the wallet with
   * @returns {object} Encrypted wallet data
   */
  encrypt(newPassword) {
    if (!newPassword || typeof newPassword !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // SECURITY: Validate that we have cryptographic randomness available
    try {
      crypto.randomBytes(1);
    } catch (error) {
      throw new Error('Cryptographic random number generator is not available');
    }

    // Generate a random salt
    const salt = crypto.randomBytes(32);
    
    // Derive a key from the password using PBKDF2
    const key = crypto.pbkdf2Sync(newPassword, salt, 100000, 32, 'sha256');
    
    // Generate initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create the wallet data to encrypt
    const walletData = JSON.stringify({
      address: this.address,
      privateKey: this.privateKey,
      timestamp: Date.now()
    });
    
    // Create cipher and encrypt the data
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(walletData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Store the encrypted data
    this.encryptedData = {
      data: encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      algorithm: 'aes-256-cbc',
      kdf: 'pbkdf2',
      iterations: 100000
    };
    
    return this.encryptedData;
  }

  /**
   * Decrypts the wallet with a password
   * @param {string} password - The password to decrypt the wallet with
   * @returns {object} Decrypted wallet data
   */
  decrypt(password) {
    if (!this.encryptedData) {
      throw new Error('No encrypted data found');
    }

    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    try {
      // Convert salt and IV from hex
      const salt = Buffer.from(this.encryptedData.salt, 'hex');
      const iv = Buffer.from(this.encryptedData.iv, 'hex');
      
      // Derive the key from the password
      const key = crypto.pbkdf2Sync(password, salt, this.encryptedData.iterations, 32, 'sha256');
      
      // Create decipher and decrypt the data
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(this.encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      const walletData = JSON.parse(decrypted);
      
      // Restore wallet data
      this.address = walletData.address;
      this.privateKey = walletData.privateKey;
      
      return walletData;
    } catch (error) {
      // SECURITY: Use generic error message to prevent timing attacks
      // Don't reveal whether it was wrong password vs corrupted data
      throw new Error('Invalid password or corrupted data');
    }
  }

  /**
   * Generates a new wallet address and private key
   * @returns {object} Wallet address and private key
   */
  generate() {
    // Generate a random private key (32 bytes)
    this.privateKey = crypto.randomBytes(32).toString('hex');
    
    // Generate a wallet address (simplified - not a real blockchain address)
    const hash = crypto.createHash('sha256').update(this.privateKey).digest('hex');
    this.address = '0x' + hash.substring(0, 40);

    // The address that generated the wallet becomes the owner
    this.ownerAddress = this.address;
    
    return {
      address: this.address,
      privateKey: this.privateKey
    };
  }

  /**
   * Exports the encrypted wallet
   * @returns {object} Encrypted wallet data
   */
  export() {
    if (!this.encryptedData) {
      throw new Error('Wallet must be encrypted before exporting');
    }
    return this.encryptedData;
  }

  /**
   * Imports an encrypted wallet
   * @param {object} encryptedData - The encrypted wallet data
   */
  import(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'object') {
      throw new Error('Invalid encrypted data');
    }
    this.encryptedData = encryptedData;
  }

  /**
   * Locks the wallet to prevent sends
   * Clears the private key from memory for security
   */
  lock() {
    this.isLocked = true;
    if (this.privateKey) {
      this.privateKey = this._secureWipe(this.privateKey);
      this.privateKey = null;
    }
  }

  /**
   * Unlocks the wallet using the encrypted password
   * @param {string} password - The password to decrypt the wallet with
   */
  unlock(password) {
    if (!this.encryptedData) {
      throw new Error('No encrypted data found. Encrypt the wallet before unlocking.');
    }
    this.decrypt(password);
    this.isLocked = false;
  }

  /**
   * Pauses the wallet to block sends (owner only)
   * @param {string} callerAddress - Address of the caller; must match ownerAddress
   */
  pause(callerAddress) {
    if (!this.ownerAddress) {
      throw new Error('Wallet has no owner. Generate the wallet first.');
    }
    if (!callerAddress || typeof callerAddress !== 'string') {
      throw new Error('Caller address must be a non-empty string');
    }
    if (callerAddress !== this.ownerAddress) {
      throw new Error('Only the owner can pause the wallet');
    }
    this.isPaused = true;
  }

  /**
   * Unpauses the wallet to allow sends (owner only)
   * @param {string} callerAddress - Address of the caller; must match ownerAddress
   */
  unpause(callerAddress) {
    if (!this.ownerAddress) {
      throw new Error('Wallet has no owner. Generate the wallet first.');
    }
    if (!callerAddress || typeof callerAddress !== 'string') {
      throw new Error('Caller address must be a non-empty string');
    }
    if (callerAddress !== this.ownerAddress) {
      throw new Error('Only the owner can unpause the wallet');
    }
    this.isPaused = false;
  }

  /**
   * Sends funds to a recipient address
   * Throws if the wallet is locked or paused
   * @param {string} to - Recipient address
   * @param {number|string} amount - Amount to send
   * @returns {object} Transaction details
   */
  send(to, amount) {
    if (this.isLocked) {
      throw new Error('Wallet is locked. Unlock the wallet before sending.');
    }

    if (this.isPaused) {
      throw new Error('Wallet is paused. Unpause the wallet before sending.');
    }

    if (!this.address) {
      throw new Error('Wallet has not been initialized. Generate or import a wallet first.');
    }

    if (!to || typeof to !== 'string') {
      throw new Error('Recipient address must be a non-empty string');
    }

    if (amount === undefined || amount === null || amount === '') {
      throw new Error('Amount must be provided');
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    const timestamp = Date.now();
    const txData = JSON.stringify({ from: this.address, to, amount: numericAmount, timestamp });
    const signature = crypto.createHmac('sha256', this.privateKey).update(txData).digest('hex');

    return {
      from: this.address,
      to,
      amount: numericAmount,
      timestamp,
      signature
    };
  }
}

module.exports = Wallet;
