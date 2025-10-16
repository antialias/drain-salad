#!/usr/bin/env node

/**
 * Image Generation Script with Reference Photo Support
 *
 * Generates images using AI with character consistency via reference photos.
 * Supports multiple backends: Replicate, ComfyUI, Automatic1111
 *
 * Usage:
 *   npm run generate:images -- [options]
 *
 * Options:
 *   --priority        Generate only priority Phase 1 images
 *   --author          Generate only author photos
 *   --food            Generate only food photography
 *   --infographics    Generate only infographics
 *   --start N         Start from image number N
 *   --end N           End at image number N
 *   --single N        Generate only image number N
 *   --backend NAME    Override backend (replicate, comfyui, a1111, dalle)
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const options = parseArgs(args);

// Load configuration
const config = {
  backend: options.backend || process.env.IMAGE_GEN_BACKEND || 'replicate',
  authorReference: process.env.AUTHOR_REFERENCE_IMAGE || 'manuscript/images/reference/author-reference.png',
  outputWidth: parseInt(process.env.OUTPUT_WIDTH) || 3072,
  outputHeight: parseInt(process.env.OUTPUT_HEIGHT) || 2048,
  outputFormat: process.env.OUTPUT_FORMAT || 'png',
  replicate: {
    token: process.env.REPLICATE_API_TOKEN,
    faceModel: process.env.REPLICATE_FACE_MODEL,
    photoModel: process.env.REPLICATE_PHOTO_MODEL
  },
  openai: {
    key: process.env.OPENAI_API_KEY
  },
  comfyui: {
    url: process.env.COMFYUI_API_URL || 'http://127.0.0.1:8188'
  },
  a1111: {
    url: process.env.A1111_API_URL || 'http://127.0.0.1:7860'
  }
};

// Validate configuration
if (!validateConfig(config, options)) {
  process.exit(1);
}

// Load image metadata
const promptsDir = 'scripts/image-prompts';
const imagePrompts = loadImagePrompts(promptsDir, options);

console.log(`\n${'='.repeat(60)}`);
console.log(`Drain Salad Image Generation`);
console.log(`${'='.repeat(60)}`);
console.log(`Backend: ${config.backend}`);
console.log(`Images to generate: ${imagePrompts.length}`);
console.log(`Author reference: ${fs.existsSync(config.authorReference) ? 'Found' : 'Will be created'}`);
console.log(`${'='.repeat(60)}\n`);

// Main execution
(async () => {
  try {
    // Load backend module
    const Backend = require(`./image-backends/${config.backend}`);
    const generator = new Backend(config);

    // Initialize backend
    await generator.init();

    // Check for author reference image
    let authorRefExists = fs.existsSync(config.authorReference);

    // Generate images
    for (let i = 0; i < imagePrompts.length; i++) {
      const promptData = imagePrompts[i];
      const isAuthorPhoto = promptData.type === 'author';

      console.log(`\n[${i + 1}/${imagePrompts.length}] Generating: ${promptData.title}`);
      console.log(`  Type: ${promptData.type}`);
      console.log(`  File: ${promptData.filename}`);

      // For author photos, use reference if available
      let useReference = false;
      if (isAuthorPhoto && authorRefExists) {
        console.log(`  Using author reference: ${config.authorReference}`);
        useReference = true;
      }

      // Generate the image
      try {
        const result = await generator.generate({
          prompt: promptData.prompt,
          type: promptData.type,
          useReference: useReference,
          referenceImage: useReference ? config.authorReference : null,
          width: config.outputWidth,
          height: config.outputHeight,
          outputPath: promptData.outputPath
        });

        console.log(`  ✓ Generated: ${result.path}`);
        console.log(`  Size: ${result.size}`);

        // If this was the first author photo, save it as reference
        if (isAuthorPhoto && !authorRefExists && promptData.number === 2) {
          // Image 2 is the main author bio photo
          const refDir = path.dirname(config.authorReference);
          if (!fs.existsSync(refDir)) {
            fs.mkdirSync(refDir, { recursive: true });
          }
          fs.copyFileSync(result.path, config.authorReference);
          authorRefExists = true;
          console.log(`  ✓ Saved as author reference for future images`);
        }

      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}`);
        if (options.stopOnError) {
          throw error;
        }
      }

      // Small delay between generations to avoid rate limits
      if (i < imagePrompts.length - 1) {
        await sleep(2000);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Generation complete!`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error(`\nFatal error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
})();

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {
    priority: false,
    author: false,
    food: false,
    infographics: false,
    start: null,
    end: null,
    single: null,
    backend: null,
    stopOnError: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--priority':
        options.priority = true;
        break;
      case '--author':
        options.author = true;
        break;
      case '--food':
        options.food = true;
        break;
      case '--infographics':
        options.infographics = true;
        break;
      case '--start':
        options.start = parseInt(args[++i]);
        break;
      case '--end':
        options.end = parseInt(args[++i]);
        break;
      case '--single':
        options.single = parseInt(args[++i]);
        break;
      case '--backend':
        options.backend = args[++i];
        break;
      case '--stop-on-error':
        options.stopOnError = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

/**
 * Load image prompts from files
 */
