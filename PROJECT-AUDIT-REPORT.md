# Drain Salad Project Audit Report
**Generated:** 2025-10-18
**Total Project Size:** ~1.1GB

---

## Executive Summary

The project is a **cookbook generation system** with automated AI image generation, editorial review workflows, and multi-format publishing (PDF, EPUB, HTML). The codebase is generally well-organized but contains **~826MB of built assets** and some **obsolete files from previous workflow iterations**.

**Key Findings:**
- ✅ **Active and functional** codebase with modern workflows
- ⚠️ **Large build directory** (826MB) that should be cleaned periodically
- ⚠️ **Duplicate workflow documentation** that needs consolidation
- ⚠️ **Obsolete image prompt system** (scripts/image-prompts/*.txt files)
- ⚠️ **Empty or orphaned directories** that can be removed

---

## 1. SOURCE CODE (Active & Maintained)

### 1.1 Core Manuscript Content
**Location:** `manuscript/`
**Size:** 248MB (mostly images)
**Status:** ✅ ACTIVE

```
manuscript/
├── chapter-*.md (14 markdown files) - Source content
├── images/ (91 PNG files across 14 subdirectories)
│   ├── chapter-01/ through chapter-12/
│   ├── front-matter/
│   └── reference/ (gitignored, 1 file)
├── metadata.yaml
└── front-matter files
```

**Assessment:** This is the **primary source of truth**. All content is actively used.

---

### 1.2 Build Scripts (JavaScript)
**Location:** `scripts/`
**Size:** 548KB
**Status:** ✅ ACTIVE

**Active Scripts (15 files):**

#### Image Generation System
- `generate-images.js` - Main image generation (OpenAI DALL-E)
- `generate-missing-images.js` - Generate only missing images
- `generate-contextual-prompts.js` - Generate prompts from chapter context
- `extract-image-manifest.js` - Extract image requirements from markdown

#### Image Quality & Review
- `review-images-structured.js` ⭐ NEW - Context-aware GPT-4o vision reviews
- `review-images.js` ⭐ NEW - Basic image review
- `refine-prompts-from-review.js` ⭐ NEW - Auto-refine prompts from feedback
- `image-quality-loop.js` ⭐ NEW - Automated quality improvement loop

#### Editorial Review
- `review-pro.js` - GPT-5 pro editorial reviews of chapters

#### Publishing
- `build-epub.js` - EPUB generation
- `build-print-pdf.js` - Print-ready PDF with high-res images
- `build-optimized-pdf.js` - Web-optimized PDF with compressed images

#### Conversion & Validation
- `markdown-to-typst.js` - Convert markdown to Typst format
- `validate-images.js` - Validate image references
- `generate-image-prompts.js` - Legacy prompt generator (may be obsolete)

#### Image Backend Modules
**Location:** `scripts/image-backends/`
- `gpt-image.js` - OpenAI DALL-E backend (PRIMARY)
- `replicate.js` - Replicate.com backend (alternative)
- `comfyui.js` - ComfyUI backend (alternative)

**Assessment:** All scripts are **actively referenced** in package.json except `generate-contextual-prompts.js`.

---

### 1.3 Shell Scripts
**Location:** `scripts/`
**Status:** ✅ ACTIVE

- `review-chapter.sh` - Review single chapter
- `review-all-chapters.sh` - Batch review all chapters
- `compare-reviews.sh` - Compare review outputs

**Assessment:** Referenced in package.json `review` scripts.

---

### 1.4 Package Configuration
**Files:**
- `package.json` - ✅ ACTIVE (main build configuration)
- `package-lock.json` - ✅ ACTIVE (dependency lockfile)
- `book-metadata.json` - ✅ ACTIVE (book metadata)
- `Makefile` - ✅ ACTIVE (additional build targets)

---

## 2. BUILT ASSETS (Generated Output)

### 2.1 Build Directory
**Location:** `build/`
**Size:** 826MB ⚠️ **VERY LARGE**
**Status:** 🔄 GENERATED (can be regenerated)

```
build/
├── drain-salad-typst.pdf       298MB ⚠️ Large, duplicate of print?
├── drain-salad-print.pdf       298MB ⚠️ Large, may be duplicate
├── drain-salad.epub            222MB ⚠️ Large (embedded images)
├── drain-salad-optimized.pdf   4.7MB ✅ Reasonably sized
└── drain-salad.html            296KB ✅ Small
```

**Issues:**
1. **Very large file sizes** - PDFs are 298MB each (likely high-res images)
2. **Potential duplicates** - `drain-salad-typst.pdf` and `drain-salad-print.pdf` appear to be the same
3. **Should be in .gitignore** - Confirmed it is gitignored ✅

**Recommendation:**
⚠️ These files should be **regenerated on demand** and not kept in the repo long-term. Consider adding a `npm run clean` script to remove build artifacts.

---

### 2.2 Typst Generated Files
**Location:** `typst/`
**Size:** 328KB
**Status:** 🔄 GENERATED

```
typst/
├── *.typ (18 files) - Generated from markdown
├── book.typ - Main book template
├── book-print.typ - Print template
├── template.typ - Base template
├── chapters/ - ⚠️ Orphaned directory
│   └── chapter-01.typ (obsolete?)
└── build/ - ⚠️ Empty directory
```

**Issues:**
1. `typst/chapters/chapter-01.typ` - **Orphaned file** (chapters are in root now)
2. `typst/build/` - **Empty directory**

**Recommendation:**
⚠️ Delete `typst/chapters/` and `typst/build/` directories.

---

### 2.3 Review Outputs
**Location:** `reviews/`
**Size:** 396KB
**Status:** 🔄 GENERATED (gitignored)

```
reviews/
├── image-review-report.md (76KB) - Old format
├── image-review-structured.json (76KB) - New format
├── chapter-01-history-comprehensive-pro-review.md
└── images/ (59 JSON files) - Individual image reviews
```

**Assessment:** Generated content that should be regenerated. Correctly gitignored ✅

---

## 3. DEAD OR OBSOLETE FILES

### 3.1 Old Image Prompt System ⚠️ OBSOLETE
**Location:** `scripts/image-prompts/`
**Size:** 83 .txt files
**Status:** ❌ OBSOLETE

According to `IMAGE-WORKFLOW.md`, the system now uses **markdown as the single source of truth**:
> "The image system now uses **markdown as the single source of truth**. Images are defined where they're used, and everything else flows from there."

**Evidence:**
- Current workflow uses `npm run extract-manifest` to scan markdown files
- These .txt files appear to be from an older manual prompt system
- Not referenced in active scripts

**Recommendation:**
❌ **DELETE** `scripts/image-prompts/` directory entirely, or move to `archive/` if you want to keep for reference.

---

### 3.2 Orphaned Typst Files
**Location:** `typst/chapters/chapter-01.typ`
**Status:** ❌ OBSOLETE

Single orphaned file in a chapters subdirectory. Current system generates .typ files in `typst/` root.

**Recommendation:**
❌ **DELETE** `typst/chapters/` directory.

---

### 3.3 Empty Directories
**Locations:**
- `assets/templates/` - Empty
- `typst/build/` - Empty

**Recommendation:**
❌ **DELETE** empty directories.

---

### 3.4 Duplicate Documentation? ⚠️ REVIEW NEEDED
**Files:**
- `IMAGE-WORKFLOW.md` (275 lines) - **NEW system documentation**
- `IMAGE-GENERATION-WORKFLOW.md` (329 lines) - Potentially old workflow?
- `IMAGE-GENERATION-SETUP.md` (554 lines) - Setup instructions
- `image-manifest.md` - **Manual manifest (OBSOLETE?)**

**Recommendation:**
⚠️ **REVIEW** these files:
1. Determine if `IMAGE-GENERATION-WORKFLOW.md` describes the OLD system
2. If `image-manifest.md` is replaced by `generated-manifest.json`, delete or archive it
3. Consider consolidating into a single `IMAGE-SYSTEM.md` documentation file

---

### 3.5 Potential CSS Duplication
**Files:**
- `assets/css/drain-salad.css` (6.1KB)
- `styles/book.css` (1.7KB)

**Recommendation:**
⚠️ **REVIEW** if both are needed or if one should be consolidated.

---

## 4. REFERENCE MATERIALS (Keep)

### 4.1 Other Author Examples
**Location:** `other-author-examples/porcelain-a-memoir/`
**Size:** 18MB (22 screenshots)
**Status:** ✅ REFERENCE

Screenshots from another author's work for design inspiration.

**Assessment:** Keep for reference.

---

### 4.2 Cover Ideas
**Location:** `cover-ideas/`
**Size:** 2.6MB (1 image)
**Status:** ✅ REFERENCE

Cover design concepts.

**Assessment:** Keep for reference.

---

## 5. CONFIGURATION & DOCUMENTATION

### 5.1 Root Documentation (Active)
- `README.md` - ✅ Project overview
- `PUBLISHING.md` - ✅ Publishing workflow
- `PUBLISHING-SETUP-COMPLETE.md` - ✅ Publishing setup
- `TYPST-LAYOUT-GUIDE.md` - ✅ Typst formatting guide

### 5.2 Git Configuration
- `.gitignore` - ✅ Properly configured
  - Ignores `build/`, `reviews/`, `.env`, `node_modules/`
  - Correctly set up ✅

---

## 6. MISSING FILES ⚠️

### 6.1 image-prompts.json
**Expected by:** `scripts/refine-prompts-from-review.js`
**Status:** ❌ NOT FOUND

The prompt refinement script expects an `image-prompts.json` file but it doesn't exist in the repository.

**Recommendation:**
⚠️ **INVESTIGATE** - Either this file should exist, or the script needs updating.

---

## 7. RECOMMENDATIONS

### Immediate Actions (Clean Up Dead Code)

```bash
# 1. Remove obsolete image prompts directory
rm -rf scripts/image-prompts/

# 2. Remove orphaned typst files
rm -rf typst/chapters/
rm -rf typst/build/

# 3. Remove empty directories
rmdir assets/templates/

# 4. Clean build artifacts (regenerate as needed)
npm run clean  # If script exists, or:
rm -rf build/*
```

### Short-term Actions (Documentation)

1. **Consolidate workflow documentation:**
   - Merge `IMAGE-WORKFLOW.md`, `IMAGE-GENERATION-WORKFLOW.md`, `IMAGE-GENERATION-SETUP.md`
   - Archive or delete outdated versions
   - Create single source of truth for image system

2. **Review CSS files:**
   - Determine if `assets/css/drain-salad.css` and `styles/book.css` can be consolidated

3. **Investigate missing file:**
   - Find or create `image-prompts.json` if needed by prompt refinement system

### Best Practices Going Forward

1. **Add clean script to package.json:**
```json
"clean": "rm -rf build/* typst/*.typ reviews/*"
```

2. **Document build artifacts:**
   - Add comment in build/ explaining these are generated
   - Consider adding build/.gitkeep to preserve empty directory

3. **Archive instead of delete:**
   - Create `archive/` directory for old workflow documentation
   - Move obsolete files there instead of deleting

---

## 8. SUMMARY BY CATEGORY

### ✅ ACTIVE CODE (Keep & Maintain)
- `manuscript/` - Source content (248MB)
- `scripts/*.js` - Build & generation scripts (15 files)
- `scripts/*.sh` - Shell scripts (3 files)
- `scripts/image-backends/` - Image generation backends (3 files)
- `package.json`, `Makefile` - Build configuration
- Root documentation files

### 🔄 GENERATED (Can Delete & Regenerate)
- `build/` - Built books (826MB) ⚠️ LARGE
- `typst/*.typ` - Converted chapter files (328KB)
- `reviews/` - Review outputs (396KB)
- `generated-manifest.json` - Image manifest

### 📚 REFERENCE (Keep)
- `other-author-examples/` - Design reference (18MB)
- `cover-ideas/` - Cover concepts (2.6MB)
- `docs/` - Additional documentation

### ❌ OBSOLETE (Delete or Archive)
- `scripts/image-prompts/` - Old prompt system (83 files)
- `typst/chapters/` - Orphaned typst file
- `typst/build/` - Empty directory
- `assets/templates/` - Empty directory
- `image-manifest.md` - Replaced by JSON manifest (needs verification)

### ⚠️ NEEDS REVIEW
- Multiple workflow documentation files (potential duplication)
- Duplicate CSS files
- Missing `image-prompts.json` file
- Duplicate PDFs in build/ (298MB each)

---

## 9. DISK SPACE SUMMARY

**Total Project:** ~1.1GB

**Breakdown:**
- Built assets (regenerable): 826MB (75%)
- Source images: ~248MB (22%)
- Reference materials: ~21MB (2%)
- Code & docs: ~5MB (1%)

**Potential savings:**
- Delete `build/`: Save 826MB
- Delete `scripts/image-prompts/`: Save ~100KB
- Archive `other-author-examples/`: Save 18MB (if not needed)

**After cleanup:** ~275MB (source code + images only)

---

## APPENDIX: File Counts

- Markdown files (manuscript): 14
- JavaScript files: 15
- Shell scripts: 3
- Typst files: 18 (generated)
- PNG images: 91
- JSON config files: 4
- Old prompt files: 83 (obsolete)
- Review JSON files: 59 (generated)
- Documentation files: 8

**Total tracked files:** ~315 (excluding node_modules & build artifacts)
