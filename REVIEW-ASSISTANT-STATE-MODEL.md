# Review Assistant State Model

**Complete data schema and state management design for the conversational review assistant.**

---

## Overview

The state model tracks all information about chapters, reviews, progress, and user preferences. It provides the foundation for intelligent suggestions, session continuity, and pattern learning.

### Design Principles

1. **Simple JSON files** - Easy to read, edit, and debug
2. **Atomic operations** - Write to temp file, then rename to prevent corruption
3. **Schema validation** - Enforce structure and catch errors early
4. **Backward compatible** - Support migration as schema evolves
5. **Human readable** - Authors can inspect and understand state

---

## Directory Structure

```
manuscript/
├── chapter-01-history.md
├── chapter-02-anatomy.md
├── ...
└── .state/
    ├── chapters/
    │   ├── chapter-01-history.json
    │   ├── chapter-02-anatomy.json
    │   └── ...
    ├── project.json
    ├── preferences.json
    ├── workflow.json
    └── session.json
```

### Storage Location

**Why `manuscript/.state/`?**
- Colocated with content
- Easy to find and inspect
- Can be gitignored or committed (user choice)
- Future: migrate to database when schema stabilizes

---

## State File Schemas

### 1. Chapter State

**File:** `manuscript/.state/chapters/{chapter-name}.json`

**Purpose:** Track everything about a single chapter

```json
{
  "file": "manuscript/chapter-01-history.md",
  "lastModified": "2025-10-18T14:32:00Z",
  "wordCount": 3200,
  "status": "in-revision",
  "version": 3,

  "characteristics": {
    "hasRecipes": false,
    "recipeCount": 0,
    "hasHistoricalClaims": true,
    "hasTechnicalContent": true,
    "hasScientificClaims": false,
    "complexity": "medium",
    "estimatedReadingTime": 12,
    "detectedTopics": [
      "fermentation",
      "medieval-kitchens",
      "food-waste"
    ],
    "headingCount": 8,
    "sections": [
      "Introduction",
      "Medieval Kitchens",
      "Depression Era",
      "Modern Revival"
    ]
  },

  "reviews": [
    {
      "id": "rev-001",
      "type": "comprehensive",
      "model": "o1",
      "timestamp": "2025-10-17T10:00:00Z",
      "outputFile": "reviews/chapter-01-history-comprehensive-review.md",
      "summary": {
        "overallScore": 7.5,
        "passed": false,
        "issues": [
          {
            "id": "issue-001",
            "type": "facts",
            "severity": "critical",
            "location": "page 8",
            "description": "Missing citation for medieval kitchen claim",
            "suggestion": "Add source or rephrase as less absolute",
            "resolved": false
          },
          {
            "id": "issue-002",
            "type": "tone",
            "severity": "minor",
            "location": "page 3, paragraph 2",
            "description": "Anachronistic language: 'totally rad'",
            "suggestion": "Replace with 'remarkably effective'",
            "resolved": true
          }
        ],
        "strengths": [
          "Engaging storytelling",
          "Good transitions",
          "Consistent voice"
        ],
        "requiresFollowUp": true
      },
      "cost": 0.045
    },
    {
      "id": "rev-002",
      "type": "tone",
      "model": "gpt-4o-mini",
      "timestamp": "2025-10-18T14:00:00Z",
      "outputFile": "reviews/chapter-01-history-tone-review.md",
      "summary": {
        "overallScore": 8.5,
        "passed": true,
        "issues": [],
        "strengths": ["Consistent voice throughout"],
        "requiresFollowUp": false
      },
      "cost": 0.012
    }
  ],

  "pendingActions": [
    {
      "id": "action-001",
      "type": "fix-issue",
      "priority": "high",
      "description": "Add citation for medieval kitchen claim",
      "linkedReview": "rev-001",
      "linkedIssue": "issue-001",
      "status": "pending",
      "createdAt": "2025-10-17T10:05:00Z"
    },
    {
      "id": "action-002",
      "type": "review",
      "priority": "medium",
      "description": "Re-run facts review after citation added",
      "status": "blocked",
      "blockedBy": ["action-001"],
      "createdAt": "2025-10-17T10:05:00Z"
    }
  ],

  "completedReviews": {
    "comprehensive": {
      "lastRun": "2025-10-17T10:00:00Z",
      "passed": false,
      "iterations": 1
    },
    "tone": {
      "lastRun": "2025-10-18T14:00:00Z",
      "passed": true,
      "iterations": 1
    },
    "structure": null,
    "recipes": null,
    "facts": null,
    "readability": null,
    "creative": null
  },

  "metrics": {
    "totalReviewsRun": 2,
    "iterationCount": 3,
    "issuesResolved": 5,
    "issuesPending": 2,
    "totalCost": 0.057,
    "lastSignificantChange": "2025-10-18T14:00:00Z",
    "timeInStatus": {
      "draft": 86400000,
      "in-revision": 172800000
    }
  },

  "readyForPublication": false
}
```