function loadImagePrompts(dir, options) {
  const prompts = [];

  // Get all prompt files
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.txt') && f !== '000_PRIORITY_LIST.txt')
    .sort();

  // Load priority list if needed
  let priorityNumbers = [];
  if (options.priority) {
    const priorityFile = path.join(dir, '000_PRIORITY_LIST.txt');
    const priorityContent = fs.readFileSync(priorityFile, 'utf8');
    const matches = priorityContent.matchAll(/\[(\d+)\]/g);
    priorityNumbers = Array.from(matches).map(m => parseInt(m[1]));
  }

  for (const file of files) {
    const filepath = path.join(dir, file);
    const content = fs.readFileSync(filepath, 'utf8');

    // Parse prompt file
    const parsed = parsePromptFile(content, file);

    // Apply filters
    if (options.single && parsed.number !== options.single) continue;
    if (options.start && parsed.number < options.start) continue;
    if (options.end && parsed.number > options.end) continue;
    if (options.priority && !priorityNumbers.includes(parsed.number)) continue;
    if (options.author && parsed.type !== 'author') continue;
    if (options.food && !['hero', 'process'].includes(parsed.type)) continue;
    if (options.infographics && parsed.type !== 'infographic') continue;

    prompts.push(parsed);
  }

  return prompts;
}

/**
 * Parse a prompt file
 */
function parsePromptFile(content, filename) {
  const lines = content.split('\n');

  // Extract image number from first line
  const numberMatch = lines[0].match(/IMAGE (\d+):/);
  const number = numberMatch ? parseInt(numberMatch[1]) : 0;

  // Extract title
  const title = lines[0].replace(/IMAGE \d+:\s*/, '').trim();

  // Extract type
  const typeMatch = content.match(/Type:\s*(\w+)/);
  const type = typeMatch ? typeMatch[1] : 'other';

  // Extract chapter
  const chapterMatch = content.match(/Chapter:\s*(.+)/);
  const chapter = chapterMatch ? chapterMatch[1].trim() : '';

  // Extract prompt (between PROMPT FOR IMAGE GENERATION and TECHNICAL SPECIFICATIONS)
  const promptMatch = content.match(/PROMPT FOR IMAGE GENERATION:\s*={40,}\s*\n([\s\S]+?)\n\s*={40,}\s*\nTECHNICAL SPECIFICATIONS:/);
  const prompt = promptMatch ? promptMatch[1].trim() : '';

  // Extract output filename
  const filenameMatch = content.match(/Output filename:\s*(.+)/);
  const outputFilename = filenameMatch ? filenameMatch[1].trim() : filename.replace('.txt', '.png');

  // Determine output path based on chapter
  let outputPath;
  if (chapter.includes('Chapter 1')) outputPath = 'manuscript/images/chapter-01/';
  else if (chapter.includes('Chapter 2')) outputPath = 'manuscript/images/chapter-02/';
  else if (chapter.includes('Chapter 3')) outputPath = 'manuscript/images/chapter-03/';
  else if (chapter.includes('Chapter 4')) outputPath = 'manuscript/images/chapter-04/';
  else if (chapter.includes('Chapter 5')) outputPath = 'manuscript/images/chapter-05/';
  else if (chapter.includes('Chapter 6')) outputPath = 'manuscript/images/chapter-06/';
  else if (chapter.includes('Chapter 7')) outputPath = 'manuscript/images/chapter-07/';
  else if (chapter.includes('Chapter 8')) outputPath = 'manuscript/images/chapter-08/';
  else if (chapter.includes('Chapter 9')) outputPath = 'manuscript/images/chapter-09/';
  else if (chapter.includes('Chapter 10')) outputPath = 'manuscript/images/chapter-10/';
  else if (chapter.includes('Chapter 11')) outputPath = 'manuscript/images/chapter-11/';
  else if (chapter.includes('Chapter 12')) outputPath = 'manuscript/images/chapter-12/';
  else outputPath = 'manuscript/images/front-matter/';

  outputPath = path.join(outputPath, outputFilename);

  return {
    number,
    title,
    type,
    chapter,
    prompt,
    filename: outputFilename,
    outputPath
  };
}

/**
 * Validate configuration
 */
function validateConfig(config, options) {
  let valid = true;

  // Check backend-specific requirements
  switch (config.backend) {
    case 'replicate':
      if (!config.replicate.token) {
        console.error('Error: REPLICATE_API_TOKEN not set in .env');
        console.error('Get your API token from: https://replicate.com/account/api-tokens');
        valid = false;
      }
      break;

    case 'dalle':
      if (!config.openai.key) {
        console.error('Error: OPENAI_API_KEY not set in .env');
        valid = false;
      }
      console.warn('Warning: DALL-E does not support reference images for character consistency');
      break;

    case 'comfyui':
      console.log('Using local ComfyUI API at:', config.comfyui.url);
      break;

    case 'a1111':
      console.log('Using local Automatic1111 API at:', config.a1111.url);
      break;

    default:
      console.error(`Error: Unknown backend: ${config.backend}`);
      console.error('Supported backends: replicate, dalle, comfyui, a1111');
      valid = false;
  }

  return valid;
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Print help
 */
function printHelp() {
  console.log(`
Drain Salad Image Generation Script

Usage:
  npm run generate:images -- [options]

Options:
  --priority         Generate only Phase 1 priority images (25 images)
  --author           Generate only author photos (8 images)
  --food             Generate only food photography (hero + process shots)
  --infographics     Generate only infographics
  --start N          Start from image number N
  --end N            End at image number N
  --single N         Generate only image number N
  --backend NAME     Override backend (replicate, comfyui, a1111, dalle)
  --stop-on-error    Stop if any generation fails
  --help             Show this help

Examples:
  # Generate all priority images
  npm run generate:images -- --priority

  # Generate only author photos
  npm run generate:images -- --author

  # Generate a specific image
  npm run generate:images -- --single 2

  # Generate images 10-20
  npm run generate:images -- --start 10 --end 20

Backends:
  replicate    - Replicate API with face reference (recommended)
  comfyui      - Local ComfyUI API
  a1111        - Local Automatic1111 API
  dalle        - OpenAI DALL-E 3 (no reference support)

Configuration:
  Copy .env.example to .env and add your API keys
  `);
}
