# Review Assistant UX Proposals

**Six different user experience approaches for the conversational review assistant, plus the recommended "best of all worlds" design.**

---

## Problem Statement

The current editorial review system requires users to:
- Remember 7 different review types
- Know which model to use when
- Understand command-line syntax
- Track review state manually
- Decide what to do next without guidance

**Authors want to write, not manage command-line workflows.**

---

## Design Principles

1. **Pit of Success** - Guide users toward the right actions naturally
2. **Progressive Disclosure** - Don't overwhelm with all options at once
3. **Smart Defaults** - Make the common case easy
4. **Context Awareness** - Understand where the user is and what they need
5. **Clear Feedback** - Always show what's happening and what's next
6. **Natural Language** - Speak human, not computer

---

## Six UI/UX Proposals

### Proposal 1: Interactive Review Wizard

**Philosophy:** Ask questions, make it impossible to mess up

**Strengths:**
- Can't make mistakes
- Clear step-by-step progression
- Great for first-time users

**Weaknesses:**
- Many questions for simple tasks
- Can feel slow for experienced users

**Best For:** New users, complex workflows

---

### Proposal 2: Status-Based Auto-Workflow

**Philosophy:** System automatically knows what to do next

**Strengths:**
- Zero cognitive load
- Fastest path to completion
- Catches critical issues first

**Weaknesses:**
- Less user control
- May not match user's current focus

**Best For:** Users who trust automation, maintenance mode

---

### Proposal 3: Conversational Natural Language Interface

**Philosophy:** Talk to the assistant like a colleague

**Strengths:**
- Most natural interaction
- Flexible and expressive
- Feels like working with editor

**Weaknesses:**
- Requires good NLP
- Ambiguity possible
- May need clarification

**Best For:** Users who prefer conversation, complex requests

---

### Proposal 4: Workflow Templates

**Philosophy:** Pre-defined paths for common tasks

**Strengths:**
- Best practices codified
- Repeatable processes
- Clear expectations

**Weaknesses:**
- Less flexible
- May not fit all situations

**Best For:** Common patterns, team consistency

---

### Proposal 5: Checklist-Driven System

**Philosophy:** Show what needs to be done, check it off

**Strengths:**
- Visual progress tracking
- Clear goals
- Satisfying to complete

**Weaknesses:**
- Static lists may not adapt
- Can feel rigid

**Best For:** Users who like structure, publication readiness

---

### Proposal 6: Hybrid Smart Assistant

**Philosophy:** Combines best of all approaches

**Strengths:**
- Flexible - works many ways
- Learns and adapts
- Progressive disclosure

**Weaknesses:**
- Most complex to build
- Need all the other pieces

**Best For:** Everyone (the recommended approach)

---

## The Recommended Approach: Conversational Smart Assistant

**The "Best of All Possible Worlds" design that combines elements from all 6 proposals.**

### Core Concept

**One command to rule them all:**
```bash
npm run review
```

The assistant:
- Reads current state automatically
- Analyzes what chapter you're working on
- Understands context from history
- Asks clarifying questions only when needed
- Provides smart suggestions
- Shows clear progress
- Learns your patterns

### Interaction Modes

**Level 1 (Default):** Minimal interaction
- Smart suggestion with default
- Press Enter to proceed
- One decision at a time

**Level 2 (Intermediate):** Simple choices
- 3-4 options presented
- Number selection
- Natural commands accepted

**Level 3 (Advanced):** Full control
- Type `help` for all options
- Access to all review types
- Workflow customization
- Batch operations

**Users naturally discover features as they need them.**

---

## Complete User Experience: First-Time Review

