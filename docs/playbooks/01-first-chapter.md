# Playbook #1: Zero to First Chapter

**Goal:** Take a complete beginner from project setup to seeing their first chapter as a professional PDF in 60-90 minutes.

**Who This Is For:** First-time users, non-technical authors, anyone wanting to validate that Drain Salad works before committing to a full manuscript.

---

## What You'll Achieve

By the end of this playbook, you will have:

- ✅ A working Drain Salad environment on your computer
- ✅ Your first chapter written in Markdown
- ✅ 2-3 AI-generated images for your chapter
- ✅ A professional PDF of your chapter you can preview
- ✅ Confidence that the platform works for your cookbook

**Time Estimate:** 60-90 minutes (including environment setup)

---

## Prerequisites

### What You Need

- **A computer** running macOS, Linux, or Windows (with WSL)
- **Basic command line comfort** (can navigate directories, run commands)
- **Your first chapter content** (can be in Google Docs, Word, or plain text - about 2,000-4,000 words)
- **API key** for image generation (OpenAI recommended for beginners - get one at platform.openai.com)

### What You Don't Need

- Programming experience
- Design skills
- Professional photography

---

## Step 1: Environment Setup (20-30 minutes)

### 1.1 Install Required Software

You need three pieces of software. Open your terminal and verify each:

```bash
# Check Node.js (need version 16+)
node --version
# If not installed: Download from nodejs.org

# Check Pandoc (need version 2.0+)
pandoc --version
# If not installed:
#   macOS: brew install pandoc
#   Linux: sudo apt-get install pandoc
#   Windows: Download from pandoc.org

# Check Typst (need version 0.11.0+)
typst --version
# If not installed:
#   macOS: brew install typst
#   Linux: Download from typst.app
#   Windows: Download from typst.app
```

**Checkpoint:** All three commands should show version numbers. If not, install the missing software before continuing.

---

### 1.2 Clone or Download Drain Salad

```bash
# If you have the source code, navigate to it
cd /path/to/drain-salad

# Install Node dependencies
npm install

# Verify installation
npm run wordcount
```

**Expected output:** You should see word counts for the existing manuscript. This confirms npm scripts are working.

---

### 1.3 Configure API Keys

Create a `.env` file in the project root:

```bash
# Create .env file
touch .env

# Open in your text editor and add:
```

**Recommended configuration for beginners:**

```bash
# Image Generation Backend
IMAGE_GEN_BACKEND=gpt-image

# OpenAI API Key
OPENAI_API_KEY=sk-your-key-here

# Image Settings (good defaults)
OUTPUT_WIDTH=3072
OUTPUT_HEIGHT=2048
OUTPUT_FORMAT=png
```

**Where to get your API key:**
1. Go to platform.openai.com
2. Sign up or log in
3. Navigate to API Keys section
4. Create new secret key
5. Copy and paste into `.env` file

**Checkpoint:** Your `.env` file exists and contains your API key.

---

## Step 2: Prepare Your First Chapter (10-15 minutes)

### 2.1 Convert Your Content to Markdown

**If you have Google Docs or Word:**

1. **Option A: Use Pandoc (Recommended)**
```bash
# Convert Word document
pandoc your-chapter.docx -o temp-chapter.md

# Convert from Google Docs (export as DOCX first, then convert)
pandoc exported-doc.docx -o temp-chapter.md
```

2. **Option B: Manual conversion** (copy-paste, then format)

**Markdown Essentials for Cookbooks:**

```markdown
# Chapter 1: Your Chapter Title

Narrative text goes here as regular paragraphs.

## Section Heading

More text here.

### Subsection

**Bold text** for emphasis
*Italic text* for subtle emphasis

- Bulleted list item 1
- Bulleted list item 2

1. Numbered list item 1
2. Numbered list item 2

![Description of image](images/chapter-01/001_image-name.png)
```

**Recipe Format Example:**

