# Phase 1: State Infrastructure - Detailed Implementation Plan

**Goal:** Build the foundational state management system that tracks chapters, reviews, and progress.

**Duration:** 3 days (broken into ~15 concrete tasks)

**Architecture:** Custom deterministic shell + LLM tools (hybrid approach)

---

## Day 1: Core State Manager

### Task 1.1: Create Directory Structure
**Time:** 10 minutes

```bash
lib/
├── state/
│   ├── StateManager.js
│   ├── BookConfig.js
│   └── schemas.js
├── content/
│   └── ContentAnalyzer.js
└── utils/
    └── fileUtils.js
```

**Files to create:**
- `lib/state/StateManager.js` - Main state management class
- `lib/state/BookConfig.js` - Book configuration loader
- `lib/state/schemas.js` - JSON schema definitions
- `lib/utils/fileUtils.js` - Atomic file operations
- `lib/content/ContentAnalyzer.js` - Chapter analysis

**Acceptance:** Directory structure exists, empty files created

---

### Task 1.2: Implement Atomic File Operations
**Time:** 30 minutes
**File:** `lib/utils/fileUtils.js`

```javascript
// Functions to implement:
- atomicWrite(filePath, data)     // Write with temp file + rename
- atomicRead(filePath)             // Read with error handling
- ensureDir(dirPath)               // Create directory if missing
- backupFile(filePath)             // Create .backup copy
```

**Test:**
```javascript
// Create test file: test/utils/fileUtils.test.js
- Test atomicWrite creates temp file then renames
- Test atomicWrite handles errors gracefully
- Test atomicRead handles missing files
- Test backupFile creates .backup
```

**Acceptance:** All file operations work, tests pass

---

### Task 1.3: Define JSON Schemas
**Time:** 30 minutes
**File:** `lib/state/schemas.js`

```javascript
// Export schemas for:
- bookConfigSchema      // Book configuration validation
- chapterStateSchema    // Chapter state validation
- projectStateSchema    // Project state validation
- preferencesSchema     // User preferences validation
```

**Test:**
```javascript
// Create test file: test/state/schemas.test.js
- Test each schema validates correct data
- Test each schema rejects invalid data
- Test required fields enforced
- Test enum values enforced
```

**Acceptance:** All schemas defined, validation tests pass

---

### Task 1.4: Implement BookConfig Loader
**Time:** 45 minutes
**File:** `lib/state/BookConfig.js`

```javascript
class BookConfig {
  constructor(configPath = 'manuscript/.state/book-config.json') {}

  load()                    // Load and validate config
  get(key)                  // Get config value
  getContentTypes()         // Get content type flags
  getReviewTypes()          // Get available review types
  getDetectionPatterns()    // Get genre-specific patterns
  getCustomWorkflows()      // Get workflow definitions

  // Static factory
  static createDefault(type, genre) // Create default config for genre
}
```

**Test:**
```javascript
// Create test file: test/state/BookConfig.test.js
- Test load() validates schema
- Test createDefault() creates valid configs for cookbook/fiction/technical
- Test get() returns correct values
- Test getContentTypes() returns content flags
- Test missing file creates default
```

**Acceptance:** BookConfig loads, validates, provides defaults

---

### Task 1.5: Implement StateManager Foundation
**Time:** 90 minutes
**File:** `lib/state/StateManager.js`

```javascript
class StateManager {
  constructor(manuscriptPath = 'manuscript') {
    this.manuscriptPath = manuscriptPath;
    this.statePath = path.join(manuscriptPath, '.state');
    this.bookConfig = new BookConfig(path.join(this.statePath, 'book-config.json'));
  }

  // Initialization
  init()                               // Create .state directory, load book config

  // Chapter state operations
  getChapterState(chapterName)         // Load chapter state
  updateChapterState(chapterName, updates)  // Update chapter state
  getAllChapters()                     // Get all chapter states

  // Project state operations
  getProjectState()                    // Load project state
  updateProjectState(updates)          // Update project state

  // Internal helpers
  _getChapterPath(chapterName)         // Get path to chapter state file
  _loadState(filePath, schema)         // Load and validate state file
  _saveState(filePath, data, schema)   // Validate and save state file
}
```

**Test:**
```javascript
// Create test file: test/state/StateManager.test.js
- Test init() creates .state directory
- Test init() creates default book-config.json if missing
- Test getChapterState() loads existing state
- Test getChapterState() returns null for missing chapter
- Test updateChapterState() updates and saves
- Test getAllChapters() returns all chapter states
```

**Acceptance:** StateManager CRUD operations work, tests pass