**Field Descriptions:**

- **file**: Path to chapter markdown file
- **lastModified**: When file was last changed
- **wordCount**: Current word count
- **status**: Current lifecycle status (see State Transitions below)
- **version**: Incremented each time file is modified significantly
- **characteristics**: Auto-detected chapter properties
- **reviews**: Complete history of all reviews run
- **pendingActions**: To-do items from reviews
- **completedReviews**: Summary of review types completed
- **metrics**: Aggregate statistics
- **readyForPublication**: Boolean flag for publication readiness

---

### 2. Project State

**File:** `manuscript/.state/project.json`

**Purpose:** Overview of entire manuscript

```json
{
  "name": "Drain Salad",
  "totalChapters": 12,
  "totalWords": 37711,
  "lastUpdate": "2025-10-18T14:32:00Z",

  "chapters": [
    {
      "name": "chapter-01-history",
      "title": "History",
      "status": "in-revision",
      "blockers": 2,
      "readyForPublication": false,
      "lastModified": "2025-10-18T14:00:00Z"
    },
    {
      "name": "chapter-02-anatomy",
      "title": "Anatomy",
      "status": "ready",
      "blockers": 0,
      "readyForPublication": true,
      "lastModified": "2025-10-15T10:00:00Z"
    }
    // ... etc for all 12 chapters
  ],

  "overallProgress": {
    "chaptersComplete": 2,
    "chaptersInRevision": 4,
    "chaptersDraft": 6,
    "totalIssues": 15,
    "criticalIssues": 3,
    "percentComplete": 16.7
  },

  "reviewPatterns": {
    "preferredModel": "o1-mini",
    "averageIterations": 2.5,
    "mostCommonIssues": [
      "tone-consistency",
      "recipe-clarity",
      "missing-citations"
    ],
    "totalCost": 2.34,
    "totalReviews": 28
  }
}
```

**Field Descriptions:**

- **chapters**: Summary of each chapter's status
- **overallProgress**: Manuscript-wide metrics
- **reviewPatterns**: Learned patterns from history

---

### 3. Preferences

**File:** `manuscript/.state/preferences.json`

**Purpose:** User preferences and settings

```json
{
  "defaultModel": "o1-mini",
  "autoSuggest": true,
  "verbosity": "detailed",
  "costLimit": 10.0,
  "preferredReviewTypes": [
    "comprehensive",
    "creative"
  ],
  "notificationStyle": "summary",

  "creativeIntention": {
    "file": ".creative-intention.md",
    "lastModified": "2025-10-15T09:00:00Z",
    "active": true
  },

  "learningData": {
    "commonMistakes": [
      "anachronistic-language",
      "missing-citations",
      "recipe-measurements"
    ],
    "strengthAreas": [
      "storytelling",
      "recipe-clarity",
      "voice-consistency"
    ],
    "typicalIterations": 2,
    "preferredWorkingHours": [9, 10, 11, 14, 15, 16]
  },

  "ui": {
    "colorScheme": "auto",
    "progressBars": true,
    "spinners": true,
    "confirmBeforeExpensiveOps": true
  }
}
```

---

### 4. Workflow State

