#!/usr/bin/env node

/**
 * Extract Image Manifest from Markdown
 *
 * This script scans all manuscript/*.md files and extracts image references,
 * creating a manifest that serves as the single source of truth.
 *
 * Image references in markdown:
 *   ![Caption text](images/chapter-01/002_author-photo.png)
 *
 * Optional prompt metadata (for future image generation):
 *   <!-- img-prompt: detailed prompt for image generation -->
 *   <!-- img-type: author|hero|process|infographic|other -->
 *
 * Usage: node scripts/extract-image-manifest.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const manuscriptDir = 'manuscript';
const outputFile = 'generated-manifest.json';

// Main execution
console.log('📸 Extracting image manifest from markdown files...\n');

const chapterFiles = glob.sync(`${manuscriptDir}/chapter-*.md`).sort();
console.log(`Found ${chapterFiles.length} chapter files\n`);

const manifest = {
  generated: new Date().toISOString(),
  images: [],
  stats: {
    totalImages: 0,
    byChapter: {},
    byType: {
      author: 0,
      hero: 0,
      process: 0,
      infographic: 0,
      other: 0
    },
    withPrompts: 0,
    missingFiles: []
  }
};

// Process each chapter file
chapterFiles.forEach(filePath => {
  const chapterName = path.basename(filePath, '.md');
  const chapterMatch = chapterName.match(/chapter-(\d+)/);
  const chapterNum = chapterMatch ? chapterMatch[1] : '00';
  const expectedChapter = `chapter-${chapterNum}`;

  console.log(`Processing ${chapterName}...`);

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let imageCount = 0;

  // Track context for prompts (HTML comments before/after image)
  let pendingPrompt = null;
  let pendingType = null;
  let pendingRef = null;

  lines.forEach((line, lineNum) => {
    // Check for prompt metadata in HTML comments
    const promptMatch = line.match(/<!--\s*img-prompt:\s*(.+?)\s*-->/);
    if (promptMatch) {
      pendingPrompt = promptMatch[1].trim();
    }

    const typeMatch = line.match(/<!--\s*img-type:\s*(\w+)\s*-->/);
    if (typeMatch) {
      pendingType = typeMatch[1].trim();
    }

    // Check for reference image dependency
    const refMatch = line.match(/<!--\s*img-ref:\s*(.+?)\s*-->/);
    if (refMatch) {
      pendingRef = refMatch[1].trim();
    }

    // Extract image references: ![alt](path)
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = imgRegex.exec(line)) !== null) {
      const alt = match[1];
      const imgPath = match[2];

      // Extract image number from filename (e.g., 002_author-photo.png -> 002)
      const numberMatch = imgPath.match(/(\d{3})_/);
      const imageNumber = numberMatch ? numberMatch[1] : null;

      // Extract slug from filename (e.g., 002_author-photo.png -> author-photo)
      const slugMatch = imgPath.match(/\d{3}_([^.]+)/);
      const slug = slugMatch ? slugMatch[1] : 'unknown';

      // Determine expected path
      const expectedPath = `manuscript/images/${expectedChapter}/${path.basename(imgPath)}`;

      // Detect type from filename or pending metadata
      let type = pendingType || detectTypeFromFilename(slug, alt);

      // Use pending prompt or extract from alt text
      const prompt = pendingPrompt || alt;

      // Check if file exists
      const fileExists = fs.existsSync(expectedPath);
      if (!fileExists) {
        manifest.stats.missingFiles.push(expectedPath);
      }

      // Add to manifest
      const imageEntry = {
        number: imageNumber,
        slug: slug,
        path: imgPath,
        expectedPath: expectedPath,
        alt: alt,
        prompt: prompt,
        type: type,
        chapter: expectedChapter,
        chapterNumber: parseInt(chapterNum),
        sourceFile: `${chapterName}.md`,
        sourceLine: lineNum + 1,
        fileExists: fileExists,
        dependsOn: pendingRef ? normalizeImagePath(pendingRef) : null
      };

      manifest.images.push(imageEntry);
      imageCount++;

      // Update stats
      manifest.stats.byType[type] = (manifest.stats.byType[type] || 0) + 1;
      if (pendingPrompt) {
        manifest.stats.withPrompts++;
      }

      // Clear pending metadata
      pendingPrompt = null;
      pendingType = null;
      pendingRef = null;
    }
  });

  manifest.stats.byChapter[expectedChapter] = imageCount;
  console.log(`  Found ${imageCount} images`);
});

manifest.stats.totalImages = manifest.images.length;

// Build dependency graph and detect issues
const dependencyInfo = analyzeDependencies(manifest.images);
manifest.dependencies = dependencyInfo;

// Save manifest
fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));

// Print summary
console.log('\n' + '='.repeat(60));
console.log('📊 Image Manifest Summary');
console.log('='.repeat(60));
console.log(`Total images: ${manifest.stats.totalImages}`);
console.log(`\nBy chapter:`);
Object.entries(manifest.stats.byChapter).forEach(([chapter, count]) => {
  console.log(`  ${chapter}: ${count} images`);
});
console.log(`\nBy type:`);
Object.entries(manifest.stats.byType).forEach(([type, count]) => {
  if (count > 0) {
    console.log(`  ${type}: ${count} images`);
  }
});
console.log(`\nWith explicit prompts: ${manifest.stats.withPrompts}`);

if (manifest.stats.missingFiles.length > 0) {
  console.log(`\n⚠️  Missing files: ${manifest.stats.missingFiles.length}`);
  manifest.stats.missingFiles.forEach(file => {
    console.log(`  ❌ ${file}`);
  });
} else {
  console.log(`\n✅ All referenced images exist!`);
}

console.log(`\n✅ Manifest saved to ${outputFile}`);

// Report dependencies
if (dependencyInfo.withDependencies > 0) {
  console.log(`\n📎 Image Dependencies:`);
  console.log(`  Images with dependencies: ${dependencyInfo.withDependencies}`);

  if (dependencyInfo.cycles.length > 0) {
    console.log(`  ⚠️  Circular dependencies detected: ${dependencyInfo.cycles.length}`);
    dependencyInfo.cycles.forEach(cycle => {
      console.log(`    ❌ ${cycle.join(' → ')}`);
    });
  } else {
    console.log(`  ✅ No circular dependencies`);
  }

  if (dependencyInfo.missing.length > 0) {
    console.log(`  ⚠️  Missing dependency targets: ${dependencyInfo.missing.length}`);
    dependencyInfo.missing.forEach(({ from, to }) => {
      console.log(`    ❌ ${from} depends on ${to} (not found)`);
    });
  }

  console.log(`  Generation order: ${dependencyInfo.sorted.length} images topologically sorted`);
}

/**
 * Normalize image path for comparison
 */
