#!/usr/bin/env node

/**
 * Pro-level editorial review using GPT-5 pro via Responses API
 *
 * GPT-5 pro uses more compute for deeper analysis but can take several minutes.
 * Uses background mode to avoid timeouts.
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const colors = {
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  red: '\x1b[0;31m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`)
};

// Parse arguments
const chapterFile = process.argv[2];
const reviewType = process.argv[3] || 'comprehensive';

if (!chapterFile) {
  console.log('Usage: node scripts/review-pro.js <chapter-file> [review-type]');
  console.log('');
  console.log('Review types:');
  console.log('  comprehensive  - Full editorial review (default)');
  console.log('  tone           - Voice and style consistency');
  console.log('  structure      - Organization and flow');
  console.log('  recipes        - Recipe accuracy and clarity');
  console.log('  facts          - Fact-checking and citations');
  console.log('  readability    - Clarity and accessibility');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/review-pro.js manuscript/chapter-01-history.md comprehensive');
  process.exit(1);
}

if (!fs.existsSync(chapterFile)) {
  log.error(`Error: File not found: ${chapterFile}`);
  process.exit(1);
}

// Review prompts
const systemPrompts = {
  comprehensive: "You are an experienced cookbook editor reviewing a chapter from 'Drain Salad', a cookbook about transforming kitchen scraps into culinary art. Provide comprehensive editorial feedback covering: (1) Tone and voice consistency (should be serious chef with philosophical wit), (2) Structure and flow, (3) Factual accuracy, (4) Recipe clarity if recipes are present, (5) Readability and engagement, (6) Suggestions for improvement. Be honest but constructive.",
  tone: "You are a voice and style editor. Review this cookbook chapter for consistency with the established voice: serious culinary expertise with philosophical depth, occasional wit, but never jokey or condescending. Flag any passages that feel off-brand. Suggest improvements.",
  structure: "You are a structural editor. Review this chapter for: logical flow, clear section transitions, proper pacing, information hierarchy, and reader navigation. Suggest restructuring where needed.",
  recipes: "You are a recipe editor and test kitchen manager. Review all recipes in this chapter for: clarity of instructions, completeness of ingredients, proper measurements, realistic timing and temperatures, food safety, and potential failure points. Flag any recipes that seem untested or unclear.",
  facts: "You are a fact-checker and culinary researcher. Verify all factual claims in this chapter: historical references, scientific explanations, cooking temperatures, food safety guidelines, and cited sources. Flag anything that seems inaccurate or needs verification.",
  readability: "You are a clarity editor focused on making complex information accessible. Review this chapter for: sentence clarity, jargon usage, paragraph length, transitions, and overall readability. Suggest simplifications where the prose is unnecessarily dense."
};

const chapterName = path.basename(chapterFile, '.md');
const chapterContent = fs.readFileSync(chapterFile, 'utf8');
const outputDir = path.join(__dirname, '..', 'reviews');
const outputFile = path.join(outputDir, `${chapterName}-${reviewType}-pro-review.md`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

log.success(`Reviewing: ${chapterName}`);
log.info(`Review type: ${reviewType}`);
log.info(`Model: GPT-5 pro (high reasoning mode)`);
console.log('');

const systemPrompt = systemPrompts[reviewType];
if (!systemPrompt) {
  log.error(`Unknown review type: ${reviewType}`);
  process.exit(1);
}

const userPrompt = `Please review the following chapter from the cookbook 'Drain Salad':

---
${chapterContent}
---

Provide detailed editorial feedback formatted in markdown.`;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  log.error('Error: OPENAI_API_KEY environment variable not set');
  process.exit(1);
}

async function runReview() {
  try {
    log.info('Creating background review request...');
    log.info('This may take several minutes for GPT-5 pro to think deeply.');
    console.log('');

    // Create response with background mode using fetch
    const createResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5-pro',
        input: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        background: true
      })
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(`API error: ${JSON.stringify(error)}`);
    }

    const response = await createResponse.json();
    const responseId = response.id;

    log.success(`Response created: ${responseId}`);
    log.info('Waiting for completion (checking every 10 seconds)...');
    console.log('');

    // Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes max

    while (!completed && attempts < maxAttempts) {
      attempts++;

      // Wait 10 seconds between checks
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Check status using fetch
      const statusResponse = await fetch(`https://api.openai.com/v1/responses/${responseId}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      });

      if (!statusResponse.ok) {
        const error = await statusResponse.json();
        throw new Error(`Status check failed: ${JSON.stringify(error)}`);
      }

      const status = await statusResponse.json();

      if (status.status === 'completed') {
        completed = true;

        // Extract the review content from the response structure
        // The output is an array with reasoning and message objects
        // We want the message object's content[0].text
        let reviewContent;

        if (status.output && Array.isArray(status.output)) {
          const messageObj = status.output.find(item => item.type === 'message');
          if (messageObj && messageObj.content && messageObj.content[0] && messageObj.content[0].text) {
            reviewContent = messageObj.content[0].text;
          } else {
            // Fallback to JSON if structure is unexpected
            reviewContent = JSON.stringify(status.output, null, 2);
          }
        } else {
          reviewContent = JSON.stringify(status.output, null, 2);
        }

        // Save to file
        fs.writeFileSync(outputFile, reviewContent);

        console.log('');
        log.success('✓ Review complete!');
        log.info(`Saved to: ${outputFile}`);
        console.log('');
        console.log('Preview:');
        console.log('---');
        console.log(reviewContent.split('\n').slice(0, 20).join('\n'));
        console.log('...');
        console.log('');
        log.info(`View full review: cat ${outputFile}`);

      } else if (status.status === 'failed') {
        log.error('✗ Review failed');
        console.log(status.error);
        process.exit(1);
      } else {
        // Still in progress
        process.stdout.write(`\r⏳ Status: ${status.status} (${attempts * 10}s elapsed)`);
      }
    }

    if (!completed) {
      console.log('');
      log.error('✗ Review timed out after 10 minutes');
      log.info(`Response ID: ${responseId}`);
      process.exit(1);
    }

  } catch (error) {
    console.log('');
    log.error('✗ Review failed');
    console.error(error.message);
    process.exit(1);
  }
}

runReview();
