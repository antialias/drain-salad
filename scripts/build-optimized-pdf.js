#!/usr/bin/env node

/**
 * Build optimized PDF for digital distribution (Gumroad, Itch.io, etc.)
 *
 * Compresses images and optimizes PDF size while maintaining quality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗜️  Building optimized PDF for digital sales...\n');

const buildDir = path.join(__dirname, '..', 'build');

// First, build the regular PDF if it doesn't exist
if (!fs.existsSync(path.join(buildDir, 'drain-salad-typst.pdf'))) {
  console.log('📚 Building base PDF first...');
  try {
    execSync('npm run build:book', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Base PDF build failed');
    process.exit(1);
  }
}

const sourcePdf = path.join(buildDir, 'drain-salad-typst.pdf');
const outputPdf = path.join(buildDir, 'drain-salad-optimized.pdf');

// Check if Ghostscript is available
let gsCommand = null;
try {
  execSync('gs --version', { stdio: 'ignore' });
  gsCommand = 'gs';
} catch {
  try {
    execSync('/usr/local/bin/gs --version', { stdio: 'ignore' });
    gsCommand = '/usr/local/bin/gs';
  } catch {
    console.log('⚠️  Ghostscript not found - copying original PDF');
    console.log('   Install for compression: brew install ghostscript\n');
    fs.copyFileSync(sourcePdf, outputPdf);

    const stats = fs.statSync(outputPdf);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log('✅ Optimized PDF ready (uncompressed)\n');
    console.log('📄 File: build/drain-salad-optimized.pdf');
    console.log(`📦 Size: ${sizeMB} MB`);
    console.log('\n💡 Tip: Install Ghostscript for 30-50% size reduction');
    process.exit(0);
  }
}

console.log('🗜️  Compressing with Ghostscript...');
console.log('   This may take a few minutes...\n');

// Compress PDF with Ghostscript
// /ebook settings: 150dpi images, optimized for screen reading
const gsArgs = [
  '-sDEVICE=pdfwrite',
  '-dCompatibilityLevel=1.7',
  '-dPDFSETTINGS=/ebook',
  '-dNOPAUSE',
  '-dQUIET',
  '-dBATCH',
  '-dDetectDuplicateImages=true',
  '-dCompressFonts=true',
  '-r150',
  `-sOutputFile="${outputPdf}"`,
  `"${sourcePdf}"`,
].join(' ');

try {
  execSync(`${gsCommand} ${gsArgs}`, { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Compression failed');
  console.log('   Falling back to uncompressed copy...');
  fs.copyFileSync(sourcePdf, outputPdf);
}

// Compare sizes
const originalStats = fs.statSync(sourcePdf);
const optimizedStats = fs.statSync(outputPdf);

const originalMB = (originalStats.size / 1024 / 1024).toFixed(2);
const optimizedMB = (optimizedStats.size / 1024 / 1024).toFixed(2);
const reduction = (((originalStats.size - optimizedStats.size) / originalStats.size) * 100).toFixed(1);

console.log('\n✅ Optimized PDF built successfully!\n');
console.log('📄 File: build/drain-salad-optimized.pdf');
console.log(`📦 Original: ${originalMB} MB`);
console.log(`📦 Optimized: ${optimizedMB} MB`);
console.log(`💾 Reduction: ${reduction}%`);
console.log('\n📝 Perfect for:');
console.log('   • Gumroad / Itch.io sales');
console.log('   • Email distribution');
console.log('   • Website downloads');
console.log('   • Customer deliverables\n');
