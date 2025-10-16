# Drain Salad Image Generation Workflow

This document explains how to generate the 132 images needed for the cookbook using AI image generation tools.

## Overview

The book needs professional-quality images across four categories:
- **Author photos** (8 images) - Must maintain character consistency
- **Food photography** (97 images) - Hero shots and process sequences
- **Infographics** (18 images) - Charts, timelines, diagrams
- **Comparison shots** (9 images) - Before/after, correct/incorrect

## Prerequisites

### Image Generation Tools (Choose One or More)

1. **Midjourney** (Recommended for character consistency)
   - Best for author photos using `--cref` for character reference
   - Excellent for food photography
   - Subscription required

2. **DALL-E 3** (via ChatGPT Plus or API)
   - Good general purpose
   - Can maintain some consistency with detailed prompts
   - Subscription or API credits required

3. **Stable Diffusion** (Local or via services)
   - Can train LoRA/DreamBooth for character consistency
   - Free if run locally
   - Steeper learning curve

4. **Other options:**
   - Adobe Firefly
   - Leonardo.ai
   - Any other high-quality image generation service

## Step-by-Step Workflow

### Step 1: Generate Image Prompts

Run the prompt generation script:

```bash
npm run image-prompts
```

This will:
- Parse `image-manifest.md`
- Extract author visual reference from `.author-visual-reference.md`
- Generate 132 individual prompt files in `scripts/image-prompts/`
- Create a priority list of must-have images for Phase 1

**Output:**
- `scripts/image-prompts/001_cover-image.txt` through `132_...txt`
- `scripts/image-prompts/000_PRIORITY_LIST.txt`

### Step 2: Start with Priority Images (Phase 1)

Open `scripts/image-prompts/000_PRIORITY_LIST.txt` to see which images to generate first.

**Priority Phase 1 (~25 images):**
- Cover image
- Author photo for bio
- One hero shot per chapter (12 images)
- Key process shots for Chapter 6 (Foundations)
- Critical comparison shots

These are sufficient for a functional first version of the book.

### Step 3: Generate Author Photos First (Character Reference)

**Critical:** Generate 1-2 author reference photos before others to establish consistency.

1. **Read** `scripts/image-prompts/002_author-photo-about-page.txt`

2. **Generate** the image using your chosen tool

3. **Save** as `manuscript/images/front-matter/002_author-photo-about-page.png`

4. **For subsequent author photos:**
   - **Midjourney:** Use `--cref <URL of first image>`
   - **DALL-E:** Include "same person as previous image" in prompt
   - **Stable Diffusion:** Train LoRA on first image or use it as img2img seed

### Step 4: Generate Remaining Images

For each priority image:

1. **Read prompt file:** `scripts/image-prompts/XXX_image-name.txt`

2. **Copy the prompt** from the "PROMPT FOR IMAGE GENERATION" section

3. **Generate image** using your tool

4. **Save to correct location:**
   ```
   manuscript/images/
     ├── front-matter/     (images 1-2)
     ├── chapter-01/       (images 3-8)
     ├── chapter-02/       (images 9-14)
     ├── chapter-03/       (images 15-26)
     └── ...
   ```

5. **Name correctly:** `XXX_image-name.png` (matching prompt filename)

### Step 5: Review and Iterate

After generating a batch:

```bash
npm run image-stats
```

Review images for:
- **Quality:** High resolution (3000px+ width)
- **Consistency:** Author looks the same across photos
- **Style:** Matches book aesthetic (warm, editorial, not overly styled)
- **Accuracy:** Matches description in prompt

Regenerate if needed.

### Step 6: Integrate Images into Manuscript

Once you have images, add them to the markdown:

```markdown
![Alt text](images/chapter-name/XXX_image-name.png)
*Caption describing the image*
```

Or for better layout control:

```markdown
<figure>
  <img src="images/chapter-name/XXX_image-name.png" alt="Description" />
  <figcaption>Caption text here</figcaption>
</figure>
```

### Step 7: Rebuild with Images

```bash
npm run build
```

This will:
- Include all images in the EPUB
- Apply custom CSS styling
- Generate properly formatted HTML with images

## Character Consistency Strategy

### For Midjourney:

1. Generate first author photo
2. Save the image URL
3. For subsequent author photos, add to prompt:
   ```
   --cref https://s.mj.run/your-image-url-here
   ```

### For DALL-E:

