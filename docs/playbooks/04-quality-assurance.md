# Playbook #4: Quality Assurance Workflows

**Goal:** Use AI-powered reviews to ensure content and images meet publication standards.

**Who This Is For:** Authors wanting comprehensive QA before publishing.

---

## QA Overview

```
Content QA          Image QA           Final QA
    ↓                  ↓                  ↓
Editorial       Automated         Pre-Flight
  Reviews    Quality Loop          Checks
```

---

## Part 1: Editorial Review System

### 6 Review Types

**1. Comprehensive** (All aspects)
```bash
./scripts/review-chapter.sh manuscript/chapter-05.md comprehensive
```

**2. Tone** (Voice consistency)
```bash
./scripts/review-chapter.sh manuscript/chapter-05.md tone
```

**3. Structure** (Flow and organization)
```bash
./scripts/review-chapter.sh manuscript/chapter-05.md structure
```

**4. Recipes** (Technical validation)
```bash
./scripts/review-chapter.sh manuscript/chapter-05.md recipes
```

**5. Facts** (Accuracy verification)
```bash
./scripts/review-chapter.sh manuscript/chapter-05.md facts
```

**6. Readability** (Clarity and accessibility)
```bash
./scripts/review-chapter.sh manuscript/chapter-05.md readability
```

---

### Review Model Selection

| Model | Use Case | Speed | Quality |
|-------|----------|-------|---------|
| `o1` | Final pre-publication | Slow | Best |
| `o1-mini` | Iterative drafting | Medium | Very Good |
| `gpt-4o` | Quick checks | Fast | Good |
| `gpt-4o-mini` | Rapid iteration | Very Fast | Decent |

**Syntax:**
```bash
./scripts/review-chapter.sh manuscript/chapter-05.md comprehensive o1
```

---

### Batch Review (All Chapters)

```bash
# Review all 12 chapters
./scripts/review-all-chapters.sh

# Output: reviews/chapter-*-comprehensive-review.md
```

**Review output structure:**
```markdown
# Chapter Review: Chapter 05

## Overall Assessment
...

## Tone & Voice
✅ Strengths: ...
⚠️ Issues: ...

## Structure & Flow
...

## Specific Suggestions
1. Page 3, Line 15: ...
```

---

### Applying Review Feedback

**Priority order:**
1. **Critical** issues (facts, safety, recipe errors)
2. **Structure** issues (flow, organization)
3. **Tone** inconsistencies
4. **Readability** improvements
5. **Nice-to-have** suggestions

**Workflow:**
```bash
# 1. Read review
cat reviews/chapter-05-comprehensive-review.md

# 2. Make edits
nano manuscript/chapter-05-techniques.md

# 3. Re-review major changes
./scripts/review-chapter.sh manuscript/chapter-05.md tone

# 4. Compare reviews
./scripts/compare-reviews.sh
```

---

## Part 2: Image Quality System

### Automated Quality Loop

**What it does:**
```
1. Review all images → 2. Refine prompts → 3. Regenerate bad images → Repeat
```

**Run the loop:**
```bash
# Standard quality loop (major issues only)
npm run quality:loop

# Full loop (including minor issues)
npm run quality:loop:full
```

**The loop:**
- Runs up to 5 iterations
- Stops when all images pass OR no improvements detected
- Generates structured JSON reviews

---

### Manual Image Review

**Step 1: Review all images**
```bash
npm run review:images:structured
```

**Output:** `reviews/images/*.json` + `reviews/image-review-summary.json`

**Step 2: Check summary**
```bash
cat reviews/image-review-summary.json
```

**Look for:**
- `needs_regeneration`: Critical issues
- `minor_issues`: Quality improvements
- `pass`: Good to go

**Step 3: Refine prompts**
```bash
# Preview changes
npm run prompts:refine:preview --dry-run

# Apply changes
npm run prompts:refine
```

**Step 4: Regenerate**
```bash
# Only regenerate images marked as "needs_regeneration"
npm run generate:missing
```

---

### Image Review Criteria

**Pass criteria:**
- ✅ Subject matches prompt
- ✅ Good lighting and composition
- ✅ Professional quality
- ✅ No major AI artifacts
- ✅ Character consistency (for author photos)

**Needs regeneration:**
- ❌ Wrong subject entirely
- ❌ Unappetizing food
- ❌ Major artifacts (extra limbs, wrong objects)
- ❌ Different person in author photos
- ❌ Garbled text in infographics

