#!/usr/bin/env node

/**
 * Image review script for Drain Salad cookbook
 *
 * Reviews all AI-generated images for:
 * - Spelling errors in any visible text
 * - Quality issues (clarity, appropriateness)
 * - Relevance to cookbook content
 *
 * Uses GPT-4o vision capabilities to analyze each image.
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  red: '\x1b[0;31m',
  blue: '\x1b[0;34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
  detail: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`)
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  log.error('Error: OPENAI_API_KEY environment variable not set');
  process.exit(1);
}

// Parse arguments
const specificImage = process.argv[2]; // Optional: review a specific image
const outputDir = path.join(__dirname, '..', 'reviews');
const outputFile = path.join(outputDir, 'image-review-report.md');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Find all images in the manuscript/images directory
 */
function findAllImages() {
  const imagesDir = path.join(__dirname, '..', 'manuscript', 'images');
  const images = [];

  function walkDir(dir, relPath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const currentRelPath = path.join(relPath, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath, currentRelPath);
      } else if (entry.isFile() && /\.(png|jpg|jpeg)$/i.test(entry.name)) {
        images.push({
          path: fullPath,
          relativePath: currentRelPath,
          name: entry.name
        });
      }
    }
  }

  walkDir(imagesDir);
  return images;
}

/**
 * Convert image to base64 for API
 */
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

/**
 * Review a single image using GPT-4o vision
 */
