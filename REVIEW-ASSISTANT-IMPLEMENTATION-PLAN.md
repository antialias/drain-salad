# Conversational Review Assistant: Complete Implementation Plan

**Transform the editorial review system from command-line scripts into an intelligent, conversational assistant that guides authors through AI-assisted book writing and review.**

---

## Overview

### Vision
One command (`npm run review`) that:
- Reads current state automatically
- Analyzes what chapter you're working on
- Understands context from history and book genre
- Asks clarifying questions only when needed
- Provides genre-appropriate smart suggestions
- Shows clear progress
- Learns your patterns

### Core Principle
**Guide users into a pit of success** - authors should write, not memorize commands or manage complex workflows.

### Platform Scope
An AI-assisted ghostwriting platform for any book genre:
- Fiction (novels, short stories, satire, sci-fi, romance, etc.)
- Non-fiction (memoir, self-help, business, history, etc.)
- Technical (cookbooks, how-to guides, textbooks, etc.)
- Academic (research, thesis, monographs, etc.)

**Genre-specific features are configured, not hardcoded.**

---

## Implementation Timeline

| Phase | Days | Focus | Key Deliverable |
|-------|------|-------|----------------|
| **1** | 1-3 | State Infrastructure | State tracking working |
| **2** | 4-7 | Conversational Interface | `npm run review` works |
| **3** | 8-10 | Advanced Features | Batch, workflows, edits |
| **4** | 11-12 | Intelligence & Polish | Learning, polish, docs |

**Total: ~12 days for complete implementation**

---

## Phase 1: State Infrastructure & Foundation

**Timeline:** Days 1-3
**Goal:** Create state management system and integrate with existing review scripts

### Task 1.1: State Directory Structure

**File:** `scripts/state-init.js`

**Purpose:** Initialize state directory and create initial state files

**Implementation:**
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Creates:
// manuscript/.state/
// manuscript/.state/chapters/
// manuscript/.state/project.json
// manuscript/.state/book-config.json
// manuscript/.state/preferences.json
// manuscript/.state/workflow.json

class StateInitializer {
  constructor() {
    this.stateDir = path.join(__dirname, '..', 'manuscript', '.state');
    this.chaptersDir = path.join(this.stateDir, 'chapters');
    this.manuscriptDir = path.join(__dirname, '..', 'manuscript');
  }

  async init() {
    console.log('Initializing state directory...');

    // Create directories
    this.createDirectories();

    // Scan for chapters
    const chapters = this.scanChapters();

    // Load or create book configuration
    const bookConfig = this.loadOrCreateBookConfig();

    // Create state for each chapter
    for (const chapter of chapters) {
      await this.createChapterState(chapter, bookConfig);
    }

    // Create project state
    this.createProjectState(chapters, bookConfig);

    // Create preferences
    this.createPreferences();

    // Create workflow state
    this.createWorkflowState();

    console.log(`✓ Initialized state for ${chapters.length} chapters`);
    console.log(`✓ Book type: ${bookConfig.type} - ${bookConfig.genre}`);
  }