---

## Day 2: State Operations & Transitions

### Task 2.1: Implement Review Tracking
**Time:** 60 minutes
**File:** `lib/state/StateManager.js`

```javascript
// Add to StateManager:
addReview(chapterName, reviewData) {
  // 1. Load chapter state
  // 2. Add to reviews array
  // 3. Update completedReviews summary
  // 4. Update metrics (totalReviewsRun, totalCost)
  // 5. Save
}

getReviewHistory(chapterName, reviewType = null) {
  // Return reviews for chapter, optionally filtered by type
}

getLastReview(chapterName, reviewType) {
  // Return most recent review of type
}
```

**Test:**
```javascript
// Add to test/state/StateManager.test.js
- Test addReview() adds to reviews array
- Test addReview() updates completedReviews
- Test addReview() updates metrics
- Test getReviewHistory() returns all reviews
- Test getReviewHistory() filters by type
- Test getLastReview() returns most recent
```

**Acceptance:** Review tracking works, tests pass

---

### Task 2.2: Implement Pending Actions
**Time:** 60 minutes
**File:** `lib/state/StateManager.js`

```javascript
// Add to StateManager:
addPendingAction(chapterName, action) {
  // 1. Generate action ID
  // 2. Add to pendingActions array
  // 3. Update metrics (issuesPending)
  // 4. Save
}

resolvePendingAction(chapterName, actionId) {
  // 1. Find action
  // 2. Mark as resolved
  // 3. Check if any actions unblocked
  // 4. Update metrics (issuesResolved)
  // 5. Save
}

getPendingActions(chapterName) {
  // Return all pending actions for chapter
}

getBlockers() {
  // Return all high-priority pending actions across all chapters
}
```

**Test:**
```javascript
- Test addPendingAction() creates action with ID
- Test addPendingAction() updates metrics
- Test resolvePendingAction() marks resolved
- Test resolvePendingAction() unblocks dependent actions
- Test getPendingActions() returns pending only
- Test getBlockers() returns high-priority across chapters
```

**Acceptance:** Pending actions work, blocking logic works, tests pass

---

### Task 2.3: Implement State Transitions
**Time:** 60 minutes
**File:** `lib/state/StateManager.js`

```javascript
// Add to StateManager:
setChapterStatus(chapterName, newStatus) {
  // 1. Validate transition is legal
  // 2. Update status
  // 3. Update timeInStatus metrics
  // 4. Save
}

canTransition(currentStatus, newStatus) {
  // Check if transition is valid
  // draft -> ready-for-review -> in-revision -> pending-verification -> ready-for-publication
}

getTransitionReason(currentStatus, newStatus) {
  // Return reason for transition
}
```

**Status transition rules:**
```javascript
const TRANSITIONS = {
  'draft': ['ready-for-review'],
  'ready-for-review': ['in-revision', 'draft'],
  'in-revision': ['pending-verification', 'draft'],
  'pending-verification': ['ready-for-publication', 'in-revision'],
  'ready-for-publication': ['in-revision']
};
```

**Test:**
```javascript
- Test setChapterStatus() updates status
- Test setChapterStatus() rejects invalid transitions
- Test setChapterStatus() updates timeInStatus
- Test canTransition() validates correctly
- Test all valid transitions work
- Test all invalid transitions rejected
```

**Acceptance:** State transitions work with validation, tests pass

---

### Task 2.4: Implement Query Operations
**Time:** 60 minutes
**File:** `lib/state/StateManager.js`

```javascript
// Add to StateManager:
getChaptersByStatus(status) {
  // Return chapters with given status
}

getNextChapterToReview() {
  // Smart logic:
  // 1. Chapters with critical blockers
  // 2. Chapters never reviewed
  // 3. Chapters recently modified
  // Return chapter name or null
}

getChaptersNeedingReview(reviewType) {
  // Return chapters that haven't had reviewType or failed it
}

getRecentActivity(hours = 24) {
  // Return chapters modified in last N hours
}

getProjectProgress() {
  // Return summary statistics
}
```

**Test:**
```javascript
- Test getChaptersByStatus() filters correctly
- Test getNextChapterToReview() prioritizes blockers
- Test getNextChapterToReview() prioritizes never-reviewed
- Test getNextChapterToReview() prioritizes recent changes
- Test getChaptersNeedingReview() finds chapters correctly
- Test getRecentActivity() filters by time
- Test getProjectProgress() calculates stats
```

**Acceptance:** All queries work, tests pass

---

## Day 3: Content Detection & Initialization

