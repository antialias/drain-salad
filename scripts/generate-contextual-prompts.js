#!/usr/bin/env node

/**
 * Generate Contextual Image Prompts using GPT-5
 *
 * Reads a chapter, sends to GPT-5 with high reasoning,
 * generates detailed prompts, updates markdown.
 *
 * Usage:
 *   node scripts/generate-contextual-prompts.js chapter-01-history.md
 *   node scripts/generate-contextual-prompts.js chapter-01-history.md --dry-run
 *   node scripts/generate-contextual-prompts.js --all
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Visual Language Guidelines
const VISUAL_GUIDELINES = `
VISUAL LANGUAGE GUIDELINES:

Author Photos (5 total):
- Documentary film aesthetic, natural light, 35mm film look
- Specific dates/times matter (December 2021, June 2021, November 2021, February 2023, etc.)
- Show reality: cramped San Francisco studio apartment, visible bathroom/toilet from kitchen, cheap rental-grade equipment
- Emotional arc: struggle → learning → breakthrough
- Slightly desaturated, warm tones, candid not posed, shallow depth of field
- Character consistency critical (all reference first author photo - 002)
- NOT glamorous, NOT aspirational, honest documentation of broke cooking

Food Photography (Hero shots, ~18 total):
- Honest NOT aspirational or Instagram-style
- Weathered wood surfaces, natural imperfections, organic composition
- Realistic textures, not glossy food porn
- Editorial cookbook style but grounded in reality
- Warm color palette, natural daylight, appetizing but honest presentation
- Professional food photography aesthetic but unpretentious

Process Sequences (~10 total):
- Clear step-by-step visual progression (Day 1 → Day 3 → Day 7, or Stage 1 → 2 → 3)
- Well-lit, natural lighting, not clinical or sterile
- Instructional clarity, educational but approachable
- Professional food photography, clear and honest

Infographics (~10 total):
- Educational reference guide aesthetic
- Warm neutral palette, organized layout, minimal but not sterile
- Clear typography, clean design, beautiful but functional
- Think field guide or textbook, but warm and inviting
- Cookbook reference guide aesthetic

Historical/Comparative/Contextual:
- Period-appropriate authentic details (medieval kitchen, Depression-era, mid-century modern, etc.)
- Not romanticized or sanitized
- Historically accurate but visually engaging
- Documentary approach to historical accuracy
`;

const BOOK_CONTEXT = `
BOOK CONTEXT:
This is "Drain Salad: A Treatise on Edible Entropy, Upstream Capture, and the Cuisine of Second Harvest" - an honest, unglamorous cookbook about cooking from kitchen scraps.

The author learned these techniques during broke months (November 2021 - March 2022) in a cramped San Francisco studio apartment where the toilet is visible from the kitchen stove. Rent was expensive, checking account had $11-73 at various points. The tone is direct, sometimes profane, deeply personal, instructive, and philosophical.

Key recurring details:
- 6:47pm Wednesday moment (the decision point between takeout and cooking from scraps)
- Small San Francisco studio apartment, cheap laminate counters, rental-grade appliances
- Visible bathroom/toilet from kitchen
- Author's emotional journey: struggle → learning → mastery
- December 2021 moldy ferment failure
- June 2021 first fermentation attempt
- November 2021 broke pantry (5 ingredients, $43 total)
- February 2023 dinner party (proof that scrap cooking can be elegant)
- Professional cooking background (garde-manger experience)
- Medieval scullery maids, Italian nonnas, Depression-era resourcefulness as lineage

The book is NOT about:
- Zero waste virtue signaling
- Instagram-worthy food porn
- Aspirational minimalism
- Moral superiority

The book IS about:
- Practical necessity turned into technique
- Honest food that tastes good
- Constraint breeding creativity
- Abundance hiding in what we discard
- Cooking as an act of resourcefulness and dignity
`;

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const all = args.includes('--all');
const yes = args.includes('--yes') || args.includes('-y');

let chapterFiles = [];

if (all) {
  const glob = require('glob');
  chapterFiles = glob.sync('manuscript/chapter-*.md').sort();
} else {
  const chapterArg = args.find(arg => !arg.startsWith('--'));
  if (!chapterArg) {
    console.error('Usage: node scripts/generate-contextual-prompts.js <chapter-file> [--dry-run] [--yes]');
    console.error('   or: node scripts/generate-contextual-prompts.js --all [--dry-run] [--yes]');
    process.exit(1);
  }

  // Handle both full paths and just filenames
  const chapterPath = chapterArg.includes('/')
    ? chapterArg
    : `manuscript/${chapterArg}`;

  if (!fs.existsSync(chapterPath)) {
    console.error(`Error: File not found: ${chapterPath}`);
    process.exit(1);
  }

  chapterFiles = [chapterPath];
}

// Load manifest for image metadata
let manifest = null;
try {
  manifest = JSON.parse(fs.readFileSync('generated-manifest.json', 'utf8'));
} catch (err) {
  console.error('Warning: Could not load generated-manifest.json. Run extract-manifest first.');
}

/**
 * Extract images from markdown content
 */
