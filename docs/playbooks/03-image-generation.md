# Playbook #3: AI Image Generation

**Goal:** Master the automated image generation system, from prompt writing to backend selection to quality refinement.

**Who This Is For:** Authors ready to generate dozens or hundreds of images, wanting to understand the image system deeply and produce professional cookbook photography.

---

## What You'll Learn

- How markdown becomes AI prompts (single source of truth)
- Comparing 4 image backends (OpenAI, Replicate, ComfyUI, A1111)
- Writing effective prompts for different image types
- Character consistency strategies
- Phased generation workflows
- Regenerating specific images
- Quality assessment and iteration

**Time to Master:** 2-4 hours hands-on

---

## How Image Generation Works

### The Automated Pipeline

```
1. Write Markdown                  2. Extract Manifest            3. Generate Images
   ┌──────────────┐                  ┌──────────────┐               ┌──────────────┐
   │ ![Alt text]  │  ──────────────> │ Scan all .md │  ──────────>  │ Call API     │
   │ (path.png)   │  extract-manifest │ files        │  generate:*   │ with prompts │
   └──────────────┘                  │ Extract imgs │               └──────────────┘
                                     │ Alt→Prompt   │                       │
                                     └──────────────┘                       ▼
                                            │                        4. Save Output
                                            ▼                           ┌──────────────┐
                                     generated-manifest.json            │ images/*.png │
                                                                        └──────────────┘
```

**Key insight:** Your markdown alt text IS the prompt. Make it detailed.

---

## Image Backend Comparison

### Decision Matrix

| Backend | Best For | Quality | Speed | Character Consistency | Setup |
|---------|----------|---------|-------|-----------------------|-------|
| **OpenAI gpt-image-1** | General purpose, author photos | Excellent | Medium | ✅ Excellent (reference images) | Easy (API key) |
| **Replicate InstantID** | Budget-friendly, portrait consistency | Very Good | Fast | ✅ Good (InstantID model) | Easy (API key) |
| **ComfyUI** | Advanced users, full control | Excellent | Depends on GPU | ⚙️ Manual setup required | Hard (local install) |
| **Automatic1111** | SD power users | Very Good | Depends on GPU | ⚙️ Manual setup required | Hard (local install) |

---

### When to Use Each Backend

**OpenAI gpt-image-1 (Recommended for Most Users)**

✅ **Use for:**
- Author photos (excellent face consistency)
- Food photography (realistic lighting, textures)
- Kitchen scenes
- When you want "it just works"

❌ **Avoid for:**
- Highly stylized illustrations
- Anime/cartoon styles
- Extreme budget constraints

**Configuration:**
```bash
# .env
IMAGE_GEN_BACKEND=gpt-image
OPENAI_API_KEY=sk-your-key
AUTHOR_REFERENCE_IMAGE=manuscript/images/reference/author.png
```

---

**Replicate InstantID**

✅ **Use for:**
- Budget-friendly generation
- Portrait photography with reference
- Testing prompts before committing to OpenAI

❌ **Avoid for:**
- Complex multi-object scenes
- Ultra-realistic food photography

**Configuration:**
```bash
# .env
IMAGE_GEN_BACKEND=replicate
REPLICATE_API_TOKEN=r8_your-token
AUTHOR_REFERENCE_IMAGE=manuscript/images/reference/author.png
```

---

**ComfyUI / Automatic1111**

✅ **Use for:**
- Complete artistic control
- Custom models (fine-tuned on food photography)
- Zero API costs (after hardware investment)
- Advanced users who know SD workflows

❌ **Avoid for:**
- Beginners
- Users without GPUs
- "I just want it to work"

**Setup:** See backend-specific guides in IMAGE-WORKFLOW.md

---

## Prompt Writing Guide

### Anatomy of a Good Prompt

```markdown
![SUBJECT + COMPOSITION + LIGHTING + STYLE + TECHNICAL](path/to/image.png)
```

**Example Breakdown:**

```markdown
<!-- ❌ BAD: Vague, no details -->
![Kitchen](images/ch01/001_kitchen.png)

<!-- ✅ GOOD: Specific, actionable -->
![Modern farmhouse kitchen with white subway tile, wooden cutting board with colorful vegetable scraps on marble counter, soft window light from left, shallow depth of field, professional food photography](images/ch01/001_kitchen-scraps.png)
```

---

### Prompt Templates by Image Type

#### Author Photos