### Task 3.1: Implement Content Analyzer
**Time:** 90 minutes
**File:** `lib/content/ContentAnalyzer.js`

```javascript
class ContentAnalyzer {
  constructor(bookConfig) {
    this.bookConfig = bookConfig;
  }

  analyzeChapter(filePath) {
    // Returns: {
    //   wordCount,
    //   complexity,
    //   estimatedReadingTime,
    //   headingCount,
    //   sections: [],
    //   detectedTopics: [],
    //   characteristics: {}  // Genre-specific from bookConfig
    // }
  }

  // Genre-specific detection
  detectRecipes(content) { /* ... */ }
  detectDialogue(content) { /* ... */ }
  detectCodeSamples(content) { /* ... */ }
  detectFootnotes(content) { /* ... */ }
  detectHistoricalClaims(content) { /* ... */ }

  // Generic analysis
  calculateComplexity(content) { /* ... */ }
  extractSections(content) { /* ... */ }
  estimateReadingTime(wordCount) { /* ... */ }
  extractTopics(content) { /* ... */ }
}
```

**Detection patterns from book config:**
```javascript
// Use bookConfig.getDetectionPatterns() to get genre-specific patterns
// Example for cookbook:
if (bookConfig.contentTypes.hasRecipes) {
  const patterns = bookConfig.customDetection.recipes.patterns;
  characteristics.hasRecipes = patterns.some(p => content.includes(p));
}
```

**Test:**
```javascript
// Create test file: test/content/ContentAnalyzer.test.js
- Test analyzeChapter() counts words
- Test analyzeChapter() extracts sections
- Test detectRecipes() finds recipe markers (for cookbook config)
- Test detectDialogue() finds quotes (for fiction config)
- Test detectCodeSamples() finds code blocks (for technical config)
- Test calculateComplexity() assigns levels
- Test estimateReadingTime() calculates correctly
```

**Acceptance:** Content analyzer works for multiple genres, tests pass

---

### Task 3.2: Implement State Initialization
**Time:** 60 minutes
**File:** `lib/state/StateManager.js`

```javascript
// Add to StateManager:
async initializeFromManuscript() {
  // 1. Find all chapter markdown files
  // 2. For each chapter:
  //    - Analyze content
  //    - Create initial state if doesn't exist
  //    - Update if exists but file modified
  // 3. Create/update project state
  // 4. Return summary
}

async initializeChapter(chapterFile) {
  // 1. Analyze chapter content
  // 2. Create initial state:
  //    - file path
  //    - lastModified
  //    - wordCount
  //    - status: 'draft'
  //    - version: 1
  //    - characteristics (from analyzer)
  //    - reviews: []
  //    - pendingActions: []
  //    - completedReviews: {}
  //    - metrics: initial
  // 3. Save
}

async syncState() {
  // 1. Check for new chapters
  // 2. Check for modified chapters
  // 3. Update project statistics
}
```

**Test:**
```javascript
- Test initializeFromManuscript() finds all chapters
- Test initializeFromManuscript() creates states
- Test initializeChapter() creates correct initial state
- Test syncState() detects new chapters
- Test syncState() detects modified chapters
- Test syncState() updates project stats
```

**Acceptance:** Can initialize state from existing manuscript, tests pass

---

### Task 3.3: Create Default Book Config for Drain Salad
**Time:** 30 minutes
**File:** `manuscript/.state/book-config.json`

```json
{
  "type": "non-fiction",
  "genre": "cookbook",
  "subgenre": "satire",
  "title": "Drain Salad",
  "targetAudience": "home-cooks",
  "voice": "conversational-satirical",

  "contentTypes": {
    "hasRecipes": true,
    "hasCodeSamples": false,
    "hasDialogue": false,
    "hasTechnicalContent": true,
    "hasFootnotes": false,
    "hasScientificClaims": false,
    "hasHistoricalClaims": true
  },

  "reviewTypes": [
    "comprehensive",
    "tone",
    "structure",
    "recipes",
    "facts",
    "readability",
    "creative"
  ],

  "customDetection": {
    "recipes": {
      "patterns": ["## Recipe:", "### Ingredients", "### Instructions"],
      "requiredFields": ["ingredients", "instructions", "yield"]
    },
    "historicalClaims": {
      "patterns": ["medieval", "century", "ancient", "historical", "traditionally"],
      "requiresCitation": true
    }
  },

  "customWorkflows": {
    "pre-publication": ["comprehensive", "recipes", "facts", "creative"],
    "quick-check": ["tone", "readability"],
    "recipe-focused": ["recipes", "facts"]
  }
}
```