async function reviewImage(image) {
  const base64Image = imageToBase64(image.path);
  const ext = path.extname(image.name).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

  const systemPrompt = `You are a professional cookbook editor reviewing AI-generated images for a cookbook called "Drain Salad" about transforming kitchen scraps into culinary art.

Your task is to review each image for:
1. **Spelling errors**: Check any visible text in the image for typos or misspellings
2. **Quality issues**: Assess clarity, composition, lighting, and professional appearance
3. **Appropriateness**: Does the image fit a serious culinary book with artistic/philosophical depth?
4. **Text legibility**: If there's text, is it clear and readable?

Provide a structured review with:
- **Status**: PASS, MINOR_ISSUES, or NEEDS_REGENERATION
- **Spelling errors**: List any found (or "None")
- **Quality assessment**: Brief comment on image quality
- **Issues**: Specific problems if any
- **Recommendation**: What should be done (keep as-is, minor edits, regenerate)

Be concise but thorough. This is for publication quality control.`;

  const userPrompt = `Please review this image from the cookbook. Image filename: ${image.name}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;

  } catch (error) {
    log.error(`Failed to review ${image.name}: ${error.message}`);
    return `**ERROR**: Failed to review - ${error.message}`;
  }
}

/**
 * Main review process
 */
async function runImageReview() {
  log.success('🖼️  Image Review for Drain Salad Cookbook');
  console.log('');

  // Find all images
  let images;
  if (specificImage) {
    const specificPath = path.resolve(specificImage);
    if (!fs.existsSync(specificPath)) {
      log.error(`Image not found: ${specificImage}`);
      process.exit(1);
    }
    images = [{
      path: specificPath,
      relativePath: path.basename(specificPath),
      name: path.basename(specificPath)
    }];
    log.info(`Reviewing single image: ${specificImage}`);
  } else {
    images = findAllImages();
    log.info(`Found ${images.length} images to review`);
  }

  console.log('');
  log.detail('Starting reviews (using GPT-4o vision)...');
  console.log('');

  // Review each image in parallel batches
  const reviews = [];
  let passCount = 0;
  let minorIssuesCount = 0;
  let needsRegenerationCount = 0;

  const BATCH_SIZE = 10; // Process 10 images concurrently
  let completed = 0;

  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    const batchPromises = batch.map(async (image, idx) => {
      const review = await reviewImage(image);

      return {
        image: image.relativePath,
        name: image.name,
        review: review
      };
    });

    const batchResults = await Promise.all(batchPromises);

    // Update counts and reviews
    for (const result of batchResults) {
      if (result.review.includes('PASS')) passCount++;
      else if (result.review.includes('MINOR_ISSUES')) minorIssuesCount++;
      else if (result.review.includes('NEEDS_REGENERATION')) needsRegenerationCount++;

      reviews.push(result);
      completed++;

      process.stdout.write(`\r[${completed}/${images.length}] Reviewed ${completed} images...`);
    }

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < images.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\r' + ' '.repeat(80)); // Clear progress line
  console.log('');
  log.success('✓ Review complete!');
  console.log('');

  // Generate markdown report
  const report = generateMarkdownReport(reviews, passCount, minorIssuesCount, needsRegenerationCount);
  fs.writeFileSync(outputFile, report);

  log.info(`Report saved to: ${outputFile}`);
  console.log('');

  // Summary
  log.detail('Summary:');
  log.success(`  ✓ Pass: ${passCount}`);
  log.info(`  ⚠ Minor issues: ${minorIssuesCount}`);
  log.error(`  ✗ Needs regeneration: ${needsRegenerationCount}`);
  console.log('');

  if (needsRegenerationCount > 0) {
    log.error(`⚠️  ${needsRegenerationCount} image(s) need regeneration`);
    log.info(`Review the full report at: ${outputFile}`);
  } else if (minorIssuesCount > 0) {
    log.info(`⚠️  ${minorIssuesCount} image(s) have minor issues`);
  } else {
    log.success('🎉 All images passed quality review!');
  }
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(reviews, passCount, minorIssuesCount, needsRegenerationCount) {
  const timestamp = new Date().toISOString();

  let report = `# Image Review Report - Drain Salad Cookbook

**Generated**: ${timestamp}
**Total images reviewed**: ${reviews.length}

## Summary

- ✓ **Pass**: ${passCount}
- ⚠ **Minor issues**: ${minorIssuesCount}
- ✗ **Needs regeneration**: ${needsRegenerationCount}

---

`;

  // Group by status
  const needsRegeneration = [];
  const minorIssues = [];
  const passed = [];

  for (const review of reviews) {
    if (review.review.includes('NEEDS_REGENERATION')) {
      needsRegeneration.push(review);
    } else if (review.review.includes('MINOR_ISSUES')) {
      minorIssues.push(review);
    } else if (review.review.includes('PASS')) {
      passed.push(review);
    }
  }

  // Needs regeneration section
  if (needsRegeneration.length > 0) {
    report += `## ✗ Images Needing Regeneration (${needsRegeneration.length})\n\n`;
    for (const item of needsRegeneration) {
      report += `### ${item.image}\n\n${item.review}\n\n---\n\n`;
    }
  }

  // Minor issues section
  if (minorIssues.length > 0) {
    report += `## ⚠ Images with Minor Issues (${minorIssues.length})\n\n`;
    for (const item of minorIssues) {
      report += `### ${item.image}\n\n${item.review}\n\n---\n\n`;
    }
  }

  // Passed section (collapsed)
  if (passed.length > 0) {
    report += `## ✓ Images That Passed (${passed.length})\n\n`;
    report += `<details>\n<summary>Click to expand ${passed.length} passing images</summary>\n\n`;
    for (const item of passed) {
      report += `### ${item.image}\n\n${item.review}\n\n---\n\n`;
    }
    report += `</details>\n\n`;
  }

  // Detailed reviews
  report += `## All Reviews (Alphabetical)\n\n`;
  const sortedReviews = [...reviews].sort((a, b) => a.image.localeCompare(b.image));
  for (const review of sortedReviews) {
    report += `### ${review.image}\n\n${review.review}\n\n---\n\n`;
  }

  return report;
}

// Run the review
runImageReview().catch(error => {
  console.log('');
  log.error('✗ Image review failed');
  console.error(error.message);
  process.exit(1);
});
