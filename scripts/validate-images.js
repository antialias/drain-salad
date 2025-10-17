#!/usr/bin/env node

/**
 * Validate Image References
 *
 * Checks that all image references in markdown match actual files,
 * and that image files are in the correct chapter directories.
 *
 * Usage: node scripts/validate-images.js [--fix]
 *
 * Options:
 *   --fix  Move misplaced images to correct directories
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Parse args
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');

// Load manifest
const manifestPath = 'generated-manifest.json';
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Manifest not found. Run: node scripts/extract-image-manifest.js');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('🔍 Validating image references...\n');

// Track issues
const issues = {
  missingFiles: [],
  wrongDirectory: [],
  unusedFiles: [],
  pathMismatches: []
};

// Check 1: Referenced images that don't exist
console.log('1️⃣  Checking for missing files...');
manifest.images.forEach(img => {
  if (!img.fileExists) {
    // Check if file exists in wrong directory
    const actualPath = `manuscript/${img.path}`;
    const fileExists = fs.existsSync(actualPath);

    if (fileExists && actualPath !== img.expectedPath) {
      issues.wrongDirectory.push({
        image: img,
        actualPath: actualPath,
        expectedPath: img.expectedPath
      });
    } else if (!fileExists) {
      issues.missingFiles.push(img);
    }
  }
});

if (issues.missingFiles.length > 0) {
  console.log(`  ❌ ${issues.missingFiles.length} missing files:\n`);
  issues.missingFiles.forEach(img => {
    console.log(`    ${img.expectedPath}`);
    console.log(`      Referenced in: ${img.sourceFile}:${img.sourceLine}`);
  });
} else {
  console.log('  ✅ All referenced files exist');
}

// Check 2: Files in wrong directory
if (issues.wrongDirectory.length > 0) {
  console.log(`\n  ⚠️  ${issues.wrongDirectory.length} files in wrong directory:\n`);
  issues.wrongDirectory.forEach(({ image, actualPath, expectedPath }) => {
    console.log(`    ${path.basename(actualPath)}`);
    console.log(`      Current:  ${actualPath}`);
    console.log(`      Expected: ${expectedPath}`);
    console.log(`      Used in:  ${image.sourceFile}:${image.sourceLine}`);
  });
} else {
  console.log('  ✅ All files in correct directories');
}

// Check 3: Image files that exist but aren't referenced
console.log('\n2️⃣  Checking for unused image files...');
const allImageFiles = glob.sync('manuscript/images/**/*.png');
const referencedPaths = new Set(
  manifest.images.map(img => `manuscript/${img.path}`)
);

allImageFiles.forEach(file => {
  if (!referencedPaths.has(file) && !file.includes('/reference/')) {
    issues.unusedFiles.push(file);
  }
});

if (issues.unusedFiles.length > 0) {
  console.log(`  ⚠️  ${issues.unusedFiles.length} unreferenced files:\n`);
  issues.unusedFiles.forEach(file => {
    console.log(`    ${file}`);
  });
} else {
  console.log('  ✅ All image files are referenced');
}

// Check 4: Path consistency (markdown path matches expected)
console.log('\n3️⃣  Checking path consistency...');
manifest.images.forEach(img => {
  const markdownPath = `manuscript/${img.path}`;
  const expectedPath = img.expectedPath;

  if (markdownPath !== expectedPath) {
    issues.pathMismatches.push({
      image: img,
      markdownPath: markdownPath,
      expectedPath: expectedPath
    });
  }
});

if (issues.pathMismatches.length > 0) {
  console.log(`  ⚠️  ${issues.pathMismatches.length} path inconsistencies:\n`);
  issues.pathMismatches.forEach(({ image, markdownPath, expectedPath }) => {
    console.log(`    ${path.basename(markdownPath)}`);
    console.log(`      Markdown: ${image.path}`);
    console.log(`      Expected: images/${image.chapter}/${path.basename(markdownPath)}`);
    console.log(`      In file:  ${image.sourceFile}:${image.sourceLine}`);
  });
} else {
  console.log('  ✅ All paths are consistent');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Validation Summary');
console.log('='.repeat(60));

const totalIssues =
  issues.missingFiles.length +
  issues.wrongDirectory.length +
  issues.unusedFiles.length +
  issues.pathMismatches.length;

if (totalIssues === 0) {
  console.log('✅ All checks passed! Image system is consistent.');
  process.exit(0);
}

console.log(`Found ${totalIssues} issues:`);
console.log(`  - Missing files: ${issues.missingFiles.length}`);
console.log(`  - Wrong directory: ${issues.wrongDirectory.length}`);
console.log(`  - Unused files: ${issues.unusedFiles.length}`);
console.log(`  - Path mismatches: ${issues.pathMismatches.length}`);

// Fix option
if (shouldFix && issues.wrongDirectory.length > 0) {
  console.log('\n🔧 Fixing wrong directory issues...\n');

  issues.wrongDirectory.forEach(({ actualPath, expectedPath }) => {
    const targetDir = path.dirname(expectedPath);

    // Create target directory if needed
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`  📁 Created directory: ${targetDir}`);
    }

    // Move file
    fs.renameSync(actualPath, expectedPath);
    console.log(`  ✅ Moved: ${path.basename(actualPath)}`);
    console.log(`       from: ${actualPath}`);
    console.log(`       to:   ${expectedPath}`);
  });

  console.log(`\n✅ Fixed ${issues.wrongDirectory.length} files`);
  console.log('   Run validation again to verify.');
  process.exit(0);
}

if (issues.wrongDirectory.length > 0) {
  console.log('\n💡 To fix wrong directory issues, run:');
  console.log('   node scripts/validate-images.js --fix');
}

process.exit(1);