**Acceptance:** Config file created and valid

---

### Task 3.4: Create CLI Command for State Initialization
**Time:** 30 minutes
**File:** `scripts/state-init.js`

```javascript
#!/usr/bin/env node

const StateManager = require('../lib/state/StateManager');

async function main() {
  const sm = new StateManager();

  console.log('Initializing review assistant state...\n');

  // Initialize
  await sm.init();
  console.log('✓ Created .state directory');

  // Initialize from manuscript
  const summary = await sm.initializeFromManuscript();
  console.log(`✓ Analyzed ${summary.chaptersFound} chapters`);
  console.log(`✓ Created ${summary.chaptersInitialized} new chapter states`);
  console.log(`✓ Updated ${summary.chaptersUpdated} existing states`);

  // Show summary
  const project = sm.getProjectState();
  console.log('\nProject Summary:');
  console.log(`  Book: ${project.name} (${project.genre})`);
  console.log(`  Total chapters: ${project.totalChapters}`);
  console.log(`  Total words: ${project.totalWords.toLocaleString()}`);

  console.log('\nState initialization complete!');
}

main().catch(console.error);
```

**Update package.json:**
```json
{
  "scripts": {
    "state:init": "node scripts/state-init.js",
    "state:sync": "node scripts/state-sync.js",
    "state:status": "node scripts/state-status.js"
  }
}
```

**Test manually:**
```bash
npm run state:init
# Should create manuscript/.state/
# Should create book-config.json
# Should create chapter states for all chapters
# Should create project.json
```

**Acceptance:** CLI command works, initializes all state

---

### Task 3.5: Add .state to .gitignore
**Time:** 5 minutes

**Update:** `manuscript/.gitignore` (create if doesn't exist)
```
# Review assistant state (optional - can be committed if desired)
.state/
```

**OR** leave it out of .gitignore if you want to commit state.

**Decision:** For now, gitignore it. Can commit later if useful.

**Acceptance:** .state directory is gitignored

---

## Testing & Validation

### Task 3.6: Create Comprehensive Integration Test
**Time:** 45 minutes
**File:** `test/integration/state-lifecycle.test.js`

```javascript
// Test complete lifecycle:
describe('State Lifecycle Integration', () => {
  test('complete initialization workflow', async () => {
    // 1. Initialize state manager
    // 2. Create book config
    // 3. Initialize from manuscript
    // 4. Verify all chapters have state
    // 5. Add a review
    // 6. Add pending actions
    // 7. Resolve actions
    // 8. Change status
    // 9. Verify state transitions
    // 10. Query operations work
  });

  test('handles missing files gracefully', async () => {
    // Test error handling
  });

  test('handles corrupted state gracefully', async () => {
    // Test recovery
  });
});
```

**Acceptance:** Integration tests pass

---

## Deliverables Checklist

**Files Created:**
- [ ] `lib/state/StateManager.js` - Complete
- [ ] `lib/state/BookConfig.js` - Complete
- [ ] `lib/state/schemas.js` - Complete
- [ ] `lib/utils/fileUtils.js` - Complete
- [ ] `lib/content/ContentAnalyzer.js` - Complete
- [ ] `scripts/state-init.js` - Complete
- [ ] `manuscript/.state/book-config.json` - Created
- [ ] `test/` directory with all tests

**Functionality Working:**
- [ ] Atomic file operations
- [ ] Schema validation
- [ ] Book config loading
- [ ] Chapter state CRUD
- [ ] Review tracking
- [ ] Pending actions with blocking
- [ ] State transitions with validation
- [ ] Query operations
- [ ] Content analysis (genre-aware)
- [ ] State initialization from manuscript
- [ ] CLI commands work

**Tests:**
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing: `npm run state:init` works
- [ ] Can query state programmatically

---

## Success Criteria

Phase 1 is complete when:

1. ✅ Can run `npm run state:init` and it creates all state from manuscript
2. ✅ All state files are valid JSON matching schemas
3. ✅ Can programmatically query chapter states
4. ✅ State transitions enforce valid lifecycle
5. ✅ Content analyzer correctly detects genre-specific characteristics
6. ✅ All tests pass
7. ✅ Code is clean, commented, and follows existing patterns

---

## Next: Phase 2 Preview

After Phase 1, we'll build the conversational CLI interface that:
- Uses StateManager to make smart suggestions
- Implements the UX from REVIEW-ASSISTANT-UX-PROPOSALS.md
- Integrates with existing review scripts
- Provides progressive disclosure

But first: let's nail the state foundation! 🚀
