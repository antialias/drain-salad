# Playbook #2: Complete Authoring Workflow

**Goal:** Master the end-to-end manuscript workflow from blank page to published multi-format book.

**Who This Is For:** Authors ready to write their full cookbook manuscript using the Drain Salad platform.

---

## The Complete Journey

```
Write → Review → Generate Images → QA → Build → Publish
  ↓        ↓            ↓           ↓      ↓        ↓
 .md    reviews/    images/     quality  build/  platforms
```

---

## Phase 1: Manuscript Structure (Planning)

### Standard Cookbook Structure

```
Front Matter:
- Cover
- Title Page
- Copyright
- Table of Contents
- Introduction

Part I: Foundations (Chapters 1-6)
- History/Philosophy
- Techniques
- Essential preparations

Part II: Recipes (Chapters 7-9)
- Organized by meal type or category
- 20-30 recipes total

Part III: Reference (Chapters 10-12)
- Ingredient guides
- Use cases / meal planning
- Appendices (conversions, troubleshooting)

Back Matter:
- Index (optional)
- About the Author
- Acknowledgments
```

### File Organization

```bash
manuscript/
├── 00-front-matter.md        # Title, copyright, intro
├── chapter-01-history.md
├── chapter-02-anatomy.md
├── chapter-03-clean-catch.md
├── chapter-04-drain-pantry.md
├── chapter-05-techniques.md
├── chapter-06-foundations.md
├── chapter-07-salads.md
├── chapter-08-mains.md
├── chapter-09-ferments.md
├── chapter-10-taxonomy.md
├── chapter-11-use-cases.md
├── chapter-12-appendices.md
└── images/
    ├── reference/
    └── chapter-*/
```

---

## Phase 2: Writing in Markdown

### Essential Markdown for Cookbooks

**Headings:**
```markdown
# Chapter 1: Title (H1 - chapter title)

## Section (H2 - major sections)

### Subsection (H3 - recipe names, techniques)
```

**Emphasis:**
```markdown
**Bold** for emphasis, ingredients in instructions
*Italic* for subtle emphasis, botanical names
```

**Lists:**
```markdown
**Ingredients:**
- 2 cups vegetable scraps
- 1 onion, diced
- 4 cups water

**Instructions:**
1. Heat oil in large pot
2. Add onions, cook until soft
3. Add scraps and water
```

**Images:**
```markdown
![Detailed prompt for AI](images/chapter-05/025_image-name.png)
```

**Recipes Standard Format:**
```markdown
### Recipe Name

**Yield:** 4 servings
**Prep Time:** 15 minutes
**Cook Time:** 30 minutes

Brief description of dish and its appeal.

**Ingredients:**
- Ingredient 1
- Ingredient 2

**Instructions:**

1. Step one
2. Step two

**Notes:** Storage, variations, substitutions
```

**Block Quotes (for tips/warnings):**
```markdown
> **Chef's Tip:** Save vegetable scraps in the freezer until you have enough for stock.
```

---

## Phase 3: Iterative Writing + Review

### Daily Writing Workflow

```bash
# 1. Write or edit chapter
nano manuscript/chapter-05-techniques.md

# 2. Quick lint check
npm run lint:fix

# 3. Preview current word count
npm run wordcount:chapters

# 4. (Optional) Get quick feedback
./scripts/review-chapter.sh manuscript/chapter-05-techniques.md readability
```

### Using Editorial Reviews During Drafting

**Cheap/fast models for iteration:**
```bash
# Tone check (uses gpt-4o-mini)
./scripts/review-chapter.sh manuscript/chapter-05-techniques.md tone

# Readability check
./scripts/review-chapter.sh manuscript/chapter-05-techniques.md readability

# Recipe check
./scripts/review-chapter.sh manuscript/chapter-05-techniques.md recipes
```

**Comprehensive reviews for major drafts:**
```bash
# Full review with o1-mini (faster, cheaper)
./scripts/review-chapter.sh manuscript/chapter-05-techniques.md comprehensive o1-mini

# Deep review with o1 (best quality, slower)
./scripts/review-chapter.sh manuscript/chapter-05-techniques.md comprehensive o1
```

### Interpreting Reviews

**Review output location:**
```
reviews/chapter-05-techniques-comprehensive-review.md
reviews/chapter-05-techniques-tone-review.md
```

