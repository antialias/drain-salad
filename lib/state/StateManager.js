const fs = require('fs');
const path = require('path');
const { atomicRead, atomicWrite, ensureDir } = require('../utils/fileUtils');
const { validateChapterState, validateProjectState, validatePreferences } = require('./schemas');
const BookConfig = require('./BookConfig');

/**
 * StateManager - Central state management for the Review Assistant
 *
 * Manages:
 * - Chapter state (reviews, metrics, characteristics)
 * - Project state (overall progress, chapter list)
 * - Preferences (user settings)
 * - Integration with BookConfig
 */
class StateManager {
  constructor(options = {}) {
    this.stateDir = options.stateDir || 'manuscript/.state';
    this.chaptersDir = path.join(this.stateDir, 'chapters');
    this.bookConfigPath = path.join(this.stateDir, 'book-config.json');
    this.projectStatePath = path.join(this.stateDir, 'project.json');
    this.preferencesPath = path.join(this.stateDir, 'preferences.json');

    this.bookConfig = null;
    this.projectState = null;
    this.preferences = null;
    this.chapterStates = new Map(); // Cache chapter states
  }

  /**
   * Initialize the state manager
   * Loads book config, project state, and preferences
   */
  async initialize() {
    // Ensure directories exist
    await ensureDir(this.stateDir);
    await ensureDir(this.chaptersDir);

    // Load book config
    this.bookConfig = new BookConfig(this.bookConfigPath);
    await this.bookConfig.load();

    // Load project state (create if missing)
    this.projectState = await this._loadOrCreateProjectState();

    // Load preferences (create if missing)
    this.preferences = await this._loadOrCreatePreferences();

    return {
      bookConfig: this.bookConfig.getAll(),
      projectState: this.projectState,
      preferences: this.preferences
    };
  }

  /**
   * Get book configuration
   */
  getBookConfig() {
    this._ensureInitialized();
    return this.bookConfig;
  }

  /**
   * Get project state
   */
  getProjectState() {
    this._ensureInitialized();
    return { ...this.projectState };
  }

  /**
   * Get preferences
   */
  getPreferences() {
    this._ensureInitialized();
    return { ...this.preferences };
  }

  // ==========================================
  // CHAPTER STATE OPERATIONS
  // ==========================================

  /**
   * Get chapter state by chapter name
   * @param {string} chapterName - Chapter identifier (e.g., 'chapter-01-history')
   * @returns {Promise<object|null>} - Chapter state or null if not found
   */
  async getChapterState(chapterName) {
    this._ensureInitialized();

    // Check cache first
    if (this.chapterStates.has(chapterName)) {
      return { ...this.chapterStates.get(chapterName) };
    }

    // Load from disk
    const chapterPath = this._getChapterStatePath(chapterName);
    const state = await atomicRead(chapterPath);

    if (state) {
      // Validate before caching
      const validation = validateChapterState(state);
      if (!validation.valid) {
        throw new Error(
          `Invalid chapter state for ${chapterName}:\n${validation.errors.join('\n')}`
        );
      }
      this.chapterStates.set(chapterName, state);
    }

    return state ? { ...state } : null;
  }

  /**
   * Create or update chapter state
   * @param {string} chapterName - Chapter identifier
   * @param {object} state - Chapter state object
   * @returns {Promise<object>} - Saved chapter state
   */
  async saveChapterState(chapterName, state) {
    this._ensureInitialized();

    // Validate state
    const validation = validateChapterState(state);
    if (!validation.valid) {
      throw new Error(
        `Invalid chapter state for ${chapterName}:\n${validation.errors.join('\n')}`
      );
    }

    // Add metadata
    const stateWithMetadata = {
      ...state,
      lastModified: new Date().toISOString()
    };

    // Save to disk
    const chapterPath = this._getChapterStatePath(chapterName);
    await atomicWrite(chapterPath, stateWithMetadata);

    // Update cache
    this.chapterStates.set(chapterName, stateWithMetadata);

    // Update project state
    await this._updateProjectStateAfterChapterChange(chapterName, stateWithMetadata);

    return { ...stateWithMetadata };
  }

