# Typst Layout Features - Usage Guide

This guide shows how to use the fancy Typst layout features in your Markdown chapters.

## Table of Contents
1. [Author's Notes (Margin/Inline)](#authors-notes)
2. [Side-by-Side Comparisons](#comparisons)
3. [Embedded Typst Blocks](#embedded-typst)
4. [Timeline/Process Flows](#timelines)
5. [Configuration Grids](#configuration-grids)
6. [Variety Galleries](#variety-galleries)

---

## Author's Notes

### Inline Author's Note
Use HTML comments to wrap personal anecdotes:

```markdown
<!-- authors-note -->
**December 2021:** I learned this the hard way when my "Clean-Catch" tray slipped into the disposal. The grinding sound still haunts me.
<!-- /authors-note -->
```

### Margin Note
For shorter notes that don't interrupt flow:

```markdown
<!-- margin-note -->
This saved me $47 in one week!
<!-- /margin-note -->
```

---

## Comparisons

### Side-by-Side Image Comparison
Perfect for "Correct vs Incorrect" images:

```markdown
<!-- comparison: left="Correct", right="Incorrect" -->
![Correctly toasted breadcrumbs](images/correct-breadcrumbs.png)
![Burnt breadcrumbs](images/burnt-breadcrumbs.png)
<!-- /comparison -->
```

The labels are optional; they default to "Correct" and "Incorrect":

```markdown
<!-- comparison -->
![Good ferment](images/good-ferment.png)
![Bad ferment](images/bad-ferment.png)
<!-- /comparison -->
```

---

## Embedded Typst Blocks

For complex layouts that need Typst's full power, embed Typst code directly:

### Timeline Example (Fermentation Stages)

````markdown
```typst
#timeline((
  (day: "Day 1", description: "Fresh vegetables in brine", image: "../images/day1.png"),
  (day: "Day 5", description: "Active fermentation (bubbles visible)", image: "../images/day5.png"),
  (day: "Day 10", description: "Finished ferment (tangy, pickled look)", image: "../images/day10.png"),
))
```
````

### Configuration Grid Example

````markdown
```typst
#config-comparison((
  (
    title: "Config 1: Minimalist",
    image: "../images/config-1.png",
    description: "Just a bowl and small container. Works for quick catches."
  ),
  (
    title: "Config 2: Counter Station",
    image: "../images/config-2.png",
    description: "Cutting board, bowl, and tools. The everyday setup."
  ),
  (
    title: "Config 3: Pro Setup",
    image: "../images/config-3.png",
    description: "Full drawer organizer with compartments. Maximum efficiency."
  ),
))
```
````

### Variety Grid (For Taxonomy Chapter)

````markdown
```typst
#variety-grid((
  (name: "Classic Green", description: "Kale stems + herb trimmings", image: "../images/var1.png"),
  (name: "Root Medley", description: "Carrot peels + potato skins", image: "../images/var2.png"),
  (name: "Citrus Burst", description: "Orange/lemon peels", image: "../images/var3.png"),
  (name: "Allium Heavy", description: "Onion ends + garlic skins", image: "../images/var4.png"),
  (name: "Bread-Based", description: "Stale bread + crusts", image: "../images/var5.png"),
  (name: "Funky Fermented", description: "Week-old ferments", image: "../images/var6.png"),
  (name: "Roasted Char", description: "Blackened veggie bits", image: "../images/var7.png"),
  (name: "Pasta Water Special", description: "Starchy liquid base", image: "../images/var8.png"),
), columns: 4)
```
````

### Side-by-Side Lists (Broke vs Flush Tier)

````markdown
```typst
#side-by-side-lists(
  "Broke Tier ($20 pantry)",
  (
    "Store-brand olive oil",
    "Basic soy sauce",
    "Table salt",
    "Black pepper",
    "Garlic powder",
  ),
  "Flush Tier ($150 pantry)",
  (
    "Imported EVOO",
    "Aged balsamic",
    "Finishing salts (3 kinds)",
    "Tellicherry peppercorns",
    "Fresh garlic confit",
  )
)
```
````

---

## Chapter Openers

For dramatic chapter openings with full-width images:

````markdown
```typst
#chapter-opener(
  "3",
  "The Clean-Catch Method",
  subtitle: "Upstream Capture Systems for the Home Kitchen",
  image-path: "../images/chapter-03-hero.png"
)
```
````

---

## Two-Column Recipe Layout

For recipes with ingredients on the left and instructions on the right:

````markdown
```typst
#recipe-two-col(
  title: "Sludge Caesar",
  serves: "4",
  time: "15 min",
  difficulty: "easy",
  ingredients: [
    - 4 cups stale bread scraps (cubed)
    - 3 tbsp anchovy paste from the back of your fridge
    - 2 garlic cloves (or 1 tbsp roasted garlic confit)
    - ¼ cup parmesan rinds (grated fine)
    - 2 tbsp olive oil (or garlic confit oil)
    - Cracked black pepper to taste
  ],
  instructions: [
    + Toast bread cubes in a dry pan until golden and crispy (5-7 min)
    + Mash anchovy paste and garlic into a thick paste
    + Toss warm croutons with paste, add oil to coat
    + Top with grated parmesan and pepper
    + Serve immediately while still warm
  ]
)
```
````

---

## Tips

1. **Keep Markdown for body text** - These special features are for structured content only
2. **Use HTML comments for simple cases** - author-note, comparison, margin-note
3. **Use embedded Typst for complex layouts** - timelines, grids, custom arrangements
4. **Images paths are relative** - From the Typst file location (usually `typst/chapters/`)
5. **Test incrementally** - Convert one chapter at a time to verify layouts

---

## Converting Your Markdown

After adding these markers, convert to Typst:

```bash
# Single chapter
npm run convert:typst -- manuscript/chapter-03-clean-catch.md

# Or manually
node scripts/markdown-to-typst.js manuscript/chapter-06-foundations.md
```

Then build the PDF:

```bash
npm run build:typst
```

Or watch for changes:

```bash
npm run build:typst:watch
```

---

## Example: Full Chapter 6 Excerpt

````markdown
# Foundations

Every Drain Salad begins with the fundamentals...

<!-- authors-note -->
**November 2021:** My first attempt at brown-butter breadcrumbs resulted in a smoke alarm incident. Start on medium heat, not high!
<!-- /authors-note -->

## Brown-Butter Breadcrumbs

```typst
#recipe-two-col(
  title: "Brown-Butter Breadcrumbs",
  serves: "Makes 2 cups",
  time: "10 min",
  difficulty: "medium",
  ingredients: [
    - 2 cups stale bread (any kind)
    - 4 tbsp butter
    - ½ tsp salt
    - Optional: herbs, garlic, parmesan
  ],
  instructions: [
    + Tear bread into rough pieces, pulse in food processor
    + Melt butter in wide pan over medium heat
    + Watch carefully as it foams and turns golden-brown (3-4 min)
    + Add breadcrumbs immediately, stir constantly
    + Cook until deep golden and fragrant (4-5 min)
    + Season with salt, cool on paper towels
  ]
)
```

### Getting the Color Right

<!-- comparison: left="Perfect Golden", right="Too Dark" -->
![Correct brown butter breadcrumbs](images/correct-breadcrumbs.png)
![Burnt breadcrumbs](images/burnt-breadcrumbs.png)
<!-- /comparison -->

The key is watching for that nutty aroma...
````

---

## Need Help?

- Check `typst/template.typ` for function definitions
- See `scripts/markdown-to-typst.js` for converter logic
- Look at converted chapters in `typst/chapters/` for examples
