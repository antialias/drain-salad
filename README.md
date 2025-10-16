# Drain Salad

**A Treatise on Edible Entropy, Upstream Capture, and the Cuisine of Second Harvest**

A cookbook about transforming kitchen scraps into culinary art through the Clean-Catch Method.

## Project Status

**Current Progress:**
- ✅ Chapter 1: A Short History of Drain Cuisine (~2,500 words)
- ✅ Chapter 2: The Anatomy of a Drain Salad (~2,500 words)
- ✅ Chapter 3: The Clean-Catch Method (~2,600 words)
- ✅ Chapter 4: The Drain Pantry (~3,000 words)
- ✅ Chapter 5: Techniques (~2,900 words)
- 🚧 Chapters 6-12: In progress
- **Total: ~13,500 words (23% of target)**
- Target: ~60,000-75,000 words (200-250 pages)

## Project Structure

```
drain-salad/
├── manuscript/          # Final manuscript chapters
│   ├── chapter-01-history.md
│   ├── chapter-02-anatomy.md
│   ├── chapter-03-clean-catch-method.md
│   ├── chapter-04-drain-pantry.md
│   ├── chapter-05-techniques.md
│   └── metadata.yaml    # Book metadata for publishing
├── scripts/            # Editorial review and automation
├── drafts/             # Initial drafts and outlines
├── cover-ideas/        # Cover artwork
├── build/              # Generated output files (epub, pdf, html)
├── reviews/            # AI-generated editorial reviews
└── styles/             # CSS for HTML output
```

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- Pandoc (for document conversion)
  ```bash
  brew install pandoc  # macOS
  ```
- LLM CLI (for editorial reviews)
  ```bash
  brew install llm  # or: pip install llm
  llm keys set anthropic  # Configure with your API key
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

### Editorial Review

Get AI-powered editorial feedback on chapters using the `llm` CLI tool.

**Review a single chapter:**
```bash
./scripts/review-chapter.sh manuscript/chapter-01-history.md
```

**Review types:**
```bash
./scripts/review-chapter.sh <chapter> comprehensive  # Full review (default)
./scripts/review-chapter.sh <chapter> tone          # Voice consistency
./scripts/review-chapter.sh <chapter> structure     # Organization & flow
./scripts/review-chapter.sh <chapter> recipes       # Recipe accuracy
./scripts/review-chapter.sh <chapter> facts         # Fact-checking
./scripts/review-chapter.sh <chapter> readability   # Clarity & accessibility
```

**Choose your model:**
```bash
./scripts/review-chapter.sh <chapter> comprehensive claude-3-opus-20240229
./scripts/review-chapter.sh <chapter> comprehensive gpt-4-turbo
```

**Review all chapters:**
```bash
./scripts/review-all-chapters.sh comprehensive
```

**Compare feedback from multiple models:**
```bash
./scripts/compare-reviews.sh manuscript/chapter-01-history.md
```

Reviews are saved to `reviews/` directory (gitignored).

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
