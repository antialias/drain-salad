# Playbook #8: Migrating Existing Manuscripts

**Goal:** Bring existing cookbook content into the Drain Salad platform without starting from scratch.

**Who This Is For:** Authors with existing manuscripts in Word, Google Docs, InDesign, or PDF wanting to use Drain Salad's automation.

---

## Why Migrate?

**Benefits:**
- AI image generation (avoid expensive photography)
- Automated editorial reviews
- Multi-format publishing (print, EPUB, PDF, HTML)
- Professional typography with Typst
- Git version control

**Effort:** 2-8 hours for typical cookbook (varies by source format)

---

## Migration Overview

```
Source Content → Convert to Markdown → Restructure → Generate Images → Build
```

---

## Option 1: From Google Docs

**Recommended for:** Most authors (easiest conversion)

### Step 1: Export from Google Docs

1. Open your Google Doc
2. File → Download → Microsoft Word (.docx)
3. Save to your computer

### Step 2: Convert with Pandoc

```bash
# Convert DOCX to Markdown
pandoc your-cookbook.docx -o manuscript/draft.md --extract-media=manuscript/images

# This creates:
# - manuscript/draft.md (your content)
# - manuscript/images/media/* (any embedded images)
```

### Step 3: Split into Chapters

```bash
# Manually split draft.md into chapters
# Look for chapter headings, create separate files:

# manuscript/chapter-01-introduction.md
# manuscript/chapter-02-techniques.md
# etc.
```

### Step 4: Review and Clean

```bash
# Check markdown syntax
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Manually review each chapter
```

---

## Option 2: From Microsoft Word

**Same as Google Docs workflow**

### Direct Pandoc Conversion

```bash
pandoc your-cookbook.docx -o manuscript/draft.md --extract-media=manuscript/images
```

**Common issues:**

**Tables:** May need manual reformatting
```markdown
<!-- Pandoc output (may be messy) -->
| Ingredient | Amount |
|------------|--------|
| Butter     | 2 tbsp |

<!-- Clean it up if needed -->
**Ingredients:**
- 2 tbsp butter
```

**Images:** Pandoc extracts to `manuscript/images/media/`
```bash
# Move to chapter directories
mv manuscript/images/media/image1.png manuscript/images/chapter-01/001_introduction.png
```

---

## Option 3: From InDesign

**Recommended for:** Professional cookbook projects with complex layouts

### Step 1: Export Text

1. InDesign → File → Export → Text
2. Save as plain text (.txt) or RTF

### Step 2: Convert

```bash
# If RTF
pandoc your-cookbook.rtf -o manuscript/draft.md

# If plain text, copy-paste into markdown files
```

### Step 3: Handle Images

**InDesign images need special attention:**

1. **Export images:** File → Export → JPG/PNG
2. **Organize:** Move to `manuscript/images/chapter-*/`
3. **Decide:** Keep existing images OR regenerate with AI

**Keep existing if:**
- Professional photography already paid for
- Images meet print quality (300 DPI, high res)
- Food styling is professional

**Regenerate with AI if:**
- Images are low quality or stock photos
- Inconsistent photography style
- Want to save on photography costs

---

## Option 4: From PDF

**Difficulty:** Hard (PDF is not editable format)

### Using Pandoc (Limited Success)

```bash
pandoc your-cookbook.pdf -o manuscript/draft.md
```

**Problems:**
- Text may be garbled
- Images often lost
- Formatting rarely survives

**Better approach:** Use OCR or manual re-typing for PDF sources

### Alternative: PDF to Word → Markdown

1. Use Adobe Acrobat or online converter (PDF → DOCX)
2. Clean up Word document
3. Follow "From Microsoft Word" workflow

---

## Handling Recipe Format Migration

### Common Source Format

```
Recipe Name: Brown Butter Crumbs
Yield: 1 cup
Time: 10 minutes

Ingredients:
4 tablespoons butter
1 cup breadcrumbs
Salt to taste

Instructions:
1. Melt butter in pan over medium heat.
2. Add breadcrumbs and toast until golden.
3. Season with salt.
```

### Convert to Drain Salad Markdown

```markdown
### Brown Butter Crumbs

**Yield:** 1 cup
**Prep Time:** 5 minutes
**Cook Time:** 5 minutes

Brief description of this recipe.

**Ingredients:**
- 4 tbsp butter
- 1 cup breadcrumbs
- Salt to taste

**Instructions:**

1. Melt butter in pan over medium heat.
2. Add breadcrumbs and toast until golden, about 3-4 minutes.
3. Season with salt to taste.

**Notes:** Store in airtight container for up to 1 week.
```

**Key changes:**
- Add `###` heading
- Use `**Bold:**` for metadata
- Bullet lists for ingredients (`-`)
- Numbered lists for instructions
- Add notes section

---

## Image Migration Strategy

### Decision Matrix

| Your Situation | Recommendation |
|----------------|----------------|
| **No images yet** | Generate all with AI |
| **Stock photos only** | Replace with AI |
| **Professional photography** | Keep existing, supplement with AI |
| **Mix of good/bad** | Keep good, regenerate bad |
| **High-res author photos** | Keep, use as reference for AI |

### Keeping Existing Images

