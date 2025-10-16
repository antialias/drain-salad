#import "template.typ": *

// Title Page
#align(center + horizon)[
  #text(size: 48pt, weight: "light", fill: rgb("#4a4035"))[
    *Drain Salad*
  ]

  #v(1em)

  #text(size: 24pt, style: "italic", fill: rgb("#8b7355"))[
    A Treatise on Edible Entropy
  ]

  #v(2em)

  #text(size: 14pt, fill: rgb("#666"))[
    Upstream Capture and the Cuisine of Second Harvest
  ]

  #v(4em)

  #text(size: 16pt)[
    [Author Name]
  ]
]

#pagebreak()

// Table of Contents
#outline(
  title: "Contents",
  indent: true,
)

#pagebreak()

// Note: Add chapters here as they're converted
// For now, this will be populated programmatically

#pagebreak()

= Coming Soon

This Typst edition is being prepared. Chapters will be added as they're converted from Markdown.

For now, use the conversion script:
```bash
node scripts/markdown-to-typst.js manuscript/chapter-XX.md
```
