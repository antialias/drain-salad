const { atomicRead, atomicWrite } = require('../utils/fileUtils');
const { validateBookConfig, createDefaultBookConfig } = require('./schemas');

/**
 * BookConfig - Manages book configuration and genre-specific settings
 *
 * Loads and provides access to book-config.json which defines:
 * - Book type (fiction, non-fiction, technical, academic)
 * - Genre and subgenre
 * - Content type flags (hasRecipes, hasCodeSamples, etc.)
 * - Available review types
 * - Detection patterns for content analysis
 * - Custom workflows
 */
class BookConfig {
  constructor(configPath = 'manuscript/.state/book-config.json') {
    this.configPath = configPath;
    this.config = null;
  }

  /**
   * Load and validate book configuration
   * @returns {Promise<object>} - The validated configuration
   * @throws {Error} - If config is invalid or cannot be loaded
   */
  async load() {
    const config = await atomicRead(this.configPath);

    if (!config) {
      throw new Error(
        `Book configuration not found at ${this.configPath}. ` +
        `Run 'npm run state:init' to create it.`
      );
    }

    // Validate configuration
    const validation = validateBookConfig(config);
    if (!validation.valid) {
      throw new Error(
        `Invalid book configuration:\n${validation.errors.join('\n')}`
      );
    }

    this.config = config;
    return config;
  }

  /**
   * Get a configuration value by key
   * @param {string} key - Configuration key (supports dot notation: 'contentTypes.hasRecipes')
   * @returns {any} - Configuration value
   * @throws {Error} - If config not loaded or key not found
   */
  get(key) {
    this._ensureLoaded();

    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        throw new Error(`Configuration key not found: ${key}`);
      }
    }

    return value;
  }

  /**
   * Get content type flags
   * @returns {object} - Content type flags (hasRecipes, hasCodeSamples, etc.)
   */
  getContentTypes() {
    this._ensureLoaded();
    return this.config.contentTypes || {};
  }

  /**
   * Get available review types for this book
   * @returns {string[]} - Array of review type names
   */
  getReviewTypes() {
    this._ensureLoaded();
    return this.config.reviewTypes || [];
  }

  /**
   * Get genre-specific content detection patterns
   * @returns {object} - Detection patterns by content type
   */
  getDetectionPatterns() {
    this._ensureLoaded();
    return this.config.customDetection || {};
  }

  /**
   * Get custom workflow definitions
   * @returns {object} - Workflows by name with review type arrays
   */
  getCustomWorkflows() {
    this._ensureLoaded();
    return this.config.customWorkflows || {};
  }

  /**
   * Get book type
   * @returns {string} - Book type (fiction, non-fiction, technical, academic)
   */
  getType() {
    this._ensureLoaded();
    return this.config.type;
  }

  /**
   * Get genre
   * @returns {string} - Genre (cookbook, novel, programming, etc.)
   */
  getGenre() {
    this._ensureLoaded();
    return this.config.genre;
  }

  /**
   * Get subgenre
   * @returns {string} - Subgenre (satire, coming-of-age, tutorial, etc.)
   */
  getSubgenre() {
    this._ensureLoaded();
    return this.config.subgenre || '';
  }

  /**
   * Get full book title
   * @returns {string} - Book title
   */
  getTitle() {
    this._ensureLoaded();
    return this.config.title || 'Untitled Book';
  }

  /**
   * Get target audience
   * @returns {string} - Target audience description
   */
  getTargetAudience() {
    this._ensureLoaded();
    return this.config.targetAudience || 'general';
  }

  /**
   * Get voice/tone description
   * @returns {string} - Voice description (conversational, formal, etc.)
   */
  getVoice() {
    this._ensureLoaded();
    return this.config.voice || 'conversational';
  }

  /**
   * Check if a specific content type is enabled
   * @param {string} contentType - Content type key (e.g., 'hasRecipes')
   * @returns {boolean} - True if content type is enabled
   */
  hasContentType(contentType) {
    const contentTypes = this.getContentTypes();
    return contentTypes[contentType] === true;
  }

  /**
   * Check if a review type is available for this book
   * @param {string} reviewType - Review type name
   * @returns {boolean} - True if review type is available
   */
  hasReviewType(reviewType) {
    const reviewTypes = this.getReviewTypes();
    return reviewTypes.includes(reviewType);
  }

  /**
   * Get detection patterns for a specific content type
   * @param {string} contentType - Content type (e.g., 'recipes', 'code')
   * @returns {string[]} - Array of detection patterns
   */
  getPatternsFor(contentType) {
    const patterns = this.getDetectionPatterns();
    return patterns[contentType]?.patterns || [];
  }

  /**
   * Get a custom workflow by name
   * @param {string} workflowName - Workflow name (e.g., 'pre-publication')
   * @returns {string[]} - Array of review types in workflow
   */
  getWorkflow(workflowName) {
    const workflows = this.getCustomWorkflows();
    return workflows[workflowName] || [];
  }

  /**
   * Ensure config is loaded before accessing
   * @private
   */
  _ensureLoaded() {
    if (!this.config) {
      throw new Error(
        'BookConfig not loaded. Call load() first.'
      );
    }
  }

  /**
   * Create a default book configuration file
   * @param {string} type - Book type (fiction, non-fiction, technical, academic)
   * @param {string} genre - Genre (cookbook, novel, programming, etc.)
   * @param {string} configPath - Path to save config
   * @returns {Promise<object>} - The created configuration
   */
  static async createDefault(type = 'non-fiction', genre = 'cookbook', configPath = 'manuscript/.state/book-config.json') {
    const defaultConfig = createDefaultBookConfig(type, genre);
    await atomicWrite(configPath, defaultConfig);
    return defaultConfig;
  }

  /**
   * Update configuration (merge with existing)
   * @param {object} updates - Configuration updates to merge
   * @returns {Promise<object>} - Updated configuration
   */
  async update(updates) {
    this._ensureLoaded();

    // Merge updates
    const updatedConfig = {
      ...this.config,
      ...updates,
      // Deep merge for nested objects
      contentTypes: {
        ...this.config.contentTypes,
        ...updates.contentTypes
      },
      customDetection: {
        ...this.config.customDetection,
        ...updates.customDetection
      },
      customWorkflows: {
        ...this.config.customWorkflows,
        ...updates.customWorkflows
      }
    };

    // Validate before saving
    const validation = validateBookConfig(updatedConfig);
    if (!validation.valid) {
      throw new Error(
        `Invalid configuration update:\n${validation.errors.join('\n')}`
      );
    }

    // Save and update in-memory config
    await atomicWrite(this.configPath, updatedConfig);
    this.config = updatedConfig;

    return updatedConfig;
  }

  /**
   * Get complete configuration object
   * @returns {object} - Complete configuration
   */
  getAll() {
    this._ensureLoaded();
    return { ...this.config };
  }
}

module.exports = BookConfig;