  /**
   * Create a new chapter state
   * @param {string} chapterFile - Path to chapter markdown file
   * @returns {Promise<object>} - New chapter state
   */
  async createChapterState(chapterFile) {
    this._ensureInitialized();

    const chapterName = this._extractChapterName(chapterFile);

    // Check if already exists
    const existing = await this.getChapterState(chapterName);
    if (existing) {
      throw new Error(`Chapter state already exists for ${chapterName}`);
    }

    // Create default state
    const defaultState = {
      file: chapterFile,
      status: 'draft',
      wordCount: 0,
      reviews: [],
      completedReviews: {},
      pendingActions: [],
      metrics: {
        lastReviewedAt: null,
        totalReviews: 0,
        costToDate: 0
      },
      characteristics: {
        complexity: 'unknown',
        estimatedReadingTime: 0
      },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    return await this.saveChapterState(chapterName, defaultState);
  }

  /**
   * Update chapter state (merge with existing)
   * @param {string} chapterName - Chapter identifier
   * @param {object} updates - Updates to merge
   * @returns {Promise<object>} - Updated chapter state
   */
  async updateChapterState(chapterName, updates) {
    this._ensureInitialized();

    const currentState = await this.getChapterState(chapterName);
    if (!currentState) {
      throw new Error(`Chapter state not found: ${chapterName}`);
    }

    // Deep merge updates
    const updatedState = {
      ...currentState,
      ...updates,
      metrics: {
        ...currentState.metrics,
        ...(updates.metrics || {})
      },
      characteristics: {
        ...currentState.characteristics,
        ...(updates.characteristics || {})
      },
      completedReviews: {
        ...currentState.completedReviews,
        ...(updates.completedReviews || {})
      }
    };

    return await this.saveChapterState(chapterName, updatedState);
  }

  /**
   * Delete chapter state
   * @param {string} chapterName - Chapter identifier
   */
  async deleteChapterState(chapterName) {
    this._ensureInitialized();

    const chapterPath = this._getChapterStatePath(chapterName);

    if (fs.existsSync(chapterPath)) {
      await fs.promises.unlink(chapterPath);
      this.chapterStates.delete(chapterName);
      await this._updateProjectStateAfterChapterDelete(chapterName);
    }
  }

  /**
   * Get all chapter states
   * @returns {Promise<object[]>} - Array of all chapter states
   */
  async getAllChapterStates() {
    this._ensureInitialized();

    const chapterFiles = fs.readdirSync(this.chaptersDir)
      .filter(f => f.endsWith('.json'));

    const states = [];
    for (const file of chapterFiles) {
      const chapterName = file.replace('.json', '');
      const state = await this.getChapterState(chapterName);
      if (state) {
        states.push(state);
      }
    }

    return states;
  }

  // ==========================================
  // PROJECT STATE OPERATIONS
  // ==========================================

  /**
   * Update project state
   * @param {object} updates - Updates to merge
   * @returns {Promise<object>} - Updated project state
   */
  async updateProjectState(updates) {
    this._ensureInitialized();

    const updatedState = {
      ...this.projectState,
      ...updates,
      lastModified: new Date().toISOString()
    };

    // Validate
    const validation = validateProjectState(updatedState);
    if (!validation.valid) {
      throw new Error(
        `Invalid project state:\n${validation.errors.join('\n')}`
      );
    }

    // Save
    await atomicWrite(this.projectStatePath, updatedState);
    this.projectState = updatedState;

    return { ...updatedState };
  }

  /**
   * Recalculate project statistics from all chapter states
   * @returns {Promise<object>} - Updated project state
   */
  async recalculateProjectStats() {
    this._ensureInitialized();

    const chapters = await this.getAllChapterStates();

    const stats = {
      totalChapters: chapters.length,
      totalWords: chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
      totalReviews: chapters.reduce((sum, ch) => sum + (ch.metrics?.totalReviews || 0), 0),
      totalCost: chapters.reduce((sum, ch) => sum + (ch.metrics?.costToDate || 0), 0),
      statusBreakdown: this._calculateStatusBreakdown(chapters)
    };

    return await this.updateProjectState(stats);
  }

  // ==========================================
  // PREFERENCES OPERATIONS
  // ==========================================

  /**
   * Update preferences
   * @param {object} updates - Preference updates
   * @returns {Promise<object>} - Updated preferences
   */
  async updatePreferences(updates) {
    this._ensureInitialized();

    const updatedPrefs = {
      ...this.preferences,
      ...updates
    };

    // Validate
    const validation = validatePreferences(updatedPrefs);
    if (!validation.valid) {
      throw new Error(
        `Invalid preferences:\n${validation.errors.join('\n')}`
      );
    }

    // Save
    await atomicWrite(this.preferencesPath, updatedPrefs);
    this.preferences = updatedPrefs;

    return { ...updatedPrefs };
  }

  // ==========================================
  // PRIVATE HELPERS
  // ==========================================

  _ensureInitialized() {
    if (!this.bookConfig || !this.projectState || !this.preferences) {
      throw new Error('StateManager not initialized. Call initialize() first.');
    }
  }

  _getChapterStatePath(chapterName) {
    return path.join(this.chaptersDir, `${chapterName}.json`);
  }

  _extractChapterName(filePath) {
    // Extract chapter name from file path
    // e.g., 'manuscript/chapter-01-history.md' -> 'chapter-01-history'
    const basename = path.basename(filePath, '.md');
    return basename;
  }

  async _loadOrCreateProjectState() {
    let state = await atomicRead(this.projectStatePath);

    if (!state) {
      // Create default project state
      const bookConfig = this.bookConfig.getAll();
      state = {
        name: bookConfig.title || 'Untitled Book',
        type: bookConfig.type,
        genre: bookConfig.genre,
        subgenre: bookConfig.subgenre || '',
        totalChapters: 0,
        totalWords: 0,
        totalReviews: 0,
        totalCost: 0,
        statusBreakdown: {
          draft: 0,
          'ready-for-review': 0,
          'in-revision': 0,
          'pending-verification': 0,
          'ready-for-publication': 0
        },
        chapters: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      await atomicWrite(this.projectStatePath, state);
    }

    return state;
  }

  async _loadOrCreatePreferences() {
    let prefs = await atomicRead(this.preferencesPath);

    if (!prefs) {
      // Create default preferences
      prefs = {
        defaultModel: 'gpt-4o-mini',
        autoSuggest: true,
        costLimit: 10.0,
        verbose: false
      };

      await atomicWrite(this.preferencesPath, prefs);
    }

    return prefs;
  }

  async _updateProjectStateAfterChapterChange(chapterName, chapterState) {
    // Update chapter list if not present
    const chapters = this.projectState.chapters || [];
    if (!chapters.includes(chapterName)) {
      chapters.push(chapterName);
    }

    // Recalculate stats
    await this.recalculateProjectStats();
  }

  async _updateProjectStateAfterChapterDelete(chapterName) {
    const chapters = (this.projectState.chapters || [])
      .filter(ch => ch !== chapterName);

    await this.updateProjectState({ chapters });
    await this.recalculateProjectStats();
  }

  _calculateStatusBreakdown(chapters) {
    const breakdown = {
      draft: 0,
      'ready-for-review': 0,
      'in-revision': 0,
      'pending-verification': 0,
      'ready-for-publication': 0
    };

    for (const chapter of chapters) {
      const status = chapter.status || 'draft';
      if (breakdown.hasOwnProperty(status)) {
        breakdown[status]++;
      }
    }

    return breakdown;
  }
}

module.exports = StateManager;