```bash
# 1. Move images to correct directories
mkdir -p manuscript/images/chapter-01
cp /old/project/images/*.jpg manuscript/images/chapter-01/

# 2. Rename to match convention
mv photo1.jpg 001_brown-butter-stages.png
mv photo2.jpg 002_finished-crumbs.png

# 3. Reference in markdown
![Brown butter in stages](images/chapter-01/001_brown-butter-stages.png)
```

**Verify image quality:**
```bash
# Check resolution
file manuscript/images/chapter-01/001_*.png
# Should be at least 2048x1536 for print

# Check file size
ls -lh manuscript/images/chapter-01/
# Each image: 500KB-5MB is typical
```

---

## Preserving Complex Formatting

### Sidebars/Callouts

**Source (Word/Google Docs):**
> Text box with chef's tip

**Markdown (Drain Salad):**
```markdown
> **Chef's Tip:** Save vegetable scraps in the freezer...
```

**Typst (Advanced):**
```typst
#callout(type: "tip")[
  Save vegetable scraps in the freezer...
]
```

---

### Multi-Column Layouts

**InDesign:** Two-column ingredient list

**Markdown:** Linear list (Typst handles layout)
```markdown
**Ingredients:**
- Ingredient 1
- Ingredient 2
```

**Typst (Advanced):**
```typst
#two-column-recipe(
  ingredients: [...],
  instructions: [...]
)
```

---

## Metadata Migration

### Extract from Existing Manuscript

**Common metadata:**
- Title
- Subtitle
- Author name
- Copyright year
- ISBN (if published before)

### Create `book-metadata.json`

```json
{
  "title": "Your Cookbook Title",
  "subtitle": "Descriptive Subtitle",
  "author": "Your Name",
  "copyright": "2025",
  "isbn": "978-...",
  "description": "Full description for Amazon/Gumroad",
  "keywords": ["keyword1", "keyword2"]
}
```

---

## Testing Your Migration

### Step-by-Step Validation

**1. Convert first chapter only**
```bash
# Convert Chapter 1
pandoc chapter-1.docx -o manuscript/chapter-01-test.md

# Build just this chapter
npm run convert:typst
npm run build:book

# Review output
open build/drain-salad-typst.pdf
```

**2. If Chapter 1 looks good, proceed with remaining chapters**

**3. Full validation**
```bash
# Lint all chapters
npm run lint

# Count words (verify all content migrated)
npm run wordcount

# Build all formats
npm run publish:all
```

---

## Common Migration Issues

### Problem: Lost Formatting

**Symptom:** Bold, italic, lists don't convert

**Fix:** Manually re-add markdown formatting:
```markdown
**Bold text**
*Italic text*
- Bullet list
```

---

### Problem: Broken Image Links

**Symptom:** Images don't appear after conversion

**Fix:**
```bash
# Find broken links
npm run lint

# Manually fix paths
![Image](images/chapter-01/001_image.png)  # Correct path
```

---

### Problem: Recipe Format Inconsistent

**Symptom:** Some recipes formatted differently

**Fix:** Use find-and-replace to standardize:
```markdown
# Before (varied)
Yield: 4 servings
Makes: 4 servings
Serves: 4

# After (standardized)
**Yield:** 4 servings
```

---

## Migration Checklist

**Before starting:**
- [ ] Backup original files
- [ ] Choose source format (DOCX recommended)
- [ ] Plan image strategy (keep/replace/hybrid)

**During migration:**
- [ ] Convert to markdown with Pandoc
- [ ] Split into chapter files
- [ ] Lint and fix syntax
- [ ] Migrate or generate images
- [ ] Test build on sample chapter

**After migration:**
- [ ] Full lint check (`npm run lint`)
- [ ] Validate images (`npm run validate-images`)
- [ ] Build all formats (`npm run publish:all`)
- [ ] Review outputs for quality
- [ ] Run editorial reviews
- [ ] Commit to git

---

## Time Estimates

| Manuscript Size | Basic Migration | With Image Generation | With QA |
|-----------------|-----------------|----------------------|---------|
| **50 pages** | 2-3 hours | 4-6 hours | 8-12 hours |
| **150 pages** | 4-6 hours | 8-12 hours | 16-24 hours |
| **300+ pages** | 8-12 hours | 16-24 hours | 32-48 hours |

**Factors affecting time:**
- Source format cleanliness
- Number of recipes
- Image count
- Complexity of layouts

---

## Quick Reference

### Conversion Commands

```bash
# DOCX → Markdown
pandoc file.docx -o output.md --extract-media=images/

# RTF → Markdown
pandoc file.rtf -o output.md

# PDF → Markdown (limited success)
pandoc file.pdf -o output.md
```

### Validation Commands

```bash
npm run lint                # Check markdown syntax
npm run wordcount           # Verify word count
npm run validate-images     # Check image links
npm run build:book          # Test build
```

---

## Next Steps After Migration

1. **Generate images** → [Playbook #3: Image Generation](03-image-generation.md)
2. **Run QA** → [Playbook #4: Quality Assurance](04-quality-assurance.md)
3. **Publish** → [Playbook #5: Multi-Format Publishing](05-multi-format-publishing.md)

---

**Migration** unlocks Drain Salad's power for existing manuscripts. The initial conversion takes effort, but the automation, multi-format publishing, and professional quality make it worthwhile.
