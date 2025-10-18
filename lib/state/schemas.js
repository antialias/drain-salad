/**
 * JSON Schema definitions and validation for state files
 *
 * Uses simple validation functions for clarity and no dependencies
 */

const VALID_BOOK_TYPES = ['fiction', 'non-fiction', 'technical', 'academic'];
const VALID_CHAPTER_STATUSES = [
  'draft',
  'ready-for-review',
  'in-revision',
  'pending-verification',
  'ready-for-publication'
];
const VALID_REVIEW_TYPES = [
  'comprehensive',
  'tone',
  'structure',
  'recipes',
  'facts',
  'readability',
  'creative',
  'dialogue',
  'character-consistency',
  'pacing',
  'code',
  'technical-accuracy',
  'examples',
  'citations',
  'footnotes',
  'argument'
];

/**
 * Validate book configuration
 */
function validateBookConfig(config) {
  const errors = [];

  if (!config.type || !VALID_BOOK_TYPES.includes(config.type)) {
    errors.push(`Invalid type: ${config.type}. Must be one of: ${VALID_BOOK_TYPES.join(', ')}`);
  }

  if (!config.genre || typeof config.genre !== 'string') {
    errors.push('Missing or invalid genre');
  }

  if (!config.title || typeof config.title !== 'string') {
    errors.push('Missing or invalid title');
  }

  if (!config.contentTypes || typeof config.contentTypes !== 'object') {
    errors.push('Missing or invalid contentTypes object');
  }

  if (!Array.isArray(config.reviewTypes) || config.reviewTypes.length === 0) {
    errors.push('Missing or invalid reviewTypes array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate chapter state
 */
function validateChapterState(state) {
  const errors = [];

  if (!state.file || typeof state.file !== 'string') {
    errors.push('Missing or invalid file path');
  }

  if (!state.status || !VALID_CHAPTER_STATUSES.includes(state.status)) {
    errors.push(`Invalid status: ${state.status}. Must be one of: ${VALID_CHAPTER_STATUSES.join(', ')}`);
  }

  if (typeof state.wordCount !== 'number' || state.wordCount < 0) {
    errors.push('Invalid wordCount: must be non-negative number');
  }

  if (!Array.isArray(state.reviews)) {
    errors.push('reviews must be an array');
  }

  if (!Array.isArray(state.pendingActions)) {
    errors.push('pendingActions must be an array');
  }

  if (!state.completedReviews || typeof state.completedReviews !== 'object') {
    errors.push('completedReviews must be an object');
  }

  if (!state.metrics || typeof state.metrics !== 'object') {
    errors.push('metrics must be an object');
  }

  if (!state.characteristics || typeof state.characteristics !== 'object') {
    errors.push('characteristics must be an object');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate project state
 */
function validateProjectState(state) {
  const errors = [];

  if (!state.name || typeof state.name !== 'string') {
    errors.push('Missing or invalid name');
  }

  if (!state.type || !VALID_BOOK_TYPES.includes(state.type)) {
    errors.push(`Invalid type: ${state.type}`);
  }

  if (!state.genre || typeof state.genre !== 'string') {
    errors.push('Missing or invalid genre');
  }

  if (typeof state.totalChapters !== 'number' || state.totalChapters < 0) {
    errors.push('Invalid totalChapters');
  }

  if (typeof state.totalWords !== 'number' || state.totalWords < 0) {
    errors.push('Invalid totalWords');
  }

  if (!Array.isArray(state.chapters)) {
    errors.push('chapters must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate preferences
 */
function validatePreferences(prefs) {
  const errors = [];

  if (prefs.defaultModel && typeof prefs.defaultModel !== 'string') {
    errors.push('defaultModel must be a string');
  }

  if (prefs.autoSuggest !== undefined && typeof prefs.autoSuggest !== 'boolean') {
    errors.push('autoSuggest must be a boolean');
  }

  if (prefs.costLimit !== undefined && (typeof prefs.costLimit !== 'number' || prefs.costLimit < 0)) {
    errors.push('costLimit must be a non-negative number');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create default book config for a given type/genre
 */
function createDefaultBookConfig(type = 'non-fiction', genre = 'cookbook') {
  const defaults = {
    'non-fiction': {
      cookbook: {
        contentTypes: {
          hasRecipes: true,
          hasCodeSamples: false,
          hasDialogue: false,
          hasTechnicalContent: true,
          hasFootnotes: false,
          hasScientificClaims: false,
          hasHistoricalClaims: true
        },
        reviewTypes: ['comprehensive', 'tone', 'structure', 'recipes', 'facts', 'readability', 'creative'],
        customDetection: {
          recipes: {
            patterns: ['## Recipe:', '### Ingredients', '### Instructions']
          },
          historicalClaims: {
            patterns: ['medieval', 'century', 'ancient', 'historical', 'traditionally']
          }
        },
        customWorkflows: {
          'pre-publication': ['comprehensive', 'recipes', 'facts', 'creative'],
          'quick-check': ['tone', 'readability'],
          'recipe-focused': ['recipes', 'facts']
        }
      }
    },
    fiction: {
      novel: {
        contentTypes: {
          hasRecipes: false,
          hasCodeSamples: false,
          hasDialogue: true,
          hasTechnicalContent: false,
          hasFootnotes: false,
          hasScientificClaims: false,
          hasHistoricalClaims: false
        },
        reviewTypes: ['comprehensive', 'tone', 'structure', 'dialogue', 'character-consistency', 'pacing', 'creative'],
        customDetection: {
          dialogue: {
            patterns: ['"', '"', '"']
          }
        },
        customWorkflows: {
          'pre-publication': ['comprehensive', 'dialogue', 'character-consistency', 'pacing', 'creative'],
          'quick-check': ['tone', 'dialogue'],
          'deep-edit': ['comprehensive', 'creative', 'character-consistency']
        }
      }
    },
    technical: {
      programming: {
        contentTypes: {
          hasRecipes: false,
          hasCodeSamples: true,
          hasDialogue: false,
          hasTechnicalContent: true,
          hasFootnotes: false,
          hasScientificClaims: false,
          hasHistoricalClaims: false
        },
        reviewTypes: ['comprehensive', 'tone', 'structure', 'code', 'technical-accuracy', 'examples', 'readability'],
        customDetection: {
          code: {
            patterns: ['```']
          }
        },
        customWorkflows: {
          'pre-publication': ['comprehensive', 'code', 'technical-accuracy', 'examples'],
          'quick-check': ['code', 'examples'],
          'deep-edit': ['comprehensive', 'technical-accuracy', 'readability']
        }
      }
    }
  };

  const typeDefaults = defaults[type] || defaults['non-fiction'];
  const genreDefaults = typeDefaults[genre] || typeDefaults.cookbook || typeDefaults.novel || typeDefaults.programming;

  return {
    type,
    genre,
    subgenre: '',
    title: 'Untitled Book',
    targetAudience: 'general',
    voice: 'conversational',
    ...genreDefaults
  };
}

module.exports = {
  VALID_BOOK_TYPES,
  VALID_CHAPTER_STATUSES,
  VALID_REVIEW_TYPES,
  validateBookConfig,
  validateChapterState,
  validateProjectState,
  validatePreferences,
  createDefaultBookConfig
};
