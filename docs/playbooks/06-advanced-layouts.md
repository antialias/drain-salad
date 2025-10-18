# Playbook #6: Advanced Typst Layouts

**Goal:** Use custom Typst features for professional cookbook design beyond basic markdown.

**Who This Is For:** Authors wanting to customize the visual design and leverage advanced layout capabilities.

---

## What Typst Enables

Beyond basic markdown, Typst allows:
- Custom page layouts
- Multi-column designs
- Timeline visualizations
- Grid-based layouts
- Custom typography
- Professional print features (bleed, color profiles)

---

## Available Custom Features

### 1. Two-Column Recipe Layout

**Use for:** Ingredient list beside instructions

```typst
#import "/typst/template.typ": *

#two-column-recipe(
  title: "Brown Butter Crumbs",
  ingredients: [
    - 4 tbsp butter
    - 1 cup breadcrumbs
    - Salt to taste
  ],
  instructions: [
    1. Melt butter in pan
    2. Add breadcrumbs
    3. Toast until golden
  ]
)
```

---

### 2. Timeline Layout

**Use for:** Fermentation schedules, meal prep planning

```typst
#timeline(
  events: (
    ("Day 1", "Start fermentation"),
    ("Day 3", "Check for bubbling"),
    ("Day 5", "Taste for sourness"),
    ("Day 7", "Refrigerate")
  )
)
```

---

### 3. Grid Layout

**Use for:** Ingredient comparisons, scrap categories

```typst
#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 1em,
  [*Peels*], [*Stems*], [*Cores*],
  [Carrot], [Herb], [Apple],
  [Potato], [Kale], [Pineapple]
)
```

---

### 4. Callout Boxes

**Use for:** Tips, warnings, notes

```typst
#callout(type: "tip")[
  Save vegetable scraps in the freezer until you have enough for stock.
]

#callout(type: "warning")[
  Never use moldy or spoiled scraps - food safety first!
]
```

---

## Customizing Page Layout

### Editing the Main Template

**File:** `typst/book.typ`

```typst
#set page(
  width: 6in,
  height: 9in,
  margin: (
    top: 0.75in,
    bottom: 0.75in,
    inside: 0.625in,
    outside: 0.5in,
  ),
  // For print with bleed:
  bleed: 0.125in,
)

#set text(
  font: "Linux Libertine",
  size: 10.5pt,
  lang: "en",
)
```

**Common customizations:**
- Change trim size (width × height)
- Adjust margins
- Set bleed for print
- Choose fonts

---

### Typography Customization

```typst
// Heading styles
#show heading.where(level: 1): it => [
  #set text(size: 24pt, weight: "bold")
  #v(1em)
  #it
  #v(0.5em)
]

// Recipe titles
#show heading.where(level: 3): it => [
  #set text(size: 14pt, style: "italic")
  #it
]

// Emphasis
#show emph: set text(style: "italic", fill: rgb("#333"))
```

---

## Workflow: Markdown → Typst → PDF

### 1. Write in Markdown (Easy)

```markdown
# Chapter 5: Techniques

## Blanching

Blanching is...

### Brown Butter Crumbs

**Ingredients:**
- 4 tbsp butter
...
```

---

### 2. Convert to Typst (Automated)

```bash
npm run convert:typst
```

**Creates:** `typst/chapter-05-techniques.typ`

---

### 3. Customize Typst (Advanced)

**Edit:** `typst/chapter-05-techniques.typ`

```typst
// Add custom timeline
#timeline(
  events: (
    ("0 min", "Start blanching water"),
    ("2 min", "Add vegetables"),
    ("3 min", "Transfer to ice bath"),
    ("5 min", "Drain and dry")
  )
)

// Add two-column recipe
#two-column-recipe(
  title: "Brown Butter Crumbs",
  ...
)
```

---

### 4. Build PDF

```bash
npm run build:book
```

**Output:** `build/drain-salad-typst.pdf`

---

## Custom Template Creation

### Creating a New Layout Function

**File:** `typst/template.typ`

```typst
// Custom ingredient showcase
#let ingredient-showcase(name, image, description) = {
  block(
    fill: luma(250),
    inset: 1em,
    radius: 0.5em,
    [
      #align(center)[
        #image(image, width: 60%)
        #text(size: 14pt, weight: "bold")[#name]
      ]
      #v(0.5em)
      #description
    ]
  )
}
```

**Usage:**
```typst
#ingredient-showcase(
  name: "Carrot Peels",
  image: "images/chapter-10/065_carrot-peels.png",
  description: [
    Rich in nutrients, perfect for stock or roasting.
  ]
)
```

---

## Image Placement and Sizing

### Basic Image Insertion

```typst
// Full width
#image("images/chapter-05/022_brown-butter.png")

// Specific width
#image("images/chapter-05/022_brown-butter.png", width: 80%)

// Centered with caption
#figure(
  image("images/chapter-05/022_brown-butter.png", width: 70%),
  caption: [Golden brown butter with nutty solids]
)
```

