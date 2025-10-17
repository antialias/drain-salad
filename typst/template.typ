// Drain Salad Cookbook Template v2
// Enhanced design with warm minimalism and documentary aesthetic

// ============================================================================
// COLOR PALETTE
// ============================================================================

#let text-primary = rgb("#2d2823")      // Rich dark brown
#let text-secondary = rgb("#5a5045")    // Mid-tone for secondary text
#let text-tertiary = rgb("#8a7f6f")     // Muted for captions

#let accent-warm = rgb("#c17a3b")       // Burnt orange (sparingly)
#let accent-cool = rgb("#7a8c7e")       // Sage green (for callouts)
#let accent-earth = rgb("#9d826b")      // Clay (for borders/rules)

#let bg-paper = rgb("#fffef9")          // Warm white
#let bg-tint = rgb("#f7f4ed")           // Cream
#let bg-block = rgb("#efeae0")          // Darker cream for blocks
#let bg-image = rgb("#f2efe8")          // Image backgrounds

#let border-light = rgb("#ddd8cc")
#let border-medium = rgb("#c7bfad")
#let border-accent = rgb("#9d826b")

// ============================================================================
// DOCUMENT & PAGE SETUP
// ============================================================================

#set document(
  title: "Drain Salad: A Treatise on Edible Entropy",
  author: "Author Name",
)

#set page(
  paper: "us-letter",
  margin: (
    top: 0.85in,
    bottom: 1in,
    inside: 1.5in,
    outside: 1.2in,
  ),

  header: context [
    #set text(
      size: 9pt,
      fill: text-tertiary,
    )
    #if counter(page).get().first() > 1 [
      #grid(
        columns: (1fr, auto, 1fr),
        align: (left, center, right),

        // Left: Book title
        smallcaps[Drain Salad],

        // Center: Separator
        text(fill: border-medium)[|],

        // Right: Chapter title
        {
          let headings = query(heading.where(level: 1))
          if headings.len() > 0 {
            let chapter-num = counter(heading.where(level: 1)).get().first()
            if chapter-num > 0 and chapter-num <= headings.len() {
              headings.at(chapter-num - 1).body
            }
          }
        }
      )
      #v(-0.7em)
      #line(length: 100%, stroke: 0.5pt + border-light)
    ]
  ],

  footer: context [
    #set text(size: 10pt, fill: text-tertiary)
    #if counter(page).get().first() > 1 [
      #align(center)[
        #counter(page).display("1")
      ]
    ]
  ],
)

// ============================================================================
// TYPOGRAPHY
// ============================================================================

#set text(
  font: ("EB Garamond", "Garamond", "Georgia"),
  size: 12pt,
  fill: text-primary,
  hyphenate: true,
  fallback: true,
)

#set par(
  justify: true,
  leading: 0.75em,
  first-line-indent: 1.5em,
)

// Reset indent after headings
#show heading: it => {
  it
  v(0.5em)
  par(first-line-indent: 0pt)[#text(size: 0pt)[]]
}

// ============================================================================
// HEADINGS
// ============================================================================

#show heading.where(level: 1): it => {
  pagebreak()
  set text(
    font: ("Inter", "Helvetica Neue", "Helvetica"),
    size: 44pt,
    weight: "light",
    fill: text-primary,
  )
  v(2em)
  it.body
  v(0.5em)
  line(length: 100%, stroke: 2pt + accent-earth)
  v(2em)
}

#show heading.where(level: 2): it => {
  set text(
    font: ("Inter", "Helvetica Neue", "Helvetica"),
    size: 24pt,
    weight: "regular",
    fill: text-primary,
  )
  v(1.2em)
  it.body
  v(0.8em)
}

#show heading.where(level: 3): it => {
  set text(
    font: ("Inter", "Helvetica Neue", "Helvetica"),
    size: 16pt,
    weight: "medium",
    fill: text-primary,
  )
  v(0.9em)
  it.body
  v(0.6em)
}

// ============================================================================
// BLOCKQUOTE STYLING
// ============================================================================

#show quote: it => {
  set par(first-line-indent: 0pt)
  block(
    width: 100%,
    inset: (left: 1.5em, rest: 1em),
    stroke: (left: 3pt + accent-earth),
    fill: bg-tint,
  )[
    #set text(size: 11pt, style: "italic", fill: text-secondary)
    #it.body
  ]
}

// ============================================================================
// FIGURE/IMAGE DISPLAY
// ============================================================================

