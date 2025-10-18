#!/usr/bin/env node

/**
 * Structured image review using JSON output
 *
 * Returns machine-readable feedback for automated prompt refinement
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

const specificImage = process.argv[2];
const outputDir = path.join(__dirname, '..', 'reviews');
const reviewsDir = path.join(outputDir, 'images');
const summaryFile = path.join(outputDir, 'image-review-summary.json');
const manifestPath = path.join(__dirname, '..', 'generated-manifest.json');

if (!fs.existsSync(reviewsDir)) {
  fs.mkdirSync(reviewsDir, { recursive: true });
}

// Load generated manifest for context
let imageManifest = {};
let chapterCache = {};

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  // Create lookup by filename for easy access
  for (const img of manifest.images) {
    const filename = path.basename(img.path);
    imageManifest[filename] = {
      prompt: img.prompt,
      alt: img.alt,
      type: img.type,
      chapter: img.chapter,
      sourceFile: img.sourceFile
    };
  }
  log.info('Loaded image manifest with generation context');
} else {
  log.info('No manifest found - reviews will be context-unaware');
}

/**
 * Load chapter text (with caching)
 */
function loadChapterText(sourceFile) {
  if (!sourceFile) return null;

  if (chapterCache[sourceFile]) {
    return chapterCache[sourceFile];
  }

  const chapterPath = path.join(__dirname, '..', 'manuscript', sourceFile);
  if (fs.existsSync(chapterPath)) {
    const text = fs.readFileSync(chapterPath, 'utf8');
    chapterCache[sourceFile] = text;
    return text;
  }

  return null;
}

// JSON Schema for structured output
const reviewSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: {
      type: "string",
      enum: ["pass", "minor_issues", "needs_regeneration"],
      description: "Overall assessment of the image"
    },
    spelling_errors: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          found: { type: "string", description: "The misspelled text" },
          correction: { type: "string", description: "The correct spelling" },
          location: { type: "string", description: "Where in the image (e.g., 'jar label', 'container text')" }
        },
        required: ["found", "correction", "location"]
      }
    },
    quality_issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          issue: {
            type: "string",
            description: "Type of quality issue",
            enum: [
              "dark_lighting",
              "poor_composition",
              "blurry",
              "inappropriate_background",
              "cluttered",
              "unprofessional",
              "text_unreadable",
              "color_issues",
              "focus_issues"
            ]
          },
          severity: {
            type: "string",
            enum: ["low", "medium", "high", "critical"]
          },
          description: { type: "string" }
        },
        required: ["issue", "severity", "description"]
      }
    },
    prompt_add: {
      type: "array",
      items: { type: "string" },
      description: "Phrases to add to the prompt"
    },
    prompt_remove: {
      type: "array",
      items: { type: "string" },
      description: "Phrases to remove from the prompt"
    },
    prompt_modify: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          from: { type: "string" },
          to: { type: "string" }
        },
        required: ["from", "to"]
      },
      description: "Modifications to make to existing prompt phrases"
    },
    text_corrections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string", description: "What the label should say" },
          current: { type: "string", description: "What it currently says (empty string if not readable)" }
        },
        required: ["label", "current"]
      }
    },
    recommended_action: {
      type: "string",
      enum: ["keep", "regenerate", "manual_edit"],
      description: "What should be done with this image"
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "Confidence in this assessment (0-1)"
    },
    notes: {
      type: "string",
      description: "Additional context or observations"
    }
  },
  required: [
    "status",
    "spelling_errors",
    "quality_issues",
    "prompt_add",
    "prompt_remove",
    "prompt_modify",
    "text_corrections",
    "recommended_action",
    "confidence",
    "notes"
  ]
};

/**
 * Find all images
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
 * Convert image to base64
 */
function imageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

/**
 * Review a single image with structured output
 */
