# Publishing Guide for Drain Salad

This guide walks you through publishing your book on various platforms.

## Quick Start

```bash
# Build all formats at once
npm run publish:all
```

This creates:
- `build/drain-salad-print.pdf` - Print-ready with bleed for KDP
- `build/drain-salad.epub` - E-book for Kindle/other readers
- `build/drain-salad-optimized.pdf` - Compressed for digital sales

## Build Individual Formats

```bash
npm run publish:print      # Print-ready PDF (6x9 with 0.125" bleed)
npm run publish:epub        # EPUB for e-readers
npm run publish:optimized   # Compressed PDF for downloads
```

## Prerequisites

### Required
- **Typst** (already installed) - For PDF generation
- **Node.js 16+** (already installed) - For build scripts

### Optional but Recommended
- **Pandoc** - For EPUB generation
  ```bash
  brew install pandoc
  ```

- **Ghostscript** - For PDF compression (30-50% size reduction)
  ```bash
  brew install ghostscript
  ```

## Publishing Platforms

### 1. Amazon KDP (Recommended First)

**Why**: Largest reach, handles both digital and print, no upfront costs

**Steps**:
1. **Create Account**: Go to [kdp.amazon.com](https://kdp.amazon.com)

2. **Paperback Setup**:
   - Click "Create Paperback"
   - Upload `build/drain-salad-print.pdf` as interior
   - Trim size: **6" x 9"**
   - Bleed: **Yes** (PDF includes 0.125" bleed)
   - Interior: **Full color**
   - Paper: **White**

3. **E-book Setup** (optional):
   - Click "Create Kindle eBook"
   - Upload `build/drain-salad.epub`
   - Let KDP convert it

4. **Pricing**:
   - Print: KDP calculates minimum cost, add your margin (suggest $5-10)
   - E-book: $2.99-$9.99 for 70% royalty tier

5. **Metadata** (copy from `book-metadata.json`):
   - Title, author, description, keywords
   - Categories (select 2)

6. **Publish**:
   - Review → Publish
   - Live in 24-72 hours

**KDP Checklist**:
- [ ] Account created
- [ ] Paperback interior uploaded (print PDF)
- [ ] Cover designed (or use KDP Cover Creator)
- [ ] Pricing set (check profitability calculator)
- [ ] Preview downloaded and checked
- [ ] Published!

### 2. Gumroad (For Direct Digital Sales)

**Why**: Simple, fast, you keep 90% after fees

**Steps**:
1. Go to [gumroad.com](https://gumroad.com) and create account

2. Click "New Product" → Digital

3. Upload Files:
   - `build/drain-salad-optimized.pdf` (main)
   - Optional: also include EPUB

4. Set Details:
   - Name: "Drain Salad: A Treatise on Edible Entropy"
   - Price: $14.99-19.99
   - Description: (from `book-metadata.json`)
   - Cover image: `manuscript/images/front-matter/001_cover-image.png`

5. Publish → Share link

**Gumroad Checklist**:
- [ ] Account created
- [ ] Optimized PDF uploaded
- [ ] Price set
- [ ] Description added
- [ ] Product live
- [ ] Share link on social media

### 3. Itch.io (Alternative to Gumroad)

**Why**: 0-10% fee (you choose), great indie community

**Steps**:
1. Go to [itch.io](https://itch.io) → Create account

2. Dashboard → Create new project

3. Set Kind: "Book"

4. Upload Files:
   - `build/drain-salad-optimized.pdf`
   - `build/drain-salad.epub` (optional)

5. Pricing:
   - "No payments" (free)
   - "Pay what you want" (minimum $10?)
   - "Paid" ($14.99?)

6. Publish

**Itch.io Checklist**:
- [ ] Account created
- [ ] Book project created
- [ ] Files uploaded
- [ ] Pricing set
- [ ] Published

## Pre-Launch Checklist

Before uploading anywhere:

### Content Review
- [ ] Read through full PDF - no typos?
- [ ] All images displaying correctly?
- [ ] TOC links working?
- [ ] Page numbers correct?

### Metadata Complete (in `book-metadata.json`)
- [ ] Author name (real or pseudonym)
- [ ] Final description (250-500 words)
- [ ] Keywords (10+)
- [ ] Categories
- [ ] ISBN (if doing print - optional for KDP)

### File Quality Checks

**Print PDF** (`build/drain-salad-print.pdf`):
- [ ] Bleed extends to page edges (0.125" all sides)
- [ ] Images are sharp (not pixelated)
- [ ] Text doesn't cut off at margins
- [ ] All fonts embedded (check PDF properties)

**EPUB** (`build/drain-salad.epub`):
- [ ] Test on Kindle Previewer
- [ ] Test on Calibre
- [ ] Images display
- [ ] TOC works

**Optimized PDF** (`build/drain-salad-optimized.pdf`):
- [ ] File size reasonable (< 100MB ideal)
- [ ] Images still look good
- [ ] Opens quickly

## Marketing Copy Templates

### Short Description (for social media)
```
A cookbook about transforming kitchen scraps into restaurant-quality dishes.
From kale ribs to stale bread, learn the techniques that make "waste" delicious.

12 chapters | 80+ images | Recipes, techniques, personal stories
```

### Long Description (for product pages)
```
[Copy from book-metadata.json description field]
```

### Keywords (for SEO/discoverability)
```
[Copy from book-metadata.json keywords field]
```

## Pricing Guidance

Based on comparable cookbooks:

**Digital (PDF/EPUB)**:
- Budget: $9.99
- Standard: $14.99
- Premium: $19.99

**Print (via KDP)**:
- Cost: ~$12-15 (KDP calculates based on page count & color)
- Retail: Cost + $8-12 margin = **$20-27**

**Bundles**:
- Digital + Print: 10% discount
- "Name your price" with $15 minimum

## Cover Design

You need a cover for KDP print. Options:

### Option 1: Use KDP Cover Creator (Free)
- Log into KDP
- Use Cover Creator tool
- Upload `manuscript/images/front-matter/001_cover-image.png` as front
- Add title/author text
- KDP handles spine/back automatically

### Option 2: Design Custom Cover
- Hire designer ($50-500)
- Or use Canva ($0-20)
- **Must follow KDP template** (download from KDP site)
  - Includes spine width calculation
  - Bleed requirements
  - Barcode placement

### Option 3: (Coming Soon)
I can build a cover generator script using your AI images.

## After Publishing

### Amazon KDP
- Link will be: `amazon.com/dp/YOUR_ASIN`
- Can run promotions (free days, countdown deals)
- Track sales in KDP dashboard

### Gumroad/Itch.io
- Share link: `yourusername.gumroad.com/l/drain-salad`
- Embed on your website
- Email to your list
- Track sales in dashboard

## Updating Your Book

### Content Changes
```bash
# 1. Edit manuscript/*.md files
# 2. Rebuild
npm run publish:all
# 3. Re-upload to platforms
```

### KDP Updates
- "Edit" → Upload new interior PDF
- Publish revision
- Live in 24-72 hours
- Existing buyers don't get update (unless you contact KDP support)

### Gumroad/Itch.io Updates
- Just replace the file
- Existing customers can re-download automatically

## Advanced: Automation with auto-kdp

Once you've done one manual upload and understand KDP:

```bash
# Install auto-kdp (optional)
git clone https://github.com/ekr0/auto-kdp.git tools/auto-kdp
cd tools/auto-kdp && npm install

# Generate config
# (Script coming soon)

# Auto-upload
# npm run publish:kdp-auto
```

## Troubleshooting

### "Typst not found"
```bash
# macOS
brew install typst

# Linux
cargo install typst

# Or download from: https://github.com/typst/typst/releases
```

### "Pandoc not found" (for EPUB)
```bash
brew install pandoc
```

### "PDF too large" (>650MB)
KDP has 650MB limit. Solutions:
1. Reduce image quality in `typst/template.typ`
2. Use fewer images
3. Convert images to JPEG instead of PNG
4. Use `npm run publish:optimized` (requires Ghostscript)

### "Bleed not showing"
- Make sure you uploaded `drain-salad-print.pdf` (not regular)
- Select "Yes" for bleed in KDP
- Check trim size is 6x9

### "EPUB has broken images"
- Ensure image paths in markdown are relative
- Check images exist in `manuscript/images/`
- Test with Calibre: `calibre build/drain-salad.epub`

## Support

If you run into issues:
1. Check this guide
2. Check platform help docs (KDP, Gumroad have great support)
3. Re-run builds with fresh `npm run publish:all`

## File Reference

After running `npm run publish:all`, you'll have:

```
build/
├── drain-salad-typst.pdf      # Regular PDF (for viewing)
├── drain-salad-print.pdf      # Print-ready with bleed (→ KDP paperback)
├── drain-salad.epub           # E-book (→ KDP Kindle, Apple Books)
└── drain-salad-optimized.pdf  # Compressed (→ Gumroad, Itch.io)
```

Upload the right file to the right place!

## Next Steps

1. **Fill in `book-metadata.json`** with your actual author info
2. **Run `npm run publish:all`** to build all formats
3. **Test the files** - open them, check quality
4. **Create KDP account** and do first manual upload
5. **Share with friends** for feedback before going public
6. **Launch!**

Good luck! 🚀
