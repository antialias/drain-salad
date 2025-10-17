#!/usr/bin/env node

/**
 * Generate Missing Images from Manifest
 *
 * Reads generated-manifest.json and generates any images that don't exist yet.
 * Uses the alt text as the base prompt, enhanced with style guidance based on type.
 *
 * Usage: node scripts/generate-missing-images.js [options]
 *
 * Options:
 *   --all         Generate all images (even if they exist)
 *   --dry-run     Show what would be generated without actually generating
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Parse arguments
const args = process.argv.slice(2);
const options = {
  all: args.includes('--all'),
  dryRun: args.includes('--dry-run')
};

// Load manifest
const manifestPath = 'generated-manifest.json';
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Manifest not found. Run: node scripts/extract-image-manifest.js');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Configuration
const config = {
  backend: process.env.IMAGE_GEN_BACKEND || 'replicate',
  authorReference: process.env.AUTHOR_REFERENCE_IMAGE || 'manuscript/images/reference/author-reference.png',
  outputWidth: parseInt(process.env.OUTPUT_WIDTH) || 3072,
  outputHeight: parseInt(process.env.OUTPUT_HEIGHT) || 2048,
  openai: {
    key: process.env.OPENAI_API_KEY
  }
};

// Filter to missing images
let imagesToGenerate = manifest.images.filter(img =>
  options.all || !img.fileExists
);

// Sort by dependency order if available
if (manifest.dependencies && manifest.dependencies.sorted.length > 0) {
  const sortOrder = new Map();
  manifest.dependencies.sorted.forEach((path, index) => {
    sortOrder.set(path, index);
  });

  imagesToGenerate.sort((a, b) => {
    const orderA = sortOrder.get(a.path) ?? 999999;
    const orderB = sortOrder.get(b.path) ?? 999999;
    return orderA - orderB;
  });
}

console.log('\n' + '='.repeat(60));
console.log('📸 Generate Missing Images');
console.log('='.repeat(60));
console.log(`Total images in manifest: ${manifest.images.length}`);
console.log(`Missing images: ${imagesToGenerate.length}`);
console.log(`Backend: ${config.backend}`);

if (manifest.dependencies && manifest.dependencies.withDependencies > 0) {
  console.log(`Dependencies: ${manifest.dependencies.withDependencies} images with dependencies`);

  if (manifest.dependencies.cycles.length > 0) {
    console.log(`⚠️  WARNING: ${manifest.dependencies.cycles.length} circular dependencies detected!`);
  }
}

console.log('='.repeat(60) + '\n');

if (imagesToGenerate.length === 0) {
  console.log('✅ All images already exist!');
  process.exit(0);
}

if (options.dryRun) {
  console.log('🔍 Dry run - would generate:\n');
  imagesToGenerate.forEach((img, i) => {
    console.log(`${i + 1}. ${img.number}_${img.slug}.png`);
    console.log(`   Path: ${img.expectedPath}`);
    console.log(`   Type: ${img.type}`);
    console.log(`   Prompt: ${img.prompt.substring(0, 80)}...`);
    console.log('');
  });
  process.exit(0);
}

// Main generation
(async () => {
  try {
    // Load backend
    const Backend = require(`./image-backends/${config.backend}`);
    const generator = new Backend(config);

    await generator.init();

    // Check for author reference
    let authorRefExists = fs.existsSync(config.authorReference);

    const CONCURRENCY = 8;
    let completed = 0;
    let failed = 0;

    // Build path to image map for dependency lookup
    const imagesByPath = new Map();
    manifest.images.forEach(img => {
      imagesByPath.set(img.path, img);
    });

    // Generate image function
    const generateImage = async (imageData, index) => {
      const isAuthorPhoto = imageData.type === 'author';

      console.log(`\n[${index + 1}/${imagesToGenerate.length}] ${imageData.number}_${imageData.slug}`);
      console.log(`  Type: ${imageData.type}`);
      console.log(`  Chapter: ${imageData.chapter}`);

      // Check for dependencies
      let referenceImage = null;
      let useReference = false;

      if (imageData.dependsOn) {
        const depImage = imagesByPath.get(imageData.dependsOn);
        if (depImage && depImage.fileExists) {
          referenceImage = depImage.expectedPath;
          useReference = true;
          console.log(`  📎 Depends on: ${imageData.dependsOn}`);
        } else {
          console.log(`  ⚠️  Warning: dependency ${imageData.dependsOn} not found or doesn't exist`);
        }
      } else if (isAuthorPhoto && authorRefExists) {
        // Fallback to author reference for author photos without explicit dependency
        referenceImage = config.authorReference;
        useReference = true;
      }

      // Build enhanced prompt based on type
      const enhancedPrompt = buildPrompt(imageData);

      console.log(`  Prompt: ${enhancedPrompt.substring(0, 100)}...`);

      if (useReference) {
        console.log(`  Using reference: ${referenceImage}`);
      }

      // Ensure output directory exists
      const outputDir = path.dirname(imageData.expectedPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`  Created directory: ${outputDir}`);
      }

      try {
        const result = await generator.generate({
          prompt: enhancedPrompt,
          type: imageData.type,
          useReference: useReference,
          referenceImage: referenceImage,
          width: config.outputWidth,
          height: config.outputHeight,
          outputPath: imageData.expectedPath
        });

        console.log(`  ✅ Generated: ${result.path}`);
        console.log(`  Size: ${result.size}`);

        // If this is an author photo and we don't have a reference yet, save it
        if (isAuthorPhoto && !authorRefExists && imageData.number === '002') {
          const refDir = path.dirname(config.authorReference);
          if (!fs.existsSync(refDir)) {
            fs.mkdirSync(refDir, { recursive: true });
          }
          fs.copyFileSync(result.path, config.authorReference);
          authorRefExists = true;
          console.log(`  ✅ Saved as author reference`);
        }

        completed++;
        return { success: true, index };
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        failed++;
        return { success: false, index, error };
      }
    };

    // Process: sequential for images with dependencies, parallel for independent ones
    const processed = new Set();

    for (let i = 0; i < imagesToGenerate.length; i++) {
      const imageData = imagesToGenerate[i];

      // Check if this image has unprocessed dependencies
      const hasDependency = imageData.dependsOn &&
        !processed.has(imageData.dependsOn) &&
        imagesToGenerate.some(img => img.path === imageData.dependsOn);

      if (hasDependency) {
        // Generate sequentially (wait for dependency)
        console.log(`\n⏸  Waiting for dependency: ${imageData.dependsOn}`);
        await generateImage(imageData, i);
        processed.add(imageData.path);
      } else {
        // Can generate in parallel - collect a batch of independent images
        const batch = [imageData];
        let j = i + 1;

        while (batch.length < CONCURRENCY && j < imagesToGenerate.length) {
          const nextImage = imagesToGenerate[j];
          const nextHasDependency = nextImage.dependsOn &&
            !processed.has(nextImage.dependsOn) &&
            imagesToGenerate.some(img => img.path === nextImage.dependsOn);

          if (!nextHasDependency) {
            batch.push(nextImage);
            j++;
          } else {
            break;
          }
        }

        // Generate batch in parallel
        const batchPromises = batch.map((img, batchIndex) =>
          generateImage(img, i + batchIndex)
        );

        await Promise.all(batchPromises);

        // Mark as processed
        batch.forEach(img => processed.add(img.path));

        // Skip ahead
        i = j - 1;

        // Progress update
        console.log(`\n📊 Progress: ${processed.size}/${imagesToGenerate.length} (${completed} succeeded, ${failed} failed)`);
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Generation Complete');
    console.log('='.repeat(60));
    console.log(`Total: ${imagesToGenerate.length}`);
    console.log(`✅ Succeeded: ${completed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('='.repeat(60) + '\n');

    if (failed > 0) {
      console.log('⚠️  Some images failed to generate. Check logs above.');
      process.exit(1);
    } else {
      console.log('✅ All missing images generated successfully!');
      console.log('\n💡 Next steps:');
      console.log('   1. Run: node scripts/extract-image-manifest.js (to verify)');
      console.log('   2. Run: npm run build:book');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
})();

/**
 * Build enhanced prompt based on image type and metadata
 */
function buildPrompt(imageData) {
  let prompt = imageData.prompt;

  // Add style enhancements based on type
  if (imageData.type === 'author') {
    prompt += ', documentary photography style, natural lighting, warm color tones, ';
    prompt += 'film photography aesthetic, shallow depth of field, ';
    prompt += 'slightly desaturated colors, 35mm film look, candid moment';
  } else if (imageData.type === 'hero') {
    prompt += ', professional food photography, editorial cookbook style, ';
    prompt += 'natural daylight, warm color palette, rustic styling, ';
    prompt += 'weathered wood surface, organic composition, realistic food textures, ';
    prompt += 'appetizing but honest presentation';
  } else if (imageData.type === 'process') {
    prompt += ', professional food photography, clear instructional style, ';
    prompt += 'well-lit, natural lighting, editorial cookbook aesthetic, ';
    prompt += 'step-by-step clarity, honest and approachable';
  } else if (imageData.type === 'infographic') {
    prompt += ', clean infographic design, educational but beautiful, ';
    prompt += 'cookbook reference guide aesthetic, warm neutral color palette, ';
    prompt += 'clear typography, organized layout, minimal but not sterile';
  }

  return prompt;
}