async function reviewImageStructured(image) {
  const base64Image = imageToBase64(image.path);
  const ext = path.extname(image.name).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

  const systemPrompt = `You are a professional cookbook editor reviewing AI-generated images for "Drain Salad," a cookbook about transforming kitchen scraps into culinary art.

Your task is to verify that each image matches its intended purpose as described in the chapter context and original generation prompt.

Focus on identifying:
1. Spelling errors in visible text
2. Illegible or unreadable text that should be clear
3. Technical rendering problems (artifacts, distortion, corruption)
4. Mismatches between the image and what was requested in the original prompt

The original generation prompt is the ground truth for what the image should contain.`;

  // Get original generation context
  const context = imageManifest[image.name];

  let contextSection = 'No original generation context available.';

  if (context) {
    const chapterText = loadChapterText(context.sourceFile);

    contextSection = `
CHAPTER CONTEXT:
${chapterText ? `Full chapter text from ${context.sourceFile}:\n\n${chapterText}\n` : `Chapter: ${context.chapter} (full text not available)`}

---

ORIGINAL GENERATION PROMPT FOR THIS IMAGE:
${context.prompt}

IMAGE PURPOSE:
${context.alt}

TYPE: ${context.type}
`;
  }

  const userPrompt = `Review this cookbook image and provide structured feedback.

Image: ${image.name}

${contextSection}

Evaluate whether the image successfully matches the intent described in the chapter and generation prompt above.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
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
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "image_review",
            strict: true,
            schema: reviewSchema
          }
        },
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    const reviewData = JSON.parse(result.choices[0].message.content);

    return {
      success: true,
      review: reviewData
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main review process
 */
async function runStructuredReview() {
  log.success('🖼️  Structured Image Review');
  console.log('');

  // Find images
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
  log.detail('Starting structured reviews (using GPT-4o with JSON schema)...');
  console.log('');

  // Review in batches
  const BATCH_SIZE = 10;
  const results = {};
  let completed = 0;

  let passCount = 0;
  let minorIssuesCount = 0;
  let needsRegenerationCount = 0;
  let failedCount = 0;

  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (image) => {
      const result = await reviewImageStructured(image);
      return { image, result };
    });

    const batchResults = await Promise.all(batchPromises);

    for (const { image, result } of batchResults) {
      completed++;
      process.stdout.write(`\r[${completed}/${images.length}] Reviewed ${completed} images...`);

      // Save individual review file
      const reviewFileName = image.name.replace(/\.(png|jpg|jpeg)$/i, '.json');
      const reviewFilePath = path.join(reviewsDir, reviewFileName);

      if (result.success) {
        const reviewData = {
          image: image.relativePath,
          timestamp: new Date().toISOString(),
          review: result.review
        };

        fs.writeFileSync(reviewFilePath, JSON.stringify(reviewData, null, 2));
        results[image.relativePath] = result.review;

        // Count statuses
        if (result.review.status === 'pass') passCount++;
        else if (result.review.status === 'minor_issues') minorIssuesCount++;
        else if (result.review.status === 'needs_regeneration') needsRegenerationCount++;
      } else {
        const errorData = {
          image: image.relativePath,
          timestamp: new Date().toISOString(),
          status: 'error',
          error: result.error
        };

        fs.writeFileSync(reviewFilePath, JSON.stringify(errorData, null, 2));
        results[image.relativePath] = {
          status: 'error',
          error: result.error
        };
        failedCount++;
      }
    }

    // Delay between batches
    if (i + BATCH_SIZE < images.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\r' + ' '.repeat(80));
  console.log('');
  log.success('✓ Review complete!');
  console.log('');

  // Save summary
  const summary = {
    timestamp: new Date().toISOString(),
    total: images.length,
    counts: {
      pass: passCount,
      minor_issues: minorIssuesCount,
      needs_regeneration: needsRegenerationCount,
      failed: failedCount
    }
  };

  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

  log.info(`Individual reviews saved to: ${reviewsDir}/`);
  log.info(`Summary saved to: ${summaryFile}`);
  console.log('');

  // Summary
  log.detail('Summary:');
  log.success(`  ✓ Pass: ${passCount}`);
  log.info(`  ⚠ Minor issues: ${minorIssuesCount}`);
  log.error(`  ✗ Needs regeneration: ${needsRegenerationCount}`);
  if (failedCount > 0) {
    log.error(`  ❌ Failed: ${failedCount}`);
  }
  console.log('');

  if (needsRegenerationCount > 0) {
    log.error(`⚠️  ${needsRegenerationCount} image(s) need regeneration`);
  } else if (minorIssuesCount > 0) {
    log.info(`⚠️  ${minorIssuesCount} image(s) have minor issues`);
  } else {
    log.success('🎉 All images passed quality review!');
  }
}

runStructuredReview().catch(error => {
  console.log('');
  log.error('✗ Structured review failed');
  console.error(error.message);
  process.exit(1);
});