**What to look for:**
- ✅ Strengths: What's working well
- ⚠️ Issues: Specific problems with line numbers
- 💡 Suggestions: Actionable improvements

**Applying feedback:**
1. Read review fully before editing
2. Prioritize critical issues (facts, safety, clarity)
3. Address tone/readability issues in bulk
4. Re-review after major changes

---

## Phase 4: Adding Images

### Planning Image Placement

**Image types needed:**

**Author/Persona (8-12 images):**
- Author portrait (cover, bio)
- Author working in kitchen
- Author presenting dishes
- Author demonstrating techniques

**Food Photography (60-80% of images):**
- Hero shots of finished dishes
- Ingredient close-ups
- Process/technique photos
- Styled plating

**Instructional (10-20 images):**
- Step-by-step processes
- Knife techniques
- Equipment setups

**Infographics (5-10 images):**
- Diagrams (frameworks, timelines)
- Comparison charts
- Visual guides

### Writing Effective Prompts

**Good prompt anatomy:**
```markdown
![SUBJECT + DETAIL + LIGHTING + COMPOSITION + STYLE](path.png)
```

**Examples:**
```markdown
![Professional cookbook author in rustic farmhouse kitchen, holding bowl of vegetable scraps, warm window light from left, candid smile, shallow depth of field](images/chapter-01/001_author.png)

![Overhead flat lay of colorful vegetable scraps on white marble, carrot peels, onion ends, herb stems, bright natural daylight, professional food photography](images/chapter-02/010_scraps.png)

![Golden brown butter in small saucepan, bubbling with nutty solids, stovetop cooking shot, steam rising, warm lighting](images/chapter-05/022_brown-butter.png)
```

### Image Placement Strategy

**Where to place images:**
- After introducing a concept (ingredient photos)
- During technique explanation (process shots)
- After recipe instructions (finished dish)
- At chapter openings (hero images)

**Avoid:**
- Too many images close together (visual fatigue)
- Images without context
- Images that don't add value

---

## Phase 5: Full Manuscript Review

### Batch Review All Chapters

```bash
# Review all 12 chapters with comprehensive analysis
./scripts/review-all-chapters.sh

# Output: reviews/chapter-*-comprehensive-review.md for each chapter
```

### Compare Reviews for Consistency

```bash
# Compare tone across all chapters
grep "Tone" reviews/chapter-*-comprehensive-review.md

# Find all flagged issues
grep "⚠️" reviews/chapter-*-comprehensive-review.md
```

### Address Systematic Issues

**Common issues to fix across all chapters:**
- Voice inconsistency (some chapters too casual, others too academic)
- Recipe format variations
- Inconsistent terminology
- Missing safety warnings

---

## Phase 6: Generate All Images

### Phased Generation

```bash
# Phase 1: Extract manifest
npm run extract-manifest

# Phase 2: Test (first 3 images)
npm run generate:images -- --single 1
npm run generate:images -- --single 2
npm run generate:images -- --single 3

# Phase 3: Author photos (if numbered 1-10)
for i in {1..10}; do npm run generate:images -- --single $i; done

# Phase 4: All remaining
npm run generate:missing
```

**Time estimate:** For 100 images with OpenAI: 2-4 hours

---

## Phase 7: Quality Assurance

### Image QA

```bash
# Review all images
npm run review:images:structured

# Run automated quality loop
npm run quality:loop

# Check results
cat reviews/image-review-summary.json
```

### Content QA

```bash
# Final lint check
npm run lint

# Verify all images present
npm run validate-images

# Check final word count
npm run wordcount
```

---

## Phase 8: Build All Formats

### Complete Build

```bash
# Convert markdown to Typst
npm run convert:typst

# Build all formats
npm run publish:all

# Verify outputs
ls -lh build/
```

**Expected outputs:**
- `drain-salad-print.pdf` (298MB) - Print-on-demand
- `drain-salad-optimized.pdf` (4.7MB) - Digital sales
- `drain-salad.epub` (222MB) - E-readers
- `drain-salad.html` (296KB) - Web preview

### Pre-Flight Checks

**Open each file and verify:**

**Print PDF:**
- ✅ All chapters present
- ✅ Images clear and positioned correctly
- ✅ Bleed extends to edges
- ✅ No blank pages (except intentional)

**EPUB:**
- ✅ Table of contents works
- ✅ Images scale properly
- ✅ Text reflows on different screen sizes

