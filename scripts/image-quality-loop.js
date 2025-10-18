#!/usr/bin/env node

/**
 * Automated image quality loop with context-aware reviews
 *
 * Workflow:
 * 1. Review images with full chapter context
 * 2. Refine prompts based on structured feedback
 * 3. Regenerate images with refined prompts
 * 4. Repeat until all images pass or max iterations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI colors
const colors = {
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  red: '\x1b[0;31m',
  blue: '\x1b[0;34m',
  cyan: '\x1b[0;36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}ℹ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}➜ ${msg}${colors.reset}`),
  detail: (msg) => console.log(`${colors.blue}  ${msg}${colors.reset}`)
};

const MAX_ITERATIONS = 5;
const SUMMARY_PATH = path.join(__dirname, '..', 'reviews', 'image-review-summary.json');
const REVIEWS_DIR = path.join(__dirname, '..', 'reviews', 'images');

/**
 * Parse the structured review to extract image statuses
 */
function parseStructuredReview() {
  if (!fs.existsSync(SUMMARY_PATH)) {
    log.error('No review summary found. Run image review first.');
    return null;
  }

  const summary = JSON.parse(fs.readFileSync(SUMMARY_PATH, 'utf8'));

  // Load individual reviews to get lists of images
  const needsRegeneration = [];
  const minorIssues = [];
  const failedReviews = [];

  if (fs.existsSync(REVIEWS_DIR)) {
    const reviewFiles = fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.json'));

    for (const file of reviewFiles) {
      const filePath = path.join(REVIEWS_DIR, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (data.status === 'error') {
        failedReviews.push(data.image);
      } else if (data.review) {
        if (data.review.status === 'needs_regeneration') {
          needsRegeneration.push(data.image);
        } else if (data.review.status === 'minor_issues') {
          minorIssues.push(data.image);
        }
      }
    }
  }

  return {
    total: summary.total,
    pass: summary.counts.pass,
    minorIssues: summary.counts.minor_issues,
    needsRegeneration: summary.counts.needs_regeneration,
    failedReviews: summary.counts.failed,
    needsRegenerationList: needsRegeneration,
    minorIssuesList: minorIssues,
    failedReviewsList: failedReviews
  };
}

/**
 * Extract image number from path
 */
function getImageNumber(imagePath) {
  const match = imagePath.match(/(\d{3})_/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Run context-aware image review
 */
function runImageReview() {
  log.step('Running context-aware image review...');

  try {
    execSync('npm run review:images:structured', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
  } catch (error) {
    log.error('Image review failed');
    throw error;
  }
}

/**
 * Refine prompts based on review feedback
 */
function refinePrompts(onlyNeedsRegen) {
  log.step('Refining prompts based on feedback...');

  try {
    const args = onlyNeedsRegen ? '--only-needs-regen' : '';
    execSync(`npm run prompts:refine ${args}`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
  } catch (error) {
    log.error('Prompt refinement failed');
    throw error;
  }
}

/**
 * Regenerate specific images
 */
function regenerateImages(imageList, reason) {
  if (imageList.length === 0) {
    log.info(`No images to regenerate for: ${reason}`);
    return;
  }

  log.step(`Regenerating ${imageList.length} images (${reason})`);

  for (const imagePath of imageList) {
    const imageNum = getImageNumber(imagePath);
    if (!imageNum) {
      log.error(`Could not extract image number from: ${imagePath}`);
      continue;
    }

    log.detail(`Regenerating image ${imageNum}: ${imagePath}`);

    try {
      execSync(`npm run generate:images -- --single ${imageNum}`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
      });
    } catch (error) {
      log.error(`Failed to regenerate image ${imageNum}: ${error.message}`);
    }
  }
}

/**
 * Main loop
 */
async function main() {
  const args = process.argv.slice(2);
  const skipInitialReview = args.includes('--skip-initial-review');
  const regenerateMinor = args.includes('--regenerate-minor');
  const retryFailed = args.includes('--retry-failed');

  console.log('');
  log.success('Context-Aware Image Quality Loop');
  console.log('');
  log.info(`Max iterations: ${MAX_ITERATIONS}`);
  log.info(`Regenerate minor issues: ${regenerateMinor ? 'YES' : 'NO'}`);
  log.info(`Retry failed reviews: ${retryFailed ? 'YES' : 'NO'}`);
  console.log('');

  // Initial review if needed
  if (!skipInitialReview) {
    runImageReview();
    console.log('');
  }

  let iteration = 0;
  let previousStats = null;

  while (iteration < MAX_ITERATIONS) {
    iteration++;

    log.step(`Iteration ${iteration}/${MAX_ITERATIONS}`);
    console.log('');

    // Parse review
    const stats = parseStructuredReview();
    if (!stats) {
      log.error('Could not parse review summary');
      process.exit(1);
    }

    // Show stats
    log.detail(`Pass: ${stats.pass}/${stats.total}`);
    log.detail(`Minor issues: ${stats.minorIssues}`);
    log.detail(`Needs regeneration: ${stats.needsRegeneration}`);
    log.detail(`Failed reviews: ${stats.failedReviews}`);
    console.log('');

    // Check if we're done
    const issueCount = stats.needsRegeneration + (regenerateMinor ? stats.minorIssues : 0) + (retryFailed ? stats.failedReviews : 0);

    if (issueCount === 0) {
      log.success('All images passed quality review!');
      console.log('');
      log.info(`Final stats: ${stats.pass}/${stats.total} images passed`);
      if (stats.minorIssues > 0 && !regenerateMinor) {
        log.info(`${stats.minorIssues} images have minor issues (not regenerating)`);
      }
      process.exit(0);
    }

    // Check if we're stuck
    if (previousStats &&
        stats.needsRegeneration === previousStats.needsRegeneration &&
        stats.minorIssues === previousStats.minorIssues &&
        stats.failedReviews === previousStats.failedReviews) {
      log.error('No progress made in this iteration. Stopping.');
      console.log('');
      log.info('Consider manually reviewing the remaining issues.');
      process.exit(1);
    }

    previousStats = stats;

    // Refine prompts based on feedback
    refinePrompts(!regenerateMinor);
    console.log('');

    // Regenerate images that need it
    const toRegenerate = [...stats.needsRegenerationList];

    if (regenerateMinor) {
      toRegenerate.push(...stats.minorIssuesList);
    }

    if (retryFailed) {
      toRegenerate.push(...stats.failedReviewsList);
    }

    if (toRegenerate.length === 0) {
      log.info('No images to regenerate this iteration');
      break;
    }

    regenerateImages(toRegenerate, 'quality issues');
    console.log('');

    // Re-review
    runImageReview();
    console.log('');
  }

  // Max iterations reached
  log.error(`Reached maximum iterations (${MAX_ITERATIONS}) without resolving all issues`);
  console.log('');

  const finalStats = parseStructuredReview();
  if (finalStats) {
    log.info('Final stats:');
    log.detail(`Pass: ${finalStats.pass}/${finalStats.total}`);
    log.detail(`Minor issues: ${finalStats.minorIssues}`);
    log.detail(`Needs regeneration: ${finalStats.needsRegeneration}`);
    log.detail(`Failed reviews: ${finalStats.failedReviews}`);
  }

  process.exit(1);
}

// Show help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Context-Aware Image Quality Loop

Automated workflow:
1. Review images with full chapter context
2. Refine prompts based on structured feedback
3. Regenerate images with refined prompts
4. Repeat until all pass or max iterations

Usage:
  node scripts/image-quality-loop.js [options]

Options:
  --skip-initial-review    Skip the initial image review (use existing report)
  --regenerate-minor       Also regenerate images with minor issues
  --retry-failed          Retry images that failed to review (fetch errors)
  --help, -h              Show this help message

Examples:
  # Basic loop - only regenerate images that need it
  npm run quality:loop

  # Include minor issues in regeneration
  npm run quality:loop:full

  # Skip initial review and use existing report
  node scripts/image-quality-loop.js --skip-initial-review
`);
  process.exit(0);
}

main().catch(error => {
  console.log('');
  log.error('Quality loop failed');
  console.error(error);
  process.exit(1);
});