```markdown
## Scrap Stock

**Yield:** 8 cups
**Active Time:** 15 minutes
**Total Time:** 4 hours

**Ingredients:**
- 4 cups vegetable scraps (carrot peels, onion ends, celery tops)
- 8 cups cold water
- 2 bay leaves
- 1 tsp black peppercorns

**Instructions:**

1. Combine all scraps in a large pot with cold water.
2. Bring to a boil, then reduce to bare simmer.
3. Simmer uncovered for 3-4 hours.
4. Strain through fine-mesh sieve.
5. Store in refrigerator for up to 5 days, or freeze.

**Notes:** Best scraps include alliums, herbs, and root vegetables. Avoid brassicas (cabbage, broccoli) which make stock bitter.
```

---

### 2.2 Create Your Chapter File

```bash
# Create your chapter file in the manuscript directory
touch manuscript/chapter-01-my-first-chapter.md

# Open in your text editor
# nano manuscript/chapter-01-my-first-chapter.md
# or use VS Code, Sublime, etc.
```

**Paste your converted content and save.**

---

### 2.3 Add Image Placeholders

For now, add 2-3 image placeholders where you want images to appear:

```markdown
![Author photo in kitchen](images/chapter-01/001_author-in-kitchen.png)

![Overhead shot of vegetable scraps](images/chapter-01/002_vegetable-scraps.png)

![Finished stock in jars](images/chapter-01/003_finished-stock.png)
```

**Important:** The alt text (description in brackets) will become the AI prompt, so be descriptive!

**Better alt text examples:**
- ❌ "Author photo"
- ✅ "Professional food blogger in bright modern kitchen, holding bowl of vegetable scraps, warm natural lighting"

- ❌ "Vegetable scraps"
- ✅ "Overhead flat lay of colorful vegetable scraps on white marble, carrot peels, onion ends, celery tops, rustic kitchen aesthetic"

**Checkpoint:** Your chapter file exists in `manuscript/` with content and 2-3 image placeholders.

---

## Step 3: Generate Your First Images (15-20 minutes)

### 3.1 Extract Image Requirements

```bash
# Scan your chapter and generate image manifest
npm run extract-manifest
```

**What this does:** Reads your markdown file, finds all image references, and creates `generated-manifest.json` with prompts extracted from your alt text.

**Verify it worked:**
```bash
# Check the manifest
cat generated-manifest.json | head -20
```

You should see your images listed with prompts.

---

### 3.2 Generate Your First Image (Test)

Let's generate just image #1 first to verify everything works:

```bash
# Generate only the first image
npm run generate:images -- --single 1
```

**What to expect:**
- This will take 30-60 seconds
- You'll see progress messages
- When complete, check `manuscript/images/chapter-01/001_*.png`

**Checkpoint:** Your first image exists and looks reasonable.

---

### 3.3 Generate Remaining Chapter Images

If the first image worked, generate the rest:

```bash
# Generate images 2 and 3
npm run generate:images -- --single 2
npm run generate:images -- --single 3

# OR generate all missing images for your chapter
npm run generate:missing
```

**Checkpoint:** All 3 images exist in `manuscript/images/chapter-01/`

---

## Step 4: Build Your First Chapter (10-15 minutes)

### 4.1 Convert to Typst Format

```bash
# Convert your markdown chapter to Typst
npm run convert:typst
```

**What this does:** Converts `manuscript/chapter-01-*.md` to `typst/chapter-01-*.typ`

---

### 4.2 Build PDF

```bash
# Build the complete book (including your chapter)
npm run build:book
```

**What this does:** Compiles all Typst files into `build/drain-salad-typst.pdf`

**What to expect:**
- This takes 30-60 seconds
- You'll see compilation messages
- Output: `build/drain-salad-typst.pdf`

---

### 4.3 Preview Your Chapter

```bash
# Open the PDF (macOS)
open build/drain-salad-typst.pdf

# Linux
xdg-open build/drain-salad-typst.pdf

# Windows (WSL)
explorer.exe build/drain-salad-typst.pdf
```

**Find your chapter** in the PDF and verify:
- ✅ Text formatted correctly
- ✅ Images appear in right places
- ✅ Recipe format looks professional
- ✅ Headings and structure are clear

**Checkpoint:** You can see your chapter as a professional PDF!

---

