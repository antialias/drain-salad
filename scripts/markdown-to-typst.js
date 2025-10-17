#!/usr/bin/env node

/**
 * Convert Drain Salad Markdown to Typst
 *
 * Converts markdown chapters to properly formatted Typst,
 * preserving recipes, callouts, and cookbook-specific formatting.
 */

const fs = require('fs');
const path = require('path');

class MarkdownToTypst {
  constructor() {
    this.inRecipe = false;
    this.inCodeBlock = false;
    this.inTypstBlock = false;
    this.inAuthorsNote = false;
    this.inComparison = false;
    this.comparisonImages = [];
    this.inTable = false;
    this.tableHeaders = [];
    this.tableRows = [];
  }

  convert(markdown) {
    const lines = markdown.split('\n');
    const output = [];
    let imageCount = 0;
    let afterHeading = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track when we're just after a heading
      if (line.match(/^#+ /)) {
        afterHeading = true;
        imageCount = 0;
      }

      // Check if this is a table
      if (this.isTableLine(line)) {
        this.processTableLine(line, lines, i);
        continue;
      }

      // If we were in a table and hit a non-table line, flush the table
      if (this.inTable && !this.isTableLine(line)) {
        output.push(this.flushTable());
        this.inTable = false;
      }

      // Check for consecutive images and make them side-by-side
      const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch && i + 2 < lines.length) {
        const nextLine = lines[i + 2]; // Skip blank line
        const nextImgMatch = nextLine.match(/!\[([^\]]*)\]\(([^)]+)\)/);

