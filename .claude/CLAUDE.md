# Drain Salad Project - Claude Context

## Typst Layout System

This project uses **Typst** (a modern typesetting system) for PDF generation with fancy cookbook layouts.

### Quick Reference

When authoring or editing markdown chapters, you can use these special markup features:

#### HTML Comment Markers (for simple cases)

```markdown
<!-- authors-note -->
**December 2021:** Personal anecdote text here
<!-- /authors-note -->

<!-- comparison: left="Perfect Golden", right="Too Dark" -->
![Correct breadcrumbs](images/correct-breadcrumbs.png)
![Burnt breadcrumbs](images/burnt-breadcrumbs.png)
<!-- /comparison -->

<!-- margin-note -->
This saved me $47 in one week!
<!-- /margin-note -->
```

#### Embedded Typst Blocks (for complex layouts)

````markdown
```typst
#recipe-two-col(
  title: "Sludge Caesar",
  serves: "4",
  time: "15 min",
  difficulty: "easy",
  ingredients: [
    - 4 cups stale bread scraps
    - 3 tbsp anchovy paste
  ],
  instructions: [
    + Toast bread cubes
    + Make anchovy paste
  ]
)
```
````

### Full Documentation

See `TYPST-LAYOUT-GUIDE.md` in the project root for:
- All available layout functions
- Complete usage examples
- Technical specifications
- Full chapter examples

### Build Commands

```bash
npm run convert:typst        # Convert all markdown → Typst
npm run build:typst          # Convert + build PDF
npm run build:typst:quick    # Just build (no reconversion)
npm run build:typst:watch    # Watch mode for live updates
```

### Available Typst Functions

From `typst/template.typ`:
- `#recipe-two-col()` - Two-column recipe layout
- `#comparison()` - Side-by-side image comparison
- `#timeline()` - Process flow visualization
- `#authors-note()` - Author's voice callout
- `#margin-note()` - Margin annotations
- `#variety-grid()` - 4-column gallery
- `#config-comparison()` - Configuration comparison grid
- `#difficulty-badge()` - Visual difficulty indicator
- `#chapter-opener()` - Full-width image chapter opener
- `#side-by-side-lists()` - For "Broke vs Flush" comparisons

### When to Use What

- **Standard markdown**: Body text, headings, lists, basic formatting
- **HTML comments**: Simple callouts, comparisons, margin notes
- **Embedded Typst**: Recipes, timelines, galleries, complex layouts

### Image Generation

```bash
npm run generate:images              # Generate all 82 images
npm run generate:images -- --start 36  # Start from image 36
npm run generate:images -- --single 24  # Generate single image
```

Images use gpt-image-1 with reference image support for character consistency.