  createDirectories() {
    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }
    if (!fs.existsSync(this.chaptersDir)) {
      fs.mkdirSync(this.chaptersDir, { recursive: true });
    }
  }

  loadOrCreateBookConfig() {
    const configPath = path.join(this.stateDir, 'book-config.json');

    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    // Create default configuration
    const config = {
      type: 'non-fiction',
      genre: 'cookbook',
      subgenre: 'satire',
      title: 'Untitled Book',
      targetAudience: 'general',
      voice: 'conversational',
      contentTypes: {
        hasRecipes: true,
        hasCodeSamples: false,
        hasDialogue: false,
        hasFootnotes: false,
        hasTechnicalContent: true
      },
      reviewTypes: [
        'comprehensive',
        'tone',
        'structure',
        'facts',
        'readability',
        'creative',
        'recipes'  // genre-specific
      ],
      customDetection: {
        // Genre-specific content detection patterns
        recipes: {
          patterns: ['## Recipe:', '### Ingredients', '### Instructions'],
          required: ['ingredients', 'instructions']
        }
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('  ✓ Created book-config.json (edit to customize for your book)');
    return config;
  }

  scanChapters() {
    const files = fs.readdirSync(this.manuscriptDir);
    return files
      .filter(f => f.startsWith('chapter-') && f.endsWith('.md'))
      .map(f => ({
        file: path.join(this.manuscriptDir, f),
        name: f.replace('.md', '')
      }));
  }

  async createChapterState(chapter, bookConfig) {
    const statePath = path.join(this.chaptersDir, `${chapter.name}.json`);

    if (fs.existsSync(statePath)) {
      console.log(`  Skipping ${chapter.name} (already exists)`);
      return;
    }

    const content = fs.readFileSync(chapter.file, 'utf8');
    const wordCount = content.split(/\s+/).length;

    // Detect content based on book configuration
    const characteristics = this.detectCharacteristics(content, bookConfig);

    const state = {
      file: `manuscript/${path.basename(chapter.file)}`,
      lastModified: fs.statSync(chapter.file).mtime.toISOString(),
      wordCount,
      status: 'draft',
      characteristics,
      reviews: [],
      pendingActions: [],
      readyForPublication: false
    };

    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    console.log(`  ✓ Created state for ${chapter.name}`);
  }

  detectCharacteristics(content, bookConfig) {
    const characteristics = {
      complexity: this.detectComplexity(content),
      estimatedReadingTime: Math.ceil(content.split(/\s+/).length / 200)
    };

    // Add genre-specific detections
    if (bookConfig.contentTypes.hasRecipes && bookConfig.customDetection.recipes) {
      const patterns = bookConfig.customDetection.recipes.patterns;
      characteristics.hasRecipes = patterns.some(p => content.includes(p));
    }

    if (bookConfig.contentTypes.hasCodeSamples) {
      characteristics.hasCodeSamples = /```[\s\S]*?```/.test(content);
    }

    if (bookConfig.contentTypes.hasDialogue) {
      characteristics.hasDialogue = /"[^"]{20,}"/.test(content);
    }

    return characteristics;
  }

  detectComplexity(content) {
    const wordCount = content.split(/\s+/).length;
    return wordCount > 4000 ? 'complex' : wordCount > 2500 ? 'medium' : 'simple';
  }

  createProjectState(chapters, bookConfig) {
    const projectPath = path.join(this.stateDir, 'project.json');

    if (fs.existsSync(projectPath)) {
      console.log('  Skipping project.json (already exists)');
      return;
    }

    const state = {
      title: bookConfig.title,
      type: bookConfig.type,
      genre: bookConfig.genre,
      chapters: chapters.map(c => ({
        name: c.name,
        status: 'draft',
        blockers: 0
      })),
      lastSession: new Date().toISOString()
    };

    fs.writeFileSync(projectPath, JSON.stringify(state, null, 2));
    console.log('  ✓ Created project.json');
  }

  createPreferences() {
    const prefsPath = path.join(this.stateDir, 'preferences.json');

    if (fs.existsSync(prefsPath)) {
      console.log('  Skipping preferences.json (already exists)');
      return;
    }

    const prefs = {
      defaultModel: 'o1-mini',
      verbosity: 'detailed',
      autoSuggest: true
    };

    fs.writeFileSync(prefsPath, JSON.stringify(prefs, null, 2));
    console.log('  ✓ Created preferences.json');
  }

  createWorkflowState() {
    const workflowPath = path.join(this.stateDir, 'workflow.json');

    if (fs.existsSync(workflowPath)) {
      console.log('  Skipping workflow.json (already exists)');
      return;
    }

    const workflow = {
      activeWorkflow: null,
      workflowSteps: []
    };

    fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));
    console.log('  ✓ Created workflow.json');
  }
}

if (require.main === module) {
  const initializer = new StateInitializer();
  initializer.init().catch(console.error);
}

module.exports = StateInitializer;
```

**Acceptance Criteria:**
- ✓ Creates `.state/` directory structure
- ✓ Creates or loads book configuration
- ✓ Generates state files for all existing chapters
- ✓ Detects content based on book type
- ✓ Handles missing chapters gracefully
- ✓ Can be run multiple times safely (idempotent)

**Testing:**
```bash
npm run state:init
# Verify directory created
# Verify book-config.json created
# Verify all chapters have state files
# Verify project.json reflects book type
```

---

### Task 1.2: State Manager Library

**File:** `scripts/lib/state-manager.js`

**Purpose:** CRUD operations for state files

**API:**
```javascript
class StateManager {
  // Chapter operations
  getChapterState(chapterName)
  updateChapterState(chapterName, updates)
  addReview(chapterName, reviewData)
  addPendingAction(chapterName, action)
  resolvePendingAction(chapterName, actionId)