**File:** `manuscript/.state/workflow.json`

**Purpose:** Track active workflow progress

```json
{
  "activeWorkflow": {
    "type": "template",
    "name": "pre-publication-comprehensive",
    "currentStep": 3,
    "totalSteps": 5,
    "started": "2025-10-18T10:00:00Z",
    "chapter": "chapter-01-history"
  },

  "workflowSteps": [
    {
      "step": 1,
      "action": "comprehensive-review",
      "status": "completed",
      "completedAt": "2025-10-18T10:30:00Z",
      "result": "passed"
    },
    {
      "step": 2,
      "action": "fix-issues",
      "status": "completed",
      "completedAt": "2025-10-18T11:00:00Z",
      "result": "2 issues resolved"
    },
    {
      "step": 3,
      "action": "tone-review",
      "status": "in-progress",
      "startedAt": "2025-10-18T14:00:00Z"
    },
    {
      "step": 4,
      "action": "creative-review",
      "status": "pending"
    },
    {
      "step": 5,
      "action": "final-verification",
      "status": "pending"
    }
  ],

  "workflowHistory": [
    {
      "name": "quick-check",
      "chapter": "chapter-02-anatomy",
      "started": "2025-10-15T09:00:00Z",
      "completed": "2025-10-15T09:15:00Z",
      "result": "success"
    }
  ]
}
```

---

### 5. Session State

**File:** `manuscript/.state/session.json`

**Purpose:** Track user sessions and enable resume

```json
{
  "currentSession": {
    "id": "sess-2025-10-18-14-32",
    "started": "2025-10-18T14:32:00Z",
    "currentChapter": "chapter-01-history",
    "actionsPerformed": [
      {
        "action": "review",
        "type": "comprehensive",
        "timestamp": "2025-10-18T14:35:00Z"
      },
      {
        "action": "review",
        "type": "tone",
        "timestamp": "2025-10-18T15:00:00Z"
      }
    ],
    "lastActivity": "2025-10-18T15:00:00Z"
  },

  "previousSession": {
    "id": "sess-2025-10-17-10-00",
    "started": "2025-10-17T10:00:00Z",
    "ended": "2025-10-17T12:30:00Z",
    "duration": 9000000,
    "chaptersWorkedOn": [
      "chapter-01-history"
    ],
    "reviewsRun": 3,
    "issuesResolved": 2
  },

  "sessionHistory": [
    {
      "id": "sess-2025-10-17-10-00",
      "date": "2025-10-17",
      "duration": 9000000,
      "productivity": "high"
    }
  ]
}
```

---

## State Transitions

### Chapter Status Lifecycle

```
draft → ready-for-review → in-revision → pending-verification → ready-for-publication
```

**Transition Rules:**

| From | To | Trigger |
|------|-----|---------|
| draft | ready-for-review | Author signals complete |
| ready-for-review | in-revision | Review finds issues |
| in-revision | pending-verification | All pending actions resolved |
| pending-verification | ready-for-publication | Final review passes |
| ready-for-publication | in-revision | New edits made |
| in-revision | draft | Major restructuring |

**Status Descriptions:**

- **draft**: Chapter being written, not ready for review
- **ready-for-review**: Author says it's complete, needs first review
- **in-revision**: Has unresolved issues from reviews
- **pending-verification**: Issues fixed, needs verification review
- **ready-for-publication**: All reviews passed, ready to publish

---

## State Operations

### StateManager API

