#!/usr/bin/env node

/**
 * Build print-ready PDF with bleed for KDP
 *
 * KDP Requirements:
 * - 6x9 trim size with 0.125" bleed = 6.25" x 9.25" final size
 * - Full color interior
 * - 300 DPI images
 * - Fonts embedded
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const metadata = require('../book-metadata.json');

console.log('📚 Building print-ready PDF for KDP...\n');

// Ensure build directory exists
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Build the PDF
console.log('🔨 Compiling Typst → PDF with bleed...');
try {
  execSync(
    'typst compile --root . typst/book-print.typ build/drain-salad-print.pdf',
    { stdio: 'inherit' }
  );
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Get file info
const pdfPath = path.join(buildDir, 'drain-salad-print.pdf');
const stats = fs.statSync(pdfPath);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

console.log('\n✅ Print PDF built successfully!\n');
console.log('📄 File: build/drain-salad-print.pdf');
console.log(`📦 Size: ${sizeMB} MB`);
console.log('📐 Dimensions: 6.25" x 9.25" (6"x9" with 0.125" bleed)');
console.log('🎨 Interior: Full color');
console.log('\n📝 Next steps:');
console.log('   1. Open the PDF and verify bleed extends to page edges');
console.log('   2. Check that all images are high quality');
console.log('   3. Verify fonts are embedded (File > Properties in Adobe)');
console.log('   4. Ready to upload to KDP!\n');
