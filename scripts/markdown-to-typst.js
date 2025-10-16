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
  }

  convert(markdown) {
    const lines = markdown.split('\n');
    const output = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      output.push(this.processLine(line));
    }

    return output.filter(l => l !== null).join('\n');
  }

  processLine(line) {
    // Code blocks (preserve as-is in Typst)
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

    // Bold and italic
    line = line.replace(/\*\*\*(.+?)\*\*\*/g, '_*$1*_');  // Bold italic
    line = line.replace(/\*\*(.+?)\*\*/g, '*$1*');         // Bold
    line = line.replace(/\*(.+?)\*/g, '_$1_');             // Italic

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

    // Links
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '#link("$2")[$1]');

    // Images
    line = line.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, (match, alt, src) => {
      return `#figure(\n  image("${src}", width: 80%),\n  caption: [${alt}]\n)`;
    });

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

  // Add template import
  const header = `#import "../template.typ": *\n\n`;
  fs.writeFileSync(outputFile, header + typst);

  console.log(`✓ Converted successfully!`);
  console.log(`  Lines: ${typst.split('\n').length}`);
  console.log(`  Size: ${(Buffer.byteLength(typst, 'utf8') / 1024).toFixed(2)} KB`);
}

module.exports = MarkdownToTypst;
