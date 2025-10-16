#!/usr/bin/env node

/**
 * Generate Image Prompts Script
 *
 * This script reads the image-manifest.md file and generates individual
 * prompt files for each image, making it easy to batch-generate images
 * using AI image generation tools.
 *
 * Usage: node scripts/generate-image-prompts.js
 */

const fs = require('fs');
const path = require('path');

// Load author visual reference
const authorRef = fs.readFileSync('.author-visual-reference.md', 'utf8');
const authorPromptCore = extractAuthorPromptCore(authorRef);

// Load image manifest
const manifest = fs.readFileSync('image-manifest.md', 'utf8');

// Output directory for prompts
const outputDir = 'scripts/image-prompts';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Parse manifest and generate prompts
const images = parseManifest(manifest);
console.log(`Found ${images.length} images in manifest`);

// Generate prompt files
let authorPhotoCount = 0;
let heroShotCount = 0;
let processCount = 0;
let infographicCount = 0;

images.forEach((image, index) => {
  const promptFile = generatePromptFile(image, index + 1, authorPromptCore);
  const filename = `${String(index + 1).padStart(3, '0')}_${sanitizeFilename(image.title)}.txt`;
  fs.writeFileSync(path.join(outputDir, filename), promptFile);

  // Count types
  if (image.type === 'author') authorPhotoCount++;
  else if (image.type === 'hero') heroShotCount++;
  else if (image.type === 'process') processCount++;
  else if (image.type === 'infographic') infographicCount++;
});

console.log(`\nGenerated ${images.length} prompt files in ${outputDir}/`);
console.log(`  - Author photos: ${authorPhotoCount}`);
console.log(`  - Hero shots: ${heroShotCount}`);
console.log(`  - Process shots: ${processCount}`);
console.log(`  - Infographics: ${infographicCount}`);

// Also generate a priority list
const priorityImages = images.filter(img => img.priority === 1);
const priorityList = priorityImages.map((img, idx) =>
  `${idx + 1}. [${img.number}] ${img.title} (${img.chapter})`
).join('\n');

fs.writeFileSync(
  path.join(outputDir, '000_PRIORITY_LIST.txt'),
  `PRIORITY PHASE 1: Generate These First\n${'='.repeat(50)}\n\n${priorityList}\n\n` +
  `Total: ${priorityImages.length} images\n\n` +
  `These are the must-have images for a functional first version:\n` +
  `- Cover image\n` +
  `- Author photo\n` +
  `- One hero shot per chapter\n` +
  `- Key process shots for Chapter 6 (Foundations)\n`
);

console.log(`\nPriority list saved to ${outputDir}/000_PRIORITY_LIST.txt`);

/**
 * Extract core author prompt from visual reference
 */
function extractAuthorPromptCore(content) {
  const match = content.match(/\*\*Core descriptor to use in every author photo:\*\*\s*"([^"]+)"/);
  return match ? match[1] : "Italian-American man in his late 20s, dark brown wavy hair, olive skin, in kitchen";
}

/**
 * Parse manifest markdown into structured data
 */
function parseManifest(content) {
  const images = [];
  const lines = content.split('\n');

  let currentChapter = '';
  let currentNumber = null;
  let currentTitle = '';
  let currentDesc = '';
  let inImageBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect chapter
    if (line.startsWith('### Chapter')) {
      currentChapter = line.replace('### ', '').split(':')[0];
    }

    // Detect image number
    const numberMatch = line.match(/^(\d+)(?:-\d+)?\.?\s+\*\*(.+?)\*\*/);
    if (numberMatch) {
      // Save previous image if exists
      if (currentNumber !== null) {
        images.push({
          number: currentNumber,
          title: currentTitle,
          chapter: currentChapter,
          description: currentDesc.trim(),
          type: detectType(currentTitle, currentDesc),
          priority: detectPriority(currentNumber, currentTitle)
        });
      }

      // Start new image
      currentNumber = parseInt(numberMatch[1]);
      currentTitle = numberMatch[2].replace(/\*\*/g, '');
      currentDesc = line.substring(line.indexOf('**') + currentTitle.length + 4).trim();
      inImageBlock = true;
    }
    // Continue description
    else if (inImageBlock && line.trim().startsWith('-')) {
      currentDesc += '\n' + line.trim();
    }
    // End of image block
    else if (inImageBlock && line.trim() === '') {
      inImageBlock = false;
    }
    else if (inImageBlock) {
      currentDesc += ' ' + line.trim();
    }
  }

  // Don't forget last image
  if (currentNumber !== null) {
    images.push({
      number: currentNumber,
      title: currentTitle,
      chapter: currentChapter,
      description: currentDesc.trim(),
      type: detectType(currentTitle, currentDesc),
      priority: detectPriority(currentNumber, currentTitle)
    });
  }

  return images;
}