---

### Multi-Image Layouts

**Side-by-side comparison:**
```typst
#grid(
  columns: (1fr, 1fr),
  gutter: 1em,
  image("images/before.png", width: 100%),
  image("images/after.png", width: 100%)
)
```

**Process sequence:**
```typst
#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 0.5em,
  image("images/step-1.png"),
  image("images/step-2.png"),
  image("images/step-3.png"),
  [Step 1: Prep], [Step 2: Cook], [Step 3: Finish]
)
```

---

## Print-Specific Features

### Bleed Setup

```typst
#set page(
  bleed: 0.125in,  // Standard print bleed
)

// Extend backgrounds to bleed
#rect(
  fill: rgb("#f5f5f5"),
  width: 100% + 0.25in,  // Extends past trim
  height: 2in,
  outset: 0.125in,
)
```

---

### Color Profiles

```typst
// Define CMYK colors for print
#let brand-green = cmyk(60%, 0%, 100%, 0%)
#let brand-brown = cmyk(0%, 40%, 60%, 20%)

// Use in document
#set text(fill: brand-brown)
```

---

### Running Headers/Footers

```typst
#set page(
  header: context [
    #if calc.odd(here().page()) [
      // Odd pages (right): Chapter title
      #emph[Chapter 5: Techniques]
      #h(1fr)
      #counter(page).display()
    ] else [
      // Even pages (left): Book title
      #counter(page).display()
      #h(1fr)
      #emph[Drain Salad]
    ]
  ]
)
```

---

## Troubleshooting

### Typst Compilation Errors

**Problem:** `error: unknown function: two-column-recipe`

**Fix:** Ensure function is defined in `typst/template.typ` and imported:
```typst
#import "/typst/template.typ": *
```

---

### Images Not Showing

**Problem:** Images don't appear in PDF

**Fix:**
```bash
# Check image paths (relative to typst/ directory)
ls manuscript/images/chapter-05/

# Verify path in Typst file
# Should be: ../manuscript/images/chapter-05/022_image.png
```

---

### Fonts Missing

**Problem:** "Font not found: Linux Libertine"

**Fix:**
```typst
// Use system fonts
#set text(font: "Georgia")  // macOS/Windows
#set text(font: "Liberation Serif")  // Linux

// Or install Linux Libertine:
// macOS: brew install --cask font-linux-libertine
```

---

## Examples from Drain Salad

### Chapter Opening

```typst
= Chapter 5: Techniques

#image("../manuscript/images/chapter-05/hero.png", width: 100%)

#v(2em)

The foundation of scrap cooking isn't waste reduction—it's *technique*.
```

---

### Recipe with Process Images

```typst
=== Brown Butter Crumbs

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 1em,
  image("../manuscript/images/chapter-06/022-step1.png"),
  image("../manuscript/images/chapter-06/022-step2.png"),
  image("../manuscript/images/chapter-06/022-step3.png"),
)

*Ingredients:*
- 4 tbsp butter
- 1 cup breadcrumbs

*Instructions:*
1. Melt butter over medium heat...
```

---

### Ingredient Matrix

```typst
#table(
  columns: (auto, 1fr, 1fr),
  [*Scrap Type*], [*Best Use*], [*Storage*],
  [Carrot peels], [Stock, roasted], [Freeze 3 months],
  [Herb stems], [Chimichurri, stock], [Freeze 2 months],
  [Citrus peels], [Candy, zest], [Dry, store 6 months],
)
```

---

## Quick Reference

### Common Typst Syntax

```typst
= Heading 1 (Chapter)
== Heading 2 (Section)
=== Heading 3 (Subsection)

*Bold text*
_Italic text_

- Bullet list
  - Nested item

1. Numbered list
2. Second item

#image("path/to/image.png")
#link("https://example.com")[Link text]

// Comments
/* Multi-line
   comments */
```

---

### Build Commands

```bash
# Convert markdown to Typst
npm run convert:typst

# Build with Typst
npm run build:book

# Watch mode (auto-rebuild on changes)
npm run build:typst:watch
```

### File Locations

```
typst/
├── book.typ              # Main book file
├── template.typ          # Custom functions
├── chapter-01-*.typ      # Generated chapters (from markdown)
└── chapter-02-*.typ
```

---

## Next Steps

**Master advanced layouts:**
1. **Experiment** with custom functions in `template.typ`
2. **Study** the Typst documentation: https://typst.app/docs
3. **Iterate** by editing `.typ` files and rebuilding
4. **Share** your custom templates with other cookbook authors

**Related playbooks:**
- [Playbook #2: Complete Authoring](02-complete-authoring.md)
- [Playbook #7: Troubleshooting](07-troubleshooting.md)

---

**Advanced Typst layouts** transform your cookbook from good to exceptional. Use these tools to create a unique, professional design that stands out.
