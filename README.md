# Drain Salad: AI-Assisted Cookbook Publishing Platform

**A complete authoring, editorial review, image generation, and multi-format publishing system for professional cookbook production.**

> *"Waste is a modern invention. This is dinner."*

---

## What Is This?

**Drain Salad** is a production-grade cookbook publishing platform that integrates:

- 📝 **Markdown-based manuscript authoring** (37,711 words, 12 chapters, 30+ recipes)
- 🎨 **AI image generation** with character consistency and automated quality loops
- 📋 **Professional editorial review** using GPT-5 pro with extended reasoning
- 📚 **Multi-format publishing** (PDF, EPUB, HTML) with professional typography
- 🔄 **Automated quality assurance** for both images and content
- 🔧 **Git-based version control** for reproducible builds

This isn't just an image generation tool—it's a complete authoring and publishing system.

---

## Quick Start

```bash
# Install dependencies
npm install

# Check your manuscript
npm run wordcount                # 37,711 words across 12 chapters
npm run wordcount:chapters       # Per-chapter breakdown
npm run image-stats              # Current image inventory

# Build the complete book
npm run build:all                # PDF, EPUB, and HTML

# Generate/update images
npm run extract-manifest         # Extract image requirements from markdown
npm run generate:missing         # Generate only missing images
npm run quality:loop             # Run automated quality assurance
```

---

## Platform Overview

### 📖 **Manuscript Authoring**
- Write in **Markdown** with full formatting support (bold, italic, lists, code blocks)
- Define images **inline** with alt text that becomes AI prompts
- Manage 12 chapters + front matter with version control
- Track progress with word count and validation tools

### 🎨 **AI Image Generation**
- **Multiple backends**: OpenAI DALL-E (gpt-image-1), Replicate, ComfyUI, Automatic1111
- **Character consistency**: Reference photos maintain author appearance across 8+ images
- **Context-aware prompts**: Generated from surrounding chapter content
- **Incremental generation**: Only creates missing images, not duplicates
- **Batch workflows**: Priority images → Author photos → Food photography → Infographics

### 🔍 **Quality Assurance**

#### **Image Quality Loop** (Automated)
1. **Structured review**: GPT-4o vision analyzes each image with full chapter context
2. **Automated refinement**: Generates improved prompts based on feedback
3. **Iterative regeneration**: Recreates problematic images with better prompts
4. **Convergence**: Repeats up to 5× until all images pass or plateau detected

#### **Editorial Review** (Professional)
- **GPT-5 pro analysis**: Extended reasoning for deep editorial feedback
- **Multiple review types**: Comprehensive, tone, structure, recipes, facts, readability
- **Batch processing**: Review all 12 chapters systematically
- **Version comparison**: Track changes across review iterations

### 📚 **Multi-Format Publishing**

| Format | Purpose | Size | Specs |
|--------|---------|------|-------|
| **Print PDF** | Amazon KDP print-on-demand | 298MB | 6×9", 0.125" bleed, full-color |
| **EPUB** | E-readers (Kindle, Apple Books) | 222MB | TOC, cover, embedded images |
| **Optimized PDF** | Digital sales (Gumroad, Itch.io) | 4.7MB | Compressed, web-friendly |
| **HTML** | Web viewing, preview | 296KB | Standalone, embedded resources |

---

## Documentation

- **[IMAGE-WORKFLOW.md](IMAGE-WORKFLOW.md)** - Image generation system (backends, prompts, quality loops)
- **[EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md)** - Chapter review workflows and review types
- **[PUBLISHING.md](PUBLISHING.md)** - Building and distribution guide (KDP, Gumroad, etc.)
- **[TYPST-LAYOUT-GUIDE.md](TYPST-LAYOUT-GUIDE.md)** - PDF layout customization

---

## Typical Workflow

### 1️⃣ **Write & Edit Content**
```bash
# Edit chapters in Markdown
nano manuscript/chapter-05-techniques.md

# Define images inline
![Brown butter stages progression](images/chapter-05/022_brown-butter-stages.png)

# Validate syntax
npm run lint
npm run lint:fix  # Auto-fix issues
```

### 2️⃣ **Generate Images**
```bash
# Extract requirements from markdown
npm run extract-manifest
# → Creates generated-manifest.json with all image specs

# Check what's missing
npm run generate:missing --dry-run

# Generate in phases
npm run generate:priority   # Phase 1: 25 priority images
npm run generate:author     # Author photos (8 images)
npm run generate:food       # Food photography
npm run generate:images     # All remaining
```

### 3️⃣ **Quality Assurance**
```bash
# Automated image quality loop
npm run quality:loop
# Runs: review → refine prompts → regenerate → repeat (max 5×)

# Editorial chapter review
./scripts/review-chapter.sh manuscript/chapter-01-history.md comprehensive
npm run review:pro  # GPT-5 pro with extended reasoning
npm run review:all  # Batch review all chapters
```