**Minor issues (optional fixes):**
- ⚠️ Slightly dark lighting
- ⚠️ Minor background imperfections
- ⚠️ Could be more vibrant

---

## Part 3: Pre-Publication Checklist

### Content Checks

```bash
# Lint markdown
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Verify word count
npm run wordcount
# Target: ~37,711 words (or your goal)

# Check metadata
cat book-metadata.json
```

---

### Image Checks

```bash
# Validate all images present
npm run validate-images

# Check image stats
npm run image-stats

# Manual spot check
open manuscript/images/chapter-01/
open manuscript/images/chapter-07/
```

---

### Build Checks

```bash
# Build all formats
npm run publish:all

# Verify outputs exist
ls -lh build/

# Expected files:
# - drain-salad-print.pdf (298MB)
# - drain-salad-optimized.pdf (4.7MB)
# - drain-salad.epub (222MB)
# - drain-salad.html (296KB)
```

**Open and verify:**
- Print PDF: All chapters, images clear, bleed correct
- EPUB: TOC works, images scale, text reflows
- Optimized PDF: File size reasonable, images still good

---

## Complete QA Workflow

### Recommended Pre-Publication Sequence

**Week 1: Editorial Review**
```bash
# Day 1-2: Batch review all chapters
./scripts/review-all-chapters.sh

# Day 3-7: Address feedback, make revisions
```

**Week 2: Image QA**
```bash
# Day 1: Generate all images
npm run generate:missing

# Day 2-3: Run quality loop
npm run quality:loop

# Day 4-5: Manual review and regeneration
npm run review:images:structured
npm run prompts:refine
npm run generate:missing
```

**Week 3: Final QA**
```bash
# Day 1: Final lint and validation
npm run lint
npm run validate-images

# Day 2: Build all formats
npm run publish:all

# Day 3-5: Review builds, fix any issues

# Day 6-7: Final editorial pass on any changed content
./scripts/review-chapter.sh manuscript/chapter-*.md comprehensive o1
```

---

## Advanced QA Techniques

### Comparing Review Versions

```bash
# Compare before/after reviews
diff reviews/chapter-05-v1-comprehensive-review.md \
     reviews/chapter-05-v2-comprehensive-review.md
```

### Tracking Quality Metrics

**Create custom script:**
```bash
#!/bin/bash
# qa-metrics.sh

echo "=== Content Metrics ==="
npm run wordcount
npm run lint 2>&1 | grep -E "error|warning" | wc -l

echo "=== Image Metrics ==="
npm run image-stats
cat reviews/image-review-summary.json | jq '.summary'

echo "=== Build Metrics ==="
ls -lh build/ | tail -n +2
```

---

## Troubleshooting

### Reviews Too Generic

**Problem:** Reviews don't catch specific issues

**Solutions:**
- Use more specific review types (recipes, facts vs. comprehensive)
- Use better models (o1 vs. gpt-4o-mini)
- Provide more context in prompts

---

### Quality Loop Not Converging

**Problem:** Loop runs 5 times, images still failing

**Solutions:**
```bash
# Check what's actually failing
cat reviews/image-review-summary.json

# Manually inspect failing images
open manuscript/images/chapter-*/

# Write better prompts manually
nano manuscript/chapter-07.md
npm run extract-manifest
```

---

### Images Pass Review But Look Wrong

**Problem:** AI review says "pass" but you disagree

**Remember:** AI reviews are helpful but not perfect. Trust your judgment.

**Fix:**
1. Manually improve prompts
2. Regenerate specific images
3. Consider different backend

---

## Quick Reference

### Essential QA Commands

```bash
# Editorial
./scripts/review-all-chapters.sh
./scripts/review-chapter.sh FILE TYPE [MODEL]

# Images
npm run review:images:structured
npm run quality:loop
npm run prompts:refine

# Pre-flight
npm run lint
npm run validate-images
npm run publish:all
```

### Review File Locations

```
reviews/
├── chapter-*-comprehensive-review.md    # Editorial reviews
├── images/
│   ├── 001_*.json                       # Individual image reviews
│   └── 002_*.json
└── image-review-summary.json             # Image review summary
```

---

## Next Steps

**After QA:**

1. **Publish to platforms** → [Playbook #5: Multi-Format Publishing](05-multi-format-publishing.md)
2. **Fix any issues** → [Playbook #7: Troubleshooting](07-troubleshooting.md)

---

**Quality assurance** is the difference between a rushed self-published book and a professional publication. Take the time to review, revise, and refine.
