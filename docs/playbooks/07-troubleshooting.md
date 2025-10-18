# Playbook #7: Troubleshooting Common Issues

**Goal:** Quickly diagnose and fix common problems in the Drain Salad platform.

**Who This Is For:** Anyone encountering errors or unexpected behavior.

---

## Quick Diagnosis

**What's broken?**
1. [Image Generation](#image-generation-issues)
2. [Build Errors](#build-errors)
3. [Review Problems](#review-issues)
4. [API/Authentication](#apiauth-issues)
5. [Performance](#performance-issues)

---

## Image Generation Issues

### Problem: Images Won't Generate

**Symptoms:** Errors when running `npm run generate:images`

**Diagnosis:**
```bash
# Check backend configuration
echo $IMAGE_GEN_BACKEND
grep IMAGE_GEN_BACKEND .env

# Check API keys
grep OPENAI_API_KEY .env
grep REPLICATE_API_TOKEN .env
```

**Solutions:**

**1. API key not set:**
```bash
# Add to .env
echo "OPENAI_API_KEY=sk-your-key" >> .env
```

**2. Wrong backend:**
```bash
# Edit .env
IMAGE_GEN_BACKEND=gpt-image  # Not: openai, gpt, etc.
```

**3. API rate limits:**
```bash
# Add delays
for i in {10..20}; do
  npm run generate:images -- --single $i
  sleep 5  # Wait between requests
done
```

---

### Problem: Character Consistency Failures

**Symptoms:** Author looks different in every photo

**Solutions:**

**1. Verify reference image exists:**
```bash
ls -lh $AUTHOR_REFERENCE_IMAGE
open $AUTHOR_REFERENCE_IMAGE
```

**2. Use better reference photo:**
- Clear, well-lit face
- Face fills 30-50% of frame
- Neutral expression
- High resolution (1024px+)

**3. Update prompts:**
```markdown
<!-- Before -->
![Author in kitchen](...)

<!-- After -->
![The same person as in reference photo, in kitchen, consistent facial features, same individual](...)
```

---

### Problem: Images Look Wrong

**Symptoms:** Generated images don't match prompts

**Solutions:**

**1. Be more specific in prompts:**
```markdown
<!-- Vague -->
![Vegetables](...)

<!-- Specific -->
![Overhead photo of fresh vegetables including carrots, onions, celery on white marble, bright natural lighting, professional food photography](...)
```

**2. Simplify complex prompts:**
```markdown
<!-- Too complex -->
![Kitchen with author and vegetables and pot and spices and herbs and cutting board..](...)

<!-- Simpler -->
![Author at kitchen counter with vegetables, bright modern kitchen, natural light](...)
```

**3. Try different backend:**
```bash
# Edit .env
IMAGE_GEN_BACKEND=replicate  # Instead of gpt-image
```

---

## Build Errors

### Problem: Typst Compilation Fails

**Symptoms:** `npm run build:book` errors

**Diagnosis:**
```bash
# Check markdown syntax
npm run lint

# Try building single chapter
typst compile typst/chapter-01-*.typ /tmp/test.pdf
```

**Solutions:**

**1. Markdown syntax errors:**
```bash
npm run lint:fix
npm run convert:typst
npm run build:book
```

**2. Missing images:**
```bash
npm run validate-images
npm run generate:missing
```

**3. Typst syntax errors in custom layouts:**
```bash
# Check template.typ for errors
typst check typst/template.typ
```

---

### Problem: EPUB Won't Build

**Symptoms:** Pandoc errors

**Solutions:**

**1. Verify Pandoc installed:**
```bash
pandoc --version
# If not: brew install pandoc (macOS) or apt-get install pandoc (Linux)
```

**2. Check markdown files exist:**
```bash
ls manuscript/*.md
```

**3. Ensure cover image exists:**
```bash
ls manuscript/images/cover.png
```

---

### Problem: Build Output Files Missing

**Symptoms:** `build/` directory empty after build

**Solutions:**

**1. Create build directory:**
```bash
mkdir -p build
```

**2. Check for errors in build output:**
```bash
npm run build:all 2>&1 | grep -i error
```

**3. Build formats individually:**
```bash
npm run build:epub   # Try EPUB first
npm run build:html   # Then HTML
npm run build:book   # Then PDF
```

---

## Review Issues

### Problem: Reviews Too Generic

**Symptoms:** AI reviews don't catch specific issues

**Solutions:**

**1. Use specific review types:**
```bash
# Instead of: comprehensive
./scripts/review-chapter.sh FILE recipes      # For recipe chapters
./scripts/review-chapter.sh FILE facts        # For technical chapters
```

**2. Use better models:**
```bash
./scripts/review-chapter.sh FILE comprehensive o1  # Instead of o1-mini
```

**3. Review smaller sections:**
- Break long chapters into sections
- Review each section separately
- More focused feedback

---

### Problem: Quality Loop Not Converging

**Symptoms:** Loop runs 5 times, images still failing

**Solutions:**

**1. Check what's failing:**
```bash
cat reviews/image-review-summary.json
```

**2. Manually fix worst offenders:**
```bash
# Edit prompts for failing images
nano manuscript/chapter-07.md
npm run extract-manifest
```

**3. Lower quality standards:**
```bash
# Only regenerate critical issues
npm run quality:loop  # Not quality:loop:full
```

---

## API/Auth Issues

### Problem: API Key Rejected

**Symptoms:** "Invalid API key" or "Unauthorized"

**Solutions:**

**1. Verify key format:**
```bash
# OpenAI keys start with: sk-
# Replicate keys start with: r8_
grep API_KEY .env
```

**2. Check key is active:**
- Log into platform.openai.com or replicate.com
- Verify key exists and isn't revoked
- Check usage limits

**3. Regenerate key:**
- Create new API key
- Update `.env` with new key

---

### Problem: Rate Limits

**Symptoms:** "Rate limit exceeded" errors

**Solutions:**

**1. Add delays:**
```bash
# In your loop
sleep 5  # Between generations
```

**2. Reduce concurrent requests:**
- Generate images one at a time
- Don't run multiple generation processes simultaneously

**3. Upgrade API tier:**
- Check your API plan limits
- Consider upgrading for higher limits

---

## Performance Issues

### Problem: Generation Takes Forever

**Symptoms:** Single image takes >5 minutes

**Solutions:**

**1. Check API status:**
```bash
curl https://status.openai.com/api/v2/status.json
```

**2. Try different backend:**
```bash
# Replicate is often faster than OpenAI
IMAGE_GEN_BACKEND=replicate
```

**3. Reduce image size temporarily:**
```bash
# Edit .env
OUTPUT_WIDTH=2048   # Down from 3072
OUTPUT_HEIGHT=1536  # Down from 2048
```

---

### Problem: Build Takes Too Long

**Symptoms:** `npm run build:all` takes >10 minutes

**Solutions:**

**1. Build only what you need:**
```bash
# Instead of build:all
npm run build:book  # Just PDF (fastest)
```

**2. Skip image conversion step:**
- If images haven't changed, Typst reuses them
- Only run `convert:typst` when markdown changes

**3. Use watch mode for development:**
```bash
npm run build:typst:watch  # Auto-rebuild on save
```

---

## File/Permission Issues

### Problem: Permission Denied

**Symptoms:** "EACCES: permission denied" errors

**Solutions:**

**1. Check file permissions:**
```bash
ls -la build/
chmod 755 build/
```

**2. Fix script permissions:**
```bash
chmod +x scripts/*.sh
```

**3. Run with correct user:**
```bash
# Don't use sudo - use your regular user
whoami  # Verify you're not root
```

---

### Problem: Files Not Found

**Symptoms:** "No such file or directory" errors

**Solutions:**

**1. Verify working directory:**
```bash
pwd  # Should be /path/to/drain-salad
cd /path/to/drain-salad
```

**2. Check relative paths:**
```bash
# Ensure paths are relative to project root
ls manuscript/chapter-01-*.md
ls manuscript/images/chapter-01/
```

**3. Create missing directories:**
```bash
mkdir -p manuscript/images/chapter-01
mkdir -p build
mkdir -p reviews/images
```

---

## Environment Issues

### Problem: Node/npm Errors

**Symptoms:** "command not found: npm"

**Solutions:**

**1. Install Node.js:**
```bash
# macOS
brew install node

# Linux
sudo apt-get install nodejs npm

# Verify
node --version  # Should be 16+
npm --version
```

**2. Install dependencies:**
```bash
npm install
```

---

### Problem: Pandoc/Typst Not Found

**Symptoms:** "command not found: pandoc" or "command not found: typst"

**Solutions:**

**1. Install Pandoc:**
```bash
# macOS
brew install pandoc

# Linux
sudo apt-get install pandoc

# Verify
pandoc --version
```

**2. Install Typst:**
```bash
# macOS
brew install typst

# Linux/Windows: Download from typst.app

# Verify
typst --version  # Should be 0.11.0+
```

---

## Recovery Procedures

### Complete Reset (Nuclear Option)

**When:** Everything is broken, start fresh

```bash
# 1. Backup your content
cp -r manuscript /tmp/manuscript-backup

# 2. Clean everything
npm run clean
rm -rf node_modules
rm -rf reviews
rm -rf build

# 3. Reinstall
npm install

# 4. Regenerate
npm run extract-manifest
npm run generate:missing
npm run build:all
```

---

### Partial Regeneration

**When:** Some images corrupted

```bash
# Delete specific chapter images
rm manuscript/images/chapter-07/*.png

# Regenerate just that chapter
npm run generate:missing
```

---

### Review Recovery

**When:** Reviews are stuck or corrupted

```bash
# Delete all reviews
rm -rf reviews/*

# Rerun
npm run review:images:structured
npm run quality:loop
```

---

## Getting Help

### Diagnostic Information to Gather

```bash
# System info
node --version
npm --version
pandoc --version
typst --version
uname -a

# Error logs
npm run build:all 2>&1 | tee /tmp/build-error.log
cat /tmp/build-error.log

# Package info
cat package.json | grep version
```

---

### Common Error Messages

**"Cannot find module"**
→ Run `npm install`

**"ENOENT: no such file"**
→ Check file paths, create missing directories

**"Invalid API key"**
→ Verify `.env` has correct key format

**"Rate limit exceeded"**
→ Add delays, check API plan limits

**"Typst error: unknown function"**
→ Check `template.typ` imports

---

## Quick Reference

### Diagnostic Commands

```bash
npm run lint                 # Check markdown syntax
npm run validate-images      # Verify images exist
npm run wordcount           # Check manuscript stats
typst check typst/*.typ     # Check Typst syntax
```

### Recovery Commands

```bash
npm run clean                # Clean build artifacts
rm -rf node_modules && npm install  # Reinstall
npm run extract-manifest     # Rebuild image manifest
```

### Help Resources

- Typst docs: https://typst.app/docs
- Pandoc manual: https://pandoc.org/MANUAL.html
- OpenAI API: https://platform.openai.com/docs

---

**Most problems** have simple solutions. Check the obvious first (API keys, file paths, permissions), then escalate to more complex fixes.