```javascript
class StateManager {
  // === Chapter Operations ===

  getChapterState(chapterName) {
    // Returns: chapter state object
    // Handles: file not found, corrupted JSON
  }

  updateChapterState(chapterName, updates) {
    // Updates fields atomically
    // Example: sm.updateChapterState('chapter-01', { status: 'in-revision' })
  }

  addReview(chapterName, reviewData) {
    // Adds to reviews array
    // Updates completedReviews
    // Updates metrics
  }

  addPendingAction(chapterName, action) {
    // Adds to pendingActions
    // Updates metrics
  }

  resolvePendingAction(chapterName, actionId) {
    // Marks action as resolved
    // Checks if any actions unblocked
  }

  setChapterStatus(chapterName, newStatus) {
    // Changes status
    // Validates transition is legal
    // Updates metrics
  }

  // === Project Operations ===

  getProjectState() {
    // Returns: project-wide state
  }

  updateProjectState(updates) {
    // Updates project state atomically
  }

  // === Preferences ===

  getPreferences() {
    // Returns: user preferences
  }

  updatePreferences(updates) {
    // Updates preferences
  }

  // === Workflow ===

  getWorkflow() {
    // Returns: current workflow state
  }

  startWorkflow(workflowName, chapter) {
    // Initializes workflow
  }

  advanceWorkflow() {
    // Moves to next step
  }

  completeWorkflow() {
    // Marks workflow complete
    // Adds to history
  }

  // === Session ===

  startSession() {
    // Creates new session
    // Archives previous session
  }

  updateSession(updates) {
    // Updates current session
  }

  endSession() {
    // Closes current session
    // Saves to history
  }

  // === Queries ===

  getChaptersByStatus(status) {
    // Returns: array of chapter names with status
    // Example: sm.getChaptersByStatus('in-revision')
  }

  getAllChapters() {
    // Returns: all chapter states
  }

  getNextChapterToReview() {
    // Smart logic:
    // 1. Chapters with critical blockers
    // 2. Chapters never reviewed
    // 3. Chapters recently modified
    // Returns: chapter name or null
  }

  getBlockers() {
    // Returns: all pending actions marked high priority
  }

  getChaptersNeedingReview(reviewType) {
    // Returns: chapters that haven't had reviewType
  }

  getRecentActivity(hours = 24) {
    // Returns: chapters modified in last N hours
  }

  // === Maintenance ===

  validateState() {
    // Checks all state files for schema compliance
    // Returns: validation report
  }

  repairState(chapterName) {
    // Attempts to fix corrupted state
  }

  migrateState(fromVersion, toVersion) {
    // Migrates state schema
  }
}
```

---

## Query Patterns

### Common Queries

**"What should I work on next?"**
```javascript
const blockers = sm.getBlockers();
if (blockers.length > 0) {
  return { chapter: blockers[0].chapter, reason: 'critical blocker' };
}

const neverReviewed = sm.getChaptersByStatus('draft')
  .filter(c => sm.getChapterState(c).reviews.length === 0);
if (neverReviewed.length > 0) {
  return { chapter: neverReviewed[0], reason: 'never reviewed' };
}

const recentlyModified = sm.getRecentActivity(24);
if (recentlyModified.length > 0) {
  return { chapter: recentlyModified[0], reason: 'recently changed' };
}

return { chapter: sm.getChaptersByStatus('ready-for-review')[0], reason: 'ready' };
```

**"What chapters need comprehensive review?"**
```javascript
const chapters = sm.getAllChapters();
return chapters.filter(c => {
  const state = sm.getChapterState(c.name);
  return !state.completedReviews.comprehensive ||
         !state.completedReviews.comprehensive.passed;
});
```

**"Show project overview"**
```javascript
const project = sm.getProjectState();
const ready = sm.getChaptersByStatus('ready-for-publication').length;
const inProgress = sm.getChaptersByStatus('in-revision').length;
const draft = sm.getChaptersByStatus('draft').length;

console.log(`Ready: ${ready}/${project.totalChapters}`);
console.log(`In revision: ${inProgress}`);
console.log(`Draft: ${draft}`);
```

---

## Atomic Operations

### Write Safety

**Problem:** State files can be corrupted if process crashes during write.

**Solution:** Atomic write pattern:

```javascript
function atomicWrite(filePath, data) {
  const tempPath = `${filePath}.tmp`;
  const backupPath = `${filePath}.backup`;

  // Write to temp file
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));

  // Backup existing file if exists
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  // Atomic rename (OS-level atomic operation)
  fs.renameSync(tempPath, filePath);

  // Clean up backup after successful write
  if (fs.existsSync(backupPath)) {
    fs.unlinkSync(backupPath);
  }
}
```

---

