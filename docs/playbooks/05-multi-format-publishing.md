# Playbook #5: Multi-Format Publishing

**Goal:** Understand the 4 output formats, when to use each, and how to upload to publishing platforms without errors.

**Who This Is For:** Authors ready to publish and distribute their cookbook across multiple platforms (Amazon KDP, Gumroad, Itch.io, web).

---

## What You'll Learn

- Understanding the 4 output files and their purposes
- Platform comparison (KDP, Gumroad, Itch.io)
- Step-by-step upload procedures
- Pre-flight checks to catch errors
- Metadata optimization per platform
- Pricing and ISBN considerations

**Time Estimate:** 2-3 hours for first publication, 30 minutes for updates

---

## The 4 Output Formats

### Overview

| Format | File | Size | Purpose | Platforms |
|--------|------|------|---------|-----------|
| **Print PDF** | `drain-salad-print.pdf` | 298MB | Print-on-demand | Amazon KDP Print, IngramSpark |
| **Optimized PDF** | `drain-salad-optimized.pdf` | 4.7MB | Digital sales | Gumroad, Itch.io, direct sales |
| **EPUB** | `drain-salad.epub` | 222MB | E-readers | Kindle, Apple Books, Kobo |
| **HTML** | `drain-salad.html` | 296KB | Web preview | Your website, blog, sample chapters |

---

### Print PDF (298MB)

**What it is:**
- High-resolution images (3072×2048px)
- 0.125" bleed on all sides
- CMYK color profile for professional printing
- 6×9" page size (standard cookbook trim)

**Use for:**
- Amazon KDP Print (print-on-demand)
- IngramSpark (wide distribution)
- Blurb, Lulu (self-publishing platforms)
- Professional print shops

**Why it's large:** Full-resolution images with bleed for trim precision

**Build command:**
```bash
npm run publish:print
```

---

### Optimized PDF (4.7MB)

**What it is:**
- Compressed images (smaller file size)
- No bleed (digital-only)
- RGB color profile (screen optimized)
- Same layout as print version

**Use for:**
- Gumroad (digital sales)
- Itch.io (pay-what-you-want)
- Payhip, SendOwl (digital marketplaces)
- Email delivery to customers
- Website downloads

**Why it's small:** Aggressive compression, web-friendly

**Build command:**
```bash
npm run publish:optimized
```

---

### EPUB (222MB)

**What it is:**
- E-reader compatible format
- Reflowable text (adapts to screen size)
- Embedded images
- Table of contents navigation
- Standard e-book format

**Use for:**
- Amazon Kindle (via KDP)
- Apple Books
- Google Play Books
- Kobo
- Barnes & Noble Nook

**Build command:**
```bash
npm run publish:epub
```

---

### HTML (296KB)

**What it is:**
- Standalone webpage
- Embedded styles
- Image references (not embedded)
- Single-file preview

**Use for:**
- Website sample chapters
- Blog post embeds
- Preview before buying
- Sharing on social media

**Build command:**
```bash
npm run build:html
```

---

## Building All Formats

### Complete Build Process

```bash
# 1. Ensure manuscript is final
npm run lint

# 2. Build all formats at once
npm run publish:all

# This creates:
#   build/drain-salad-print.pdf       (298MB)
#   build/drain-salad-optimized.pdf   (4.7MB)
#   build/drain-salad.epub            (222MB)
#   build/drain-salad.html            (296KB)
```

**Build time:** 2-5 minutes for all formats

---

## Pre-Flight Checklist

Before uploading to any platform, verify:

### Content Checks

```bash
# ✅ No markdown lint errors
npm run lint

# ✅ All images present
npm run validate-images

# ✅ Word count as expected
npm run wordcount
# Should show ~37,711 words (or your target)

# ✅ Metadata is set
cat book-metadata.json
# Verify title, author, description, ISBN, price
```

---

### PDF Checks

Open `build/drain-salad-print.pdf` and verify:

- ✅ All chapters present and in correct order
- ✅ Images appear and look good
- ✅ No blank pages (except intentional chapter breaks)
- ✅ Table of contents is accurate
- ✅ Page numbers are correct
- ✅ Bleed extends to edge (for print PDF)
- ✅ Text is readable at intended print size
- ✅ No weird Typst compilation artifacts

**Print-specific:** Check the bleed area by looking at edges - images and backgrounds should extend beyond page boundary.

---

### EPUB Checks

Open `build/drain-salad.epub` in Calibre or Apple Books:

- ✅ Table of contents works
- ✅ Images scale correctly on different screen sizes
- ✅ Text reflows properly
- ✅ Chapter breaks are correct
- ✅ Recipes are formatted correctly
- ✅ No broken image links

**Test on multiple devices** if possible (Kindle, iPad, phone)

---

## Platform-Specific Upload Guides

