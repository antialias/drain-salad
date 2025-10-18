#!/usr/bin/env node

/**
 * Refine image prompts based on structured review feedback
 *
 * Reads the structured review JSON and automatically updates prompts
 * to fix identified issues.
 */

const fs = require('fs');
const path = require('path');

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

const REVIEWS_DIR = path.join(__dirname, '..', 'reviews', 'images');
const IMAGE_PROMPTS_PATH = path.join(__dirname, '..', 'generated-manifest.json');

/**
 * Load all individual review files
 */
function loadStructuredReviews() {
  if (!fs.existsSync(REVIEWS_DIR)) {
    log.error('No review directory found. Run npm run review:images:structured first.');
    process.exit(1);
  }

  const reviewFiles = fs.readdirSync(REVIEWS_DIR).filter(f => f.endsWith('.json'));

  if (reviewFiles.length === 0) {
    log.error('No review files found. Run npm run review:images:structured first.');
    process.exit(1);
  }

  const reviews = {};
  let totalReviews = 0;
  let passCount = 0;
  let minorIssuesCount = 0;
  let needsRegenerationCount = 0;
  let failedCount = 0;

  for (const file of reviewFiles) {
    const filePath = path.join(REVIEWS_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data.status === 'error') {
      reviews[data.image] = { status: 'error', error: data.error };
      failedCount++;
    } else {
      reviews[data.image] = data.review;
      totalReviews++;

      if (data.review.status === 'pass') passCount++;
      else if (data.review.status === 'minor_issues') minorIssuesCount++;
      else if (data.review.status === 'needs_regeneration') needsRegenerationCount++;
    }
  }

  return {
    total: totalReviews,
    summary: {
      pass: passCount,
      minor_issues: minorIssuesCount,
      needs_regeneration: needsRegenerationCount,
      failed: failedCount
    },
    reviews
  };
}

/**
 * Load current image prompts
 */
function loadImagePrompts() {
  if (!fs.existsSync(IMAGE_PROMPTS_PATH)) {
    log.error(`Image prompts file not found: ${IMAGE_PROMPTS_PATH}`);
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(IMAGE_PROMPTS_PATH, 'utf8'));
}

/**
 * Get image number from path
 */