**Template:**
```markdown
![Professional food blogger/chef in [SETTING], [ACTIVITY], [LIGHTING], warm friendly expression, cookbook author photo, high-quality portrait](path.png)
```

**Examples:**
```markdown
![Professional cookbook author in bright modern kitchen, holding bowl of vegetable scraps, natural window light from left, warm smile, professional headshot, shallow depth of field](images/author-with-scraps.png)

![Chef in rustic farmhouse kitchen, stirring large pot on stove, steam rising, golden hour lighting, candid working shot, professional photography](images/author-cooking.png)
```

**Pro tips:**
- Set `AUTHOR_REFERENCE_IMAGE` in `.env` for consistency across photos
- Be specific about lighting (window light, golden hour, soft diffused)
- Include expression cues (warm smile, concentrated, thoughtful)
- Specify camera angle (eye level, slightly above, close-up)

---

#### Food Photography

**Template:**
```markdown
![DISH NAME, [PRESENTATION], [BACKGROUND], [LIGHTING], [COMPOSITION], food photography, cookbook style](path.png)
```

**Examples:**
```markdown
![Vegetable scrap stock in glass mason jars, golden amber liquid, rustic wooden table, soft natural window light, overhead shot, professional food photography](images/ch05/015_stock-jars.png)

![Brown butter crumbs in small bowl, golden toasted texture, white marble background, scattered breadcrumbs, macro photography, shallow depth of field](images/ch06/022_brown-butter-crumbs.png)

![Citrus peel salad on white ceramic plate, vibrant orange and yellow peels, fresh herbs, drizzled with olive oil, natural daylight, 45-degree angle, cookbook photography](images/ch07/028_citrus-peel-salad.png)
```

**Pro tips:**
- Overhead shots: "overhead flat lay", "bird's eye view"
- Depth: "shallow depth of field", "bokeh background"
- Texture: "glistening", "crispy texture", "steam rising"
- Color: "vibrant", "golden", "rich brown"
- Background: "white marble", "rustic wood", "neutral linen"

---

#### Ingredient Photography

**Template:**
```markdown
![INGREDIENTS arranged [COMPOSITION], [BACKGROUND], [LIGHTING], ingredient showcase, cookbook style](path.png)
```

**Examples:**
```markdown
![Colorful vegetable scraps arranged on white marble, carrot peels, onion ends, celery tops, herb stems, overhead flat lay, bright natural light](images/ch02/008_vegetable-scraps.png)

![Mason jars with labeled fermented scraps, arranged on wooden shelf, soft window light, organizational system, home kitchen aesthetic](images/ch03/012_labeled-jars.png)
```

---

#### Process/Step Photography

**Template:**
```markdown
![Step-by-step [PROCESS], [STAGE], hands visible, kitchen counter, natural light, instructional photography](path.png)
```

**Examples:**
```markdown
![Hands blanching vegetable scraps in boiling water, steam rising, stainless pot on stovetop, instructional cooking photography, clear lighting](images/ch05/018_blanching-process.png)

![Knife cutting citrus peels on wooden cutting board, hands visible, precise cuts, overhead angle, professional technique demonstration](images/ch05/020_cutting-citrus-peels.png)
```

---

#### Infographics / Diagrams

**Template:**
```markdown
![Clean simple diagram showing [CONCEPT], labeled components, minimal design, educational illustration, cookbook infographic](path.png)
```

**Examples:**
```markdown
![Clean diagram showing 6-element framework for scrap cooking, simple icons, labeled boxes, minimal color palette, educational infographic](images/ch02/010_framework-diagram.png)

![Timeline showing fermentation stages over 5 days, simple horizontal layout, clean typography, cookbook educational graphic](images/ch09/055_fermentation-timeline.png)
```

**Pro tips for diagrams:**
- Add "clean simple diagram", "minimal design"
- Specify "labeled components", "clear typography"
- Use "educational illustration", "infographic style"
- Keep it simple - AI struggles with complex multi-element diagrams

---

## Workflow: Generating Images in Phases

### Phase 1: Test Generation (3-5 images)

**Goal:** Verify your backend works and prompts produce reasonable output

```bash
# Extract manifest from your markdown
npm run extract-manifest

# Generate first image only
npm run generate:images -- --single 1

# Check the output
open manuscript/images/chapter-01/001_*.png

# If good, try a few more
npm run generate:images -- --single 2
npm run generate:images -- --single 3
```

