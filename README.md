# Drain Salad

**A Treatise on Edible Entropy, Upstream Capture, and the Cuisine of Second Harvest**

A cookbook about transforming kitchen scraps into culinary art through the Clean-Catch Method.

## Project Status

**Current Progress:**
- ✅ Chapter 1: A Short History of Drain Cuisine (~3,000 words)
- ✅ Chapter 2: The Anatomy of a Drain Salad (~3,500 words)
- ✅ Chapter 3: The Clean-Catch Method (~4,000 words)
- 🚧 Chapters 4-12: In progress
- Target: ~60,000-75,000 words (200-250 pages)

## Project Structure

```
drain-salad/
├── manuscript/          # Final manuscript chapters
│   ├── chapter-01-history.md
│   ├── chapter-02-anatomy.md
│   ├── chapter-03-clean-catch-method.md
│   └── metadata.yaml    # Book metadata for publishing
├── drafts/             # Initial drafts and outlines
├── cover-ideas/        # Cover artwork
├── build/              # Generated output files (epub, pdf, html)
└── styles/             # CSS for HTML output
```

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- Pandoc (for document conversion)
  ```bash
  brew install pandoc  # macOS
  ```

### Install Dependencies

```bash
npm install
```

## Workflow

### Linting

Check markdown formatting:
```bash
npm run lint
```

Auto-fix markdown issues:
```bash
npm run lint:fix
```

### Building

Generate EPUB:
```bash
npm run build:epub
```

Generate PDF:
```bash
npm run build:pdf
```

Generate all formats:
```bash
npm run build
```

Watch for changes and rebuild:
```bash
npm run watch
```

### Word Count

Check current word count:
```bash
npm run wordcount
```

## Publishing Checklist

- [ ] Complete all 12 chapters
- [ ] Professional copy editing pass
- [ ] Recipe testing and verification
- [ ] Final cover design (2560x1600px, JPG)
- [ ] Metadata optimization (title, description, keywords)
- [ ] EPUB validation
- [ ] KDP account setup
- [ ] Category and keyword research
- [ ] Pricing strategy
- [ ] Launch plan

## License

All rights reserved. This work is proprietary and not licensed for distribution or modification.

## Contact

For inquiries about this project, please contact [author email].