        if (nextImgMatch && lines[i + 1].trim() === '') {
          // Two consecutive images - make them side by side
          const [_, alt1, src1] = imgMatch;
          const [__, alt2, src2] = nextImgMatch;
          const path1 = src1.startsWith('images/') ? `../manuscript/${src1}` : src1;
          const path2 = src2.startsWith('images/') ? `../manuscript/${src2}` : src2;

          output.push(`#side-by-side-images(\n  "${path1}",\n  "${path2}",\n  left-caption: [${alt1}],\n  right-caption: [${alt2}]\n)`);

          i += 2; // Skip the next blank line and image
          imageCount += 2;
          afterHeading = false;
          continue;
        }
      }

      const processed = this.processLine(line, { imageCount, afterHeading });
      if (processed !== null) {
        output.push(processed);

        // Track images for layout variety
        if (line.match(/!\[/)) {
          imageCount++;
          afterHeading = false;
        }
      }
    }

    // Flush any remaining table
    if (this.inTable) {
      output.push(this.flushTable());
    }

    return output.filter(l => l !== null).join('\n');
  }

  isTableLine(line) {
    // Check if line looks like a markdown table row
    const trimmed = line.trim();
    return trimmed.startsWith('|') && trimmed.endsWith('|');
  }

  processTableLine(line, lines, index) {
    const trimmed = line.trim();

    // Check if this is a separator line (|---|---|)
    if (trimmed.match(/^\|[\s\-:]+\|$/)) {
      return; // Skip separator lines
    }

    // Parse the cells
    const cells = trimmed
      .split('|')
      .slice(1, -1) // Remove empty first and last elements
      .map(cell => cell.trim());

    if (!this.inTable) {
      // First line is headers
      this.inTable = true;
      this.tableHeaders = cells;
      this.tableRows = [];
    } else {
      // Subsequent lines are data rows
      this.tableRows.push(cells);
    }
  }

  flushTable() {
    if (!this.tableHeaders.length) {
      return '';
    }

    const numCols = this.tableHeaders.length;
    const allCells = [...this.tableHeaders, ...this.tableRows.flat()];

    // Convert markdown formatting in cells
    const formattedCells = allCells.map(cell => {
      // Convert bold
      cell = cell.replace(/\*\*(.+?)\*\*/g, '*$1*');
      // Convert italic
      cell = cell.replace(/\*(.+?)\*/g, '_$1_');
      // Convert inline code
      cell = cell.replace(/`(.+?)`/g, '`$1`');
      return `[${cell}]`;
    });

    const output = `#table(\n  columns: ${numCols},\n  ${formattedCells.join(', ')}\n)\n`;

    // Reset state
    this.tableHeaders = [];
    this.tableRows = [];

    return output;
  }

  processLine(line, context = {}) {
    const { imageCount = 0, afterHeading = false } = context;

    // Typst code blocks (pass through unchanged)
    if (line.startsWith('```typst')) {
      this.inTypstBlock = true;
      return '';  // Skip the fence
    }
    if (this.inTypstBlock && line === '```') {
      this.inTypstBlock = false;
      return '';  // Skip the fence
    }
    if (this.inTypstBlock) {
      return line;  // Pass through Typst code unchanged
    }

    // Escape special characters FIRST (before any processing)
    line = line.replace(/\$/g, '\\$');       // Dollar signs
    line = line.replace(/@/g, '\\@');        // At signs (social media handles)

    // HTML comment markers for special layouts
    // Skip image prompt/ref comments (these are for AI image generation, not for Typst)
    if (line.trim().startsWith('<!-- img-prompt:') || line.trim().startsWith('<!-- img-ref:')) {
      return null;
    }

    // <!-- authors-note -->
    if (line.trim() === '<!-- authors-note -->') {
      this.inAuthorsNote = true;
      return '#authors-note[';
    }
    if (line.trim() === '<!-- /authors-note -->') {
      this.inAuthorsNote = false;
      return ']';
    }

    // <!-- comparison: left="Correct", right="Incorrect" -->
    const comparisonMatch = line.match(/<!-- comparison(?:: left="([^"]+)", right="([^"]+)")? -->/);
    if (comparisonMatch) {
      this.inComparison = true;
      this.comparisonImages = [];
      this.comparisonLabels = {
        left: comparisonMatch[1] || "Correct",
        right: comparisonMatch[2] || "Incorrect"
      };
      return null;  // Suppress output until we collect the images
    }
    if (line.trim() === '<!-- /comparison -->') {
      this.inComparison = false;
      if (this.comparisonImages.length === 2) {
        const output = `#comparison(\n  "${this.comparisonImages[0]}",\n  "${this.comparisonImages[1]}",\n  left-label: "${this.comparisonLabels.left}",\n  right-label: "${this.comparisonLabels.right}"\n)`;
        this.comparisonImages = [];
        return output;
      }
      return null;
    }

    // <!-- margin-note -->
    if (line.trim() === '<!-- margin-note -->') {
      return '#margin-note[';
    }
    if (line.trim() === '<!-- /margin-note -->') {
      return ']';
    }

    // Regular code blocks (preserve as-is in Typst)
    if (line.startsWith('```')) {
      this.inCodeBlock = !this.inCodeBlock;
      if (this.inCodeBlock) {
        return '```';
      } else {
        return '```';
      }
    }

    if (this.inCodeBlock) {
      return line;
    }

    // Collect images for comparison
    if (this.inComparison) {
      const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imgMatch) {
        this.comparisonImages.push(imgMatch[2]);
        return null;  // Suppress the individual image output
      }
    }

    // Headings
    if (line.startsWith('# ')) {
      return `= ${line.slice(2)}`;
    }
    if (line.startsWith('## ')) {
      return `== ${line.slice(3)}`;
    }
    if (line.startsWith('### ')) {
      return `=== ${line.slice(4)}`;
    }
    if (line.startsWith('#### ')) {
      return `==== ${line.slice(5)}`;
    }

    // Bold and italic (must handle these carefully to not break footnote markers)
    line = line.replace(/\*\*\*(.+?)\*\*\*/g, '_*$1*_');  // Bold italic
    line = line.replace(/\*\*(.+?)\*\*/g, '*$1*');         // Bold
    line = line.replace(/\*(.+?)\*/g, '_$1_');             // Italic

    // Escape remaining unpaired asterisks (footnote markers)
    // These are asterisks that weren't part of emphasis pairs
    line = line.replace(/([)\w])\*(\s|$)/g, '$1\\*$2');

    // Escape asterisks at the start of lines that aren't list markers
    // (footnote text like "*To make crumbs:")
    if (line.match(/^\*[A-Z]/) || line.match(/^\*[a-z]/)) {
      line = '\\' + line;
    }

    // Lists
    if (line.match(/^(\s*)[-*+] /)) {
      const indent = line.match(/^(\s*)/)[1];
      const content = line.replace(/^(\s*)[-*+] /, '');
      return `${indent}- ${content}`;
    }

    // Numbered lists
    if (line.match(/^(\s*)\d+\. /)) {
      const indent = line.match(/^(\s*)/)[1];
      const content = line.replace(/^(\s*)\d+\. /, '');
      return `${indent}+ ${content}`;
    }

    // Block quotes
    if (line.startsWith('> ')) {
      return `#quote[${line.slice(2)}]`;
    }

    // Images (must come before links!)
    line = line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      // Convert manuscript-relative paths to typst-relative paths
      const typstPath = src.startsWith('images/') ? `../manuscript/${src}` : src;

      // First image after a chapter heading gets hero treatment
      if (imageCount === 0 && afterHeading) {
        return `#hero-image("${typstPath}", caption: [${alt}])`;
      }

      // Regular images with nice framing
      return `#figure(\n  image("${typstPath}", width: 80%),\n  caption: [${alt}]\n)`;
    });

    // Links
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '#link("$2")[$1]');

    // Horizontal rules
    if (line.trim() === '---' || line.trim() === '***') {
      return '#divider';
    }

    // Empty lines
    if (line.trim() === '') {
      return '';
    }

    return line;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node markdown-to-typst.js <input.md> [output.typ]');
    console.error('');
    console.error('Examples:');
    console.error('  node markdown-to-typst.js manuscript/chapter-01-history.md');
    console.error('  node markdown-to-typst.js manuscript/chapter-01-history.md typst/chapter-01.typ');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1] || inputFile.replace(/\.md$/, '.typ').replace('manuscript', 'typst');

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }

  console.log(`Converting: ${inputFile}`);
  console.log(`Output: ${outputFile}`);

  const markdown = fs.readFileSync(inputFile, 'utf8');
  const converter = new MarkdownToTypst();
  const typst = converter.convert(markdown);

  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Add template import (no ../ since files are in same dir)
  const header = `#import "template.typ": *\n\n`;
  fs.writeFileSync(outputFile, header + typst);

  console.log(`✓ Converted successfully!`);
  console.log(`  Lines: ${typst.split('\n').length}`);
  console.log(`  Size: ${(Buffer.byteLength(typst, 'utf8') / 1024).toFixed(2)} KB`);
}

module.exports = MarkdownToTypst;