**Decision point:** Do these images match your vision? If yes, proceed. If no, refine prompts.

---

### Phase 2: Author Photos (8-12 images)

**Goal:** Generate all author/portrait photos with consistent appearance

```bash
# Ensure reference image is set
echo $AUTHOR_REFERENCE_IMAGE
# Should show: manuscript/images/reference/author-reference.png

# Generate author photos specifically
# (Assumes you've numbered author photos 1-10)
for i in {1..10}; do
  npm run generate:images -- --single $i
done
```

**Pro tip:** Generate all author photos in one session for better consistency

---

### Phase 3: Hero/Priority Images (20-30 images)

**Goal:** Generate your most important images (covers, chapter openers, signature recipes)

```bash
# Use priority flag if you've tagged images
npm run generate:priority

# Or generate specific range
# If hero images are numbered 11-35:
for i in {11..35}; do
  npm run generate:images -- --single $i
  sleep 2  # Avoid rate limits
done
```

---

### Phase 4: Bulk Generation (All Remaining)

**Goal:** Fill in all remaining images

```bash
# Generate all missing images
npm run generate:missing

# This will:
# - Check which images already exist
# - Only generate missing ones
# - Skip images you've already created
```

**Time estimate:** For 100 images:
- OpenAI: ~2-3 hours (30-60 sec/image)
- Replicate: ~1-2 hours (faster)
- ComfyUI: Depends on GPU

---

## Character Consistency Strategy

### Using Reference Images

**For OpenAI gpt-image:**

```bash
# 1. Get a good reference photo
# - Clear face visibility
# - Good lighting
# - Neutral expression
# - High resolution (1024px+)

# 2. Save as author-reference.png
cp your-photo.jpg manuscript/images/reference/author-reference.png

# 3. Configure .env
echo "AUTHOR_REFERENCE_IMAGE=manuscript/images/reference/author-reference.png" >> .env

# 4. Your prompts should mention "the author" or "the chef"
```

**Example prompts with reference:**
```markdown
![The author in professional kitchen, holding vegetables, natural lighting](images/001_author.png)

![The chef stirring pot on stove, concentrated expression, kitchen scene](images/005_author-cooking.png)
```

**How it works:** The backend sends your reference image + prompt, asking for the same person in a new scene.

---

## Advanced Workflows

### Dry-Run Mode (Test Before Spending)

```bash
# Preview what would be generated without actually generating
npm run generate:missing --dry-run

# Output shows:
# - Which images would be generated
# - Prompts that would be used
# - Estimated count
```

**Use this to:**
- Verify your manifest extracted correctly
- Review prompts before committing
- Estimate how many API calls you'll make

---

### Regenerating Specific Images

**Scenario:** Image #42 doesn't look right, need to regenerate

**Option 1: Delete and regenerate**
```bash
# Delete the bad image
rm manuscript/images/chapter-07/042_*.png

# Regenerate just that one
npm run generate:images -- --single 42
```

**Option 2: Improve the prompt first**
```bash
# 1. Edit your markdown file with better prompt
nano manuscript/chapter-07-salads.md

# 2. Re-extract manifest
npm run extract-manifest

# 3. Delete old image
rm manuscript/images/chapter-07/042_*.png

# 4. Generate with new prompt
npm run generate:images -- --single 42
```

---

### Batch Regeneration

**Scenario:** Chapter 5 images all need better prompts

```bash
# 1. Edit prompts in chapter-05-techniques.md

# 2. Re-extract manifest
npm run extract-manifest

# 3. Delete Chapter 5 images
rm manuscript/images/chapter-05/*.png

# 4. Regenerate all missing (will only regenerate Chapter 5)
npm run generate:missing
```

---

## Quality Assessment

### What to Look For

**Food Photography:**
- ✅ Realistic lighting and shadows
- ✅ Appetizing colors
- ✅ Clear focus on subject
- ✅ Natural textures
- ❌ Weird artifacts or "AI look"
- ❌ Unnatural food arrangement
- ❌ Wrong colors (green strawberries, blue bread)

**Author Photos:**
- ✅ Consistent face across images
- ✅ Natural expression
- ✅ Realistic hands (AI struggles with hands)
- ✅ Professional setting
- ❌ Different person
- ❌ Distorted features
- ❌ Wrong age/ethnicity

**Infographics:**
- ✅ Clean, simple design
- ✅ Legible text (if any)
- ✅ Clear visual hierarchy
- ❌ Garbled text
- ❌ Too complex
- ❌ Confusing layout