function getImageNumber(imagePath) {
  const match = imagePath.match(/(\d{3})_/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Apply quality improvements to a prompt
 */
function applyQualityImprovements(prompt, qualityIssues) {
  let improved = prompt;

  for (const issue of qualityIssues) {
    switch (issue.issue) {
      case 'dark_lighting':
        // Add bright lighting instructions
        if (!improved.toLowerCase().includes('bright') && !improved.toLowerCase().includes('well-lit')) {
          improved += ', bright natural lighting, well-lit professional kitchen';
        }
        // Remove moody/dark descriptors
        improved = improved.replace(/,?\s*moody lighting/gi, '');
        improved = improved.replace(/,?\s*dim lighting/gi, '');
        improved = improved.replace(/,?\s*dark atmosphere/gi, '');
        break;

      case 'inappropriate_background':
        // Add clean background instruction
        if (!improved.toLowerCase().includes('professional kitchen')) {
          improved += ', clean professional kitchen background, no bathroom visible';
        }
        break;

      case 'cluttered':
        // Add minimal/clean instructions
        if (!improved.toLowerCase().includes('clean') && !improved.toLowerCase().includes('minimal')) {
          improved += ', clean minimal composition, organized setting';
        }
        break;

      case 'blurry':
      case 'focus_issues':
        // Add sharp focus instructions
        if (!improved.toLowerCase().includes('sharp')) {
          improved += ', sharp focus, crisp details, high clarity';
        }
        break;

      case 'text_unreadable':
        // Add legible text instruction
        if (!improved.toLowerCase().includes('legible') && !improved.toLowerCase().includes('readable')) {
          improved += ', clear legible text on all labels, professional typography';
        }
        break;

      case 'unprofessional':
        // Add professional descriptors
        improved += ', professional cookbook photography, publication quality';
        break;
    }
  }

  return improved;
}

/**
 * Apply prompt improvements from structured feedback
 */
function applyPromptImprovements(prompt, review) {
  let improved = prompt;

  // Apply removals
  if (review.prompt_remove && review.prompt_remove.length > 0) {
    for (const removePhrase of review.prompt_remove) {
      const regex = new RegExp(`,?\\s*${removePhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi');
      improved = improved.replace(regex, '');
    }
  }

  // Apply modifications
  if (review.prompt_modify && review.prompt_modify.length > 0) {
    for (const mod of review.prompt_modify) {
      const regex = new RegExp(mod.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      improved = improved.replace(regex, mod.to);
    }
  }

  // Apply additions
  if (review.prompt_add && review.prompt_add.length > 0) {
    for (const addPhrase of review.prompt_add) {
      // Only add if not already present
      if (!improved.toLowerCase().includes(addPhrase.toLowerCase())) {
        improved += `, ${addPhrase}`;
      }
    }
  }

  return improved;
}

/**
 * Add spelling corrections to prompt
 */
function addSpellingCorrections(prompt, textCorrections) {
  if (!textCorrections || textCorrections.length === 0) return prompt;

  let improved = prompt;

  // Add explicit label instructions
  const labels = textCorrections.map(tc => tc.label).join(', ');
  if (!improved.toLowerCase().includes('labels')) {
    improved += `, labels must say exactly: "${labels}"`;
  }

  return improved;
}

/**
 * Generate refined prompt for an image
 */
function refinePrompt(originalPrompt, review) {
  let refined = originalPrompt;

  // Apply structured improvements first
  refined = applyPromptImprovements(refined, review);

  // Apply quality issue fixes
  if (review.quality_issues && review.quality_issues.length > 0) {
    refined = applyQualityImprovements(refined, review.quality_issues);
  }

  // Add spelling corrections
  if (review.text_corrections && review.text_corrections.length > 0) {
    refined = addSpellingCorrections(refined, review.text_corrections);
  }

  // Clean up formatting
  refined = refined
    .replace(/,\s*,/g, ',')  // Remove double commas
    .replace(/,\s+/g, ', ')  // Normalize spacing
    .replace(/\s+/g, ' ')    // Remove multiple spaces
    .trim();

  return refined;
}

/**
 * Main refinement process
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const onlyNeedsRegeneration = args.includes('--only-needs-regen');

  console.log('');
  log.success('Prompt Refinement from Structured Review');
  console.log('');

  // Load data
  log.step('Loading review data...');
  const reviewData = loadStructuredReviews();

  log.step('Loading image prompts...');
  const promptsData = loadImagePrompts();

  console.log('');
  log.info(`Total reviews: ${Object.keys(reviewData.reviews).length}`);
  log.info(`Needs regeneration: ${reviewData.summary.needs_regeneration}`);
  log.info(`Minor issues: ${reviewData.summary.minor_issues}`);
  console.log('');

  // Track changes
  const refinements = [];
  let refinedCount = 0;

  // Process each review
  for (const [imagePath, review] of Object.entries(reviewData.reviews)) {
    // Skip if only processing regeneration images
    if (onlyNeedsRegeneration && review.status !== 'needs_regeneration') {
      continue;
    }

    // Skip passed images and errors
    if (review.status === 'pass' || review.status === 'error') {
      continue;
    }

    // Get image number
    const imageNum = getImageNumber(imagePath);
    if (!imageNum) {
      log.error(`Could not extract image number from: ${imagePath}`);
      continue;
    }

    // Find original prompt (number is stored as string in generated-manifest.json)
    const promptEntry = promptsData.images.find(img => parseInt(img.number, 10) === imageNum);
    if (!promptEntry) {
      log.error(`No prompt found for image ${imageNum}`);
      continue;
    }

    // Refine prompt
    const originalPrompt = promptEntry.prompt;
    const refinedPrompt = refinePrompt(originalPrompt, review);

    // Check if actually changed
    if (refinedPrompt === originalPrompt) {
      log.detail(`No changes for image ${imageNum}: ${promptEntry.slug || path.basename(promptEntry.path)}`);
      continue;
    }

    refinedCount++;

    refinements.push({
      number: imageNum,
      filename: promptEntry.slug || path.basename(promptEntry.path),
      status: review.status,
      original: originalPrompt,
      refined: refinedPrompt,
      issues: {
        spelling: review.spelling_errors || [],
        quality: review.quality_issues || []
      }
    });

    if (!dryRun) {
      promptEntry.prompt = refinedPrompt;
    }

    log.success(`Refined image ${imageNum}: ${promptEntry.slug || path.basename(promptEntry.path)}`);
    log.detail(`Original: ${originalPrompt.substring(0, 80)}...`);
    log.detail(`Refined:  ${refinedPrompt.substring(0, 80)}...`);
    console.log('');
  }

  // Save results
  if (dryRun) {
    log.info('DRY RUN - No changes saved');
    console.log('');
    log.info(`Would refine ${refinedCount} prompts`);

    // Save dry run report
    const reportPath = path.join(__dirname, '..', 'reviews', 'prompt-refinement-preview.json');
    fs.writeFileSync(reportPath, JSON.stringify({ refinements }, null, 2));
    log.info(`Preview saved to: ${reportPath}`);
  } else {
    if (refinedCount > 0) {
      // Backup original
      const backupPath = `${IMAGE_PROMPTS_PATH}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, JSON.stringify(promptsData, null, 2));
      log.info(`Backup saved to: ${backupPath}`);

      // Save updated prompts
      fs.writeFileSync(IMAGE_PROMPTS_PATH, JSON.stringify(promptsData, null, 2));
      log.success(`Updated ${refinedCount} prompts in ${IMAGE_PROMPTS_PATH}`);

      // Save refinement log
      const logPath = path.join(__dirname, '..', 'reviews', 'prompt-refinement-log.json');
      fs.writeFileSync(logPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        refinements
      }, null, 2));
      log.info(`Refinement log saved to: ${logPath}`);
    } else {
      log.info('No prompts needed refinement');
    }
  }

  console.log('');
  log.success('✓ Prompt refinement complete!');
  console.log('');
}

// Show help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Prompt Refinement from Structured Review

Usage:
  node scripts/refine-prompts-from-review.js [options]

Options:
  --dry-run                Preview changes without saving
  --only-needs-regen       Only refine prompts for images that need regeneration
  --help, -h               Show this help message

Examples:
  # Preview prompt refinements
  node scripts/refine-prompts-from-review.js --dry-run

  # Apply refinements to all problematic images
  node scripts/refine-prompts-from-review.js

  # Only fix critical images
  node scripts/refine-prompts-from-review.js --only-needs-regen
`);
  process.exit(0);
}

main().catch(error => {
  console.log('');
  log.error('Refinement failed');
  console.error(error);
  process.exit(1);
});