/**
 * Detect image type from title and description
 */
function detectType(title, desc) {
  const lowerTitle = title.toLowerCase();
  const lowerDesc = desc.toLowerCase();

  if (lowerTitle.includes('author') || lowerDesc.includes('author photo') || lowerDesc.includes('author at') || lowerDesc.includes("author's hand")) {
    return 'author';
  }
  if (lowerTitle.includes('hero') || lowerTitle.includes('finished')) {
    return 'hero';
  }
  if (lowerTitle.includes('process') || lowerTitle.includes('sequence') || lowerTitle.includes('stages') || lowerTitle.includes('progression')) {
    return 'process';
  }
  if (lowerTitle.includes('infographic') || lowerTitle.includes('chart') || lowerTitle.includes('timeline') || lowerTitle.includes('matrix')) {
    return 'infographic';
  }
  if (lowerTitle.includes('comparison') || lowerDesc.includes('vs') || lowerDesc.includes('before/after')) {
    return 'comparison';
  }

  return 'other';
}

/**
 * Determine if image is priority 1 (must-have for first version)
 */
function detectPriority(number, title) {
  // Cover and author bio
  if (number <= 2) return 1;

  // Hero shots (roughly every 6-8 images for chapter hero shots)
  const heroNumbers = [57, 61, 62, 69, 71, 82, 94, 99, 117];
  if (heroNumbers.includes(number)) return 1;

  // Key chapter 6 process shots
  if (number >= 40 && number <= 56) return 1;

  return 2;
}

/**
 * Generate complete prompt file for an image
 */
function generatePromptFile(image, number, authorPromptCore) {
  let prompt = '';

  // Header
  prompt += `IMAGE ${number}: ${image.title}\n`;
  prompt += `${'='.repeat(60)}\n\n`;

  // Metadata
  prompt += `Chapter: ${image.chapter}\n`;
  prompt += `Type: ${image.type}\n`;
  prompt += `Priority: ${image.priority === 1 ? 'PHASE 1 (Must-have)' : 'PHASE 2'}\n\n`;

  // Description from manifest
  prompt += `Description:\n`;
  prompt += `${image.description}\n\n`;

  // Style guide
  prompt += `${'='.repeat(60)}\n`;
  prompt += `PROMPT FOR IMAGE GENERATION:\n`;
  prompt += `${'='.repeat(60)}\n\n`;

  // Build actual prompt based on type
  if (image.type === 'author') {
    prompt += buildAuthorPrompt(image, authorPromptCore);
  } else if (image.type === 'hero' || image.type === 'process') {
    prompt += buildFoodPrompt(image);
  } else if (image.type === 'infographic') {
    prompt += buildInfographicPrompt(image);
  } else {
    prompt += buildGenericPrompt(image);
  }

  // Technical specs
  prompt += `\n\n${'='.repeat(60)}\n`;
  prompt += `TECHNICAL SPECIFICATIONS:\n`;
  prompt += `${'='.repeat(60)}\n\n`;
  prompt += `- Aspect ratio: ${getAspectRatio(image)}\n`;
  prompt += `- Resolution: 3000px wide minimum (300 DPI for print)\n`;
  prompt += `- Format: PNG or high-quality JPG\n`;
  prompt += `- Color space: sRGB\n`;
  prompt += `- Style: ${getStyleGuide(image)}\n\n`;

  // Filename
  prompt += `Output filename: ${String(number).padStart(3, '0')}_${sanitizeFilename(image.title)}.png\n`;

  return prompt;
}

/**
 * Build prompt for author photos
 */
