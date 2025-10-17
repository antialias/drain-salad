# Drain Salad Cookbook: Typst Template Design Recommendations

## Current State Analysis

Your current template is solid with good fundamentals:
- **Strengths**: Warm earthy palette (#4a4035, #8b7355), classic typography (Garamond body, Helvetica headings), thoughtful components
- **Opportunities**: More visual drama, better use of whitespace, stronger hierarchy, more contemporary feel

## Design Philosophy

The Drain Salad cookbook has a unique voice: unglamorous, authentic, personal, technically precise. The design should reflect this through:

1. **Honest Brutalism**: Clean lines, generous whitespace, letting content breathe
2. **Documentary Aesthetic**: Archival feel, matte finishes (metaphorically), authentic photography presentation
3. **Technical Precision**: Clear hierarchy, structured layouts, systematic organization
4. **Warm Minimalism**: Restraint with warmth, fewer elements but more intentional

Think: Kinfolk meets Modernist Cuisine meets a well-worn field guide.

---

## 1. Typography Overhaul

### Current Issues
- Helvetica for headings feels corporate/generic
- Line length could be optimized
- Lacking typographic hierarchy nuance

### Recommendations

**Primary Typeface Stack**:
```typst
// Body: Keep Garamond but with better fallbacks
#set text(
  font: ("EB Garamond", "Garamond", "Georgia", "Baskerville"),
  size: 11pt,
  hyphenate: true,
)

// Headings: Replace Helvetica with something more characterful
// Option A: Serif for continuity (contemporary feel)
font: ("Crimson Pro", "Garamond Premier Pro", "Garamond")

// Option B: Grotesque sans for contrast (editorial feel)
font: ("Inter", "Forma DJR Micro", "Helvetica Neue")

// Option C: Slab serif for impact (cookbook tradition with edge)
font: ("Zilla Slab", "Roboto Slab", "Rockwell")
```

**Recommended: Option B (Grotesque Sans)**
- Use **Inter** (free, excellent web font with optical sizing)
- Creates clean contrast with Garamond body
- Feels contemporary but not trendy
- Excellent readability at all sizes

**Size Scale** (modular scale 1.25):
```typst
// Chapter (Level 1): 44pt (3.667em)
// Section (Level 2): 27.5pt (2.292em)
// Subsection (Level 3): 17.2pt (1.433em)
// Body: 12pt (1em) - increase from 11.5pt
// Caption: 10pt (0.833em)
// Aside: 10.5pt (0.875em)
```

**Line Height**:
```typst
#set par(
  leading: 0.75em,  // Increase from 0.65em for better readability
  justify: true,
)
```

---

## 2. Color Palette Refinement

### Current Palette
```
Primary text: #4a4035 (warm brown)
Accent: #8b7355 (tan)
Gray: #666
Backgrounds: #fdfdfb, #f9f8f5
```

### Enhanced Palette

**Core Colors**:
```typst
// Text
#let text-primary = rgb("#2d2823")      // Darker, richer brown
#let text-secondary = rgb("#5a5045")    // Mid-tone for secondary text
#let text-tertiary = rgb("#8a7f6f")     // Muted for captions

// Accents
#let accent-warm = rgb("#c17a3b")       // Burnt orange (use sparingly)
#let accent-cool = rgb("#7a8c7e")       // Sage green (for callouts)
#let accent-earth = rgb("#9d826b")      // Clay (for borders/rules)

// Backgrounds
#let bg-paper = rgb("#fffef9")          // Warm white
#let bg-tint = rgb("#f7f4ed")           // Cream
#let bg-block = rgb("#efeae0")          // Darker cream for blocks
#let bg-image = rgb("#f2efe8")          // Image backgrounds

// Functional
#let border-light = rgb("#ddd8cc")
#let border-medium = rgb("#c7bfad")
#let border-accent = rgb("#9d826b")
```

**Usage Strategy**:
- Primary text in near-black brown (#2d2823)
- Accents VERY sparingly (burnt orange for emphasis only)
- Sage green for tips/callouts
- Generous use of cream backgrounds for visual hierarchy

---

## 3. Page Layout Enhancement

### Current: Standard margins, basic header/footer
### Recommendation: Asymmetric layout with breathing room

```typst
#set page(
  paper: "us-letter",
  // Asymmetric margins for visual interest
  margin: (
    top: 0.85in,
    bottom: 1in,
    inside: 1.5in,   // Binding edge
    outside: 1.2in,  // Outer edge (narrower for dynamic feel)
  ),

  // Enhanced header with running chapter info
  header: context [
    #set text(
      size: 9pt,
      fill: text-tertiary,
      tracking: 0.05em,  // Letter-spacing for elegance
    )
    #if counter(page).get().first() > 1 [
      #grid(
        columns: (1fr, auto, 1fr),
        align: (left, center, right),

        // Left: Book title
        smallcaps[Drain Salad],

        // Center: Chapter number (subtle)
        text(fill: border-medium)[|],

        // Right: Chapter title
        {
          let chapter-num = counter(heading.where(level: 1)).get().first()
          let chapter-title = query(heading.where(level: 1))
            .at(chapter-num - 1).body
          chapter-title
        }
      )
      #v(-0.7em)
      #line(length: 100%, stroke: 0.5pt + border-light)
    ]
  ],

  // Minimal footer with page number
  footer: context [
    #set text(size: 10pt, fill: text-tertiary)
    #if counter(page).get().first() > 1 [
      #align(center)[
        #counter(page).display("1")
      ]
    ]
  ],
)
```

**Bleed Setup** (for print-ready PDFs):
```typst
// Add 0.125in bleed all around
#set page(
  width: 8.5in + 0.25in,   // Letter + bleed both sides
  height: 11in + 0.25in,
  margin: (
    top: 0.85in + 0.125in,
    bottom: 1in + 0.125in,
    inside: 1.5in + 0.125in,
    outside: 1.2in + 0.125in,
  ),
)
```

---

## 4. Chapter Opener Redesign

### Current: Basic pagebreak with title
### Recommendation: Dramatic full-page opener

```typst
#let chapter-opener(number, title, subtitle: "", epigraph: none) = {
  pagebreak()

  // Massive chapter number as background element
  place(
    top + right,
    dx: -0.3in,
    dy: 0.5in,
  )[
    #text(
      size: 180pt,
      weight: "ultralight",
      fill: rgb(217, 212, 200, 30),  // 30% opacity cream
      font: ("Inter", "Helvetica Neue"),
    )[
      #str(number)
    ]
  ]

  // Main title block
  v(3in)  // Space from top

  block(
    width: 70%,
    breakable: false,
  )[
    // "Chapter N" label
    #text(
      size: 11pt,
      weight: "medium",
      fill: accent-earth,
      tracking: 0.15em,
      font: ("Inter", "Helvetica Neue"),
    )[
      CHAPTER #number
    ]

    #v(0.8em)

    // Chapter title
    #text(
      size: 44pt,
      weight: "light",
      fill: text-primary,
      font: ("Inter", "Helvetica Neue"),
    )[
      #title
    ]

    // Subtitle if provided
    #if subtitle != "" [
      #v(0.6em)
      #text(
        size: 17pt,
        style: "italic",
        fill: text-secondary,
      )[
        #subtitle
      ]
    ]

    // Decorative rule
    #v(1.5em)
    #line(length: 40%, stroke: 2pt + accent-earth)
  ]

  // Epigraph (quote) if provided
  #if epigraph != none [
    #v(2em)
    #block(
      width: 60%,
      inset: (left: 2em),
    )[
      #set text(size: 13pt, style: "italic", fill: text-secondary)
      #epigraph
    ]
  ]

  #v(2em)
}
```

---

## 5. Image Presentation Overhaul

### Philosophy: Let images breathe, create visual rhythm

**Hero Images** (full-width, dramatic):
```typst
#let hero-image(path, caption: none, bleed: false) = {
  v(2em)

  if bleed {
    // Full bleed to page edges
    place(
      top + left,
      dx: -page.margin.outside,
      float: true,
    )[
      #box(width: page.width - page.margin.inside)[
        #image(path, width: 100%)
      ]
    ]
  } else {
    // Contained but generous
    align(center)[
      #box(
        width: 95%,
        stroke: none,
        fill: bg-image,
        inset: 1.5em,
      )[
        #image(path, width: 100%)

        #if caption != none [
          #v(1.2em)
          #set text(
            size: 10pt,
            style: "italic",
            fill: text-tertiary,
            tracking: 0.02em,
          )
          #set par(leading: 0.6em)
          #caption
        ]
      ]
    ]
  ]

  v(2em)
}
```

**Process Grid** (step-by-step photos):
```typst
#let process-grid(images, columns: 3, numbered: true) = {
  let cell-width = (100% - (columns - 1) * 1em) / columns

  grid(
    columns: (1fr,) * columns,
    column-gutter: 1.5em,
    row-gutter: 1.5em,

    ..images.enumerate().map(((i, img)) => {
      box(
        stroke: 1pt + border-light,
        inset: 0.8em,
        fill: white,
      )[
        // Image
        #image(img.path, width: 100%)

        // Step number + caption
        #if numbered [
          #v(0.6em)
          #grid(
            columns: (auto, 1fr),
            column-gutter: 0.5em,

            // Step number badge
            align(horizon)[
              #box(
                fill: accent-earth,
                inset: (x: 0.6em, y: 0.3em),
                radius: 50%,
              )[
                #text(
                  size: 10pt,
                  weight: "bold",
                  fill: white,
                )[#str(i + 1)]
              ]
            ],

            // Caption
            align(horizon + left)[
              #text(size: 9.5pt, fill: text-secondary)[
                #img.caption
              ]
            ]
          )
        ] else [
          #if img.caption != none [
            #v(0.5em)
            #text(size: 9.5pt, fill: text-secondary)[
              #img.caption
            ]
          ]
        ]
      ]
    })
  )
}
```

**Image Gallery** (taxonomy, varieties):
```typst
#let image-gallery(items, columns: 4) = {
  v(1.5em)

  grid(
    columns: (1fr,) * columns,
    column-gutter: 1.2em,
    row-gutter: 2em,

    ..items.map(item => {
      align(center)[
        // Image container with subtle shadow
        #box(
          stroke: none,
          fill: white,
          inset: 0.5em,
          // Simulate shadow with layered boxes
        )[
          #image(item.path, width: 100%)
        ]

        // Label
        #v(0.8em)
        #text(
          size: 11pt,
          weight: "medium",
          fill: text-primary,
        )[
          #item.name
        ]

        // Description
        #if item.description != none [
          #v(0.3em)
          #text(
            size: 9pt,
            fill: text-tertiary,
            style: "italic",
          )[
            #item.description
          ]
        ]
      ]
    })
  )

  v(1.5em)
}
```

---

## 6. Recipe Block Redesign

### Current: Basic box with metadata
### Recommendation: Structured, scannable, elegant

```typst
#let recipe(
  title: "",
  serves: none,
  time: none,
  difficulty: none,
  intro: none,
  ingredients,
  instructions,
) = {

  pagebreak(weak: true)  // Try to keep together

  block(
    width: 100%,
    fill: bg-tint,
    stroke: none,
    inset: 0pt,
    radius: 0pt,
    breakable: true,
  )[
    // Title bar
    #block(
      width: 100%,
      fill: accent-earth,
      inset: (x: 1.8em, y: 1.2em),
    )[
      #set text(
        font: ("Inter", "Helvetica Neue"),
        size: 24pt,
        weight: "bold",
        fill: white,
      )
      #title
    ]

    // Metadata bar
    #if serves != none or time != none or difficulty != none [
      #block(
        width: 100%,
        fill: bg-block,
        inset: (x: 1.8em, y: 0.9em),
      )[
        #set text(size: 10pt, fill: text-secondary)

        #grid(
          columns: (auto, auto, auto, 1fr),
          column-gutter: 2.5em,

          // Serves
          if serves != none [
            grid(
              columns: (auto, auto),
              column-gutter: 0.5em,
              text(fill: accent-warm)[●],
              [*Serves* #serves],
            )
          ],

          // Time
          if time != none [
            grid(
              columns: (auto, auto),
              column-gutter: 0.5em,
              text(fill: accent-warm)[●],
              [*Time* #time],
            )
          ],

          // Difficulty badge
          if difficulty != none [
            grid(
              columns: (auto, auto),
              column-gutter: 0.5em,
              text(fill: accent-warm)[●],
              [*Level* #difficulty],
            )
          ],

          // Spacer
          [],
        )
      ]
    ]

    // Intro text (optional)
    #if intro != none [
      #block(
        width: 100%,
        inset: (x: 1.8em, top: 1.5em, bottom: 1.2em),
      )[
        #set text(size: 11pt, style: "italic", fill: text-secondary)
        #set par(leading: 0.7em)
        #intro
      ]
    ]

    // Two-column layout: ingredients + instructions
    #block(
      width: 100%,
      inset: (x: 1.8em, top: 1.2em, bottom: 1.8em),
    )[
      #grid(
        columns: (38%, 1fr),
        column-gutter: 2.5em,

        // Left: Ingredients
        [
          #set par(leading: 0.6em, first-line-indent: 0pt)

          #text(
            font: ("Inter", "Helvetica Neue"),
            size: 13pt,
            weight: "semibold",
            fill: text-primary,
          )[Ingredients]

          #v(0.8em)

          #set text(size: 10.5pt, fill: text-primary)

          #for item in ingredients [
            • #item \
            #v(0.3em)
          ]
        ],

        // Right: Instructions
        [
          #set par(leading: 0.7em, first-line-indent: 0pt)

          #text(
            font: ("Inter", "Helvetica Neue"),
            size: 13pt,
            weight: "semibold",
            fill: text-primary,
          )[Instructions]

          #v(0.8em)

          #set text(size: 11pt, fill: text-primary)

          #set enum(
            spacing: 1em,
            tight: false,
            numbering: n => [
              #box(
                fill: accent-cool,
                inset: (x: 0.5em, y: 0.25em),
                radius: 3pt,
              )[
                #text(
                  size: 10pt,
                  weight: "bold",
                  fill: white,
                )[#n]
              ]
            ],
          )

          #enum(
            ..instructions
          )
        ]
      )
    ]
  ]
}
```

---

## 7. Callouts & Special Elements

**Author's Note** (personal asides):
```typst
#let authors-note(body) = {
  block(
    width: 100%,
    fill: bg-tint,
    stroke: (left: 4pt + accent-warm),
    inset: (left: 1.5em, rest: 1.2em),
    radius: 0pt,
  )[
    #set par(leading: 0.7em, first-line-indent: 0pt)

    #text(
      font: ("Inter", "Helvetica Neue"),
      size: 10pt,
      weight: "bold",
      fill: accent-warm,
      tracking: 0.08em,
    )[AUTHOR'S NOTE]

    #v(0.6em)

    #set text(size: 10.5pt, style: "italic", fill: text-secondary)
    #body
  ]
}
```

**Technical Tip** (precision cooking notes):
```typst
#let tech-tip(title: "Technique", body) = {
  block(
    width: 100%,
    fill: rgb(245, 247, 245),  // Very light sage
    stroke: (left: 3pt + accent-cool),
    inset: (left: 1.2em, rest: 1em),
    radius: 0pt,
  )[
    #set par(leading: 0.65em, first-line-indent: 0pt)

    #grid(
      columns: (auto, 1fr),
      column-gutter: 0.6em,

      text(fill: accent-cool, size: 14pt)[◆],

      text(
        font: ("Inter", "Helvetica Neue"),
        size: 10pt,
        weight: "semibold",
        fill: accent-cool,
      )[#title.upper()],
    )

    #v(0.5em)
    #set text(size: 10pt, fill: text-primary)
    #body
  ]
}
```

**Pull Quote** (emphasize key concepts):
```typst
#let pullquote(body, attribution: none) = {
  v(2em)

  align(center)[
    #block(
      width: 75%,
      inset: (x: 2em, y: 1.5em),
    )[
      // Opening quote mark
      #text(
        size: 60pt,
        fill: rgb(217, 212, 200),
        font: ("EB Garamond", "Garamond"),
      )["]

      #v(-2.5em)

      #set text(
        size: 15pt,
        style: "italic",
        fill: text-primary,
        weight: "regular",
      )
      #set par(leading: 0.8em, first-line-indent: 0pt)

      #body

      #if attribution != none [
        #v(0.8em)
        #text(
          size: 11pt,
          style: "normal",
          fill: text-tertiary,
          font: ("Inter", "Helvetica Neue"),
        )[— #attribution]
      ]
    ]
  ]

  v(2em)
}
```

---

## 8. Section Dividers

**Simple Divider**:
```typst
#let divider = {
  v(2em)
  align(center)[
    #text(
      size: 14pt,
      fill: accent-earth,
      tracking: 0.5em,
    )[• • •]
  ]
  v(2em)
}
```

**Chapter End Marker**:
```typst
#let chapter-end = {
  v(3em)
  align(center)[
    #box(
      fill: accent-earth,
      width: 3em,
      height: 3pt,
    )
  ]
  v(2em)
}
```

---

## 9. Table of Contents Enhancement

```typst
#outline(
  title: [
    #v(1in)
    #text(
      size: 44pt,
      weight: "light",
      fill: text-primary,
      font: ("Inter", "Helvetica Neue"),
    )[Contents]
    #v(1.5em)
  ],

  indent: 1.5em,
  fill: text(fill: border-medium)[
    #box(width: 1fr, line(length: 100%, stroke: (
      thickness: 0.5pt,
      paint: border-light,
      dash: "dotted",
    )))
  ],
)
```

---

## 10. Advanced: Baseline Grid Alignment

For professional typesetting quality, consider implementing baseline grid alignment:

```typst
// Define baseline grid
#let baseline-grid = 12pt  // Match body leading

#show par: it => {
  // Snap to baseline grid
  set par(spacing: baseline-grid)
  it
}

#show heading: it => {
  // Ensure headings align to grid
  let height = measure(it).height
  let remainder = calc.rem(height, baseline-grid)
  let compensation = if remainder == 0pt { 0pt } else {
    baseline-grid - remainder
  }

  it
  v(compensation)
}
```

---

## Implementation Priority

### Phase 1: Core Improvements (High Impact, Low Risk)
1. ✅ Refine color palette
2. ✅ Implement new chapter opener
3. ✅ Redesign recipe blocks
4. ✅ Enhance image presentation

### Phase 2: Typography (Medium Impact, Medium Risk)
5. ✅ Switch to Inter for headings
6. ✅ Increase body size to 12pt
7. ✅ Implement modular scale
8. ✅ Refine line heights

### Phase 3: Polish (Lower Impact, Higher Effort)
9. ✅ Implement baseline grid
10. ✅ Add bleed for print
11. ✅ Create advanced callout styles
12. ✅ Refine TOC design

---

## Testing Checklist

Before finalizing:
- [ ] Print test pages at 100% scale
- [ ] Check readability at 11pt and 12pt body sizes
- [ ] Verify color contrast meets WCAG AA standards
- [ ] Test recipe blocks with varying content lengths
- [ ] Ensure images maintain quality at print resolution (300dpi)
- [ ] Check chapter openers with long and short titles
- [ ] Verify page breaks don't orphan headings
- [ ] Test with different paper stocks (cream vs. white)

---

## Font Licensing Notes

**Free/Open Fonts Used**:
- **EB Garamond**: SIL Open Font License (commercial use OK)
- **Inter**: SIL Open Font License (commercial use OK)
- **Zilla Slab**: SIL Open Font License (commercial use OK)
- **Crimson Pro**: SIL Open Font License (commercial use OK)

All recommended fonts are free and open-source, suitable for commercial publishing.

---

## Next Steps

1. Create a `template-v2.typ` file with these improvements
2. Test with 2-3 sample chapters
3. Get feedback on readability and aesthetic
4. Iterate based on actual content flow
5. Finalize before bulk generation

Would you like me to:
- Implement a specific section first?
- Create a complete template-v2.typ file?
- Generate sample pages showing before/after?
