/**
 * Skill Module
 * Provides a system for tracking and managing blockchain developer skills
 * Supports skill creation, retrieval, validation, and proficiency tracking
 */

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

const SKILL_CATEGORIES = {
  BLOCKCHAIN: 'blockchain',
  SMART_CONTRACTS: 'smart_contracts',
  DEFI: 'defi',
  NFT: 'nft',
  CRYPTOGRAPHY: 'cryptography',
  CONSENSUS: 'consensus',
  SECURITY: 'security',
  DEVELOPMENT: 'development'
};

class SkillFetcher {
  /**
   * Creates a new SkillFetcher instance
   * @param {string} owner - The owner/developer name for skill tracking
   */
  constructor(owner = 'Anonymous') {
    if (typeof owner !== 'string' || owner.trim() === '') {
      throw new Error('Owner must be a non-empty string');
    }
    this.owner = owner.trim();
    this.skills = new Map();
    this.createdAt = new Date();
  }

  /**
   * Adds or updates a skill entry
   * @param {string} name - The skill name
   * @param {string} level - Proficiency level: 'beginner', 'intermediate', 'advanced', or 'expert'
   * @param {string} category - Skill category (e.g., 'blockchain', 'smart_contracts')
   * @param {string} [description] - Optional description of the skill
   * @returns {object} The created or updated skill object
   */
  addSkill(name, level, category, description = '') {
    this._validateSkillName(name);
    this._validateLevel(level);
    this._validateCategory(category);

    const skillKey = name.trim().toLowerCase();
    const skill = {
      name: name.trim(),
      level: level.toLowerCase(),
      category: category.toLowerCase(),
      description: typeof description === 'string' ? description.trim() : '',
      addedAt: new Date(),
      updatedAt: new Date()
    };

    if (this.skills.has(skillKey)) {
      const existing = this.skills.get(skillKey);
      skill.addedAt = existing.addedAt;
    }

    this.skills.set(skillKey, skill);
    return skill;
  }

  /**
   * Retrieves a skill by name
   * @param {string} name - The skill name
   * @returns {object|null} The skill object, or null if not found
   */
  getSkill(name) {
    this._validateSkillName(name);
    const skillKey = name.trim().toLowerCase();
    return this.skills.get(skillKey) || null;
  }

  /**
   * Retrieves all skills, optionally filtered by category or level
   * @param {object} [filters] - Optional filters
   * @param {string} [filters.category] - Filter by category
   * @param {string} [filters.level] - Filter by level
   * @returns {object[]} Array of matching skill objects
   */
  getSkills(filters = {}) {
    let result = Array.from(this.skills.values());

    if (filters.category) {
      const cat = filters.category.toLowerCase();
      result = result.filter(s => s.category === cat);
    }

    if (filters.level) {
      const lvl = filters.level.toLowerCase();
      result = result.filter(s => s.level === lvl);
    }

    return result;
  }

  /**
   * Removes a skill by name
   * @param {string} name - The skill name to remove
   * @returns {boolean} True if the skill was removed, false if not found
   */
  removeSkill(name) {
    this._validateSkillName(name);
    const skillKey = name.trim().toLowerCase();
    return this.skills.delete(skillKey);
  }

  /**
   * Returns a summary of the owner's skills
   * @returns {object} Summary including counts per category and level
   */
  getSummary() {
    const allSkills = Array.from(this.skills.values());
    const byCategory = {};
    const byLevel = {};

    for (const skill of allSkills) {
      byCategory[skill.category] = (byCategory[skill.category] || 0) + 1;
      byLevel[skill.level] = (byLevel[skill.level] || 0) + 1;
    }

    return {
      owner: this.owner,
      totalSkills: allSkills.length,
      byCategory,
      byLevel,
      createdAt: this.createdAt
    };
  }

  /**
   * Returns the list of valid skill levels
   * @returns {string[]} Valid proficiency levels
   */
  static getValidLevels() {
    return [...VALID_LEVELS];
  }

  /**
   * Returns the list of available skill categories
   * @returns {object} Available skill categories
   */
  static getCategories() {
    return { ...SKILL_CATEGORIES };
  }

  // --- Private validation helpers ---

  _validateSkillName(name) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Skill name must be a non-empty string');
    }
  }

  _validateLevel(level) {
    if (typeof level !== 'string' || !VALID_LEVELS.includes(level.toLowerCase())) {
      throw new Error(`Level must be one of: ${VALID_LEVELS.join(', ')}`);
    }
  }

  _validateCategory(category) {
    if (typeof category !== 'string' || category.trim() === '') {
      throw new Error('Category must be a non-empty string');
    }
  }
}

module.exports = SkillFetcher;