function buildAuthorPrompt(image, authorPromptCore) {
  // Extract setting from description
  const setting = extractSetting(image.description);
  const expression = extractExpression(image.description);

  let prompt = `${authorPromptCore}, ${setting}, ${expression}, `;
  prompt += `documentary photography style, natural lighting, warm color tones, `;
  prompt += `film photography aesthetic, shallow depth of field, `;
  prompt += `slightly desaturated colors, 35mm film look, candid moment, `;
  prompt += `professional food photography lighting but not overly stylized\n\n`;

  prompt += `Key elements:\n`;
  prompt += `- Same person as established in reference (Italian-American man, late 20s, wavy dark hair)\n`;
  prompt += `- Natural, unposed moment\n`;
  prompt += `- Authentic kitchen/restaurant setting\n`;
  prompt += `- Worn, lived-in clothing (no pristine chef whites)\n`;
  prompt += `- Visible hands if working with food\n\n`;

  prompt += `Avoid:\n`;
  prompt += `- Overly staged or posed\n`;
  prompt += `- Perfect lighting (should feel real)\n`;
  prompt += `- Stock photo aesthetic\n`;
  prompt += `- Smiling at camera (too cheesy)\n`;

  return prompt;
}

/**
 * Build prompt for food photography
 */
function buildFoodPrompt(image) {
  let prompt = `Professional food photography, `;
  prompt += `${image.title.toLowerCase()}, `;
  prompt += `editorial cookbook style, natural daylight, warm color palette, `;
  prompt += `shot from above or 45-degree angle, shallow depth of field, `;
  prompt += `rustic styling, linen napkin or towel visible, `;
  prompt += `weathered wood surface or neutral background, `;
  prompt += `organic composition, not overly styled, `;
  prompt += `realistic food textures, appetizing but honest presentation\n\n`;

  prompt += `Specific to this image:\n`;
  const lines = image.description.split('\n').filter(l => l.trim().startsWith('-'));
  lines.forEach(line => {
    prompt += `${line}\n`;
  });

  prompt += `\nStyle references:\n`;
  prompt += `- Not fine dining/Michelin style (too precious)\n`;
  prompt += `- Think Bon Appétit or Serious Eats aesthetic\n`;
  prompt += `- Shows the food is made from scraps but looks delicious\n`;
  prompt += `- Honest, authentic, approachable\n`;

  return prompt;
}

/**
 * Build prompt for infographics
 */
function buildInfographicPrompt(image) {
  let prompt = `Clean infographic design, `;
  prompt += `educational but beautiful, `;
  prompt += `cookbook reference guide aesthetic, `;
  prompt += `warm neutral color palette (browns, creams, muted greens), `;
  prompt += `clear typography, organized layout, `;
  prompt += `minimal but not sterile, `;
  prompt += `feels like a well-designed textbook or field guide\n\n`;

  prompt += `Content:\n`;
  prompt += `${image.description}\n\n`;

  prompt += `Style: Clean, functional, but with personality. Think Cook's Illustrated meets kinfolk magazine.\n`;

  return prompt;
}

/**
 * Build generic prompt
 */
function buildGenericPrompt(image) {
  let prompt = `${image.title}, `;
  prompt += `professional photography, natural lighting, `;
  prompt += `editorial style, warm color tones, `;
  prompt += `cookbook aesthetic\n\n`;
  prompt += `${image.description}`;
  return prompt;
}

/**
 * Extract setting from description
 */
function extractSetting(desc) {
  if (desc.includes('kitchen counter')) return 'at kitchen counter';
  if (desc.includes('stove')) return 'at stove cooking';
  if (desc.includes('table')) return 'at small dining table';
  if (desc.includes('market')) return 'at farmers market';
  return 'in home kitchen';
}

/**
 * Extract expression/mood from description
 */
function extractExpression(desc) {
  if (desc.includes('frustrated') || desc.includes('disappointed')) return 'frustrated expression';
  if (desc.includes('worried') || desc.includes('confused')) return 'worried/confused expression';
  if (desc.includes('smirk') || desc.includes('confident')) return 'slight smirk, confident';
  if (desc.includes('focused')) return 'focused on work';
  return 'natural expression, mid-task';
}

/**
 * Get aspect ratio for image type
 */
function getAspectRatio(image) {
  if (image.number === 1) return '2:3 (portrait for book cover)';
  if (image.type === 'infographic') return '16:9 or square';
  if (image.type === 'hero') return '4:3 or 3:2 (landscape)';
  return '3:2 or 4:3';
}

/**
 * Get style guide for image type
 */
function getStyleGuide(image) {
  if (image.type === 'author') return 'Documentary/reportage, film aesthetic';
  if (image.type === 'hero') return 'Editorial food photography, warm and inviting';
  if (image.type === 'process') return 'Clear instructional, well-lit, honest';
  if (image.type === 'infographic') return 'Clean design, educational but beautiful';
  return 'Professional, warm, approachable';
}

/**
 * Sanitize filename
 */
function sanitizeFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}
