/**
 * Validator Rewards Module
 * Parses, validates, and formats Ethereum beacon chain validator reward data.
 *
 * The expected data shape mirrors the API response described in the repository
 * issue, which includes attestation rewards, sync-committee rewards, proposal
 * rewards, and overall validator performance for a given epoch/slot range.
 */

/**
 * Number of wei per ETH (10^18)
 */
const WEI_PER_ETH = BigInt('1000000000000000000');

/**
 * ValidatorRewards
 * Utility class for working with Ethereum validator reward API responses.
 */
class ValidatorRewards {
  // ---------------------------------------------------------------------------
  // Conversion helpers
  // ---------------------------------------------------------------------------

  /**
   * Converts a wei amount (string or number) to a human-readable ETH value.
   * @param {string|number|bigint} wei - Amount in wei
   * @returns {string} Amount formatted as ETH with up to 9 decimal places
   */
  static weiToEth(wei) {
    if (wei === null || wei === undefined) return '0';
    const bigWei = BigInt(String(wei));
    const whole = bigWei / WEI_PER_ETH;
    const remainder = bigWei % WEI_PER_ETH;
    // Pad remainder to 18 digits then trim trailing zeros (max 9 significant decimals)
    const fracFull = remainder.toString().padStart(18, '0');
    // Take first 9 decimal places and strip trailing zeros
    const frac = fracFull.slice(0, 9).replace(/0+$/, '');
    return frac.length > 0 ? `${whole}.${frac}` : `${whole}`;
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  /**
   * Validates a BLS public key string.
   * A BLS public key is 48 bytes, represented as 96 hex characters with an
   * optional '0x' prefix (total 98 characters with prefix, 96 without).
   * @param {string} key - Public key to validate
   * @returns {boolean} True if the key is valid
   */
  static validatePublicKey(key) {
    if (!key || typeof key !== 'string') return false;
    const clean = key.startsWith('0x') ? key.slice(2) : key;
    return /^[0-9a-fA-F]{96}$/.test(clean);
  }

  /**
   * Validates a single validator reward entry.
   * @param {object} entry - Entry to validate
   * @returns {{ valid: boolean, errors: string[] }} Validation result
   */
  static validateEntry(entry) {
    const errors = [];

    if (!entry || typeof entry !== 'object') {
      return { valid: false, errors: ['Entry must be a non-null object'] };
    }

    // Validator sub-object
    if (!entry.validator || typeof entry.validator !== 'object') {
      errors.push('entry.validator must be an object');
    } else {
      if (entry.validator.index === undefined || entry.validator.index === null) {
        errors.push('entry.validator.index is required');
      }
      if (!ValidatorRewards.validatePublicKey(entry.validator.public_key)) {
        errors.push('entry.validator.public_key must be a valid 48-byte BLS public key');
      }
    }

    // Top-level numeric string fields – must be non-negative integer strings
    for (const field of ['total_reward', 'total_penalty', 'total_missed']) {
      if (entry[field] === undefined) {
        errors.push(`entry.${field} is required`);
      } else if (!/^\d+$/.test(String(entry[field]))) {
        errors.push(`entry.${field} must be a non-negative integer string`);
      }
    }

    // Finality
    if (entry.finality !== undefined && typeof entry.finality !== 'string') {
      errors.push('entry.finality must be a string');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validates a full validator rewards API response object.
   * @param {object} response - API response to validate
   * @returns {{ valid: boolean, errors: string[] }} Validation result
   */
  static validateResponse(response) {
    const errors = [];

    if (!response || typeof response !== 'object') {
      return { valid: false, errors: ['Response must be a non-null object'] };
    }

    if (!Array.isArray(response.data)) {
      errors.push('response.data must be an array');
    } else {
      response.data.forEach((entry, idx) => {
        const result = ValidatorRewards.validateEntry(entry);
        if (!result.valid) {
          result.errors.forEach(e => errors.push(`data[${idx}]: ${e}`));
        }
      });
    }

    if (response.range !== undefined) {
      if (typeof response.range !== 'object' || response.range === null) {
        errors.push('response.range must be an object');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Parses a single attestation reward component (head / source / target).
   * @param {object|null} component - Raw component object
   * @returns {object} Parsed component
   * @private
   */
  static _parseAttestationComponent(component) {
    const toEth = ValidatorRewards.weiToEth.bind(ValidatorRewards);
    return {
      rewardWei: component && component.reward,
      penaltyWei: component && component.penalty,
      missedRewardWei: component && component.missed_reward,
      rewardEth: toEth(component && component.reward),
      penaltyEth: toEth(component && component.penalty)
    };
  }

  // ---------------------------------------------------------------------------
  // Parsing
  // ---------------------------------------------------------------------------

  /**
   * Parses a single validator reward entry into a normalised object with ETH
   * amounts and structured reward breakdowns.
   * @param {object} entry - Raw entry from the API response
   * @returns {object} Parsed entry
   * @throws {Error} If the entry fails validation
   */
  static parseEntry(entry) {
    const { valid, errors } = ValidatorRewards.validateEntry(entry);
    if (!valid) {
      throw new Error(`Invalid validator reward entry: ${errors.join('; ')}`);
    }

    const toEth = ValidatorRewards.weiToEth.bind(ValidatorRewards);

    return {
      validator: {
        index: entry.validator.index,
        publicKey: entry.validator.public_key
      },
      finality: entry.finality || null,
      totals: {
        rewardWei: entry.total_reward,
        penaltyWei: entry.total_penalty,
        missedWei: entry.total_missed,
        rewardEth: toEth(entry.total_reward),
        penaltyEth: toEth(entry.total_penalty),
        missedEth: toEth(entry.total_missed)
      },
      attestation: entry.attestation
        ? {
            totalWei: entry.attestation.total,
            totalEth: toEth(entry.attestation.total),
            head: ValidatorRewards._parseAttestationComponent(entry.attestation.head),
            source: ValidatorRewards._parseAttestationComponent(entry.attestation.source),
            target: ValidatorRewards._parseAttestationComponent(entry.attestation.target),
            inactivityLeakPenaltyWei: entry.attestation.inactivity_leak_penalty,
            inclusionDelay: entry.attestation.inclusion_delay
          }
        : null,
      syncCommittee: entry.sync_committee
        ? {
            totalWei: entry.sync_committee.total,
            totalEth: toEth(entry.sync_committee.total),
            rewardWei: entry.sync_committee.reward,
            rewardEth: toEth(entry.sync_committee.reward),
            penaltyWei: entry.sync_committee.penalty,
            penaltyEth: toEth(entry.sync_committee.penalty),
            missedRewardWei: entry.sync_committee.missed_reward,
            missedRewardEth: toEth(entry.sync_committee.missed_reward)
          }
        : null,
      proposal: entry.proposal
        ? {
            totalWei: entry.proposal.total,
            totalEth: toEth(entry.proposal.total),
            executionLayerRewardWei: entry.proposal.execution_layer_reward,
            executionLayerRewardEth: toEth(entry.proposal.execution_layer_reward),
            attestationInclusionRewardWei: entry.proposal.attestation_inclusion_reward,
            attestationInclusionRewardEth: toEth(entry.proposal.attestation_inclusion_reward),
            syncInclusionRewardWei: entry.proposal.sync_inclusion_reward,
            syncInclusionRewardEth: toEth(entry.proposal.sync_inclusion_reward),
            slashingInclusionRewardWei: entry.proposal.slashing_inclusion_reward,
            slashingInclusionRewardEth: toEth(entry.proposal.slashing_inclusion_reward),
            missedClRewardWei: entry.proposal.missed_cl_reward,
            missedClRewardEth: toEth(entry.proposal.missed_cl_reward),
            missedElRewardWei: entry.proposal.missed_el_reward,
            missedElRewardEth: toEth(entry.proposal.missed_el_reward)
          }
        : null
    };
  }

  /**
   * Parses a full validator rewards API response.
   * @param {object} response - Raw API response
   * @returns {object} Parsed response with ETH amounts and structured data
   * @throws {Error} If the response fails validation
   */
  static parseResponse(response) {
    const { valid, errors } = ValidatorRewards.validateResponse(response);
    if (!valid) {
      throw new Error(`Invalid validator rewards response: ${errors.join('; ')}`);
    }

    return {
      data: response.data.map(entry => ValidatorRewards.parseEntry(entry)),
      paging: response.paging || {},
      range: response.range || null
    };
  }

  // ---------------------------------------------------------------------------
  // Query helpers
  // ---------------------------------------------------------------------------

  /**
   * Checks whether an entry has been finalized on the beacon chain.
   * @param {object} entry - Raw or parsed entry
   * @returns {boolean} True if finality === 'finalized'
   */
  static isFinalized(entry) {
    return entry && entry.finality === 'finalized';
  }

  /**
   * Returns the top N entries sorted by total reward (descending).
   * Works with raw API response data entries.
   * @param {object[]} entries - Array of raw reward entries
   * @param {number} [n=10] - Number of top entries to return
   * @returns {object[]} Sorted array of up to n entries
   */
  static getTopRewards(entries, n = 10) {
    if (!Array.isArray(entries)) return [];
    return [...entries]
      .sort((a, b) => {
        const aWei = BigInt(String(a.total_reward || 0));
        const bWei = BigInt(String(b.total_reward || 0));
        if (bWei > aWei) return 1;
        if (bWei < aWei) return -1;
        return 0;
      })
      .slice(0, n);
  }

  /**
   * Calculates aggregate statistics across all entries in a response.
   * @param {object} response - Raw API response
   * @returns {object} Summary statistics
   */
  static getSummary(response) {
    if (!response || !Array.isArray(response.data) || response.data.length === 0) {
      return {
        validatorCount: 0,
        totalRewardWei: '0',
        totalRewardEth: '0',
        totalPenaltyWei: '0',
        totalPenaltyEth: '0',
        totalMissedWei: '0',
        totalMissedEth: '0',
        finalizedCount: 0,
        range: response && response.range ? response.range : null
      };
    }

    let totalReward = BigInt(0);
    let totalPenalty = BigInt(0);
    let totalMissed = BigInt(0);
    let finalizedCount = 0;

    for (const entry of response.data) {
      totalReward += BigInt(String(entry.total_reward || 0));
      totalPenalty += BigInt(String(entry.total_penalty || 0));
      totalMissed += BigInt(String(entry.total_missed || 0));
      if (ValidatorRewards.isFinalized(entry)) finalizedCount++;
    }

    return {
      validatorCount: response.data.length,
      totalRewardWei: totalReward.toString(),
      totalRewardEth: ValidatorRewards.weiToEth(totalReward),
      totalPenaltyWei: totalPenalty.toString(),
      totalPenaltyEth: ValidatorRewards.weiToEth(totalPenalty),
      totalMissedWei: totalMissed.toString(),
      totalMissedEth: ValidatorRewards.weiToEth(totalMissed),
      finalizedCount,
      range: response.range || null
    };
  }

  // ---------------------------------------------------------------------------
  // Formatting
  // ---------------------------------------------------------------------------

  /**
   * Formats a single parsed validator reward entry for human-readable display.
   * @param {object} entry - Parsed entry (output of parseEntry)
   * @returns {string} Formatted string
   */
  static formatEntry(entry) {
    if (!entry || typeof entry !== 'object') return 'No entry data available';

    const sep = '─'.repeat(50);
    let output = `${sep}\n`;
    output += `Validator #${entry.validator.index}\n`;
    output += `  Public Key : ${entry.validator.publicKey}\n`;
    output += `  Finality   : ${entry.finality || 'unknown'}\n\n`;

    output += `Total Rewards\n`;
    output += `  Reward  : ${entry.totals.rewardEth} ETH\n`;
    output += `  Penalty : ${entry.totals.penaltyEth} ETH\n`;
    output += `  Missed  : ${entry.totals.missedEth} ETH\n\n`;

    if (entry.attestation) {
      output += `Attestation Rewards  (${entry.attestation.totalEth} ETH)\n`;
      output += `  Head   reward : ${entry.attestation.head.rewardEth} ETH\n`;
      output += `  Source reward : ${entry.attestation.source.rewardEth} ETH\n`;
      output += `  Target reward : ${entry.attestation.target.rewardEth} ETH\n\n`;
    }

    if (entry.syncCommittee) {
      output += `Sync Committee  (${entry.syncCommittee.totalEth} ETH)\n`;
      output += `  Reward  : ${entry.syncCommittee.rewardEth} ETH\n`;
      output += `  Penalty : ${entry.syncCommittee.penaltyEth} ETH\n\n`;
    }

    if (entry.proposal) {
      output += `Proposal Rewards  (${entry.proposal.totalEth} ETH)\n`;
      output += `  Execution Layer : ${entry.proposal.executionLayerRewardEth} ETH\n`;
      output += `  Attest Inclusion: ${entry.proposal.attestationInclusionRewardEth} ETH\n`;
      output += `  Sync Inclusion  : ${entry.proposal.syncInclusionRewardEth} ETH\n`;
      output += `  Missed CL       : ${entry.proposal.missedClRewardEth} ETH\n`;
      output += `  Missed EL       : ${entry.proposal.missedElRewardEth} ETH\n\n`;
    }

    return output;
  }

  /**
   * Formats a full parsed validator rewards response for display.
   * @param {object} parsedResponse - Output of parseResponse
   * @returns {string} Formatted string
   */
  static formatResponse(parsedResponse) {
    if (!parsedResponse || !Array.isArray(parsedResponse.data)) {
      return 'No data available';
    }

    let output = 'Validator Rewards Report\n';
    output += '='.repeat(50) + '\n\n';

    // Range information
    if (parsedResponse.range) {
      const r = parsedResponse.range;
      if (r.epoch) {
        output += `Epoch  : ${r.epoch.start}`;
        if (r.epoch.end !== r.epoch.start) output += ` – ${r.epoch.end}`;
        output += '\n';
      }
      if (r.slot) {
        output += `Slot   : ${r.slot.start} – ${r.slot.end}\n`;
      }
      if (r.timestamp) {
        const start = new Date(r.timestamp.start * 1000).toISOString();
        const end = new Date(r.timestamp.end * 1000).toISOString();
        output += `Time   : ${start} – ${end}\n`;
      }
      output += '\n';
    }

    output += `Validators: ${parsedResponse.data.length}\n\n`;

    for (const entry of parsedResponse.data) {
      output += ValidatorRewards.formatEntry(entry);
    }

    return output;
  }

  /**
   * Formats a summary statistics object for display.
   * @param {object} summary - Output of getSummary
   * @returns {string} Formatted string
   */
  static formatSummary(summary) {
    if (!summary) return 'No summary available';

    let output = 'Validator Rewards Summary\n';
    output += '='.repeat(50) + '\n\n';
    output += `Validators       : ${summary.validatorCount}\n`;
    output += `Finalized        : ${summary.finalizedCount}\n\n`;
    output += `Total Reward     : ${summary.totalRewardEth} ETH\n`;
    output += `Total Penalty    : ${summary.totalPenaltyEth} ETH\n`;
    output += `Total Missed     : ${summary.totalMissedEth} ETH\n`;

    if (summary.range && summary.range.epoch) {
      output += `\nEpoch Range      : ${summary.range.epoch.start} – ${summary.range.epoch.end}\n`;
    }

    return output;
  }
}

module.exports = ValidatorRewards;