## Schema Validation

### Validation Rules

Each state file has a JSON schema that defines:
- Required fields
- Field types
- Valid enum values
- Array constraints
- Nested object structures

**Example schema for chapter state:**
```javascript
const chapterStateSchema = {
  type: 'object',
  required: ['file', 'status', 'reviews', 'pendingActions'],
  properties: {
    file: { type: 'string' },
    lastModified: { type: 'string', format: 'date-time' },
    wordCount: { type: 'number', minimum: 0 },
    status: {
      type: 'string',
      enum: ['draft', 'ready-for-review', 'in-revision', 'pending-verification', 'ready-for-publication']
    },
    reviews: {
      type: 'array',
      items: { $ref: '#/definitions/review' }
    }
    // ... etc
  }
};
```

---

## State Evolution & Migration

### Versioning

State files include a schema version:
```json
{
  "_schemaVersion": "1.0.0",
  "file": "manuscript/chapter-01-history.md",
  ...
}
```

### Migration Strategy

When schema changes:
1. Bump schema version
2. Write migration function
3. Auto-migrate on first load

**Example migration:**
```javascript
function migrateV1ToV2(state) {
  // v2 adds 'version' field to chapters
  return {
    ...state,
    _schemaVersion: '2.0.0',
    version: 1
  };
}
```

---

## How State Enables UI Proposals

### 1. Interactive Wizard
**Uses:** `completedReviews`, `characteristics`, `pendingActions`
**How:** Wizard reads state to know what's been done and what's recommended

### 2. Status-Based Auto-Workflow
**Uses:** `status`, `reviewHistory`, `pendingActions`
**How:** Automatically determines next action based on status and history

### 3. Conversational NLI
**Uses:** All state data for context
**How:** Understands "review this chapter" based on current state

### 4. Workflow Templates
**Uses:** `workflow.json`, `chapter.status`
**How:** Tracks progress through predefined sequences

### 5. Checklist-Driven
**Uses:** `completedReviews`, `pendingActions`
**How:** Generates dynamic checklists from state

### 6. Smart Assistant
**Uses:** Everything
**How:** Full context awareness for intelligent suggestions

---

## State Backup & Recovery

### Backup Strategy

1. **Automatic backups** before each write
2. **Daily snapshots** of entire `.state/` directory
3. **Git integration** (optional - user can commit state)

### Recovery

```bash
# Validate current state
npm run state:validate

# Repair corrupted state
npm run state:repair chapter-01-history

# Restore from backup
npm run state:restore --from=2025-10-17
```

---

## Performance Considerations

### File Size

Typical state file sizes:
- Chapter state: 5-15 KB
- Project state: 10-30 KB
- Preferences: 2-5 KB
- Total for 12 chapters: ~200 KB

**Conclusion:** File-based state is performant for this use case.

### Caching

StateManager caches in-memory for session:
- Load state files on first access
- Keep in memory during session
- Write back on changes
- Clear cache on exit

### Future: Database Migration

When schema stabilizes, migrate to SQLite:
- Faster queries
- Better concurrency
- Transaction support
- Still human-readable with tools

---

## Example: Complete State Flow

**User runs comprehensive review:**

1. **Load state:** `sm.getChapterState('chapter-01-history')`
2. **Check status:** `status: 'draft'`
3. **Run review:** Call review script
4. **Parse results:** Extract issues, score
5. **Update state:**
   ```javascript
   sm.addReview('chapter-01-history', {
     type: 'comprehensive',
     model: 'o1',
     summary: { issues: [...], score: 7.5 }
   });

   if (issues.length > 0) {
     sm.setChapterStatus('chapter-01-history', 'in-revision');
     issues.forEach(issue => {
       sm.addPendingAction('chapter-01-history', {
         type: 'fix-issue',
         description: issue.description,
         priority: issue.severity === 'critical' ? 'high' : 'medium'
       });
     });
   }
   ```
6. **Save state:** Atomic write to disk
7. **Show results:** UI displays issues and next steps

---

**The state model provides a complete foundation for intelligent, context-aware review assistance.**