function extractImages(content, chapterPath) {
  const lines = content.split('\n');
  const images = [];
  const chapterName = path.basename(chapterPath, '.md');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match: ![alt text](path)
    const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (match) {
      const alt = match[1];
      const imagePath = match[2];

      // Extract number and slug from path
      const numberMatch = imagePath.match(/(\d{3})_([^.]+)/);
      if (!numberMatch) continue;

      const number = numberMatch[1];
      const slug = numberMatch[2];

      // Get surrounding context (±20 lines)
      const contextStart = Math.max(0, i - 20);
      const contextEnd = Math.min(lines.length, i + 20);
      const context = lines.slice(contextStart, contextEnd).join('\n');

      // Find in manifest for metadata
      let metadata = null;
      if (manifest) {
        metadata = manifest.images.find(img =>
          img.number === number && img.slug === slug
        );
      }

      images.push({
        number,
        slug,
        alt,
        path: imagePath,
        lineNumber: i + 1,
        context,
        metadata,
        originalLine: line
      });
    }
  }

  return images;
}

/**
 * Call GPT-5 to generate prompts
 */
async function generatePrompts(chapterText, images, chapterName) {
  console.log(`\n🤖 Calling GPT-5 with high reasoning effort...`);
  console.log(`   Chapter: ${chapterName}`);
  console.log(`   Images: ${images.length}`);
  console.log(`   Model: gpt-5`);

  // Build image list for prompt
  const imageList = images.map((img, idx) => {
    return `${idx + 1}. NUMBER: "${img.number}", SLUG: "${img.slug}" (full filename: ${img.number}_${img.slug}.png)
   - Alt text: "${img.alt}"
   - Type: ${img.metadata?.type || 'unknown'}
   - Current prompt: "${img.metadata?.prompt || img.alt}"
   - Context excerpt: "${img.context.substring(0, 500)}..."
   - Dependencies: ${img.metadata?.dependsOn ? `References ${img.metadata.dependsOn}` : 'None'}
`;
  }).join('\n');

  const prompt = `${BOOK_CONTEXT}

${VISUAL_GUIDELINES}

CHAPTER TEXT:
${chapterText}

================================================
IMAGES TO GENERATE PROMPTS FOR:
================================================
${imageList}

TASK:
For each image above, write a detailed 200-400 word prompt that will be sent to an AI image generator (DALL-E 3).

Each prompt must:
1. Capture specific visual details mentioned in the surrounding chapter text
2. Include narrative/emotional context from that exact moment in the book
3. Specify composition, lighting, color palette, mood, camera angle
4. Reference any dates, times, locations explicitly mentioned
5. Maintain visual consistency with the image type category
6. Make the image actually illustrate what the text is saying at that point
7. Include specific period details for historical images
8. For author photos: include cramped apartment details, visible bathroom, specific dates
9. For process sequences: specify the progression stages clearly
10. For infographics: specify layout, typography, design aesthetic

Be extremely specific. Include sensory details. Make the AI understand the exact scene, mood, and context.

OUTPUT FORMAT (valid JSON only):
{
  "images": [
    {
      "number": "002",
      "slug": "author-photo",
      "prompt": "Your detailed 200-400 word prompt here..."
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown code blocks, no explanatory text, just the JSON object.`;

  try {
    const response = await openai.responses.create({
      model: 'gpt-5',
      input: prompt,
      reasoning: { effort: 'high' },
      text: { verbosity: 'high' },
      max_output_tokens: 16000
    });

    console.log(`   ✅ Response received`);
    console.log(`   Reasoning tokens: ${response.usage?.reasoning_tokens || 'N/A'}`);
    console.log(`   Output tokens: ${response.usage?.output_tokens || 'N/A'}`);

    // Parse JSON response
    let outputText = response.output_text;

    // Remove markdown code blocks if present
    outputText = outputText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const result = JSON.parse(outputText);
    return result.images;

  } catch (error) {
    console.error('\n❌ Error calling GPT-5:');
    console.error(error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Update markdown with prompts
 */
function updateMarkdownWithPrompts(content, images, generatedPrompts) {
  let lines = content.split('\n');
  const updates = [];

  // Match generated prompts to images
  for (const genPrompt of generatedPrompts) {
    const image = images.find(img =>
      img.number === genPrompt.number && img.slug === genPrompt.slug
    );

    if (!image) {
      console.warn(`⚠️  Generated prompt for ${genPrompt.number}_${genPrompt.slug} but image not found in chapter`);
      continue;
    }

    updates.push({
      lineNumber: image.lineNumber,
      image,
      prompt: genPrompt.prompt
    });
  }

  // Sort by line number descending (so we can insert without messing up line numbers)
  updates.sort((a, b) => b.lineNumber - a.lineNumber);

  // Insert prompts
  for (const update of updates) {
    const lineIdx = update.lineNumber - 1;

    // Check if there's already an img-prompt comment on the previous line
    let insertIdx = lineIdx;
    if (lineIdx > 0 && lines[lineIdx - 1].includes('<!-- img-prompt:')) {
      // Replace existing prompt
      lines[lineIdx - 1] = `<!-- img-prompt: ${update.prompt} -->`;
    } else {
      // Insert new prompt
      lines.splice(lineIdx, 0, `<!-- img-prompt: ${update.prompt} -->`);
    }
  }

  return lines.join('\n');
}

/**
 * Show diff preview
 */
function showDiff(images, generatedPrompts) {
  console.log('\n' + '='.repeat(80));
  console.log('📝 Generated Prompts Preview');
  console.log('='.repeat(80));

  for (const genPrompt of generatedPrompts) {
    const image = images.find(img =>
      img.number === genPrompt.number && img.slug === genPrompt.slug
    );

    if (!image) continue;

    console.log(`\n📷 Image ${genPrompt.number}_${genPrompt.slug}`);
    console.log(`   Type: ${image.metadata?.type || 'unknown'}`);
    console.log(`   Alt: "${image.alt}"`);
    console.log(`\n   Old prompt (${image.metadata?.prompt?.length || 0} chars):`);
    console.log(`   "${image.metadata?.prompt || image.alt}"`);
    console.log(`\n   New prompt (${genPrompt.prompt.length} chars):`);
    console.log(`   "${genPrompt.prompt}"`);
    console.log('\n' + '-'.repeat(80));
  }
}

/**
 * Confirm before writing
 */
async function confirm(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Process a single chapter
 */
async function processChapter(chapterPath) {
  console.log('\n' + '='.repeat(80));
  console.log(`📖 Processing: ${chapterPath}`);
  console.log('='.repeat(80));

  // Read chapter
  const content = fs.readFileSync(chapterPath, 'utf8');
  const chapterName = path.basename(chapterPath, '.md');

  // Extract images
  const images = extractImages(content, chapterPath);

  if (images.length === 0) {
    console.log('   No images found in this chapter.');
    return;
  }

  console.log(`   Found ${images.length} images`);

  // Generate prompts with GPT-5
  const generatedPrompts = await generatePrompts(content, images, chapterName);

  console.log(`   ✅ Generated ${generatedPrompts.length} prompts`);

  // Show preview
  showDiff(images, generatedPrompts);

  if (dryRun) {
    console.log('\n🔍 DRY RUN - No changes written');
    return;
  }

  // Confirm
  if (!yes) {
    const shouldWrite = await confirm('\n❓ Write these prompts to the markdown file? (y/n): ');
    if (!shouldWrite) {
      console.log('❌ Cancelled');
      return;
    }
  }

  // Update markdown
  const updatedContent = updateMarkdownWithPrompts(content, images, generatedPrompts);

  // Write back
  fs.writeFileSync(chapterPath, updatedContent, 'utf8');

  console.log(`\n✅ Updated ${chapterPath}`);
  console.log(`   ${generatedPrompts.length} prompts added`);
}

/**
 * Main
 */
async function main() {
  console.log('\n🎨 Contextual Image Prompt Generator');
  console.log('   Model: GPT-5 (high reasoning effort)');
  console.log('   Mode:', dryRun ? 'DRY RUN' : 'WRITE');

  if (!process.env.OPENAI_API_KEY) {
    console.error('\n❌ Error: OPENAI_API_KEY not found in environment');
    process.exit(1);
  }

  for (const chapterPath of chapterFiles) {
    try {
      await processChapter(chapterPath);
    } catch (error) {
      console.error(`\n❌ Error processing ${chapterPath}:`);
      console.error(error.message);
      if (!all) {
        process.exit(1);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Complete!');
  console.log('='.repeat(80));

  if (!dryRun) {
    console.log('\n💡 Next steps:');
    console.log('   1. Run: npm run extract-manifest');
    console.log('   2. Run: npm run generate:missing --all');
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