### 4️⃣ **Build & Publish**
```bash
# Convert markdown to Typst
npm run convert:typst

# Build all formats
npm run publish:all
# Creates:
#   - build/drain-salad-print.pdf (298MB, print-ready)
#   - build/drain-salad-optimized.pdf (4.7MB, digital sales)
#   - build/drain-salad.epub (222MB, e-readers)
#   - build/drain-salad.html (296KB, web)

# Upload to platforms:
# → Amazon KDP (print + EPUB)
# → Gumroad (optimized PDF + EPUB)
# → Itch.io (digital bundle)
```

---

## Project Structure

```
drain-salad/
├── manuscript/              # Source content (37,711 words)
│   ├── chapter-*.md        # 12 chapters in Markdown
│   ├── images/             # AI-generated photography (91 images)
│   │   ├── chapter-01/     # Per-chapter organization
│   │   ├── chapter-02/
│   │   └── reference/      # Author reference photo
│   └── metadata.yaml       # Book metadata
│
├── scripts/                # Build & automation
│   ├── generate-*.js       # Image generation
│   ├── review-*.js         # Quality assurance
│   ├── build-*.js          # Format publishing
│   └── image-backends/     # OpenAI, Replicate, ComfyUI
│
├── typst/                  # PDF layout system
│   ├── book.typ            # Main template (6×9", bleed)
│   ├── template.typ        # Base styling
│   └── *.typ               # Generated chapter files
│
├── build/                  # Published formats (gitignored)
│   ├── drain-salad-print.pdf
│   ├── drain-salad-optimized.pdf
│   ├── drain-salad.epub
│   └── drain-salad.html
│
├── reviews/                # Generated reviews (gitignored)
│   ├── images/             # Individual image reviews (JSON)
│   └── image-review-summary.json
│
├── archive/                # Historical documentation
│   └── old-workflow-docs/  # Previous workflow versions
│
├── package.json            # 50+ npm scripts
├── book-metadata.json      # Title, author, ISBN, pricing
├── Makefile                # Alternative build system
└── .env                    # API credentials (gitignored)
```

---

## Configuration

### API Keys (`.env`)
```bash
# Image Generation Backend
IMAGE_GEN_BACKEND=replicate  # or gpt-image, comfyui, a1111

# API Keys
OPENAI_API_KEY=sk-...        # For GPT Image + editorial review
REPLICATE_API_TOKEN=r8_...   # For Replicate InstantID

# Image Output Settings
OUTPUT_WIDTH=3072
OUTPUT_HEIGHT=2048
OUTPUT_FORMAT=png

# Author Reference Photo (for character consistency)
AUTHOR_REFERENCE_IMAGE=manuscript/images/reference/author-reference.png

# Local APIs (if using ComfyUI/A1111)
COMFYUI_API_URL=http://127.0.0.1:8188
A1111_API_URL=http://127.0.0.1:7860
```

### Book Metadata (`book-metadata.json`)
```json
{
  "title": "Drain Salad: A Treatise on Edible Entropy",
  "subtitle": "Upstream Capture and the Cuisine of Second Harvest",
  "author": "Your Name",
  "description": "Transform kitchen scraps into gourmet food...",
  "keywords": ["cookbook", "zero-waste", "sustainability", "fermentation"],
  "isbn": "...",
  "pricing": {
    "print": 24.99,
    "ebook": 9.99
  }
}
```

---

## Key npm Scripts

### 📝 **Content Management**
```bash
npm run extract-manifest      # Scan markdown for image requirements
npm run validate-images       # Check image consistency
npm run wordcount             # Total: 37,711 words
npm run wordcount:chapters    # Per-chapter breakdown
npm run lint                  # Check markdown syntax
npm run lint:fix              # Auto-fix issues
```

### 🎨 **Image Generation**
```bash
npm run generate:images       # Generate all images
npm run generate:missing      # Only missing images
npm run generate:priority     # Phase 1: 25 priority images
npm run generate:author       # Author photos (8 images)
npm run generate:food         # Food photography
```

### 🔍 **Quality Assurance**
```bash
npm run review:images:structured  # Structured JSON reviews
npm run quality:loop              # Automated improvement loop
npm run quality:loop:full         # Include minor issues
npm run prompts:refine            # Refine prompts from feedback
npm run prompts:refine:preview    # Dry-run preview
```

### 📋 **Editorial Review**
```bash
npm run review                # Single chapter review
npm run review:all            # Batch review all chapters
npm run review:pro            # GPT-5 pro deep analysis
npm run review:compare        # Compare review versions
```

### 📚 **Building & Publishing**
```bash
npm run build:all             # All formats (PDF, EPUB, HTML)
npm run build:book            # PDF via Typst
npm run build:epub            # EPUB e-reader
npm run build:html            # HTML standalone
npm run publish:all           # All publishing formats
npm run publish:print         # Print-ready PDF (298MB)
npm run publish:optimized     # Web PDF (4.7MB)
npm run clean                 # Remove generated files
```

---