**Optimized PDF:**
- ✅ File size reasonable (<10MB)
- ✅ Images still look good despite compression

---

## Phase 9: Publish to Platforms

See [Playbook #5: Multi-Format Publishing](05-multi-format-publishing.md) for detailed platform upload guides.

**Quick reference:**
- **Amazon KDP Print:** Upload `drain-salad-print.pdf`
- **Amazon KDP Kindle:** Upload `drain-salad.epub`
- **Gumroad:** Upload `drain-salad-optimized.pdf`
- **Itch.io:** Upload both PDF and EPUB

---

## Workflow Optimization Tips

### Version Control with Git

```bash
# Commit after each major milestone
git add manuscript/chapter-05-techniques.md
git commit -m "Complete chapter 5 first draft"

# Commit images separately
git add manuscript/images/chapter-05/
git commit -m "Add chapter 5 images"

# Tag releases
git tag v1.0-first-complete-draft
git tag v2.0-post-review-revisions
```

### Managing Revisions

**Track changes manually:**
```markdown
<!-- Version history at top of file -->
<!--
v1.0 (2025-10-15): First draft
v1.1 (2025-10-18): Addressed tone review feedback
v2.0 (2025-10-20): Comprehensive revision
-->
```

### Automating Builds

**Create a simple build script:**
```bash
#!/bin/bash
# build-quick.sh

echo "Linting..."
npm run lint:fix

echo "Converting to Typst..."
npm run convert:typst

echo "Building PDF..."
npm run build:book

echo "✓ Build complete!"
open build/drain-salad-typst.pdf
```

---

## Common Workflows

### Daily Writing Session

```bash
# 1. Open chapter
code manuscript/chapter-07-salads.md

# 2. Write for 1-2 hours

# 3. Quick checks
npm run lint:fix
npm run wordcount:chapters

# 4. Commit
git add manuscript/chapter-07-salads.md
git commit -m "Add 3 recipes to chapter 7"
```

### Weekly Review Session

```bash
# 1. Review all chapters written this week
./scripts/review-chapter.sh manuscript/chapter-07-salads.md comprehensive

# 2. Read reviews
cat reviews/chapter-07-*-review.md

# 3. Make revisions

# 4. Re-review if major changes
./scripts/review-chapter.sh manuscript/chapter-07-salads.md tone
```

### Monthly Build

```bash
# 1. Full QA
npm run lint
npm run validate-images

# 2. Build all formats
npm run publish:all

# 3. Review outputs
open build/drain-salad-print.pdf
open build/drain-salad.epub

# 4. Tag release
git tag v1.0-$(date +%Y%m%d)
```

---

## Troubleshooting

### Build Errors

**Typst compilation fails:**
```bash
# Check for markdown syntax errors
npm run lint

# Try building single chapter
typst compile typst/chapter-05-techniques.typ /tmp/test.pdf
```

**Images missing:**
```bash
# Verify images exist
npm run validate-images

# Re-generate missing images
npm run generate:missing
```

### Review Issues

**Reviews too generic:**
- Use more specific review types (recipes, facts vs. comprehensive)
- Use better models (o1 vs. gpt-4o-mini)

**Reviews miss obvious errors:**
- Reviews are AI-generated, not perfect
- Use multiple review types
- Have human beta readers

---

## Quick Reference

### Daily Commands
```bash
npm run lint:fix                  # Check syntax
npm run wordcount:chapters        # Track progress
git add . && git commit -m "..."  # Save work
```

### Weekly Commands
```bash
./scripts/review-chapter.sh manuscript/chapter-N.md comprehensive
npm run build:book               # Preview current state
```

### Monthly Commands
```bash
npm run publish:all              # Build all formats
git tag v1.0-YYYYMMDD            # Tag release
```

---

## Next Steps

**You've completed your manuscript! Now:**

1. **Run comprehensive QA** → [Playbook #4: Quality Assurance](04-quality-assurance.md)
2. **Understand image generation** → [Playbook #3: Image Generation](03-image-generation.md)
3. **Publish to platforms** → [Playbook #5: Multi-Format Publishing](05-multi-format-publishing.md)
4. **Explore advanced layouts** → [Playbook #6: Advanced Typst Layouts](06-advanced-layouts.md)

---

**You are now a Drain Salad power user.** You understand the complete workflow from blank page to published book across multiple formats. Keep iterating, keep improving, and ship your cookbook!