#show figure: it => {
  set align(center)

  block(
    width: 100%,
    breakable: false,
    spacing: 2em,
  )[
    #box(
      stroke: 0.5pt + border-light,
      inset: 0.8em,
      fill: white,
    )[
      #it.body
    ]

    #if it.caption != none [
      #v(0.8em)
      #set text(
        size: 10pt,
        style: "italic",
        fill: text-tertiary,
      )
      #set par(first-line-indent: 0pt)
      #it.caption
    ]
  ]
}

// ============================================================================
// ENHANCED CHAPTER OPENER
// ============================================================================

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
      fill: rgb(217, 212, 200, 30),  // 30% opacity
      font: ("Inter", "Helvetica Neue"),
    )[
      #str(number)
    ]
  ]

  // Main title block
  v(3in)

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

  // Epigraph
  if epigraph != none [
    v(2em)
    block(
      width: 60%,
      inset: (left: 2em),
    )[
      #set text(size: 13pt, style: "italic", fill: text-secondary)
      #epigraph
    ]
  ]

  v(2em)
}

// ============================================================================
// HERO IMAGE (Full-width, dramatic)
// ============================================================================

#let hero-image(path, caption: none) = {
  v(2em)

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
        )
        #set par(leading: 0.6em, first-line-indent: 0pt)
        #caption
      ]
    ]
  ]

  v(2em)
}

// ============================================================================
// SIDE-BY-SIDE IMAGES
// ============================================================================

#let side-by-side-images(left-path, right-path, left-caption: none, right-caption: none) = {
  v(1em)

  grid(
    columns: (1fr, 1fr),
    column-gutter: 1.5em,

    [
      #box(
        stroke: 0.5pt + border-light,
        inset: 0.5em,
        fill: white,
      )[
        #image(left-path, width: 100%)
      ]
      #if left-caption != none [
        #v(0.5em)
        #align(center)[
          #text(size: 9.5pt, style: "italic", fill: text-tertiary)[#left-caption]
        ]
      ]
    ],

    [
      #box(
        stroke: 0.5pt + border-light,
        inset: 0.5em,
        fill: white,
      )[
        #image(right-path, width: 100%)
      ]
      #if right-caption != none [
        #v(0.5em)
        #align(center)[
          #text(size: 9.5pt, style: "italic", fill: text-tertiary)[#right-caption]
        ]
      ]
    ]
  )

  v(2em)
}

// ============================================================================
// ENHANCED RECIPE BLOCK
// ============================================================================

#let recipe(
  title: "",
  serves: none,
  time: none,
  difficulty: none,
  intro: none,
  ingredients,
  instructions,
) = {

  pagebreak(weak: true)

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

          if serves != none [
            grid(
              columns: (auto, auto),
              column-gutter: 0.5em,
              text(fill: accent-warm)[●],
              [*Serves* #serves],
            )
          ],

          if time != none [
            grid(
              columns: (auto, auto),
              column-gutter: 0.5em,
              text(fill: accent-warm)[●],
              [*Time* #time],
            )
          ],

          if difficulty != none [
            grid(
              columns: (auto, auto),
              column-gutter: 0.5em,
              text(fill: accent-warm)[●],
              [*Level* #difficulty],
            )
          ],

          [],
        )
      ]
    ]

    // Intro text
    #if intro != none [
      #block(
        width: 100%,
        inset: (x: 1.8em, top: 1.5em, bottom: 1.2em),
      )[
        #set text(size: 11pt, style: "italic", fill: text-secondary)
        #set par(leading: 0.7em, first-line-indent: 0pt)
        #intro
      ]
    ]

    // Two-column layout
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

// ============================================================================
// INGREDIENTS LIST (standalone)
// ============================================================================

#let ingredients(items) = {
  block(
    fill: bg-tint,
    inset: 1em,
    radius: 3pt,
    width: 100%,
  )[
    #text(
      font: ("Inter", "Helvetica Neue"),
      size: 12pt,
      weight: "bold",
      fill: text-primary,
    )[Ingredients]

    #v(0.5em)

    #set text(size: 10.5pt)
    #set par(first-line-indent: 0pt)

    #for item in items [
      • #item \
    ]
  ]
}

// ============================================================================
// INSTRUCTIONS LIST (standalone)
// ============================================================================

#let instructions(steps) = {
  set par(first-line-indent: 0pt)

  text(
    font: ("Inter", "Helvetica Neue"),
    size: 12pt,
    weight: "bold",
    fill: text-primary,
  )[Instructions]

  v(0.5em)

  enum(
    tight: false,
    numbering: "1.",
    ..steps
  )
}