```bash
$ npm run review

Drain Salad Review Assistant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyzing manuscript/chapter-01-history.md...
✓ 3,200 words
✓ Contains historical claims
✓ No recipes detected
✓ Never been reviewed

Recommended: Comprehensive review (o1-mini)
Cost: ~$0.05 | Time: ~2 min

Press Enter to proceed, or type:
  'creative' for creative consultant
  'tone' for just tone check
  'help' for all options

> [Enter]

Running comprehensive review with o1-mini...
⣾ Analyzing tone and voice...
⣽ Checking structure and flow...
⣻ Verifying factual accuracy...
⣺ Assessing readability...

✓ Review complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHAPTER STATUS: In Revision
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall: 7.5/10 - Good foundation, needs minor fixes

Issues Found:
  🔴 Critical (1): Missing citation (page 8)
  🟡 Minor (2): Anachronistic language, dense paragraph

Strengths:
  ✓ Engaging storytelling
  ✓ Good transitions
  ✓ Consistent voice

Next Steps:
  1. Fix citation issue (page 8)
  2. Simplify paragraph on page 12
  3. Re-run facts review to verify

Full review: reviews/chapter-01-history-comprehensive-review.md

What would you like to do?
  [1] Fix issues now (opens editor)
  [2] Read detailed feedback
  [3] Run another review type
  [4] Work on different chapter
  [q] Quit

> 2

[Shows detailed review content...]

Press Enter when ready to continue...

> [Enter]

Would you like me to suggest specific edits for the issues?
(I can analyze the review and propose fixes)

[y/n]> y

Analyzing review feedback...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUGGESTED EDITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue 1: Missing citation (page 8)
Location: "Medieval kitchens used every part"

Current:
  Medieval kitchens used every part of the animal.

Suggestion:
  Medieval kitchens, constrained by scarcity, developed
  practices for using every part of available ingredients.

Apply this edit? [y/n/e to edit manually]> y
✓ Applied

Issue 2: Anachronistic language (page 3)
Location: "totally rad"
Suggestion: Replace with "remarkably effective"

Apply? [y/n]> y
✓ Applied

Issue 3: Dense paragraph (page 12)
[Shows before/after...]

Apply? [y/n]> y
✓ Applied

All issues addressed! Chapter updated.

Next step: Re-run facts review to verify citations?
[y/n]> y

Running facts review with gpt-4o-mini...
✓ Complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROGRESS UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chapter: chapter-01-history
Status: Ready for Publication ✓

Reviews Completed:
  ✓ Comprehensive (passed)
  ✓ Facts (passed)

This chapter looks good! Ready to move on?

Suggestions:
  • Run creative review to refine voice
  • Move to chapter-02-anatomy
  • Generate images for chapter-01

What next? [creative/next/images/quit]>
```

---

## User Experience: Returning to Work

```bash
$ npm run review

Drain Salad Review Assistant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome back! Last session: 2 hours ago

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Progress: 3/12 chapters ready

  ✓ chapter-01-history (ready)
  ✓ chapter-02-anatomy (ready)
  ⚠ chapter-03-clean-catch (in revision - 1 blocker)
  ○ chapter-04-drain-pantry (draft)
  ... (8 more)

Recommendation: Continue with chapter-03-clean-catch
You left off fixing recipe clarity issues.

[1] Resume chapter-03
[2] Start new chapter
[3] Review all chapters
[4] Project overview

> 1

Loading chapter-03-clean-catch-method.md...

Last review: recipe (2 issues found)
Status: In Revision

Pending issues:
  🔴 Recipe "Basic Vegetable Stock" missing salt quantity
  🟡 Timing unrealistic for roasting step

Would you like to:
  [1] Fix these issues (I can help)
  [2] Re-run recipe review
  [3] See detailed feedback

> 1

I'll help you fix these. Let me analyze the recipe...

[Walks through each fix with suggestions...]

Chapter updated! Re-run recipe review to verify?
[y/n]> y

Running recipe review...
✓ All recipes validated!

Chapter-03 Status: Ready for Publication ✓

Great work! Ready for the next chapter?
[y/n]>
```

---

## User Experience: Batch Workflow

```bash
$ npm run review

> batch

Starting batch review mode...

How many chapters? [all/number/range]> 4-7

Reviewing chapters 4-7 (4 chapters)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Review type? [comprehensive/quick]> quick
Model? [o1-mini/gpt-4o-mini]> gpt-4o-mini

Estimated cost: $0.12
Estimated time: 6 min

Proceed? [y/n]> y

[1/4] chapter-04-drain-pantry
  ⣾ Reviewing...
  ✓ Done (8.2/10) - 2 minor issues

[2/4] chapter-05-techniques
  ⣾ Reviewing...
  ✓ Done (7.5/10) - 3 issues (1 critical)

[3/4] chapter-06-foundations
  ⣾ Reviewing...
  ✓ Done (9.1/10) - Perfect!

[4/4] chapter-07-salads-small-plates
  ⣾ Reviewing...
  ✓ Done (8.0/10) - 4 recipe issues

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BATCH RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Completed: 4 chapters
Total issues: 9 (1 critical)

Summary:
  ✓ chapter-04: Minor fixes needed
  ⚠ chapter-05: Critical fact-check issue
  ✓ chapter-06: Ready for publication!
  ⚠ chapter-07: Recipe validation needed

Recommendations:
  1. Fix chapter-05 critical issue first
  2. Run recipe review on chapter-07
  3. Quick fixes for chapter-04

Start with chapter-05? [y/n]>
```

---

## User Experience: Creative Consultant

