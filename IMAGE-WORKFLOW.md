# Image Workflow Documentation

## New Automated System (Markdown-Driven)

The image system now uses **markdown as the single source of truth**. Images are defined where they're used, and everything else flows from there.

### Quick Start

```bash
# 1. Extract manifest from markdown (scans all chapter files)
npm run extract-manifest

# 2. Generate only missing images
npm run generate:missing

# 3. Build the book
npm run build:book
```

### How It Works

#### 1. Define Images in Markdown

Images are defined inline in your manuscript files:

```markdown
![Author at kitchen counter with cutting board full of scraps](images/chapter-01/002_author-photo.png)
```

The system uses:
- **Alt text** → becomes the base prompt for image generation
- **Path** → determines chapter and filename
- **Filename pattern** → `NNN_slug.png` for auto-numbering

#### 2. Extract Manifest

```bash
npm run extract-manifest
```

This script:
- Scans all `manuscript/chapter-*.md` files
- Extracts image references
- Auto-detects image type (author, hero, process, infographic)
- Checks which files exist
- Outputs: `generated-manifest.json`

**Output Example:**
```json
{
  "images": [
    {
      "number": "002",
      "slug": "author-photo",
      "path": "images/chapter-01/002_author-photo.png",
      "expectedPath": "manuscript/images/chapter-01/002_author-photo.png",
      "alt": "Author at kitchen counter with scraps",
      "prompt": "Author at kitchen counter with scraps",
      "type": "author",
      "chapter": "chapter-01",
      "fileExists": true
    }
  ]
}
```

#### 3. Generate Missing Images

```bash
# Dry run (see what would be generated)
npm run generate:missing:dry-run

# Actually generate
npm run generate:missing
```

This script:
- Reads `generated-manifest.json`
- Finds images where `fileExists: false`
- Generates them using AI (OpenAI DALL-E 3)
- Saves to the correct `expectedPath`
- Enhances prompts based on type (author/hero/process/infographic)

#### 4. Build Book

```bash
npm run build:book
```

Converts markdown → typst → PDF. Images are already in the right places, so it just works.

---

## Image Types and Auto-Detection

The system auto-detects image types from filenames and alt text:

| Type | Keywords | Style Enhancement |
|------|----------|-------------------|
| `author` | "author", date mentions (e.g., "december 2021") | Documentary style, natural lighting, film aesthetic |
| `hero` | "hero", finished dish names | Professional food photography, editorial cookbook style |
| `process` | "process", "sequence", "stages" | Clear instructional, well-lit, step-by-step |
| `infographic` | "infographic", "chart", "matrix", "guide" | Clean design, educational, reference guide aesthetic |
| `other` | Everything else | Generic professional photography |

---

## Advanced: Custom Prompts and Dependencies

### Custom Prompts

Add HTML comments before images for more control:

```markdown
<!-- img-type: hero -->
<!-- img-prompt: rustic wooden table, overhead shot, golden hour lighting -->
![Finished dish](images/chapter-06/043_bread-crumbs-hero.png)
```

The `img-prompt` comment overrides the auto-generated prompt from alt text.

### Image Dependencies (Reference Images)

If one image should use another as a reference (for character consistency, style matching, etc.):

```markdown
<!-- img-ref: images/chapter-01/002_author-photo.png -->
![Author at farmers market](images/chapter-03/015_author-at-market.png)
```

**What this does:**
- Image 015 will use image 002 as a reference when generating
- System ensures 002 is generated before 015
- Topological sorting handles complex dependency chains
- Detects and warns about circular dependencies

**Example use cases:**
- **Character consistency**: All author photos reference the first one
- **Style matching**: Series of photos with consistent aesthetic
- **Before/after**: "After" image references "before" image

**Automatic dependency:**
- All images with `type: author` automatically use `manuscript/images/reference/author-reference.png` as reference (no need to declare explicitly)

---

## File Organization

```
manuscript/
├── chapter-01-history.md          # Images defined here
├── chapter-02-anatomy.md
├── ...
└── images/
    ├── chapter-01/                # Images auto-saved here
    │   ├── 002_author-photo.png
    │   ├── 003_medieval-kitchen.png
    │   └── ...
    ├── chapter-02/
    └── ...

generated-manifest.json            # Auto-generated manifest
```

**Path Rules:**
- Images are organized by chapter
- Filenames follow pattern: `NNN_descriptive-slug.png`
- Number (NNN) determines order, can have gaps
- Slug is derived from filename in markdown

---

## Validation (Optional)

```bash
npm run validate-images
```

Checks for:
- Missing files referenced in markdown
- Unreferenced image files
- Images in wrong directories
- Path inconsistencies

Can auto-fix with `--fix` flag.

---

## Migration from Old System

The old system had 3 sources of truth:
1. `image-manifest.md` (planning doc)
2. `scripts/image-prompts/*.txt` (82 prompt files)
3. Markdown files (image references)

The new system has **1 source of truth**:
- Markdown files only

The old scripts still exist for backwards compatibility:
```bash
npm run image-prompts          # OLD: Generate prompt files from manifest.md
npm run generate:images        # OLD: Generate from prompt files
```

But the new workflow is simpler:
```bash
npm run extract-manifest       # NEW: Extract from markdown
npm run generate:missing       # NEW: Generate missing only
```

---

## Benefits

1. ✅ **Single source of truth** - markdown drives everything
2. ✅ **No manual insertion** - images defined where used
3. ✅ **Deterministic paths** - auto-derived from chapter + filename
4. ✅ **Incremental generation** - only generates what's missing
5. ✅ **Self-documenting** - see images in context while writing
6. ✅ **Git-friendly** - changes visible in markdown diffs
7. ✅ **Build process unchanged** - paths already correct

---

## Troubleshooting

### "Manifest not found"
Run: `npm run extract-manifest` first

### "Images in wrong directory"
The system expects images in `manuscript/images/chapter-NN/`.
If images are elsewhere, either:
- Move them manually
- Or run: `npm run validate-images --fix`

### "Backend not configured"
Set up `.env` file with:
```bash
IMAGE_GEN_BACKEND=replicate  # or 'dalle'
OPENAI_API_KEY=your-key-here
```

### "Image generation fails"
Check:
1. API keys in `.env`
2. Backend is installed (see `scripts/image-backends/`)
3. Network connection
4. Rate limits

---

## CI/CD Integration

```yaml
# .github/workflows/build.yml
- name: Extract image manifest
  run: npm run extract-manifest

- name: Validate images
  run: npm run validate-images

- name: Build book
  run: npm run build:book
```

Don't generate images in CI (too slow/expensive). Generate locally and commit them.

---

## Questions?

See also:
- `scripts/extract-image-manifest.js` - Source code with comments
- `scripts/generate-missing-images.js` - Generation logic
- `scripts/validate-images.js` - Validation checks
