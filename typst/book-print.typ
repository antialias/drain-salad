#import "@preview/orange-book:0.6.1": book, make-index, index
#import "template.typ": hero-image, recipe, divider

// Print-ready configuration with bleed
// KDP Requirements for 6x9 book with bleed:
// - Trim size: 6" x 9"
// - Bleed: 0.125" on all sides
// - Final page size: 6.25" x 9.25"
// - Interior: Full color

#show: book.with(
  title: "Drain Salad",
  subtitle: "A Treatise on Edible Entropy: Upstream Capture and the Cuisine of Second Harvest",
  author: "[Author Name]",
  main-color: rgb("#9d826b"),
  lang: "en",
  paper-size: "us-letter",  // Will manually add bleed in post-processing
)

// Front Matter
#include "00-front-matter.typ"

#pagebreak()

// Chapters
#include "chapter-01-history.typ"
#include "chapter-02-anatomy.typ"
#include "chapter-03-clean-catch-method.typ"
#include "chapter-04-drain-pantry.typ"
#include "chapter-05-techniques.typ"
#include "chapter-06-foundations.typ"
#include "chapter-07-salads-small-plates.typ"
#include "chapter-08-mains.typ"
#include "chapter-09-ferments-condiments.typ"
#include "chapter-10-taxonomy.typ"
#include "chapter-11-use-cases.typ"
#include "chapter-12-appendices.typ"
