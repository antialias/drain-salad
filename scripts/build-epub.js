#!/usr/bin/env node

/**
 * Build EPUB from markdown for Kindle and other e-readers
 *
 * Uses Pandoc to convert markdown → EPUB with proper metadata
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const metadata = require('../book-metadata.json');

console.log('📱 Building EPUB for e-readers...\n');

// Check if pandoc is installed
try {
  execSync('pandoc --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Pandoc not found!');
  console.error('\n📦 Install Pandoc:');
  console.error('   macOS:   brew install pandoc');
  console.error('   Linux:   apt-get install pandoc');
  console.error('   Windows: https://pandoc.org/installing.html\n');
  process.exit(1);
}

// Ensure build directory exists
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Get all chapter files in order
const manuscriptDir = path.join(__dirname, '..', 'manuscript');
const chapters = [
  '00-front-matter.md',
  'chapter-01-history.md',
  'chapter-02-anatomy.md',
  'chapter-03-clean-catch-method.md',
  'chapter-04-drain-pantry.md',
  'chapter-05-techniques.md',
  'chapter-06-foundations.md',
  'chapter-07-salads-small-plates.md',
  'chapter-08-mains.md',
  'chapter-09-ferments-condiments.md',
  'chapter-10-taxonomy.md',
  'chapter-11-use-cases.md',
  'chapter-12-appendices.md',
].map(f => path.join(manuscriptDir, f));

// Create metadata file for Pandoc
const pandocMetadata = {
  title: metadata.title,
  subtitle: metadata.subtitle,
  author: metadata.author,
  language: metadata.language,
  rights: `© ${new Date().getFullYear()} ${metadata.author}. All rights reserved.`,
  description: metadata.description,
  keywords: metadata.keywords.join(', '),
};

const metadataPath = path.join(buildDir, 'epub-metadata.yaml');
fs.writeFileSync(
  metadataPath,
  `---\n${Object.entries(pandocMetadata).map(([k, v]) => `${k}: "${v}"`).join('\n')}\n---\n`
);

console.log('📝 Generating EPUB with Pandoc...');
console.log(`   Chapters: ${chapters.length}`);
console.log(`   Title: ${metadata.title}`);
console.log(`   Author: ${metadata.author}\n`);

// Build EPUB
const chapterPaths = chapters.map(c => `"${c}"`).join(' ');
const command = `pandoc ${metadataPath} ${chapterPaths} \\
  -o build/drain-salad.epub \\
  --toc \\
  --toc-depth=2 \\
  --resource-path=manuscript \\
  --epub-cover-image=manuscript/images/front-matter/001_cover-image.png \\
  --metadata-file=${metadataPath}`;

try {
  execSync(command, { stdio: 'inherit', shell: '/bin/bash' });
} catch (error) {
  console.error('❌ EPUB build failed');
  process.exit(1);
}

// Get file info
const epubPath = path.join(buildDir, 'drain-salad.epub');
const stats = fs.statSync(epubPath);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

// Clean up temp metadata
fs.unlinkSync(metadataPath);

console.log('\n✅ EPUB built successfully!\n');
console.log('📄 File: build/drain-salad.epub');
console.log(`📦 Size: ${sizeMB} MB`);
console.log('\n📝 Next steps:');
console.log('   1. Test on Kindle Previewer (https://kdp.amazon.com/en_US/help/topic/G202131170)');
console.log('   2. Test on other e-readers (Calibre, Apple Books)');
console.log('   3. Verify TOC and images display correctly');
console.log('   4. Ready to upload to KDP or other platforms!\n');