  // Project operations
  getProjectState()
  updateProjectState(updates)

  // Book configuration
  getBookConfig()
  updateBookConfig(updates)

  // Preferences
  getPreferences()
  updatePreferences(updates)

  // Workflow
  getWorkflow()
  updateWorkflow(updates)

  // Queries
  getChaptersByStatus(status)
  getAllChapters()
  getNextChapterToReview()
  getBlockers()
  getAvailableReviewTypes() // Based on book config
}
```

**Implementation Details:**
- Uses `fs` for file operations
- JSON parsing with error handling
- Atomic writes (write to temp file, then rename)
- Schema validation for state objects
- Default values for missing fields
- Genre-aware queries

**Acceptance Criteria:**
- ✓ All CRUD operations work correctly
- ✓ Handles missing files gracefully
- ✓ Validates state schema
- ✓ Atomic writes prevent corruption
- ✓ Query methods return correct results
- ✓ Respects book configuration

---

### Task 1.3: Chapter Analyzer

**File:** `scripts/lib/chapter-analyzer.js`

**Purpose:** Extract characteristics from chapter markdown files based on book type

**API:**
```javascript
class ChapterAnalyzer {
  constructor(bookConfig) {
    this.bookConfig = bookConfig;
  }

  analyze(chapterPath) {
    return {
      wordCount: number,
      complexity: 'simple' | 'medium' | 'complex',
      estimatedReadingTime: number,
      detectedTopics: string[],
      headingCount: number,
      sections: string[],
      // Genre-specific detections
      ...this.detectGenreSpecific(content)
    }
  }

  detectGenreSpecific(content) {
    // Dynamic detection based on book configuration
    // Examples:
    // - Cookbooks: hasRecipes, recipeCount
    // - Technical: hasCodeSamples, codeLanguages
    // - Fiction: hasDialogue, characterCount
    // - Academic: hasFootnotes, citationCount
  }
}
```

**Detection Patterns (Configurable):**

**For Cookbooks:**
- hasRecipes: Looks for recipe patterns (ingredients list, instructions)
- hasHistoricalClaims: Keywords like "traditionally", dates
- hasTechnicalContent: Temperature mentions, measurements, techniques

**For Fiction:**
- hasDialogue: Dialogue patterns
- characterIntroductions: New character mentions
- sceneTransitions: Scene breaks and transitions

**For Technical:**
- hasCodeSamples: Code blocks
- hasExamples: Example sections
- hasDiagrams: Image/diagram references

**For Academic:**
- hasFootnotes: Footnote markers
- hasCitations: Citation patterns
- hasEquations: Math equations

**Acceptance Criteria:**
- ✓ Detects content based on book configuration
- ✓ Accurately identifies genre-specific elements
- ✓ Calculates complexity correctly
- ✓ Extracts meaningful topics
- ✓ Fast (< 100ms per chapter)
- ✓ Extensible for new genres

---

### Task 1.4: Update Existing Review Scripts

**Files:** `scripts/review-chapter.sh`, `scripts/review-pro.js`

**Purpose:** Integrate state updates after each review

**Changes:**
- Load book configuration to customize review prompts
- Update system prompts based on book type
- Track genre-specific review types

**Example system prompt customization:**
```javascript
function getSystemPrompt(reviewType, bookConfig) {
  const basePrompts = {
    comprehensive: `You are an experienced ${bookConfig.type} editor reviewing a ${bookConfig.genre} book...`,
    tone: `Review this ${bookConfig.genre} chapter for voice consistency...`,
    // ... etc
  };

  // Add genre-specific review types
  if (reviewType === 'recipes' && bookConfig.genre === 'cookbook') {
    return `You are a recipe editor. Review all recipes for clarity, measurements, timing, and food safety...`;
  }

  if (reviewType === 'code' && bookConfig.contentTypes.hasCodeSamples) {
    return `You are a technical editor. Review all code samples for correctness, clarity, and best practices...`;
  }

  return basePrompts[reviewType];
}
```

**Acceptance Criteria:**
- ✓ Existing scripts continue to work
- ✓ State updated after each review
- ✓ Review prompts customized to book type
- ✓ Genre-specific reviews available when configured
- ✓ No breaking changes to existing workflows

---

### Phase 1 Deliverables

- ✅ State directory structure created
- ✅ Book configuration system
- ✅ StateManager library with full API
- ✅ ChapterAnalyzer detects based on book type
- ✅ Existing review scripts genre-aware
- ✅ State validation tool
- ✅ All existing functionality preserved

---

## Phase 2: Conversational Interface Core

**Timeline:** Days 4-7
**Goal:** Build the main `npm run review` command with genre-aware smart suggestions

### Genre-Aware Context Detection

The conversational interface adapts to book type:

**For Cookbooks:**
- Suggests recipe reviews for chapters with recipes
- Checks for food safety issues
- Validates measurements and temperatures

**For Fiction:**
- Suggests character consistency checks
- Checks dialogue authenticity
- Validates scene transitions

**For Technical:**
- Suggests code review for chapters with samples
- Checks technical accuracy
- Validates examples

**For Academic:**
- Suggests citation verification
- Checks argument structure
- Validates references

All suggestions are driven by `book-config.json`, not hardcoded.

---

## Phase 3: Advanced Features & Workflows

**Timeline:** Days 8-10
**Goal:** Batch processing, genre-specific workflows, edit suggestions

### Genre-Specific Workflow Templates

**File:** `scripts/lib/workflow-templates.js`

**Templates** are loaded from book configuration:

```javascript
// For cookbooks
{
  'cookbook-pre-publication': {
    steps: [
      { action: 'review', type: 'comprehensive' },
      { action: 'review', type: 'recipes' },
      { action: 'review', type: 'facts' },
      { action: 'review', type: 'creative' }
    ]
  }
}

