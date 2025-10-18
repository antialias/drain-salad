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
  // REVIEW TRACKING (Task 2.1)
  // ==========================================

  /**
   * Add a review to chapter state
   * @param {string} chapterName - Chapter identifier
   * @param {object} review - Review object {type, model, cost, timestamp, summary, issues}
   * @returns {Promise<object>} - Updated chapter state
   */
  async addReview(chapterName, review) {
    this._ensureInitialized();

    const state = await this.getChapterState(chapterName);
    if (!state) {
      throw new Error(`Chapter state not found: ${chapterName}`);
    }

    // Validate review type is allowed for this book
    const allowedTypes = this.bookConfig.getReviewTypes();
    if (!allowedTypes.includes(review.type)) {
      throw new Error(
        `Review type '${review.type}' not allowed for this book. ` +
        `Allowed types: ${allowedTypes.join(', ')}`
      );
    }

    // Create review entry
    const reviewEntry = {
      id: `${chapterName}-${review.type}-${Date.now()}`,
      type: review.type,
      model: review.model || 'gpt-4o-mini',
      cost: review.cost || 0,
      timestamp: review.timestamp || new Date().toISOString(),
      summary: review.summary || '',
      issues: review.issues || [],
      ...review
    };

    // Add to reviews array
    const reviews = [...state.reviews, reviewEntry];

    // Update completedReviews map
    const completedReviews = {
      ...state.completedReviews,
      [review.type]: reviewEntry.timestamp
    };

    // Update metrics
    const metrics = {
      ...state.metrics,
      lastReviewedAt: reviewEntry.timestamp,
      totalReviews: (state.metrics.totalReviews || 0) + 1,
      costToDate: (state.metrics.costToDate || 0) + reviewEntry.cost
    };

    return await this.updateChapterState(chapterName, {
      reviews,
      completedReviews,
      metrics
    });
  }

  /**
   * Get review history for a chapter
   * @param {string} chapterName - Chapter identifier
   * @param {object} options - Filter options {type, limit, since}
   * @returns {Promise<object[]>} - Array of review entries
   */
  async getReviewHistory(chapterName, options = {}) {
    this._ensureInitialized();

    const state = await this.getChapterState(chapterName);
    if (!state) {
      return [];
    }

    let reviews = state.reviews || [];

    // Filter by type if specified
    if (options.type) {
      reviews = reviews.filter(r => r.type === options.type);
    }

    // Filter by timestamp if specified
    if (options.since) {
      const sinceDate = new Date(options.since);
      reviews = reviews.filter(r => new Date(r.timestamp) >= sinceDate);
    }

    // Sort by timestamp (newest first)
    reviews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit if specified
    if (options.limit) {
      reviews = reviews.slice(0, options.limit);
    }

    return reviews;
  }

  /**
   * Get the most recent review of a specific type
   * @param {string} chapterName - Chapter identifier
   * @param {string} reviewType - Review type
   * @returns {Promise<object|null>} - Most recent review or null
   */
  async getLatestReview(chapterName, reviewType) {
    const reviews = await this.getReviewHistory(chapterName, {
      type: reviewType,
      limit: 1
    });
    return reviews.length > 0 ? reviews[0] : null;
  }

  // ==========================================
  // PENDING ACTIONS (Task 2.2)
  // ==========================================

  /**
   * Add a pending action to chapter state
   * @param {string} chapterName - Chapter identifier
   * @param {object} action - Action object {type, description, priority}
   * @returns {Promise<object>} - Updated chapter state
   */
  async addPendingAction(chapterName, action) {
    this._ensureInitialized();

    const state = await this.getChapterState(chapterName);
    if (!state) {
      throw new Error(`Chapter state not found: ${chapterName}`);
    }

    const actionEntry = {
      id: `${chapterName}-action-${Date.now()}`,
      type: action.type || 'general',
      description: action.description,
      priority: action.priority || 'medium',
      createdAt: new Date().toISOString(),
      ...action
    };

    const pendingActions = [...state.pendingActions, actionEntry];

    return await this.updateChapterState(chapterName, { pendingActions });
  }

  /**
   * Complete a pending action
   * @param {string} chapterName - Chapter identifier
   * @param {string} actionId - Action ID to complete
   * @returns {Promise<object>} - Updated chapter state
   */
  async completePendingAction(chapterName, actionId) {
    this._ensureInitialized();

    const state = await this.getChapterState(chapterName);
    if (!state) {
      throw new Error(`Chapter state not found: ${chapterName}`);
    }

    const pendingActions = state.pendingActions.filter(a => a.id !== actionId);

    return await this.updateChapterState(chapterName, { pendingActions });
  }

  /**
   * Remove a pending action without completing it
   * @param {string} chapterName - Chapter identifier
   * @param {string} actionId - Action ID to remove
   * @returns {Promise<object>} - Updated chapter state
   */
  async removePendingAction(chapterName, actionId) {
    // Same as completePendingAction for now
    return await this.completePendingAction(chapterName, actionId);
  }

  /**
   * Get all pending actions for a chapter
   * @param {string} chapterName - Chapter identifier
   * @param {object} options - Filter options {type, priority}
   * @returns {Promise<object[]>} - Array of pending actions
   */
  async getPendingActions(chapterName, options = {}) {
    this._ensureInitialized();

    const state = await this.getChapterState(chapterName);
    if (!state) {
      return [];
    }

    let actions = state.pendingActions || [];

    // Filter by type if specified
    if (options.type) {
      actions = actions.filter(a => a.type === options.type);
    }

    // Filter by priority if specified
    if (options.priority) {
      actions = actions.filter(a => a.priority === options.priority);
    }

    return actions;
  }

  // ==========================================
  // STATE TRANSITIONS (Task 2.3)
  // ==========================================

  /**
   * Transition chapter to a new status
   * Valid transitions:
   * - draft -> ready-for-review
   * - ready-for-review -> in-revision
   * - in-revision -> ready-for-review (after edits)
   * - in-revision -> pending-verification
   * - pending-verification -> ready-for-publication
   * - pending-verification -> in-revision (if issues found)
   *
   * @param {string} chapterName - Chapter identifier
   * @param {string} newStatus - New status
   * @param {object} metadata - Optional metadata for transition
   * @returns {Promise<object>} - Updated chapter state
   */
  async transitionChapterStatus(chapterName, newStatus, metadata = {}) {
    this._ensureInitialized();

    const state = await this.getChapterState(chapterName);
    if (!state) {
      throw new Error(`Chapter state not found: ${chapterName}`);
    }

    const currentStatus = state.status;

    // Validate transition
    const validTransitions = {
      'draft': ['ready-for-review'],
      'ready-for-review': ['in-revision', 'pending-verification'],
      'in-revision': ['ready-for-review', 'pending-verification'],
      'pending-verification': ['ready-for-publication', 'in-revision'],
      'ready-for-publication': ['in-revision'] // Allow going back for further edits
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. ` +
        `Allowed transitions: ${allowedTransitions.join(', ')}`
      );
    }

    // Record transition in state
    const transitions = state.transitions || [];
    const transitionEntry = {
      from: currentStatus,
      to: newStatus,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    transitions.push(transitionEntry);

    return await this.updateChapterState(chapterName, {
      status: newStatus,
      transitions
    });
  }

  /**
   * Mark chapter as ready for review
   * @param {string} chapterName - Chapter identifier
   * @returns {Promise<object>} - Updated chapter state
   */
  async markReadyForReview(chapterName) {
    return await this.transitionChapterStatus(chapterName, 'ready-for-review');
  }

  /**
   * Mark chapter as in revision
   * @param {string} chapterName - Chapter identifier
   * @param {string} reason - Reason for revision
   * @returns {Promise<object>} - Updated chapter state
   */
  async markInRevision(chapterName, reason = '') {
    return await this.transitionChapterStatus(chapterName, 'in-revision', { reason });
  }

  /**
   * Mark chapter as ready for publication
   * @param {string} chapterName - Chapter identifier
   * @returns {Promise<object>} - Updated chapter state
   */
  async markReadyForPublication(chapterName) {
    return await this.transitionChapterStatus(chapterName, 'ready-for-publication');
  }

  // ==========================================
  // QUERY OPERATIONS (Task 2.4)
  // ==========================================

  /**
   * Find chapters by status
   * @param {string} status - Status to filter by
   * @returns {Promise<object[]>} - Array of chapter states
   */
  async findChaptersByStatus(status) {
    this._ensureInitialized();

    const chapters = await this.getAllChapterStates();
    return chapters.filter(ch => ch.status === status);
  }

  /**
   * Find chapters that need review
   * A chapter needs review if:
   * - It's in 'ready-for-review' status, OR
   * - It has never been reviewed, OR
   * - It hasn't been reviewed in the last N days
   *
   * @param {object} options - Options {maxDaysSinceReview}
   * @returns {Promise<object[]>} - Array of chapter states needing review
   */
  async findChaptersNeedingReview(options = {}) {
    this._ensureInitialized();

    const maxDaysSinceReview = options.maxDaysSinceReview || 30;
    const chapters = await this.getAllChapterStates();

    return chapters.filter(ch => {
      // Status is explicitly ready-for-review
      if (ch.status === 'ready-for-review') {
        return true;
      }

      // Never been reviewed
      if (!ch.metrics.lastReviewedAt) {
        return true;
      }

      // Hasn't been reviewed recently
      const lastReview = new Date(ch.metrics.lastReviewedAt);
      const daysSince = (Date.now() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > maxDaysSinceReview) {
        return true;
      }

      return false;
    });
  }

  /**
   * Find chapters by characteristic
   * @param {string} characteristic - Characteristic key (e.g., 'hasRecipes')
   * @param {any} value - Value to match (default: true)
   * @returns {Promise<object[]>} - Array of chapter states
   */
  async findChaptersByCharacteristic(characteristic, value = true) {
    this._ensureInitialized();

    const chapters = await this.getAllChapterStates();
    return chapters.filter(ch => {
      return ch.characteristics && ch.characteristics[characteristic] === value;
    });
  }

  /**
   * Find chapters with pending actions
   * @param {object} options - Filter options {type, priority}
   * @returns {Promise<object[]>} - Array of {chapter, actions} objects
   */
  async findChaptersWithPendingActions(options = {}) {
    this._ensureInitialized();

    const chapters = await this.getAllChapterStates();
    const result = [];

    for (const chapter of chapters) {
      let actions = chapter.pendingActions || [];

      // Filter by type if specified
      if (options.type) {
        actions = actions.filter(a => a.type === options.type);
      }

      // Filter by priority if specified
      if (options.priority) {
        actions = actions.filter(a => a.priority === options.priority);
      }

      if (actions.length > 0) {
        result.push({
          chapter,
          actions
        });
      }
    }

    return result;
  }

  /**
   * Find chapters missing specific review type
   * @param {string} reviewType - Review type to check
   * @returns {Promise<object[]>} - Array of chapter states
   */
  async findChaptersMissingReview(reviewType) {
    this._ensureInitialized();

    const chapters = await this.getAllChapterStates();
    return chapters.filter(ch => {
      const completedReviews = ch.completedReviews || {};
      return !completedReviews[reviewType];
    });
  }

  /**
   * Get chapter statistics
   * @returns {Promise<object>} - Statistics object
   */
  async getChapterStatistics() {
    this._ensureInitialized();

    const chapters = await this.getAllChapterStates();

    return {
      total: chapters.length,
      byStatus: this._calculateStatusBreakdown(chapters),
      totalWords: chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
      totalReviews: chapters.reduce((sum, ch) => sum + (ch.metrics?.totalReviews || 0), 0),
      totalCost: chapters.reduce((sum, ch) => sum + (ch.metrics?.costToDate || 0), 0),
      averageWordCount: Math.round(
        chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0) / chapters.length
      ),
      chaptersWithPendingActions: chapters.filter(ch =>
        (ch.pendingActions || []).length > 0
      ).length,
      chaptersNeverReviewed: chapters.filter(ch =>
        !ch.metrics?.lastReviewedAt
      ).length
    };
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