## Step 5: Iterate and Improve (Optional)

### 5.1 Improve Image Prompts

If an image doesn't look right, edit the alt text in your markdown file:

```markdown
<!-- Before -->
![Stock pot](images/chapter-01/003_finished-stock.png)

<!-- After -->
![Large stainless steel pot with golden vegetable stock, steam rising, on modern stovetop, bright professional kitchen, food photography, shallow depth of field](images/chapter-01/003_finished-stock.png)
```

Then regenerate:

```bash
# Re-extract manifest with new prompts
npm run extract-manifest

# Regenerate just that image
npm run generate:images -- --single 3

# Rebuild PDF
npm run build:book
```

---

### 5.2 Get Editorial Feedback

```bash
# Run a quick readability check
./scripts/review-chapter.sh manuscript/chapter-01-my-first-chapter.md readability

# Or get comprehensive feedback
./scripts/review-chapter.sh manuscript/chapter-01-my-first-chapter.md comprehensive
```

**Review output** will be saved to `reviews/chapter-01-*-review.md`

Open and read the feedback. Look for:
- Tone consistency issues
- Unclear recipe instructions
- Structure improvements
- Readability problems

---

### 5.3 Make Revisions

Based on the review:

1. Edit your markdown file with improvements
2. Re-run `npm run build:book` to see changes
3. Optionally re-review to see if issues are fixed

---

## Troubleshooting

### Images Won't Generate

**Problem:** API errors or timeout

**Solutions:**
```bash
# Check your API key
grep OPENAI_API_KEY .env

# Verify you have credits
# Check platform.openai.com/account/usage

# Try a different backend
# Edit .env: IMAGE_GEN_BACKEND=replicate
# (You'll need a Replicate API key)
```

---

### PDF Won't Build

**Problem:** Typst compilation errors

**Solutions:**
```bash
# Check for markdown syntax errors
npm run lint

# Fix common issues
npm run lint:fix

# Verify Typst can read your file
typst compile --root . typst/chapter-01-*.typ /tmp/test.pdf
```

---

### Images Look Wrong

**Problem:** Generated images don't match your vision

**Solutions:**
- **Make prompts more specific:** Add lighting, composition, style details
- **Use reference images:** If you have an author photo, set `AUTHOR_REFERENCE_IMAGE` in `.env`
- **Try a different backend:** OpenAI vs. Replicate have different styles
- **Iterate:** It often takes 2-3 generations to get it right

**Better prompt example:**
```markdown
<!-- Vague -->
![Kitchen scene](...)

<!-- Specific -->
![Modern farmhouse kitchen with white subway tile backsplash, wooden cutting board with colorful vegetable scraps, soft window light from left, shallow depth of field, professional food photography, warm tones](...)
```

---

## What's Next?

You've successfully:
- ✅ Set up your environment
- ✅ Written a chapter in Markdown
- ✅ Generated AI images
- ✅ Built a professional PDF

### Next Steps:

1. **Add more chapters:** Follow the same process for Chapter 2, 3, etc.
2. **Learn the complete workflow:** See [Playbook #2: Complete Authoring Workflow](02-complete-authoring.md)
3. **Master image generation:** See [Playbook #3: AI Image Generation](03-image-generation.md)
4. **Explore quality assurance:** See [Playbook #4: Quality Assurance Workflows](04-quality-assurance.md)
5. **Publish to platforms:** See [Playbook #5: Multi-Format Publishing](05-multi-format-publishing.md)

---

## Quick Reference Commands

```bash
# Extract images from markdown
npm run extract-manifest

# Generate specific image
npm run generate:images -- --single N

# Generate all missing
npm run generate:missing

# Build PDF
npm run build:book

# Review chapter
./scripts/review-chapter.sh manuscript/chapter-01-*.md comprehensive

# Check syntax
npm run lint
```

---

**Congratulations!** You've completed your first chapter in Drain Salad. The hardest part is behind you - from here, it's just repeating this process for the rest of your cookbook.

**Questions or stuck?** See [Playbook #7: Troubleshooting](07-troubleshooting.md) or check the main documentation.