---

### When to Regenerate

**Definitely regenerate if:**
- Faces don't match across author photos
- Food looks unappetizing or inedible
- Major artifacts (extra limbs, wrong objects)
- Text is completely garbled
- Wrong subject entirely

**Consider keeping if:**
- Minor background imperfections
- Slightly different lighting than ideal
- Small AI artifacts in non-focal areas
- Good enough for cookbook context

---

## Troubleshooting

### Images Taking Forever to Generate

**Problem:** Single image takes >5 minutes

**Solutions:**
```bash
# Check API status
curl https://status.openai.com/api/v2/status.json

# Try different backend
# Edit .env: IMAGE_GEN_BACKEND=replicate

# Reduce image size (temporary)
# Edit .env:
# OUTPUT_WIDTH=2048
# OUTPUT_HEIGHT=1536
```

---

### Character Consistency Failures

**Problem:** Author looks different in every photo

**Solutions:**
1. **Verify reference image:**
```bash
# Check file exists and is readable
ls -lh $AUTHOR_REFERENCE_IMAGE
open $AUTHOR_REFERENCE_IMAGE
```

2. **Improve reference photo:**
   - Use clear, well-lit photo
   - Face should fill ~30-50% of frame
   - Neutral expression
   - Direct lighting
   - High resolution

3. **Update prompts to be more specific:**
```markdown
<!-- Before -->
![Author in kitchen](images/001.png)

<!-- After -->
![The same author as reference photo, in bright modern kitchen, same person, consistent appearance, warm smile](images/001.png)
```

---

### API Rate Limits

**Problem:** "Rate limit exceeded" errors

**Solutions:**
```bash
# Add delays between generations
for i in {50..100}; do
  npm run generate:images -- --single $i
  sleep 5  # Wait 5 seconds between images
done

# Or use built-in rate limiting
# (Check scripts/generate-images.js for --delay flag)
npm run generate:images -- --start 50 --delay 3000
```

---

### Images Don't Match Prompts

**Problem:** AI generates wrong subject or style

**Solutions:**

1. **Be more explicit:**
```markdown
<!-- Vague -->
![Vegetables](...)

<!-- Specific -->
![Overhead photo of colorful fresh vegetables including carrots, celery, onions, arranged on white marble countertop, professional food photography, bright natural daylight, cookbook style](...)
```

2. **Add negative prompts (backend-specific):**
   - OpenAI: Add "not blurry, not dark, not abstract"
   - ComfyUI/A1111: Use negative prompt field

3. **Simplify overly complex prompts:**
```markdown
<!-- Too complex -->
![Kitchen scene with author and vegetables and pot and spices and herbs and cutting board and...](...)

<!-- Simplified -->
![Author at kitchen counter with vegetables and cooking pot, bright kitchen, natural light](...)
```

---

## Quick Reference

### Common Commands

```bash
# Extract image requirements from markdown
npm run extract-manifest

# Generate single image
npm run generate:images -- --single N

# Generate range
npm run generate:images -- --start 10 --end 20

# Generate all missing
npm run generate:missing

# Dry run (preview only)
npm run generate:missing --dry-run

# Check what exists
ls manuscript/images/*/
```

### Backend Switching

```bash
# Edit .env
IMAGE_GEN_BACKEND=gpt-image      # OpenAI
IMAGE_GEN_BACKEND=replicate       # Replicate
IMAGE_GEN_BACKEND=comfyui         # ComfyUI
IMAGE_GEN_BACKEND=a1111           # Automatic1111
```

### File Locations

```
generated-manifest.json           # Image manifest (generated)
manuscript/chapter-*.md           # Source with image refs
manuscript/images/chapter-*/      # Generated images
manuscript/images/reference/      # Author reference photo
.env                              # Backend configuration
```

---

## Next Steps

**Now that you understand image generation:**

1. **Generate your full image set** using phased workflow
2. **Run quality assurance** → [Playbook #4: Quality Assurance](04-quality-assurance.md)
3. **Build your complete book** → [Playbook #2: Complete Authoring Workflow](02-complete-authoring.md)
4. **Troubleshoot issues** → [Playbook #7: Troubleshooting](07-troubleshooting.md)

---

**Mastering AI image generation** transforms your cookbook from a text document into a professional, visually rich publication. The key is understanding the pipeline, writing specific prompts, and iterating until quality meets your standards.
