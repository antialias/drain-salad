/**
 * GPT Image Backend for Image Generation
 *
 * Uses OpenAI's gpt-image-1 model via Responses API
 *
 * FEATURES:
 * - ✅ Reference image support for character consistency
 * - ✅ High input fidelity for face preservation
 * - ✅ Superior instruction following vs DALL-E 3
 * - ✅ Better text rendering and real-world knowledge
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class DalleBackend {
  constructor(config) {
    this.config = config;
    this.apiKey = config.openai.key;
    this.model = 'gpt-4.1'; // Model that supports image_generation tool
  }

  async init() {
    // Verify API key works
    try {
      if (!this.apiKey || this.apiKey.length < 20) {
        throw new Error('Invalid OpenAI API key');
      }
      console.log('✓ OpenAI API key configured');
      console.log('✓ Using gpt-image-1 via Responses API');
      console.log('✓ Reference images supported for character consistency');
    } catch (error) {
      throw new Error(`Failed to configure OpenAI API: ${error.message}`);
    }
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

    console.log(`  Using gpt-image-1 via Responses API`);

    // Enhance prompt with style descriptors
    let enhancedPrompt = prompt;

    if (type === 'author') {
      enhancedPrompt = `${prompt}, professional documentary photography, 35mm film aesthetic, natural window lighting, Kodak Portra 400 film stock, authentic moment, not posed, editorial style`;
    } else {
      enhancedPrompt = `${prompt}, professional photography, high quality, detailed, editorial cookbook style, natural lighting, warm color palette, shot on film`;
    }

    // Build input content array
    const content = [
      { type: 'input_text', text: enhancedPrompt }
    ];

    // Add reference image if provided
    if (useReference && referenceImage && fs.existsSync(referenceImage)) {
      console.log(`  Using reference image: ${path.basename(referenceImage)}`);
      const imageBase64 = this.imageToDataURL(referenceImage);
      content.push({
        type: 'input_image',
        image_url: imageBase64
      });
    }

    // Map requested dimensions to closest supported size
    let size;
    if (width > height) {
      size = '1536x1024'; // Landscape
    } else if (height > width) {
      size = '1024x1536'; // Portrait
    } else {
      size = '1024x1024'; // Square
    }

    console.log(`  Size: ${size}`);
    console.log(`  Prompt length: ${enhancedPrompt.length} chars`);

    // Create Responses API request with image_generation tool
    const requestData = {
      model: this.model,
      input: [
        {
          role: 'user',
          content: content
        }
      ],
      tools: [
        {
          type: 'image_generation',
          size: size,
          quality: 'high',              // High quality rendering
          input_fidelity: 'high',       // Preserve reference image details (faces)
          background: 'auto',           // Auto-detect background needs
          output_format: 'png'          // PNG for best quality
        }
      ]
    };

    try {
      console.log(`  Creating generation request...`);
      const result = await this.makeRequest('/v1/responses/create', 'POST', requestData);

      // Extract image from response
      const imageGenerationCall = result.output?.find(
        output => output.type === 'image_generation_call'
      );

      if (!imageGenerationCall || !imageGenerationCall.result) {
        throw new Error('No image generated in response');
      }

      // result is base64-encoded PNG
      const imageBase64 = imageGenerationCall.result;
      const revisedPrompt = imageGenerationCall.revised_prompt;

      if (revisedPrompt) {
        console.log(`  ℹ️  Model revised prompt:`, revisedPrompt.substring(0, 100) + '...');
      }

      // Save image from base64
      console.log(`  Saving image...`);
      const imageBuffer = Buffer.from(imageBase64, 'base64');

      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, imageBuffer);

      // Get file size
      const stats = fs.statSync(outputPath);
      const fileSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;

      return {
        path: outputPath,
        size: fileSize,
        model: 'gpt-image-1'
      };

    } catch (error) {
      throw new Error(`GPT Image generation failed: ${error.message}`);
    }
  }

  imageToDataURL(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase().replace('.', '');
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
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
}

module.exports = DalleBackend;