function normalizeImagePath(imgPath) {
  // Remove manuscript/ prefix if present
  let normalized = imgPath.replace(/^manuscript\//, '');
  // Ensure it has images/ prefix
  if (!normalized.startsWith('images/')) {
    normalized = 'images/' + normalized;
  }
  return normalized;
}

/**
 * Analyze dependencies and create topologically sorted order
 */
function analyzeDependencies(images) {
  const result = {
    withDependencies: 0,
    cycles: [],
    missing: [],
    sorted: []
  };

  // Build path to image map
  const imagesByPath = new Map();
  images.forEach(img => {
    imagesByPath.set(img.path, img);
    if (img.dependsOn) {
      result.withDependencies++;
    }
  });

  // Check for missing dependencies
  images.forEach(img => {
    if (img.dependsOn && !imagesByPath.has(img.dependsOn)) {
      result.missing.push({
        from: img.path,
        to: img.dependsOn
      });
    }
  });

  // Topological sort using Kahn's algorithm
  const sorted = [];
  const inDegree = new Map();
  const adjList = new Map();

  // Initialize
  images.forEach(img => {
    inDegree.set(img.path, 0);
    adjList.set(img.path, []);
  });

  // Build graph
  images.forEach(img => {
    if (img.dependsOn && imagesByPath.has(img.dependsOn)) {
      adjList.get(img.dependsOn).push(img.path);
      inDegree.set(img.path, inDegree.get(img.path) + 1);
    }
  });

  // Find nodes with no dependencies
  const queue = [];
  images.forEach(img => {
    if (inDegree.get(img.path) === 0) {
      queue.push(img.path);
    }
  });

  // Process queue
  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);

    // Reduce in-degree for dependents
    adjList.get(current).forEach(dependent => {
      inDegree.set(dependent, inDegree.get(dependent) - 1);
      if (inDegree.get(dependent) === 0) {
        queue.push(dependent);
      }
    });
  }

  // Check for cycles (if not all images were sorted)
  if (sorted.length < images.length) {
    // Find cycles
    images.forEach(img => {
      if (inDegree.get(img.path) > 0) {
        const cycle = findCycle(img.path, imagesByPath, new Set());
        if (cycle.length > 0) {
          result.cycles.push(cycle);
        }
      }
    });
  }

  result.sorted = sorted;
  return result;
}

/**
 * Find a cycle starting from a node
 */
function findCycle(start, imagesByPath, visited) {
  if (visited.has(start)) {
    return [start];
  }

  visited.add(start);
  const img = imagesByPath.get(start);

  if (img && img.dependsOn && imagesByPath.has(img.dependsOn)) {
    const cycle = findCycle(img.dependsOn, imagesByPath, visited);
    if (cycle.length > 0) {
      cycle.unshift(start);
      return cycle;
    }
  }

  return [];
}

/**
 * Detect image type from filename and alt text
 */
function detectTypeFromFilename(slug, alt) {
  const combined = (slug + ' ' + alt).toLowerCase();

  if (combined.includes('author') || combined.includes('december 2021') ||
      combined.includes('june 2021') || combined.includes('november 2021')) {
    return 'author';
  }
  if (combined.includes('hero') || combined.includes('finished')) {
    return 'hero';
  }
  if (combined.includes('process') || combined.includes('sequence') ||
      combined.includes('stage') || combined.includes('progression') ||
      combined.includes('timeline')) {
    return 'process';
  }
  if (combined.includes('infographic') || combined.includes('chart') ||
      combined.includes('matrix') || combined.includes('decision-tree') ||
      combined.includes('guide') || combined.includes('comparison')) {
    return 'infographic';
  }

  return 'other';
}