// ============================================================================
// AUTHOR'S NOTE
// ============================================================================

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

// ============================================================================
// PULL QUOTE
// ============================================================================

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

// ============================================================================
// CALLOUT BOX
// ============================================================================

#let callout(
  title: "",
  type: "tip",
  body
) = {
  let colors = (
    tip: (bg: rgb("#e8f5e9"), border: rgb("#4caf50"), icon: "💡"),
    warning: (bg: rgb("#fff3e0"), border: rgb("#ff9800"), icon: "⚠️"),
    note: (bg: rgb("#e3f2fd"), border: rgb("#2196f3"), icon: "ℹ️"),
  )

  let color = colors.at(type)

  block(
    fill: color.bg,
    stroke: (left: 3pt + color.border),
    inset: (left: 1em, rest: 0.8em),
    radius: 3pt,
    width: 100%,
  )[
    #set par(first-line-indent: 0pt)
    #text(weight: "bold", fill: color.border)[
      #color.icon #title
    ]
    #v(0.3em)
    #body
  ]
}

// ============================================================================
// SECTION DIVIDER
// ============================================================================

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

// ============================================================================
// IMAGE CAPTION
// ============================================================================

#let caption(body) = {
  set text(size: 9.5pt, style: "italic", fill: text-tertiary)
  set par(first-line-indent: 0pt)
  align(center)[#body]
}

// ============================================================================
// COMPARISON (side-by-side correct vs incorrect)
// ============================================================================

#let comparison(left-img, right-img, left-label: "Correct", right-label: "Incorrect") = {
  grid(
    columns: (1fr, 1fr),
    column-gutter: 1.5em,

    [
      #image(left-img, width: 100%)
      #v(0.5em)
      #align(center)[
        #text(fill: rgb("#4caf50"), weight: "bold", size: 12pt)[✓ #left-label]
      ]
    ],

    [
      #image(right-img, width: 100%)
      #v(0.5em)
      #align(center)[
        #text(fill: rgb("#f44336"), weight: "bold", size: 12pt)[✗ #right-label]
      ]
    ]
  )
}

// ============================================================================
// VARIETY GRID (for taxonomy chapter)
// ============================================================================

#let variety-grid(varieties, columns: 4) = {
  grid(
    columns: (1fr,) * columns,
    column-gutter: 1em,
    row-gutter: 1.5em,

    ..varieties.map(v => {
      box()[
        #image(v.image, width: 100%)
        #v(0.5em)
        #align(center)[
          #text(size: 11pt, weight: "bold")[#v.name]
          #v(0.2em)
          #text(size: 9pt, fill: text-tertiary)[#v.description]
        ]
      ]
    })
  )
}

// ============================================================================
// SIDE-BY-SIDE LISTS (Broke vs Flush tier)
// ============================================================================

#let side-by-side-lists(
  left-title,
  left-items,
  right-title,
  right-items,
  left-color: rgb("#fff3e0"),
  right-color: rgb("#e8f5e9")
) = {
  grid(
    columns: (1fr, 1fr),
    column-gutter: 2em,

    [
      #block(fill: left-color, inset: 1em, radius: 4pt, width: 100%)[
        #text(size: 14pt, weight: "bold", fill: text-primary)[#left-title]
        #v(0.5em)
        #set par(first-line-indent: 0pt)
        #for item in left-items [
          • #item \
        ]
      ]
    ],

    [
      #block(fill: right-color, inset: 1em, radius: 4pt, width: 100%)[
        #text(size: 14pt, weight: "bold", fill: text-primary)[#right-title]
        #v(0.5em)
        #set par(first-line-indent: 0pt)
        #for item in right-items [
          • #item \
        ]
      ]
    ]
  )
}

// ============================================================================
// MARGIN NOTE
// ============================================================================

#let margin-note(body) = {
  place(
    right + top,
    dx: 1.5in + 0.5in,
    dy: -0.5em,
    box(
      width: 2in,
      fill: bg-tint,
      stroke: 1pt + border-light,
      inset: 0.8em,
      radius: 3pt,
    )[
      #set text(size: 9pt, fill: text-tertiary)
      #set par(first-line-indent: 0pt, leading: 0.5em)
      #body
    ]
  )
}

// ============================================================================
// EXPORT TEMPLATE FUNCTION
// ============================================================================

#let template(body) = {
  body
}
