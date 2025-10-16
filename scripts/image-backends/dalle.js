/**
 * DALL-E 3 Backend for Image Generation
 *
 * Uses OpenAI's DALL-E 3 API
 *
 * LIMITATION: DALL-E 3 does not support reference images for face consistency.
 * Workaround: Uses highly detailed, consistent character descriptions.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class DalleBackend {
  constructor(config) {
    this.config = config;
    this.apiKey = config.openai.key;
    this.model = 'dall-e-3';

    // Store character description for consistency
    this.characterDescription = this.loadCharacterDescription();
  }

  async init() {
    // Verify API key works
    try {
      // Just check that we have an API key
      if (!this.apiKey || this.apiKey.length < 20) {
        throw new Error('Invalid OpenAI API key');
      }
      console.log('✓ OpenAI API key configured');
      console.log('⚠️  Note: DALL-E 3 does not support reference images.');
      console.log('   Using detailed prompts for character consistency.');
    } catch (error) {
      throw new Error(`Failed to configure OpenAI API: ${error.message}`);
    }
  }

  loadCharacterDescription() {
    // Load the detailed character description from visual reference
    try {
      const refFile = '.author-visual-reference.md';
      if (fs.existsSync(refFile)) {
        const content = fs.readFileSync(refFile, 'utf8');

        // Extract the core descriptor
        const match = content.match(/\*\*Core descriptor to use in every author photo:\*\*\s*"([^"]+)"/);
        if (match) {
          return match[1];
        }
      }
    } catch (error) {
      console.warn('Could not load character description:', error.message);
    }

    // Fallback description
    return "Italian-American man in his late 20s, dark brown wavy medium-length hair often pulled back in a low bun, 2-day stubble beard, olive Mediterranean skin tone, dark brown eyes, wearing casual kitchen clothing (plain t-shirt or henley), documentary photography style, natural lighting, warm color tones, film photography aesthetic, shallow depth of field";
  }

  async generate(options) {
    const {
      prompt,
      type,
      useReference,
      referenceImage,
      width,
      height,
      outputPath
    } = options;

    console.log(`  Using DALL-E 3`);

    if (useReference) {
      console.warn('  ⚠️  DALL-E 3 does not support reference images');
      console.warn('     Using detailed character description for consistency');
    }

    // Enhance prompt with character description for author photos
    let enhancedPrompt = prompt;

    if (type === 'author') {
      // For author photos, ensure consistent character description
      // Extract just the context/action from the original prompt
      const contextMatch = prompt.match(/(?:now |at |in |standing )[^,]*/);
      const context = contextMatch ? contextMatch[0] : '';

      enhancedPrompt = `${this.characterDescription}${context ? ', ' + context : ''}, professional documentary photography, 35mm film aesthetic, natural window lighting, Kodak Portra 400 film stock, authentic moment, not posed, editorial style`;
    } else {
      // For food/other photos, enhance with quality descriptors
      enhancedPrompt = `${prompt}, professional photography, high quality, detailed, editorial cookbook style, natural lighting, warm color palette, shot on film`;
    }

    // DALL-E 3 size options: 1024x1024, 1024x1792, or 1792x1024
    // Map requested dimensions to closest DALL-E size
    let size;
    if (width > height) {
      size = '1792x1024'; // Landscape
    } else if (height > width) {
      size = '1024x1792'; // Portrait
    } else {
      size = '1024x1024'; // Square
    }

    console.log(`  Size: ${size} (DALL-E 3 preset)`);
    console.log(`  Prompt length: ${enhancedPrompt.length} chars`);

    // DALL-E 3 has a 4000 character limit
    if (enhancedPrompt.length > 4000) {
      console.warn(`  ⚠️  Prompt too long (${enhancedPrompt.length} chars), truncating to 4000`);
      enhancedPrompt = enhancedPrompt.substring(0, 3997) + '...';
    }

    // Create image generation request
    console.log(`  Creating generation request...`);

    const requestData = {
      model: this.model,
      prompt: enhancedPrompt,
      n: 1,
      size: size,
      quality: 'hd', // Use HD quality for better results
      style: 'natural' // Natural style (vs vivid)
    };

    try {
      const result = await this.makeRequest('/v1/images/generations', 'POST', requestData);

      if (!result.data || !result.data[0] || !result.data[0].url) {
        throw new Error('Invalid response from DALL-E API');
      }

      const imageUrl = result.data[0].url;
      const revisedPrompt = result.data[0].revised_prompt;

      if (revisedPrompt) {
        console.log(`  ℹ️  DALL-E revised prompt (safety/quality):`, revisedPrompt.substring(0, 100) + '...');
      }

      // Download image
      console.log(`  Downloading image...`);
      await this.downloadImage(imageUrl, outputPath);

      // If this is an author photo and we need higher resolution, upscale it
      if (type === 'author' && (width > 1792 || height > 1792)) {
        console.log(`  ℹ️  DALL-E max size is 1792px, generated image may be smaller than requested ${width}x${height}`);
      }

      // Get file size
      const stats = fs.statSync(outputPath);
      const fileSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;

      return {
        path: outputPath,
        size: fileSize,
        url: imageUrl
      };

    } catch (error) {
      throw new Error(`DALL-E generation failed: ${error.message}`);
    }
  }

  async downloadImage(url, outputPath) {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);

      const request = https.get(url, response => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      });

      request.on('error', err => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });

      file.on('error', err => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    });
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `https://api.openai.com${endpoint}`;

    const options = {
      method: method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(url, options, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);

            if (res.statusCode >= 400) {
              const errorMsg = json.error?.message || json.error || body;
              reject(new Error(`OpenAI API error ${res.statusCode}: ${errorMsg}`));
            } else {
              resolve(json);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body}`));
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = DalleBackend;
