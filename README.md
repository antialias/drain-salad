# Drain Salad: A Treatise on Edible Entropy

**A cookbook about transforming kitchen scraps into gourmet food—with automated AI image generation**

> *"Waste is a modern invention. This is dinner."*

---

## What Is This?

A complete, publishable cookbook (37,700 words, 30 recipes) about "Drain Salad" cooking—turning vegetable scraps, stale bread, and kitchen offcuts into genuinely delicious meals.

The book includes:
- 12 chapters covering history, technique, and recipes
- Personal stories and specific failures (Moby + Neil Strauss style voice)
- Scientific explanations (Maillard reactions, fermentation, emulsification)
- **Automated AI image generation** with character consistency for author photos

---

## Quick Start

### 1. Build the Book

```bash
npm install
npm run build
```

Outputs:
- `build/drain-salad.epub` (for e-readers)
- `build/drain-salad.html` (for web viewing)

### 2. Generate Images

```bash
# Set up configuration
cp .env.example .env
# Add your Replicate API token to .env

# Generate first author photo (becomes reference)
npm run generate:images -- --single 2

# Generate all priority images (25 images)
npm run generate:priority
```

See [IMAGE-GENERATION-SETUP.md](IMAGE-GENERATION-SETUP.md) for complete guide.

---

## Key Features

### ✅ Complete Manuscript (37,700 words)
- 12 chapters + front matter
- 30 recipes (23 full + 7 foundation preparations)
- Research-backed content with personal voice
- Prank/profound balance throughout

### ✅ AI Image Generation with Reference Photos
- **Character consistency** - Author looks the same across all photos
- **Reference image support** via OpenAI GPT Image, Replicate InstantID, or IP-Adapter
- **Multiple backends** - GPT Image (best), Replicate (budget), or local ComfyUI
- **Automated workflow** with npm scripts
- **132 images** cataloged and ready to generate

### ✅ Professional Publishing Toolchain
- Markdown → EPUB, HTML, PDF via Pandoc
- Custom CSS styling for cookbooks
- Automated builds and editorial reviews
- Git version control with semantic commits

---

## Project Structure

```
drain-salad/
├── manuscript/                  # Markdown chapters
│   ├── 00-front-matter.md
│   ├── chapter-01-history.md
│   ├── chapter-02-anatomy.md
│   ├── ...chapter-12-appendices.md
│   └── images/                  # Generated photography
│
├── scripts/
│   ├── generate-images.js       # Image generation orchestrator
│   ├── image-backends/
│   │   ├── dalle.js             # OpenAI GPT Image (gpt-image-1)
│   │   ├── replicate.js         # Replicate API (InstantID)
│   │   └── comfyui.js           # Local ComfyUI support
│   └── image-prompts/           # 82 generated prompt files
│
├── assets/css/
│   └── drain-salad.css          # Cookbook styling
│
├── IMAGE-GENERATION-SETUP.md    # Complete setup guide
└── image-manifest.md            # Image specifications
```

---

## Image Generation

### How Character Consistency Works

1. **Generate first author photo** from text description
2. **Save as reference** automatically
3. **All subsequent photos** use face reference
4. **InstantID maintains** facial features across contexts

```bash
# Generate author reference photo
npm run generate:images -- --single 2

# Generate all author photos (uses reference)
npm run generate:author

# Generate food photography
npm run generate:food

# Generate all priority images
npm run generate:priority
```

### Example

**First Photo (No Reference):**
```
"Italian-American man, late 20s, dark wavy hair, olive skin, 
 at kitchen counter with prep scraps visible, documentary style"
```
→ Saved as `manuscript/images/reference/author-reference.png`

**Subsequent Photos (With Reference):**
```
face_image: (base64 of reference photo)
"Same person from reference, now at stove cooking pasta..."
```
→ Same face, different context

---

## npm Scripts

```bash
# Building
npm run build              # EPUB + HTML
npm run build:all          # EPUB + HTML + PDF
npm run watch              # Auto-rebuild on changes

# Images
npm run generate:images    # Generate all images
npm run generate:priority  # Phase 1 (25 priority images)
npm run generate:author    # Author photos only (8 images)
npm run generate:food      # Food photography only
npm run image-prompts      # Regenerate prompt files
npm run image-stats        # Count generated images

# Development
npm run lint               # Check markdown
npm run wordcount          # Total word count
```

---

## Content Summary

### Part I: Foundations (Chapters 1-6)
1. History of scrap cooking
2. 6-element framework
3. Clean-Catch food safety system
4. Tiered pantry infrastructure
5. 10 core techniques
6. 7 essential preparations

### Part II: Recipes (Chapters 7-9)
7. 8 salads & small plates
8. 8 substantial mains
9. 7 ferments & condiments

### Part III: Application (Chapters 10-12)
10. 8 variety categories
11. 10 use case scenarios
12. Reference materials & troubleshooting

---

## Statistics

- **Words:** 37,711
- **Pages:** ~150-165 (est.)
- **Recipes:** 30 total
- **Images:** 132 planned (82 prompts generated)
- **Build time:** ~2 minutes

---

## Cost Estimates

**Image Generation:**
- **GPT Image (OpenAI):** ~$5.50 (25 priority) / ~$17.60 (all 82) - Best quality + consistency
- **Replicate API:** ~$2.50 (25 priority) / ~$4.50 (all 82) - Budget option with consistency
- **ComfyUI (Local):** $0 (requires GPU) - Full control

**Publishing (Amazon KDP):**
- Ebook: Free
- Print: ~$0.85 per unit

---

## Publishing Roadmap

### ✅ Completed
- Complete manuscript (37,711 words)
- Voice refinement
- Image system infrastructure
- Professional CSS styling
- Build toolchain

### 🔄 Next Steps
- Generate priority images (25 images)
- Integrate images into manuscript
- Final EPUB with images
- Cover design
- KDP submission

---

## Technical Details

### Image Generation Backends

**OpenAI GPT Image (gpt-image-1) - Recommended:**
- Responses API with `image_generation` tool
- **High input fidelity** for reference image preservation
- Superior instruction following and text rendering
- **Output:** 1536x1024px PNG (high quality)

**Replicate API - Budget Option:**
- **InstantID model** for face consistency
- **Author photos:** `identitynet_strength_ratio: 0.8`
- **Food photos:** Stable Diffusion XL
- **Output:** 3072x2048px PNG

### CSS Styling
- Georgia (body) / Helvetica (headers)
- Warm earth tones
- Recipe-specific formatting
- Print-optimized page breaks

---

## Documentation

- [IMAGE-GENERATION-SETUP.md](IMAGE-GENERATION-SETUP.md) - Setup guide
- [IMAGE-GENERATION-WORKFLOW.md](IMAGE-GENERATION-WORKFLOW.md) - Manual workflow
- [image-manifest.md](image-manifest.md) - Complete image specs
- [.narrator-voice.md](.narrator-voice.md) - Writing style guide

---

## Requirements

- Node.js 16+
- Pandoc 2.0+
- Replicate API key (or local GPU for ComfyUI)

---

## License

UNLICENSED - Private project

---

*Drain Salad: Because your scraps deserve better than the compost bin.*
