# Conversational Review Assistant: Complete Implementation Plan

**Transform the editorial review system from command-line scripts into an intelligent, conversational assistant that guides authors through the review process naturally.**

---

## Overview

### Vision
One command (`npm run review`) that:
- Reads current state automatically
- Analyzes what chapter you're working on
- Understands context from history
- Asks clarifying questions only when needed
- Provides smart suggestions
- Shows clear progress
- Learns your patterns

### Core Principle
**Guide users into a pit of success** - authors should write, not memorize commands or manage complex workflows.

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
// manuscript/.state/preferences.json
// manuscript/.state/workflow.json

// Scans manuscript/ for all chapter files
// Creates initial state for each chapter
// Detects basic characteristics (word count, has recipes, etc.)

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

    // Create state for each chapter
    for (const chapter of chapters) {
      await this.createChapterState(chapter);
    }

    // Create project state
    this.createProjectState(chapters);

    // Create preferences
    this.createPreferences();

    // Create workflow state
    this.createWorkflowState();

    console.log(`✓ Initialized state for ${chapters.length} chapters`);
  }

  createDirectories() {
    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }
    if (!fs.existsSync(this.chaptersDir)) {
      fs.mkdirSync(this.chaptersDir, { recursive: true });
    }
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

  async createChapterState(chapter) {
    const statePath = path.join(this.chaptersDir, `${chapter.name}.json`);

    // Skip if already exists
    if (fs.existsSync(statePath)) {
      console.log(`  Skipping ${chapter.name} (already exists)`);
      return;
    }

    const content = fs.readFileSync(chapter.file, 'utf8');
    const wordCount = content.split(/\s+/).length;

    const state = {
      file: `manuscript/${path.basename(chapter.file)}`,
      lastModified: fs.statSync(chapter.file).mtime.toISOString(),
      wordCount,
      status: 'draft',
      characteristics: {
        hasRecipes: content.includes('## Recipe:') || content.includes('### Ingredients'),
        hasHistoricalClaims: /medieval|historical|century|era/i.test(content),
        hasTechnicalContent: /temperature|°F|°C|ferment/i.test(content),
        complexity: wordCount > 4000 ? 'complex' : wordCount > 2500 ? 'medium' : 'simple'
      },
      reviews: [],
      pendingActions: [],
      readyForPublication: false
    };

    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    console.log(`  ✓ Created state for ${chapter.name}`);
  }

  createProjectState(chapters) {
    const projectPath = path.join(this.stateDir, 'project.json');

    if (fs.existsSync(projectPath)) {
      console.log('  Skipping project.json (already exists)');
      return;
    }

    const state = {
      name: 'Drain Salad',
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
- ✓ Generates state files for all existing chapters
- ✓ Handles missing chapters gracefully
- ✓ Can be run multiple times safely (idempotent)

**Testing:**
```bash
npm run state:init
# Verify directory created
# Verify all chapters have state files
# Verify project.json exists
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
}
```

**Implementation Details:**
- Uses `fs` for file operations
- JSON parsing with error handling
- Atomic writes (write to temp file, then rename)
- Schema validation for state objects
- Default values for missing fields

**Acceptance Criteria:**
- ✓ All CRUD operations work correctly
- ✓ Handles missing files gracefully
- ✓ Validates state schema
- ✓ Atomic writes prevent corruption
- ✓ Query methods return correct results

---

### Task 1.3: Chapter Analyzer

**File:** `scripts/lib/chapter-analyzer.js`

**Purpose:** Extract characteristics from chapter markdown files

**API:**
```javascript
class ChapterAnalyzer {
  analyze(chapterPath) {
    return {
      wordCount: number,
      hasRecipes: boolean,
      recipeCount: number,
      hasHistoricalClaims: boolean,
      hasTechnicalContent: boolean,
      hasScientificClaims: boolean,
      complexity: 'simple' | 'medium' | 'complex',
      estimatedReadingTime: number,
      detectedTopics: string[],
      headingCount: number,
      sections: string[]
    }
  }
}
```

**Detection Logic:**
- **hasRecipes**: Looks for recipe patterns (ingredients list, instructions)
- **hasHistoricalClaims**: Keywords like "medieval", dates, "historically"
- **hasTechnicalContent**: Temperature mentions, measurements, techniques
- **hasScientificClaims**: "Maillard", "fermentation", chemical terms
- **complexity**: Based on word count, sentence length, jargon density
- **detectedTopics**: Extract from headings and frequent terms

**Acceptance Criteria:**
- ✓ Accurately detects recipes
- ✓ Identifies historical content
- ✓ Calculates complexity correctly
- ✓ Extracts meaningful topics
- ✓ Fast (< 100ms per chapter)

---

### Task 1.4: Update Existing Review Scripts

**Files:** `scripts/review-chapter.sh`, `scripts/review-pro.js`

**Purpose:** Integrate state updates after each review

**Changes to `review-chapter.sh`:**
```bash
# After successful review, call state updater
node scripts/lib/update-review-state.js \
  "$CHAPTER_FILE" \
  "$REVIEW_TYPE" \
  "$MODEL" \
  "$OUTPUT_FILE"
```

**New File:** `scripts/lib/update-review-state.js`
- Called by bash script to update state
- Parses review output for issues (basic regex)
- Updates chapter state with review data

**Acceptance Criteria:**
- ✓ Existing scripts continue to work
- ✓ State updated after each review
- ✓ Review history tracked correctly
- ✓ No breaking changes to existing workflows

---

### Task 1.5: State Validation & Migration

**File:** `scripts/validate-state.js`

**Purpose:** Validate state files and repair issues

**Features:**
- Schema validation
- Detect orphaned state files
- Detect chapters without state
- Repair corrupted state
- Migrate from old formats (future-proofing)

**Acceptance Criteria:**
- ✓ Validates all state files
- ✓ Reports errors clearly
- ✓ Can repair common issues
- ✓ Safe to run anytime

---

### Phase 1 Deliverables

- ✅ State directory structure created
- ✅ StateManager library with full API
- ✅ ChapterAnalyzer extracts characteristics
- ✅ Existing review scripts update state
- ✅ State validation tool
- ✅ All existing functionality preserved

---

## Phase 2: Conversational Interface Core

**Timeline:** Days 4-7
**Goal:** Build the main `npm run review` command with smart suggestions

### Task 2.1: Review Assistant Main Entry Point

**File:** `scripts/review-assistant.js`

**Purpose:** Main conversational interface

**Structure:**
```javascript
class ReviewAssistant {
  constructor() {
    this.stateManager = new StateManager();
    this.analyzer = new ChapterAnalyzer();
    this.ui = new ConversationalUI();
  }

  async run() {
    // Main loop
    while (true) {
      const context = await this.detectContext();
      const suggestion = await this.makeSuggestion(context);
      const action = await this.ui.prompt(suggestion);
      await this.executeAction(action);
    }
  }

  async detectContext() {
    // What chapter is user working on?
    // What's the status?
    // What was last action?
  }

  async makeSuggestion(context) {
    // Smart suggestions based on context
  }

  async executeAction(action) {
    // Route to appropriate handler
  }
}
```

**Modes:**
- **Interactive mode** (default): One command at a time
- **Command mode**: Parse natural language commands
- **Batch mode**: Process multiple chapters
- **Workflow mode**: Follow template

---

### Task 2.2: Conversational UI Library

**File:** `scripts/lib/conversational-ui.js`

**Purpose:** Handle all user interaction with clean API

**API:**
```javascript
class ConversationalUI {
  // Display methods
  showWelcome()
  showStatus(chapterState)
  showProgress(current, total)
  showReviewResults(review)
  showError(error)

  // Input methods
  async prompt(message, options)
  async confirm(message)
  async choose(message, choices)
  async askNumber(message, min, max)
  async askText(message)

  // Visual elements
  spinner(message)
  progressBar(current, total)
  separator()
  header(text)

  // Formatting
  formatChapterStatus(state)
  formatReviewSummary(review)
  formatIssues(issues)
}
```

**Implementation:**
- Uses `inquirer` or `prompts` for input
- Uses `chalk` for colors
- Uses `ora` for spinners
- Uses `cli-progress` for progress bars

---

### Task 2.3: Context Detector

**File:** `scripts/lib/context-detector.js`

**Purpose:** Determine what the user is most likely trying to do

**Decision Logic:**
```javascript
// Priority order for next action:
1. Critical blockers (facts errors, safety issues)
2. Pending actions from last review
3. Never reviewed (suggest comprehensive)
4. Changed since last review (suggest re-review)
5. Ready for next review type in sequence
6. Ready for publication (suggest moving on)
```

---

### Task 2.4: Action Executor

**File:** `scripts/lib/action-executor.js`

**Purpose:** Execute user-chosen actions

**API:**
```javascript
class ActionExecutor {
  async executeReview(chapterName, reviewType, model)
  async showChapterStatus(chapterName)
  async showProjectOverview()
  async runBatch(chapters, reviewType)
  async switchChapter(newChapterName)
}
```

---

### Task 2.5: Command Parser

**File:** `scripts/lib/command-parser.js`

**Purpose:** Parse natural language commands

**Examples:**
```javascript
"creative" -> { action: 'review', type: 'creative' }
"tone" -> { action: 'review', type: 'tone' }
"batch" -> { action: 'batch' }
"review chapter-03" -> { action: 'review', chapter: 'chapter-03' }
"batch 4-7" -> { action: 'batch', range: [4, 7] }
```

---

### Task 2.6: Package Integration

**File:** `package.json`

**Add commands:**
```json
{
  "scripts": {
    "review": "node scripts/review-assistant.js",
    "state:init": "node scripts/state-init.js",
    "state:validate": "node scripts/validate-state.js"
  }
}
```

**Dependencies:**
```json
{
  "dependencies": {
    "inquirer": "^9.2.0",
    "chalk": "^5.3.0",
    "ora": "^7.0.1",
    "cli-progress": "^3.12.0",
    "cli-table3": "^0.6.3",
    "word-wrap": "^1.2.5",
    "date-fns": "^2.30.0"
  }
}
```

---

### Phase 2 Deliverables

- ✅ `npm run review` command works
- ✅ Conversational UI with smart suggestions
- ✅ Context detection and next action suggestions
- ✅ Command parsing for natural input
- ✅ Action execution integrated
- ✅ Clean, professional user experience

---

## Phase 3: Advanced Features & Workflows

**Timeline:** Days 8-10
**Goal:** Batch processing, workflows, edit suggestions

### Task 3.1: Batch Review Mode

**File:** `scripts/lib/batch-processor.js`

**Features:**
```javascript
class BatchProcessor {
  async reviewBatch(chapters, reviewType, options)
  async reviewAll()
  async reviewRange(start, end)
}
```

**UI:**
```
Batch Review Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/4] chapter-04-drain-pantry
  ✓ Done (8.2/10) - 2 minor issues

[2/4] chapter-05-techniques
  ✓ Done (7.5/10) - 3 issues (1 critical)
```

---

### Task 3.2: Workflow Templates

**File:** `scripts/lib/workflow-templates.js`

**Templates:**
```javascript
const workflows = {
  'pre-publication': {
    name: 'Pre-Publication Comprehensive',
    steps: [
      { action: 'review', type: 'comprehensive', model: 'o1' },
      { action: 'wait-for-fixes' },
      { action: 'review', type: 'creative', model: 'gpt-5-pro' },
      { action: 'review', type: 'facts', model: 'gpt-4o' },
      { action: 'verify' }
    ]
  },

  'quick-check': {
    name: 'Quick Tone & Readability Check',
    steps: [
      { action: 'review', type: 'tone', model: 'gpt-4o-mini' },
      { action: 'review', type: 'readability', model: 'gpt-4o-mini' }
    ]
  }
};
```

---

### Task 3.3: Review Parser & Edit Suggester

**File:** `scripts/lib/review-parser.js`

**Purpose:** Parse review output to extract structured issues

```javascript
class ReviewParser {
  parseReview(reviewContent) {
    return {
      overallScore: 7.5,
      issues: [...],
      strengths: [...],
      requiresFollowUp: true
    };
  }
}

class EditSuggester {
  async suggestEdits(chapterPath, issues)
  async applyEdit(chapterPath, edit)
}
```

**UI:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUGGESTED EDITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue 1: Missing citation (page 8)
Current: "Medieval kitchens used every part"
Suggestion: "Medieval kitchens, constrained by scarcity..."

Apply this edit? [y/n/e]>
```

---

### Task 3.4: Session Management

**File:** `scripts/lib/session-manager.js`

**Features:**
```javascript
class SessionManager {
  startSession()
  saveSession(session)
  resumeSession()
  getSessionHistory()
}
```

**UI:**
```
Welcome back! Last session: 2 hours ago

You were working on: chapter-03-clean-catch
Status: In revision (1 blocker)

[1] Resume chapter-03
[2] Start fresh
```

---

### Phase 3 Deliverables

- ✅ Batch review mode works
- ✅ Workflow templates defined and executable
- ✅ Review parsing extracts issues
- ✅ Edit suggestions with before/after
- ✅ Session management and resume

---

## Phase 4: Intelligence & Polish

**Timeline:** Days 11-12
**Goal:** Learning, optimization, UX polish

### Task 4.1: Pattern Learning

**File:** `scripts/lib/pattern-learner.js`

**Features:**
```javascript
class PatternLearner {
  analyzePatterns() {
    // What issues are most common?
    // Which reviews catch most issues?
    // How many iterations typical?
  }

  getPersonalizedSuggestion(chapterName) {
    // "Chapters with recipes typically need 2 iterations"
    // "Similar to chapter-03, which needed facts review"
  }
}
```

---

### Task 4.2: Cost Tracking & Optimization

**File:** `scripts/lib/cost-tracker.js`

**Features:**
```javascript
class CostTracker {
  estimateCost(reviewType, model, wordCount)
  trackActualCost(review)
  getTotalCost()
  suggestOptimization()
}
```

**UI:**
```
Review cost estimate: $0.15
Project total to date: $2.34

💡 Tip: Using o1-mini would cost $0.03 (80% savings)
```

---

### Task 4.3: Enhanced Creative Consultant Integration

**Features:**
- Prompt to create `.creative-intention.md` if missing
- Show intention before creative reviews
- Track alignment score over iterations

---

### Task 4.4: Error Handling & Recovery

**Features:**
- API failures: Retry with backoff
- File not found: Helpful suggestions
- State corruption: Automatic repair
- Interrupted reviews: Resume capability

---

### Task 4.5: Help System & Documentation

**File:** `scripts/lib/help-system.js`

**UI:**
```
> help

Commands:
  [Enter]     Accept suggestion
  creative    Creative consultant review
  batch       Review multiple chapters
  help        Get help
  quit        Exit
```

---

### Task 4.6: Documentation Updates

**Files:** `EDITORIAL-REVIEW.md`, `README.md`, new `REVIEW-ASSISTANT.md`

- Update all documentation
- Add troubleshooting guide
- Add FAQ

---

### Phase 4 Deliverables

- ✅ Pattern learning improves suggestions
- ✅ Cost tracking and optimization
- ✅ Enhanced creative consultant flow
- ✅ Robust error handling
- ✅ Comprehensive help system
- ✅ Polished UX throughout
- ✅ Complete documentation

---

## Complete File Structure

```
drain-salad/
├── manuscript/
│   ├── chapter-*.md
│   └── .state/                    # NEW
│       ├── chapters/
│       │   ├── chapter-01-history.json
│       │   └── ...
│       ├── project.json
│       ├── preferences.json
│       ├── workflow.json
│       └── session.json
│
├── scripts/
│   ├── review-assistant.js        # NEW - Main entry point
│   ├── state-init.js              # NEW
│   ├── validate-state.js          # NEW
│   │
│   ├── lib/
│   │   ├── state-manager.js       # NEW
│   │   ├── chapter-analyzer.js    # NEW
│   │   ├── conversational-ui.js   # NEW
│   │   ├── context-detector.js    # NEW
│   │   ├── command-parser.js      # NEW
│   │   ├── action-executor.js     # NEW
│   │   ├── batch-processor.js     # NEW
│   │   ├── workflow-templates.js  # NEW
│   │   ├── workflow-executor.js   # NEW
│   │   ├── review-parser.js       # NEW
│   │   ├── edit-suggester.js      # NEW
│   │   ├── session-manager.js     # NEW
│   │   ├── pattern-learner.js     # NEW
│   │   ├── cost-tracker.js        # NEW
│   │   ├── creative-consultant.js # NEW
│   │   ├── error-handler.js       # NEW
│   │   ├── help-system.js         # NEW
│   │   └── update-review-state.js # NEW
│   │
│   ├── review-chapter.sh          # MODIFIED
│   └── review-pro.js              # MODIFIED
│
└── package.json                   # MODIFIED
```

---

## Testing Strategy

### Unit Tests
```bash
scripts/test/
├── state-manager.test.js
├── chapter-analyzer.test.js
├── command-parser.test.js
└── review-parser.test.js
```

### Integration Tests
```bash
scripts/test/integration/
├── full-review-flow.test.js
├── batch-review.test.js
└── workflow-execution.test.js
```

### Manual Testing Checklist
- [ ] First-time user experience
- [ ] Returning user experience
- [ ] All review types work
- [ ] Batch mode works
- [ ] Workflows execute correctly
- [ ] Error handling works
- [ ] State persists correctly

---

## Migration Strategy

### For Existing Users

1. **Phase 1:** State tracking added, existing scripts still work
2. **Phase 2:** New `npm run review` available, old scripts still work
3. **Phase 3:** Documentation promotes new command
4. **Phase 4:** Old scripts marked as "advanced/manual mode"

**No breaking changes at any point**

---

## Risk Mitigation

### Risk: State corruption
**Mitigation:**
- Atomic writes
- State validation tool
- Automatic backups
- Repair functionality

### Risk: Breaking existing workflows
**Mitigation:**
- Existing scripts unchanged initially
- Gradual migration path
- Comprehensive testing

### Risk: Complex code hard to maintain
**Mitigation:**
- Modular architecture
- Clear separation of concerns
- Comprehensive documentation
- Unit tests for all components

---

## Success Metrics

### Quantitative
- ✓ Time to complete review workflow reduced by 50%
- ✓ Commands needed reduced from ~10 to ~3
- ✓ 90% of users accept smart suggestions
- ✓ Zero breaking changes
- ✓ < 100ms response time for UI

### Qualitative
- ✓ Users describe as "natural" and "helpful"
- ✓ Don't need to reference documentation
- ✓ Feel guided, not constrained
- ✓ Understand what's happening
- ✓ Confident in results

---

## Next Steps After Approval

1. ✅ Approve this plan
2. Install dependencies
3. Create directory structure
4. Begin Phase 1: State Infrastructure
5. Test each phase before proceeding
6. Iterate based on feedback

---

**This implementation plan provides a complete roadmap from current state to fully-functioning conversational review assistant.**