```bash
$ npm run review

> creative chapter-01

Checking for .creative-intention.md...
✓ Found creative intention

Your stated intention:
  "Make this cookbook feel more intimate and personal,
   as if speaking to a close friend in their kitchen."

Review chapter-01-history with this intention?

Model recommendation: gpt-5-pro (deep analysis)
Cost: ~$0.15 | Time: ~3-5 min

[gpt-5-pro/o1/cancel]> [Enter]

Starting GPT-5 pro creative consultant...
This uses extended reasoning and may take several minutes.

⏳ Creating response... (background mode)
⏳ Waiting for analysis... (30s elapsed)
⏳ Still thinking... (60s elapsed)
⏳ Deep analysis in progress... (90s elapsed)
✓ Complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATIVE CONSULTANT FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Alignment with Creative Intention: 6.5/10

The chapter has strong foundations but doesn't fully
achieve the intimate, friend-in-kitchen feeling you're
aiming for.

What's Working:
  ✓ Historical storytelling is engaging
  ✓ Voice is authoritative but approachable
  ✓ Some personal touches (Tuesday anecdote)

What Needs Work:
  • Too many facts, not enough feeling
  • Missing personal connection to the reader
  • Lacks warmth in opening paragraphs

Specific Suggestions:
  1. Open with personal story rather than history
  2. Use "you" and "we" more (currently too distant)
  3. Add sensory details (smells, textures)
  4. Share a personal failure or lesson learned

[Detailed feedback continues...]

Would you like me to:
  [1] Suggest specific rewrites
  [2] Show examples of more intimate voice
  [3] Re-review after you make changes
  [4] Save feedback and continue

>
```

---

## Key Design Features

### 1. Progressive Disclosure

**Start simple:**
- One suggestion
- Press Enter to accept
- Clear, single action

**Gradually reveal:**
- Type 'help' for more options
- Commands discovered naturally
- Power features available but not overwhelming

### 2. Smart Defaults

- Always suggest the most likely next action
- Based on state, history, characteristics
- Can always override

### 3. Context Awareness

**System knows:**
- What chapter you're on
- What's been reviewed
- What issues exist
- What's next logically

### 4. Natural Commands

```bash
> creative           # Run creative review
> tone              # Run tone review
> batch             # Batch mode
> batch 4-7         # Review chapters 4-7
> workflow pub      # Pre-publication workflow
> status            # Project overview
> help              # Show help
> quit              # Exit
```

### 5. Visual Clarity

**Use of:**
- Emoji for status (✓ ⚠ 🔴 ○)
- Box drawing for sections
- Colors for emphasis
- Progress indicators
- Clear headers

### 6. State Persistence

- Pick up where you left off
- Session history
- Resume prompts
- No lost work

---

## Command Reference

### Simple Commands
- `[Enter]` - Accept suggestion
- `creative` - Creative consultant review
- `tone` - Quick tone check
- `facts` - Fact-checking review
- `recipes` - Recipe validation
- `batch` - Batch review mode
- `status` - Project overview
- `help` - Show help
- `quit` - Exit

### Complex Commands
- `review chapter-03` - Review specific chapter
- `creative chapter-01` - Creative review of chapter
- `batch 4-7` - Review chapters 4 through 7
- `workflow pre-publication` - Use workflow template
- `workflow quick-check` - Quick tone+readability

### Context Commands
- `next` - Move to next chapter
- `back` - Return to previous chapter
- `resume` - Resume previous session
- `history` - Show review history

---

## How It All Comes Together

### State Model
Tracks everything about chapters, reviews, progress

### Context Detection
Analyzes state to determine what's most relevant

### Command Parser
Understands natural language input

### Action Executor
Runs reviews, shows status, executes commands

### Conversational UI
Presents information clearly, gets user input

### Pattern Learning
Improves suggestions over time

### Workflow Templates
Codifies common patterns

---

## Progressive User Journey

### Day 1: First Use
- Run `npm run review`
- Accept smart suggestion
- Follow guided prompts
- Complete first review

### Week 1: Learning
- Try different review types
- Discover commands
- Run batch reviews
- See patterns emerge

### Month 1: Proficient
- Use shortcuts
- Create workflows
- Understand patterns
- Work efficiently

### Month 3: Expert
- Customize preferences
- Use advanced features
- Batch operations
- Optimal efficiency

---

## Why This Design Works

1. **Simple to start** - One command, clear suggestions
2. **Grows with you** - Discover features as needed
3. **Never confusing** - Always know what's happening
4. **Respects expertise** - Can be terse or detailed
5. **Learns patterns** - Gets smarter over time
6. **Feels natural** - Like working with an editor
7. **Saves time** - Reduces decisions needed
8. **Builds confidence** - Clear progress tracking

---

**The conversational smart assistant combines the best aspects of all 6 proposals into a unified, natural, and effective user experience.**
