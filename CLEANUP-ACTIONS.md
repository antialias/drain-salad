# Cleanup Actions Summary
**Generated:** 2025-10-18
**Status after Phase 1:** 557MB (saved 543MB from 1.1GB)

---

## ✅ COMPLETED (Phase 1 - Immediate Actions)

- [x] Deleted `scripts/image-prompts/` (83 obsolete .txt files from old workflow)
- [x] Deleted `typst/chapters/` (orphaned chapter-01.typ)
- [x] Deleted `typst/build/` (empty directory)
- [x] Deleted `assets/templates/` (empty directory)
- [x] Cleaned `build/` directory (saved 826MB)

**Result:** Project reduced from 1.1GB to 557MB

---

## 🔍 INVESTIGATION RESULTS (Phase 2)

### 1. Documentation Files - CONFIRMED DUPLICATES ❌

**OBSOLETE:** `IMAGE-GENERATION-WORKFLOW.md` (329 lines)
- Describes the OLD manual workflow using Midjourney/DALL-E
- References `npm run image-prompts` (which generated the .txt files we just deleted)
- References `scripts/image-prompts/` directory (deleted)
- Last updated: 2025-10-16

**ACTIVE:** `IMAGE-WORKFLOW.md` (275 lines)
- Describes the NEW automated markdown-driven workflow
- Uses `npm run extract-manifest` → scans markdown files directly
- Uses `npm run generate:missing` → generates from `generated-manifest.json`
- This is the current system ✅

**REFERENCE:** `IMAGE-GENERATION-SETUP.md` (554 lines)
- Setup instructions, appears to be for the old system
- Contains useful background but may be outdated

**OBSOLETE:** `image-manifest.md` (manual list of images)
- Was used by the old `generate-image-prompts.js` script
- Replaced by `generated-manifest.json` (auto-generated from markdown)
- No longer referenced by active scripts

**RECOMMENDATION:**
```bash
# Move obsolete docs to archive
mkdir -p archive/old-workflow-docs
mv IMAGE-GENERATION-WORKFLOW.md archive/old-workflow-docs/
mv IMAGE-GENERATION-SETUP.md archive/old-workflow-docs/
mv image-manifest.md archive/old-workflow-docs/

# Update README to point to IMAGE-WORKFLOW.md as single source of truth
```

---

### 2. CSS Files - NO DUPLICATION ✅

**ACTIVE:** `assets/css/drain-salad.css` (337 lines)
- Comprehensive cookbook styling
- Used by EPUB and HTML builds (confirmed in package.json lines 10, 12)
- Has detailed recipe styling, image classes, print/EPUB optimizations
- **Keep this file** ✅

**OBSOLETE:** `styles/book.css` (111 lines)
- Simpler, more generic styling
- NOT referenced in package.json or any build scripts
- Appears to be leftover from earlier iteration
- **Can be deleted** ❌

**RECOMMENDATION:**
```bash
rm -rf styles/
```

---

### 3. Missing `image-prompts.json` - BUG IN NEW SCRIPT ⚠️

**Issue:** `scripts/refine-prompts-from-review.js` expects `image-prompts.json` but it doesn't exist.

**Root cause:** This script was created to work with the new automated workflow, but incorrectly references the old prompt file name.

**The workflow actually uses:**
- `generated-manifest.json` - Created by `npm run extract-manifest`
- Contains all image metadata extracted from markdown

**NEEDS FIX:** `scripts/refine-prompts-from-review.js:32`
```javascript
// WRONG:
const IMAGE_PROMPTS_PATH = path.join(__dirname, '..', 'image-prompts.json');

// SHOULD BE:
const IMAGE_PROMPTS_PATH = path.join(__dirname, '..', 'generated-manifest.json');
```

**However**, there's a structural issue: `generated-manifest.json` has a different format than what the refine script expects. The script expects:
```json
{
  "images": [
    { "number": 1, "filename": "...", "prompt": "..." }
  ]
}
```

But `generated-manifest.json` has:
```json
{
  "images": [
    { "path": "...", "prompt": "...", "alt": "...", "chapter": "..." }
  ]
}
```

**RECOMMENDATION:**
The refine-prompts script needs to be updated to use the `generated-manifest.json` format, OR we need to create a separate `image-prompts.json` file that's generated from the manifest with the expected structure.

---

### 4. Obsolete Scripts - INVESTIGATION NEEDED

**Potentially obsolete:** `scripts/generate-image-prompts.js`
- References `image-manifest.md` (we determined this is obsolete)
- NOT referenced in package.json
- Used by the old workflow

**RECOMMENDATION:** Move to archive if confirmed unused

---

## 📋 RECOMMENDED ACTIONS

### Phase 3: Archive Obsolete Documentation

```bash
# Create archive directory
mkdir -p archive/old-workflow-docs

# Move obsolete documentation
mv IMAGE-GENERATION-WORKFLOW.md archive/old-workflow-docs/
mv IMAGE-GENERATION-SETUP.md archive/old-workflow-docs/
mv image-manifest.md archive/old-workflow-docs/

# Optional: Move obsolete script
mv scripts/generate-image-prompts.js archive/old-workflow-docs/
```

### Phase 4: Delete Unused CSS

```bash
# Remove unused styles directory
rm -rf styles/
```

### Phase 5: Fix Prompt Refinement Script

**Option A:** Create `image-prompts.json` from `generated-manifest.json`

Add a script to convert the manifest:
```bash
npm run create-prompts-manifest
```

**Option B:** Update `refine-prompts-from-review.js` to use `generated-manifest.json` format

This requires code changes in the script to adapt to the different structure.

**DECISION NEEDED:** Which approach do you prefer?

---

## 📝 DOCUMENTATION UPDATES NEEDED

### Update README.md

Add clear workflow documentation:
```markdown
## Image Workflow

The image system uses markdown as the single source of truth.

1. Define images in markdown: `![alt text](path/to/image.png)`
2. Extract manifest: `npm run extract-manifest`
3. Generate missing images: `npm run generate:missing`
4. Build book: `npm run build:book`

See `IMAGE-WORKFLOW.md` for complete documentation.
```

### Create .gitattributes

```bash
# Mark old workflow docs as archived
archive/** linguist-documentation
```

---

## 🎯 FINAL PROJECT STATE (After all phases)

**Current:** 557MB
**After Phase 3-4:** ~556MB (minimal savings, mainly organizational)

**Structure:**
```
drain-salad/
├── manuscript/           # Source content (248MB)
├── scripts/              # Active build scripts
├── assets/css/          # Active CSS (drain-salad.css only)
├── IMAGE-WORKFLOW.md    # SINGLE source of truth for workflow
├── archive/             # Historical documentation
│   └── old-workflow-docs/
└── (other files...)
```

---

## ⚠️ CRITICAL ISSUE TO FIX

The prompt refinement script (`refine-prompts-from-review.js`) won't work until we either:

1. Create `image-prompts.json` in the expected format, OR
2. Update the script to use `generated-manifest.json`

The automated quality loop (`npm run quality:loop`) depends on this script working correctly.

**Next step:** Decide on fix approach and implement.