// For fiction
{
  'fiction-pre-publication': {
    steps: [
      { action: 'review', type: 'comprehensive' },
      { action: 'review', type: 'character-consistency' },
      { action: 'review', type: 'dialogue' },
      { action: 'review', type: 'pacing' }
    ]
  }
}

// For technical
{
  'technical-pre-publication': {
    steps: [
      { action: 'review', type: 'comprehensive' },
      { action: 'review', type: 'code' },
      { action: 'review', type: 'examples' },
      { action: 'review', type: 'technical-accuracy' }
    ]
  }
}
```

Workflows are defined in `book-config.json` under `customWorkflows`.

---

## Phase 4: Intelligence & Polish

**Timeline:** Days 11-12
**Goal:** Learning, optimization, genre-aware suggestions

### Pattern Learning (Genre-Aware)

```javascript
class PatternLearner {
  analyzePatterns(bookConfig) {
    // Learn patterns specific to this book type
    // Example for cookbooks: "Recipes typically need 2 iterations"
    // Example for fiction: "Dialogue chapters need extra tone review"
    // Example for technical: "Code samples often have formatting issues"
  }
}
```

---

## Complete File Structure

```
book-platform/                      # Generic book writing platform
├── manuscript/
│   ├── chapter-*.md
│   └── .state/                    # NEW
│       ├── book-config.json       # NEW - Book type & genre configuration
│       ├── chapters/
│       │   ├── chapter-01.json
│       │   └── ...
│       ├── project.json
│       ├── preferences.json
│       ├── workflow.json
│       └── session.json
│
├── scripts/
│   ├── review-assistant.js        # NEW - Genre-aware main entry
│   ├── state-init.js              # NEW - Detects/creates book config
│   ├── validate-state.js          # NEW
│   │
│   ├── lib/
│   │   ├── state-manager.js       # NEW - Genre-aware state management
│   │   ├── chapter-analyzer.js    # NEW - Configurable content detection
│   │   ├── conversational-ui.js   # NEW
│   │   ├── context-detector.js    # NEW - Genre-aware suggestions
│   │   ├── command-parser.js      # NEW
│   │   ├── action-executor.js     # NEW
│   │   ├── batch-processor.js     # NEW
│   │   ├── workflow-templates.js  # NEW - Genre-specific workflows
│   │   ├── workflow-executor.js   # NEW
│   │   ├── review-parser.js       # NEW
│   │   ├── edit-suggester.js      # NEW
│   │   ├── session-manager.js     # NEW
│   │   ├── pattern-learner.js     # NEW - Genre-aware learning
│   │   ├── cost-tracker.js        # NEW
│   │   ├── creative-consultant.js # NEW
│   │   ├── error-handler.js       # NEW
│   │   ├── help-system.js         # NEW - Genre-aware help
│   │   └── update-review-state.js # NEW
│   │
│   ├── review-chapter.sh          # MODIFIED - Genre-aware prompts
│   └── review-pro.js              # MODIFIED - Genre-aware prompts
│
└── package.json                   # MODIFIED
```

---

## Book Configuration (`book-config.json`)

**Example for Cookbook:**
```json
{
  "type": "non-fiction",
  "genre": "cookbook",
  "subgenre": "satire",
  "title": "Drain Salad",
  "targetAudience": "home cooks interested in sustainability",
  "voice": "serious chef with philosophical wit",
  "contentTypes": {
    "hasRecipes": true,
    "hasCodeSamples": false,
    "hasDialogue": false,
    "hasTechnicalContent": true
  },
  "reviewTypes": [
    "comprehensive",
    "tone",
    "structure",
    "facts",
    "readability",
    "creative",
    "recipes"
  ],
  "customDetection": {
    "recipes": {
      "patterns": ["## Recipe:", "### Ingredients", "### Instructions"]
    }
  },
  "customWorkflows": {
    "pre-publication": ["comprehensive", "recipes", "facts", "creative"]
  }
}
```

**Example for Fiction (Novel):**
```json
{
  "type": "fiction",
  "genre": "literary-fiction",
  "subgenre": "coming-of-age",
  "title": "The Summer Before",
  "targetAudience": "adult literary fiction readers",
  "voice": "lyrical, introspective, first-person",
  "contentTypes": {
    "hasRecipes": false,
    "hasCodeSamples": false,
    "hasDialogue": true,
    "hasTechnicalContent": false
  },
  "reviewTypes": [
    "comprehensive",
    "tone",
    "structure",
    "dialogue",
    "character-consistency",
    "pacing",
    "creative"
  ],
  "customDetection": {
    "dialogue": {
      "patterns": ["\"", "'"]
    },
    "characters": {
      "trackNames": true
    }
  },
  "customWorkflows": {
    "pre-publication": ["comprehensive", "character-consistency", "dialogue", "pacing", "creative"]
  }
}
```

**Example for Technical (Programming Book):**
```json
{
  "type": "technical",
  "genre": "programming",
  "subgenre": "tutorial",
  "title": "Mastering TypeScript",
  "targetAudience": "intermediate JavaScript developers",
  "voice": "clear, instructional, encouraging",
  "contentTypes": {
    "hasRecipes": false,
    "hasCodeSamples": true,
    "hasDialogue": false,
    "hasTechnicalContent": true
  },
  "reviewTypes": [
    "comprehensive",
    "tone",
    "structure",
    "code",
    "technical-accuracy",
    "examples",
    "readability"
  ],
  "customDetection": {
    "code": {
      "patterns": ["```typescript", "```javascript", "```"],
      "languages": ["typescript", "javascript"]
    }
  },
  "customWorkflows": {
    "pre-publication": ["comprehensive", "code", "technical-accuracy", "examples"]
  }
}
```

---

## Success Metrics

### Quantitative
- ✓ Time to complete review workflow reduced by 50%
- ✓ Commands needed reduced from ~10 to ~3
- ✓ 90% of users accept smart suggestions
- ✓ Zero breaking changes
- ✓ < 100ms response time for UI
- ✓ Works for any book genre with proper configuration

### Qualitative
- ✓ Users describe as "natural" and "helpful" across genres
- ✓ Don't need to reference documentation
- ✓ Feel guided, not constrained
- ✓ Understand what's happening
- ✓ Confident in results
- ✓ Genre-specific features feel native, not tacked-on

---

**This implementation plan provides a complete roadmap for a genre-agnostic AI-assisted ghostwriting platform with configuration-driven specialization.**
