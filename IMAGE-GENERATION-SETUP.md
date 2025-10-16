# Image Generation Setup Guide

## Overview

This system uses **reference photos** + **descriptive prompts** to generate consistent images, especially for author photos where the same person needs to appear across multiple shots.

### Key Features

✅ **Reference image support** - Use a photo to maintain character consistency
✅ **Automated generation** - npm scripts manage the entire workflow
✅ **Multiple backends** - Replicate API, ComfyUI, or Automatic1111
✅ **Batch processing** - Generate all images with one command
✅ **Progress tracking** - See generation status in real-time

---

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Configuration

```bash
# Copy the example config
cp .env.example .env

# Edit .env and add your API key
nano .env
```

Add your Replicate API token (get it from https://replicate.com/account/api-tokens):

```env
REPLICATE_API_TOKEN=r8_your_token_here
IMAGE_GEN_BACKEND=replicate
```

### 3. Generate First Author Photo (This Becomes Your Reference)

```bash
# Generate just the author bio photo (image #2)
npm run generate:images -- --single 2
```

This will:
- Use the detailed prompt from `scripts/image-prompts/002_author-photo.txt`
- Generate Italian-American man character based on detailed description
- Save to `manuscript/images/front-matter/002_author-photo.png`
- **Automatically save as reference** for all future author photos

### 4. Generate Remaining Author Photos (Will Use Reference)

```bash
# Generate all 8 author photos using the reference
npm run generate:author
```

All subsequent author photos will use image #2 as a **face reference**, ensuring the same person appears in every photo.

### 5. Generate Food Photography

```bash
# Generate all food hero shots and process sequences
npm run generate:food
```

### 6. Generate Everything Else

```bash
# Generate all priority images (25 images)
npm run generate:priority

# Or generate ALL images (82 images)
npm run generate:images
```

---

## How Reference Photos Work

### The Reference Photo Approach

1. **First generation** (image #2 - author bio photo):
   - Generated from detailed text description only
   - Saved as `manuscript/images/reference/author-reference.png`
   - This establishes the character

2. **Subsequent generations** (images with `type: author`):
   - Use the reference photo + new prompt
   - AI maintains facial features from reference
   - Changes only context (setting, expression, action)

### Technical Implementation

**Replicate Backend** uses **InstantID model**:
```javascript
{
  face_image: "base64_encoded_reference_photo",
  prompt: "Same person from reference, now at stove cooking...",
  identitynet_strength_ratio: 0.8,  // 80% face consistency
  adapter_strength_ratio: 0.8       // 80% style adherence
}
```

This ensures:
- Same facial structure across all photos
- Same skin tone, hair, facial features
- Only clothing, background, and pose change

---

## Available npm Scripts

### Generation Commands

```bash
# Generate all images
npm run generate:images

# Generate only Phase 1 priority images (25 images)
npm run generate:priority

# Generate only author photos (8 images with face reference)
npm run generate:author

# Generate only food photography (hero shots + process)
npm run generate:food

# Generate specific image by number
npm run generate:images -- --single 37

# Generate range of images
npm run generate:images -- --start 25 --end 50

# Use different backend
npm run generate:images -- --backend comfyui --author
```

### Utility Commands

```bash
# Regenerate prompt files (if you edit image-manifest.md)
npm run image-prompts

# Count generated images
npm run image-stats

# Build book with images
npm run build
```

---

## Backend Options

### Option 1: Replicate API (Recommended for Character Consistency)

**Pros:**
- ✅ **Supports face reference** (InstantID model)
- ✅ **Best character consistency** across author photos
- ✅ Cloud-based (no local GPU needed)
- ✅ Reliable, fast
- ✅ Works out of the box

**Cons:**
- 💵 Costs ~$0.05-0.15 per image (~$6-12 for all 82 images)

**Setup:**
1. Sign up at https://replicate.com
2. Get API token from account settings
3. Add to `.env`: `REPLICATE_API_TOKEN=r8_...`
4. Set backend: `IMAGE_GEN_BACKEND=replicate`
5. Run: `npm run generate:priority`

---

### Option 2: OpenAI GPT Image (gpt-image-1) - Best of Both Worlds! 🔥

**Pros:**
- ✅ **Reference image support!** - Uses Responses API for character consistency
- ✅ **Superior instruction following** - Better than DALL-E 3 and Replicate
- ✅ **High input fidelity** - Preserves facial features from reference images
- ✅ **Better text rendering** - Improved over DALL-E series
- ✅ **Real-world knowledge** - Understands context and composition
- ✅ Cloud-based (no local GPU needed)
- ✅ Natural, photorealistic style

**Cons:**
- 💵 Token-based pricing (varies by size/quality, ~$0.10-0.20 per image)
- ⚠️ Max size 1536px (vs 3072px target, but acceptable quality)
- ⚠️ Model may revise prompts for safety/quality

**Setup:**
1. Get OpenAI API key from https://platform.openai.com/api-keys
2. Add to `.env`: `OPENAI_API_KEY=sk-...`
3. Set backend: `IMAGE_GEN_BACKEND=dalle`
4. Run: `npm run generate:priority`

**How Reference Images Work:**
The backend uses OpenAI's **Responses API** with the `image_generation` tool:
```javascript
{
  input: [
    { type: 'input_text', text: 'Italian-American man cooking...' },
    { type: 'input_image', image_url: 'data:image/png;base64,...' }
  ],
  tools: [{
    type: 'image_generation',
    quality: 'high',
    input_fidelity: 'high'  // Preserves reference face
  }]
}
```

**When to use GPT Image:**
- ✅ **Best overall choice** if you have OpenAI API access
- ✅ Author photos with character consistency
- ✅ Complex scenes requiring instruction following
- ✅ When you want text labels rendered correctly
- ✅ When you want both quality AND consistency

---

### Option 3: Local ComfyUI (Advanced)

**Pros:**
- ✅ Free after initial setup
- ✅ Full control over workflow
- ✅ Can use any models/nodes

**Cons:**
- ⚠️ Requires powerful GPU (RTX 3060+ recommended)
- ⚠️ Complex setup
- ⚠️ Requires manual workflow configuration

**Setup:**
1. Install ComfyUI (https://github.com/comfyanonymous/ComfyUI)
2. Install IP-Adapter nodes for face reference
3. Create workflow JSON (see `scripts/image-backends/comfyui.js`)
4. Set `.env`: `IMAGE_GEN_BACKEND=comfyui`
5. Start ComfyUI server: `python main.py --listen`

**Note:** ComfyUI backend is a framework - you need to implement your specific workflow.

---

### Option 3: Manual + Midjourney (Hybrid)

Midjourney doesn't have a public API, but you can use it manually with the generated prompts:

1. Run: `npm run image-prompts`
2. Open `scripts/image-prompts/002_author-photo.txt`
3. Copy prompt to Midjourney Discord
4. Save generated image as reference
5. For subsequent author photos, use: `--cref <image_url>`

**Manual workflow:**
```
/imagine Italian-American man in late 20s... (prompt) --ar 3:2 --v 6

# Save image URL, then for next author photo:
/imagine Same person as before, now at stove cooking... --cref <previous_url> --ar 3:2 --v 6
```

---

## Configuration Options

### `.env` Settings

```env
# API Keys
REPLICATE_API_TOKEN=r8_your_token_here

# Backend selection
IMAGE_GEN_BACKEND=replicate  # replicate, comfyui, a1111

# Reference image (auto-created)
AUTHOR_REFERENCE_IMAGE=manuscript/images/reference/author-reference.png

# Output settings
OUTPUT_WIDTH=3072
OUTPUT_HEIGHT=2048
OUTPUT_FORMAT=png

# Model selection (Replicate)
REPLICATE_FACE_MODEL=zsxkib/instant-id:latest  # For author photos
REPLICATE_PHOTO_MODEL=stability-ai/sdxl:latest # For food/general
```

---

## Character Consistency Strategy

### Phase 1: Establish Reference (Image #2)

```bash
npm run generate:images -- --single 2
```

**What happens:**
1. Reads `scripts/image-prompts/002_author-photo.txt`
2. Generates from detailed text description
3. Saves to `manuscript/images/front-matter/002_author-photo.png`
4. **Copies to `manuscript/images/reference/author-reference.png`**

### Phase 2: Generate Consistent Photos

```bash
npm run generate:author
```

**What happens:**
1. Loads reference image
2. For each author photo:
   - Converts reference to base64
   - Sends to InstantID model with:
     - Reference face image
     - New contextual prompt
     - High identity preservation (80%)
   - Saves to correct location

**Result:** All 8 author photos show the same person in different contexts.

---

## Troubleshooting

### "Author doesn't look consistent across photos"

**Solution 1:** Increase identity strength
```env
# In replicate.js, adjust these values:
identitynet_strength_ratio: 0.9  # Up from 0.8
adapter_strength_ratio: 0.9      # Up from 0.8
```

**Solution 2:** Regenerate reference photo
```bash
# Try a few variations
npm run generate:images -- --single 2
# Pick the best one as reference
```

**Solution 3:** Use manual curation
```bash
# Generate multiple candidates
for i in {1..5}; do
  npm run generate:images -- --single 2
  mv manuscript/images/front-matter/002_author-photo.png \
     manuscript/images/reference/candidate-$i.png
done

# Pick best, rename as author-reference.png
```

---

### "Image generation is too slow"

**For Replicate:**
- Generations take 20-60 seconds each
- Priority queue available with paid plan
- Can't parallelize (API rate limits)

**For Local ComfyUI:**
- Much faster with good GPU (5-15 seconds)
- Can run multiple in parallel
- Batch processing possible

---

### "Images don't match the style I want"

**Edit prompts:**
1. Modify `image-manifest.md` with desired style
2. Regenerate prompts: `npm run image-prompts`
3. Regenerate specific images: `npm run generate:images -- --single N`

**Example style adjustment:**
```markdown
# In image-manifest.md, change description to:
- More cinematic lighting
- Shot on film, 35mm, Kodak Portra 400
- Natural window light, golden hour
```

---

### "Reference image isn't working"

**Check:**
```bash
# Verify reference exists
ls -lh manuscript/images/reference/author-reference.png

# Check it's a valid image
file manuscript/images/reference/author-reference.png

# Should output: PNG image data, 3072 x 2048...
```

**If missing:**
```bash
# Manually copy any author photo as reference
cp manuscript/images/front-matter/002_author-photo.png \
   manuscript/images/reference/author-reference.png
```

---

## Cost Estimates

### Replicate (Cloud - Best for Character Consistency)

| Image Type | Cost/Image | Count | Total |
|---|---|---|---|
| Author photos (InstantID) | $0.10 | 8 | $0.80 |
| Food photography (SDXL) | $0.05 | 65 | $3.25 |
| Infographics (SDXL) | $0.05 | 9 | $0.45 |
| **Total (Priority 25)** | — | 25 | **$2.50** |
| **Total (All 82)** | — | 82 | **$4.50** |

Actual costs may vary. First-time users often get free credits.

### OpenAI GPT Image (gpt-image-1) - Cloud, Best Overall

Token-based pricing depends on size and quality. Approximate costs:

| Quality | Size (1024×1024) | Size (1024×1536) | Size (1536×1024) |
|---|---|---|---|
| Low | ~$0.05 | ~$0.07 | ~$0.07 |
| Medium | ~$0.15 | ~$0.20 | ~$0.20 |
| High | ~$0.25 | ~$0.35 | ~$0.35 |

**Estimated project costs:**

| Image Type | Quality | Cost/Image | Count | Total |
|---|---|---|---|---|
| Author photos (with reference) | High | $0.35 | 8 | $2.80 |
| Food photography | Medium | $0.20 | 65 | $13.00 |
| Infographics | Medium | $0.20 | 9 | $1.80 |
| **Total (Priority 25)** | Mixed | ~$0.22 avg | 25 | **~$5.50** |
| **Total (All 82)** | Mixed | ~$0.21 avg | 82 | **~$17.60** |

**More expensive than Replicate**, but has **reference support + superior instruction following + better text rendering**.

### Comparison Summary

| Backend | Character Consistency | Quality | Cost (25 images) | Cost (82 images) | Best For |
|---|---|---|---|---|---|
| **GPT Image** | ✅ Yes (high fidelity) | Excellent | ~$5.50 | ~$17.60 | Best overall, instruction following |
| **Replicate** | ✅ Yes (InstantID) | Very Good | ~$2.50 | ~$4.50 | Budget-conscious, good consistency |
| **ComfyUI** | ✅ Yes (IP-Adapter) | Excellent | $0 | $0 | Local GPU, full control |

### ComfyUI (Local)

- **Setup cost:** $0 (assuming you have compatible GPU)
- **Generation cost:** $0 (electricity only)
- **Time cost:** Higher initial setup, faster ongoing

---

## Advanced Usage

### Batch Processing with Custom Filters

```bash
# Generate all Chapter 6 images (foundations)
npm run generate:images -- --start 25 --end 36

# Generate all hero shots (food photography main images)
# Edit script to filter by type === 'hero'

# Generate with retry on failure
npm run generate:images -- --priority --stop-on-error
```

### Using Different Models

Edit `.env`:
```env
# For more realistic photos
REPLICATE_PHOTO_MODEL=stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b

# For more artistic style
REPLICATE_PHOTO_MODEL=playgroundai/playground-v2.5-1024px-aesthetic:latest
```

### Regenerating Specific Images

```bash
# Regenerate cover
npm run generate:images -- --single 1

# Regenerate all author photos
npm run generate:author

# Regenerate specific range (process shots)
npm run generate:images -- --start 25 --end 30
```

---

## Integration with Manuscript

After generating images, add them to your markdown:

```markdown
![Author preparing scraps](images/front-matter/002_author-photo.png)
*The author in his kitchen, demonstrating the Clean-Catch method*
```

Or with figure tags for better layout:

```markdown
<figure>
  <img src="images/chapter-06/026_brown-butter-crumbs-hero.png"
       alt="Brown butter bread crumbs in jar" />
  <figcaption>
    Brown-butter bread crumbs - the foundation of dozens of recipes
  </figcaption>
</figure>
```

Then rebuild:
```bash
npm run build
```

Images will be embedded in EPUB and HTML automatically.

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure `.env` with API keys
3. ✅ Generate reference photo: `npm run generate:images -- --single 2`
4. ✅ Generate priority images: `npm run generate:priority`
5. ✅ Review generated images
6. ✅ Integrate into manuscript markdown
7. ✅ Rebuild book: `npm run build`
8. ✅ Generate remaining images as needed

---

**Questions?** Check the generated prompts in `scripts/image-prompts/` to see exactly what's being sent to the AI.

Last updated: 2025-10-16