### Amazon KDP (Kindle Direct Publishing)

**What you can publish:**
- Print book (print PDF)
- Kindle e-book (EPUB)

**Accounts needed:**
- KDP account (kdp.amazon.com)
- Amazon Author Central (optional, for author page)

---

#### KDP Print Upload

**Step-by-step:**

1. **Go to kdp.amazon.com** → Create New Title → Paperback

2. **Enter Print Book Details:**
   - Title: Drain Salad: A Treatise on Edible Entropy
   - Subtitle: (Optional) Upstream Capture and the Cuisine of Second Harvest
   - Author: Your Name
   - Description: (From `book-metadata.json`)
   - Publishing Rights: "I own the copyright"
   - Keywords: zero-waste cooking, food scraps, sustainability, fermentation, cookbook
   - Categories: Select up to 2 (Cookbooks > Specific Ingredients > Vegetables, Cooking > Sustainability)

3. **ISBN:**
   - **Option A:** Use free KDP ISBN (Amazon only, can't sell elsewhere)
   - **Option B:** Use your own ISBN (purchase from Bowker or MyIdentifiers.com)

4. **Print Options:**
   - Ink & Paper: **Black & White on White Paper** (cheaper) OR **Premium Color** (better, more expensive)
   - Trim Size: **6" × 9"** (matches your Typst layout)
   - Bleed: **Bleed** (you have 0.125" bleed)
   - Paperback Cover Finish: **Matte** or **Glossy**

5. **Upload Print-Ready PDF:**
   - Upload `build/drain-salad-print.pdf`
   - Wait for review (2-5 minutes)
   - Fix any errors flagged by KDP

6. **Upload Cover:**
   - **Option A:** Use KDP Cover Creator (basic)
   - **Option B:** Upload custom cover (design yourself or hire designer)
   - **Cover dimensions for 6×9" with bleed:** Use KDP's cover template calculator

7. **Preview:**
   - Use KDP's online previewer
   - Check first/last pages, random middle pages
   - Verify bleed looks correct

8. **Pricing:**
   - Set your price (e.g., $24.99)
   - KDP shows your royalty (typically 60% of list price minus printing costs)
   - **Expanded Distribution:** Optional (lower royalties, wider distribution)

9. **Publish:**
   - Click "Publish Your Paperback"
   - Wait 24-72 hours for review
   - Book goes live on Amazon

**KDP Print File Limits:**
- Maximum file size: **650 MB** (your 298MB print PDF is fine)
- Page count limits vary by spine width

---

#### KDP Kindle E-Book Upload

**Step-by-step:**

1. **Go to kdp.amazon.com** → Create New Title → Kindle eBook

2. **Enter eBook Details:**
   - Same metadata as print version
   - Ensure consistency (same title, author, description)

3. **Upload EPUB:**
   - Upload `build/drain-salad.epub`
   - KDP converts EPUB to Amazon's format automatically

4. **Previewer:**
   - Use Kindle Previewer tool
   - Check on multiple device simulations (phone, tablet, Kindle)
   - Verify images scale properly

5. **Pricing:**
   - Set price (typically $2.99-$9.99 for cookbooks)
   - Choose 70% royalty (if price is $2.99-$9.99) or 35% royalty
   - Consider KDP Select (exclusive to Amazon for 90 days, earns Kindle Unlimited reads)

6. **Publish:**
   - Click "Publish Your Kindle eBook"
   - Goes live within 24-72 hours

**Pro tip:** Link your e-book and print book for cross-promotion

---

### Gumroad (Digital Sales)

**What you can publish:**
- Optimized PDF (primary)
- EPUB (optional bundle)

**Why Gumroad:**
- Direct sales, you keep 90% (10% + $0.30 fee)
- Easy checkout, no complex setup
- Supports pay-what-you-want pricing
- Built-in affiliate program

---

#### Gumroad Upload

**Step-by-step:**

1. **Go to gumroad.com** → Sign up/Login → Create Product

2. **Product Type:** Digital Product

3. **Upload Files:**
   - Upload `build/drain-salad-optimized.pdf`
   - (Optional) Upload `build/drain-salad.epub` as bonus file

4. **Product Details:**
   - Name: Drain Salad: A Treatise on Edible Entropy
   - Summary: Comprehensive cookbook for transforming kitchen scraps into gourmet meals
   - Description: (Full description from `book-metadata.json`, use markdown)

5. **Pricing:**
   - Set price (e.g., $9.99)
   - OR enable "Pay what you want" (minimum $9.99, suggested $19.99)

6. **Cover Image:**
   - Upload your cookbook cover (1200×1600px recommended)

7. **Publish:**
   - Click "Publish"
   - Get shareable link
   - Share on social media, email list, etc.

**Gumroad Benefits:**
- Immediate sales, no approval process
- Email marketing built-in
- Can offer discounts, bundles, upsells

---

### Itch.io (Pay-What-You-Want / Community)

**What you can publish:**
- Optimized PDF
- EPUB
- HTML (as in-browser preview)

**Why Itch.io:**
- Pay-what-you-want friendly
- Gaming/indie community (might find audience)
- Can set 0% platform fee (vs. Gumroad's 10%)
- Supports bundles (combine with other creators)

---

#### Itch.io Upload

**Step-by-step:**

1. **Go to itch.io** → Sign up/Login → Upload New Project

2. **Project Type:** Physical Game (cookbooks don't have a category, use this)

3. **Title and Details:**
   - Title: Drain Salad: A Treatise on Edible Entropy
   - Short Description: Transform kitchen scraps into gourmet meals
   - Long Description: (From `book-metadata.json`)

4. **Upload Files:**
   - Upload `build/drain-salad-optimized.pdf` (mark as downloadable)
   - Upload `build/drain-salad.epub` (mark as downloadable)
   - (Optional) Upload `build/drain-salad.html` (mark as "playable in browser")

5. **Pricing:**
   - Set minimum price (e.g., $5)
   - OR set to "No payments" for free distribution
   - Enable "Pay what you want"

6. **Cover Image:**
   - Upload cover (630×500px minimum)

7. **Platform Fee:**
   - Set revenue share (default 10%, can set to 0% if you want)

8. **Publish:**
   - Set visibility (Public, Unlisted, or Draft)
   - Click "Save & View Page"

**Itch.io Benefits:**
- Great for bundles (e.g., "Sustainability Cookbook Bundle")
- Community-focused
- Can embed HTML version in browser

---

### Direct Website Sales

**Use case:** Sell from your own website

**Recommended tools:**
- **Gumroad embed:** Easiest (use Gumroad's embed code)
- **Payhip:** Alternative to Gumroad
- **WooCommerce:** If you have WordPress site
- **SendOwl:** Digital delivery service

**Sample embed (Gumroad):**
```html
<script src="https://gumroad.com/js/gumroad.js"></script>
<a class="gumroad-button" href="https://gum.co/your-product-id">Buy Drain Salad</a>
```

---

## Metadata Optimization

### Writing Good Descriptions

**For Amazon KDP:**
- Keep it under 4,000 characters
- Use bullet points for key features
- Front-load benefits ("Transform kitchen scraps into gourmet meals")
- Include keywords naturally (zero-waste, fermentation, sustainability)
- End with call-to-action

**Example:**
```
Transform your kitchen scraps into gourmet meals with this comprehensive guide to sustainable cooking.

**What You'll Learn:**
• The 6-element framework for scrap cooking
• 30+ recipes for vegetable peels, herb stems, stale bread, and more
• Safe food handling with the Clean-Catch system
• Fermentation techniques for flavor and preservation
• Real-world meal planning scenarios

**Who This Book Is For:**
Home cooks interested in sustainability, reducing food waste, and elevating everyday ingredients into restaurant-quality dishes.

**Includes:**
• 12 comprehensive chapters
• Detailed technique guides
• Beautiful food photography
• Complete appendices with conversions and troubleshooting

Stop throwing away edible food. Start cooking creatively.
```

**For Gumroad/Itch.io:**
- More casual, conversational tone
- Can be longer (no strict limits)
- Include sample chapter or recipe
- Link to your website/social media

---

### Choosing Keywords

**Good cookbook keywords:**
- zero-waste cooking
- food scraps
- sustainable recipes
- fermentation
- kitchen sustainability
- vegetable scraps cookbook
- reduce food waste
- creative cooking
- frugal cooking
- scrap cooking

**Avoid:**
- Generic terms ("cookbook", "recipes" alone)
- Unrelated terms (don't keyword stuff)
- Trademarked terms

**KDP allows 7 keywords** - choose wisely!

---

## Pricing Strategy

### Comparison by Platform

| Platform | Print | E-Book | PDF | Your Cut |
|----------|-------|--------|-----|----------|
| **Amazon KDP Print** | $24.99 | - | - | ~60% (minus printing ~$4-6) = $9-11 |
| **Amazon KDP Kindle** | - | $9.99 | - | 70% = $6.99 |
| **Gumroad PDF** | - | - | $14.99 | 90% = $13.49 |
| **Itch.io PDF** | - | - | $9.99 | 100% (if 0% fee) = $9.99 |

**Recommended pricing:**
- **Print (KDP):** $24.99 (standard for 300-page cookbook)
- **E-Book (Kindle):** $9.99 (impulse buy range)
- **PDF (Gumroad):** $14.99 (between e-book and print)
- **Itch.io:** Pay-what-you-want ($5 minimum)

**Multi-platform strategy:**
- Sell print exclusively on Amazon (widest reach)
- Sell PDF on Gumroad (best margins)
- Use Itch.io for community building / bundles
- Offer bundle discount (print + PDF) on your website

---

## ISBN Considerations

### Do You Need an ISBN?

**Amazon KDP:** No (they provide free ISBN if selling only on Amazon)
**Other platforms:** Yes (IngramSpark, Apple Books require ISBN)

**Free KDP ISBN limitations:**
- Only usable on Amazon
- Amazon listed as publisher
- Can't sell elsewhere with that ISBN

**Your own ISBN benefits:**
- You are the publisher of record
- Can sell on any platform
- Looks more professional
- Required for libraries, bookstores

**Where to buy ISBNs:**
- **US:** Bowker (myidentifiers.com) - $125 for 1, $295 for 10
- **Canada:** Library and Archives Canada (free)
- **UK:** Nielsen ISBN Store (£89 for 1, £149 for 10)

**Recommendation:**
- Starting out: Use free KDP ISBN for print, no ISBN for digital
- Serious author: Buy 10-pack ISBNs ($295) - one for print, one for EPUB, rest for future books

---

## Post-Publication

### Updating Your Book

**For minor changes (typos, small edits):**

```bash
# 1. Fix content in manuscript
nano manuscript/chapter-05-techniques.md

# 2. Rebuild
npm run publish:all

# 3. Re-upload to platforms
# - KDP: Click "Edit" → Upload new files → "Publish"
# - Gumroad: Edit product → Replace file
# - Itch.io: Edit project → Upload new version
```

**For major changes (new chapter, restructure):**
- Consider it a new edition
- May require new ISBN (for print)
- Amazon: Create new book OR update as "Second Edition"

---

### Marketing Your Book

**Pre-launch:**
- Build email list
- Share sample chapters (use HTML version)
- Pre-announce on social media

**Launch:**
- Amazon: Ask friends/family to buy and review on Day 1
- Gumroad: Email your list with discount code
- Social media: Share purchase links

**Post-launch:**
- Collect reviews on Amazon (critical for visibility)
- Submit to cookbook blogs for review
- Create content (recipe videos, blog posts) linking to book
- Join communities (Reddit r/Cookbooks, Facebook groups)

---

## Troubleshooting

### KDP Rejects Print PDF

**Common issues:**
- File too large (>650MB) - use optimized PDF instead, or reduce image quality
- Bleed issues - verify 0.125" bleed in Typst settings
- Low-resolution images - ensure 300 DPI

**Fix:**
```bash
# Check PDF properties
pdfinfo build/drain-salad-print.pdf

# Reduce file size if needed
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
   -dNOPAUSE -dQUIET -dBATCH \
   -sOutputFile=build/drain-salad-print-compressed.pdf \
   build/drain-salad-print.pdf
```

---

### EPUB Not Displaying Correctly

**Problem:** Images too large, text unreadable

**Fix:**
```bash
# Check EPUB structure
unzip -l build/drain-salad.epub

# Validate EPUB
# Install epubcheck: https://github.com/w3c/epubcheck
java -jar epubcheck.jar build/drain-salad.epub
```

---

### Wrong File Uploaded

**Problem:** Uploaded print PDF to Gumroad (huge download for customers)

**Fix:**
- Immediately replace with optimized PDF
- Email customers who already purchased to apologize and offer corrected file

---

## Quick Reference

### Build Commands

```bash
# Build all formats
npm run publish:all

# Individual formats
npm run publish:print         # Print PDF (298MB)
npm run publish:optimized     # Optimized PDF (4.7MB)
npm run publish:epub          # EPUB (222MB)
npm run build:html            # HTML (296KB)
```

### File Locations

```
build/drain-salad-print.pdf         # → Amazon KDP Print
build/drain-salad-optimized.pdf     # → Gumroad, Itch.io
build/drain-salad.epub              # → Amazon KDP Kindle, Apple Books
build/drain-salad.html              # → Website preview
```

### Platform URLs

- Amazon KDP: https://kdp.amazon.com
- Gumroad: https://gumroad.com
- Itch.io: https://itch.io
- Bowker ISBN: https://myidentifiers.com

---

## Next Steps

**After publishing:**

1. **Monitor sales and reviews** on each platform
2. **Engage with readers** (respond to reviews, answer questions)
3. **Create supplemental content** (blog posts, recipe videos)
4. **Plan next edition** or next book
5. **Join cookbook communities** for ongoing learning

**Related playbooks:**
- [Playbook #4: Quality Assurance](04-quality-assurance.md) - Pre-publication QA
- [Playbook #7: Troubleshooting](07-troubleshooting.md) - Fixing common issues

---

**Congratulations on publishing!** You've taken your cookbook from manuscript to market across multiple platforms. Now the real work begins: connecting with readers and sharing your passion for sustainable cooking.
