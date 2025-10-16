// Drain Salad Cookbook Template
// A warm, earthy cookbook design

// Document setup
#set document(
  title: "Drain Salad: A Treatise on Edible Entropy",
  author: "Author Name",
)

// Page setup
#set page(
  paper: "us-letter",
  margin: (x: 1.5in, y: 1in),
  header: context [
    #set text(size: 10pt, fill: rgb("#8b7355"))
    #if counter(page).get().first() > 1 [
      #smallcaps[Drain Salad]
      #h(1fr)
      Chapter #counter(heading.where(level: 1)).get().first()
    ]
  ],
  footer: context [
    #set text(size: 10pt, fill: rgb("#666"))
    #h(1fr)
    #counter(page).display("1")
    #h(1fr)
  ],
)

// Typography
#set text(
  font: "Ga

ramond",
  size: 11.5pt,
  fallback: true,
)

#set par(
  justify: true,
  leading: 0.65em,
  first-line-indent: 1.5em,
)

// Reset indent after headings
#show heading: it => {
  it
  v(0.5em)
  par(first-line-indent: 0pt)[#text(size: 0pt)[]]
}

// Heading styles
#show heading.where(level: 1): it => {
  pagebreak(weak: true)
  set text(
    font: "Helvetica Neue",
    size: 32pt,
    weight: "light",
    fill: rgb("#4a4035"),
  )
  v(1em)
  it.body
  v(1.5em)
  line(length: 100%, stroke: 1pt + rgb("#8b7355"))
  v(2em)
}

#show heading.where(level: 2): it => {
  set text(
    font: "Helvetica Neue",
    size: 20pt,
    weight: "regular",
    fill: rgb("#4a4035"),
  )
  v(1em)
  it.body
  v(0.8em)
}

#show heading.where(level: 3): it => {
  set text(
    font: "Helvetica Neue",
    size: 14pt,
    weight: "medium",
    fill: rgb("#4a4035"),
  )
  v(0.8em)
  it.body
  v(0.5em)
}

// Recipe block styling
#let recipe(
  title: "",
  serves: "",
  time: "",
  difficulty: "",
  body
) = {
  block(
    width: 100%,
    fill: rgb("#fdfdfb"),
    stroke: 1pt + rgb("#e5e0d8"),
    inset: 1.5em,
    radius: 4pt,
    breakable: false,
  )[
    #set par(first-line-indent: 0pt)

    // Recipe header
    #text(
      font: "Helvetica Neue",
      size: 18pt,
      weight: "bold",
      fill: rgb("#4a4035"),
    )[#title]

    // Recipe metadata
    #if serves != "" or time != "" or difficulty != "" [
      #v(0.5em)
      #block(
        fill: rgb("#f5f3f0"),
        inset: 0.8em,
        radius: 3pt,
        stroke: none,
      )[
        #set text(size: 9.5pt, fill: rgb("#666"))
        #grid(
          columns: (auto, auto, auto),
          column-gutter: 2em,
          if serves != "" [*Serves:* #serves],
          if time != "" [*Time:* #time],
          if difficulty != "" [*Difficulty:* #difficulty],
        )
      ]
    ]

    #v(1em)
    #body
  ]
}

// Ingredients list
#let ingredients(items) = {
  block(
    fill: rgb("#f9f8f5"),
    inset: 1em,
    radius: 3pt,
    width: 100%,
  )[
    #text(
      font: "Helvetica Neue",
      size: 12pt,
      weight: "bold",
      fill: rgb("#4a4035"),
    )[Ingredients]

    #v(0.5em)

    #set text(size: 10.5pt)
    #set par(first-line-indent: 0pt)

    #for item in items [
      • #item \
    ]
  ]
}

// Instructions block
#let instructions(steps) = {
  set par(first-line-indent: 0pt)
  text(
    font: "Helvetica Neue",
    size: 12pt,
    weight: "bold",
    fill: rgb("#4a4035"),
  )[Instructions]

  v(0.5em)

  enum(
    tight: false,
    numbering: "1.",
    ..steps
  )
}

// Callout box (for tips, warnings, notes)
#let callout(
  title: "",
  type: "tip",  // tip, warning, note
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

// Pull quote
#let pullquote(body) = {
  align(center)[
    #block(width: 80%)[
      #set text(
        size: 13pt,
        style: "italic",
        fill: rgb("#4a4035"),
      )
      #set par(first-line-indent: 0pt)
      #v(1em)
      "#body"
      #v(1em)
    ]
  ]
}

// Section divider
#let divider = {
  v(1.5em)
  align(center)[
    #text(size: 16pt, fill: rgb("#8b7355"))[
      • • •
    ]
  ]
  v(1.5em)
}

// Image caption
#let caption(body) = {
  set text(size: 9.5pt, style: "italic", fill: rgb("#666"))
  set par(first-line-indent: 0pt)
  align(center)[#body]
}

// Export functions for use in chapters
#let template(body) = {
  body
}