## Technical Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Authoring** | Markdown | Human-readable source format |
| **PDF Layout** | Typst | Professional typography & layout |
| **E-book** | Pandoc | EPUB conversion |
| **Image Gen** | OpenAI / Replicate / ComfyUI | AI photography |
| **Review** | GPT-4o / GPT-5 pro | Quality assurance |
| **Build** | Node.js | Orchestration |
| **Version** | Git | Source control |

---

## Book Statistics

- **📊 37,711 words** across 12 chapters + front matter
- **🍽️ 30+ recipes** (23 full recipes, 7 foundation preps)
- **📸 132 images planned** (91 currently generated)
- **⏱️ Build time** ~2-5 minutes for all formats
- **📦 Output sizes**:
  - Print PDF: 298MB (high-resolution)
  - EPUB: 222MB (with embedded images)
  - Optimized PDF: 4.7MB (compressed)
  - HTML: 296KB (without images)

---

## Key Features

✅ **Manuscript-First Design**: Images defined inline, extracted automatically
✅ **Context-Aware Quality**: Reviews consider full chapter text, not just images
✅ **Automated Improvement Loops**: Converges to quality standards automatically
✅ **Character Consistency**: Maintains author appearance across multiple photos
✅ **Multi-Format Output**: Single source → PDF/EPUB/HTML
✅ **Professional Editorial**: GPT-5 pro with cookbook-specific review frameworks
✅ **Publishing-Ready**: Direct to Amazon KDP, Gumroad, Itch.io
✅ **Reproducible Builds**: Git-versioned, deterministic build system
✅ **Extensible Architecture**: Multiple image backends, custom templates
✅ **Production-Grade**: Used for real cookbook publication

---

## Cost Estimates

### Image Generation (132 images)
- **OpenAI gpt-image-1**: ~$17.60 total (best quality + consistency)
- **Replicate InstantID**: ~$4.50 total (budget option with consistency)
- **ComfyUI (local)**: $0 (requires GPU)

### Publishing
- **Amazon KDP**:
  - E-book: Free upload
  - Print: ~$0.85 per unit (650MB file limit)
- **Gumroad**: 10% + $0.30 per sale
- **Itch.io**: Name-your-own revenue share

---

## Troubleshooting

### Image Generation Issues
```bash
# Verify backend configuration
echo $IMAGE_GEN_BACKEND

# Test with single image
npm run generate:images -- --single 1

# Check API keys
grep OPENAI_API_KEY .env
grep REPLICATE_API_TOKEN .env
```

### Build Failures
```bash
# Clean and rebuild
npm run clean
npm run convert:typst
npm run build:all

# Verify Typst installation
typst --version  # Should be v0.11.0+

# Check Pandoc
pandoc --version  # Should be v2.0+
```

### Quality Loop Issues
```bash
# Ensure reviews directory exists
mkdir -p reviews/images

# Test review system
npm run review:images:structured

# Check prompt refinement
npm run prompts:refine:preview --dry-run
```

---

## Content Overview

### **Part I: Foundations** (Chapters 1-6)
1. **History** - Medieval kitchens to modern sustainability
2. **Anatomy** - 6-element framework for scrap cooking
3. **Clean-Catch** - Food safety system for salvaged ingredients
4. **Drain Pantry** - Tiered ingredient infrastructure
5. **Techniques** - 10 core methods (blanching, roasting, fermentation)
6. **Foundations** - 7 essential preparations (brown butter crumbs, garlic confit, etc.)

### **Part II: Recipes** (Chapters 7-9)
7. **Salads & Small Plates** - 8 recipes (Sludge Caesar, Citrus Peel Salad, etc.)
8. **Mains** - 8 substantial dishes (Scrap Frittata, Root Vegetable Soup, etc.)
9. **Ferments & Condiments** - 7 preserves (Fermented Hot Sauce, Herb Chimichurri, etc.)

### **Part III: Application** (Chapters 10-12)
10. **Taxonomy** - 8 scrap variety categories
11. **Use Cases** - 10 real-world scenarios (Sunday Meal Prep, Broke Week, Dinner Party)
12. **Appendices** - Reference materials, conversions, troubleshooting

---

## Requirements

- **Node.js** 16+ (for build scripts)
- **Pandoc** 2.0+ (for EPUB/HTML conversion)
- **Typst** 0.11.0+ (for PDF layout)
- **API Keys**: OpenAI (recommended) or Replicate

---

## License

**UNLICENSED** - Private project for personal cookbook publication

---

## Support & Documentation

- **Setup Issues**: See `.env.example` for configuration template
- **Image Workflows**: Read [IMAGE-WORKFLOW.md](IMAGE-WORKFLOW.md)
- **Editorial Review**: Read [EDITORIAL-REVIEW.md](EDITORIAL-REVIEW.md)
- **Publishing Guide**: Read [PUBLISHING.md](PUBLISHING.md)
- **Layout Customization**: Read [TYPST-LAYOUT-GUIDE.md](TYPST-LAYOUT-GUIDE.md)
- **Archive**: Historical documentation in `archive/old-workflow-docs/`

---

**Drain Salad Platform** - Because your cookbook deserves professional production tools.

*Built with AI assistance using Claude Code*