1. Generate first author photo with detailed description
2. For subsequent photos, include:
   ```
   Same Italian-American man as previous image (late 20s, dark wavy
   hair pulled back, 2-day stubble, olive skin), now [new context]
   ```

### For Stable Diffusion:

1. Generate 4-6 author photos
2. Train a LoRA on these images
3. Use LoRA for all subsequent author photos
4. OR: Use first image as img2img reference with high denoising

## Image Specifications

### Technical Requirements

- **Resolution:** Minimum 3000px width (300 DPI for print)
- **Format:** PNG for maximum quality, JPEG acceptable for photos
- **Color space:** sRGB
- **Aspect ratios:**
  - Cover: 2:3 portrait
  - Food hero shots: 3:2 or 4:3 landscape
  - Process shots: 4:3 or square
  - Infographics: 16:9 or square

### Style Guidelines

**Food Photography:**
- Natural daylight
- Warm, slightly desaturated color palette
- Rustic styling (weathered wood, linen)
- Overhead or 45° angle
- Shallow depth of field
- Realistic, not overly styled
- Think Bon Appétit / Serious Eats aesthetic

**Author Photos:**
- Documentary style
- Natural lighting
- Slightly desaturated, film look
- Candid, mid-task moments
- Never overly posed

**Infographics:**
- Clean, educational design
- Warm neutral palette (browns, creams)
- Clear typography
- Field guide / textbook aesthetic

## Batch Processing Tips

### Using Midjourney:

```
/imagine prompt: [paste prompt here] --ar 3:2 --stylize 100 --v 6
```

Save as job, use `/show` to retrieve later.

### Using DALL-E via API:

Create a script that reads all prompt files and generates in batch.

### Using Stable Diffusion:

Create a batch file with prompts and settings, use SD WebUI's batch mode.

## Phase 2: Remaining Images

After Phase 1 is complete and tested:

1. Generate all remaining hero shots (dishes, ferments, etc.)
2. Generate process sequences (step-by-step photos)
3. Generate comparison shots
4. Generate infographics (may require design tools like Figma + AI)

## Infographics

Some images are infographics that may need design software:

1. **Generate base with AI:** Use DALL-E or Midjourney for layout concepts
2. **Refine in design tool:** Clean up in Figma, Illustrator, or Canva
3. **Ensure readability:** Text must be legible at print size

Or:

1. **Design manually:** Create in Figma/Illustrator based on specs
2. **Export at high res:** 3000px minimum

## Quality Checklist

Before considering an image "done":

- [ ] Matches prompt description
- [ ] High resolution (3000px+ width)
- [ ] Correct aspect ratio
- [ ] Matches book's visual style
- [ ] (For author photos) Matches character reference
- [ ] (For food photos) Looks appetizing but realistic
- [ ] No visible AI artifacts or errors
- [ ] Properly named and organized in folders

## Troubleshooting

### Author doesn't look consistent:

- Regenerate with more specific reference (use --cref in Midjourney)
- Add more physical details to prompt
- Consider training a LoRA (Stable Diffusion)

### Food looks fake/overly styled:

- Add "realistic, not overly styled" to prompt
- Reduce "stylize" parameter
- Reference specific food photographers
- Add "shot on film" or "documentary style"

### Images lack consistency across chapters:

- Create a master style prompt that you append to all prompts
- Use same settings (--stylize, --chaos, etc.) across all
- Generate in batches by type (all heroes, then all process, etc.)

## Cost Estimates

**Midjourney:**
- Standard plan: $30/mo for ~200 generations
- Estimate: ~$40-60 for all 132 images

**DALL-E 3:**
- $0.04 per image (1024x1024) or $0.08 (1024x1792)
- Estimate: ~$10-20 for all 132 images

**Stable Diffusion:**
- Free if run locally
- Cloud services: varies, ~$10-30

## Timeline Estimate

- **Phase 1 (Priority 25 images):** 4-6 hours
- **Phase 2 (Remaining 107 images):** 12-15 hours
- **Total:** 16-21 hours of generation + review time

Budget more time for:
- Learning the tool if new to AI image generation
- Iterating on character consistency
- Creating infographics

## Next Steps

1. Choose your image generation tool(s)
2. Run `npm run image-prompts`
3. Generate first author reference photo
4. Start with Priority Phase 1 images
5. Integrate into manuscript
6. Rebuild and review
7. Continue with Phase 2

---

**Questions or issues?** Document them in `image-manifest.md` as you go.

Last updated: 2025-10-16
