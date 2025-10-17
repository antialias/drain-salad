/**
 * GPT Image Backend (gpt-image-1) for Image Generation
 *
 * Uses OpenAI's gpt-image-1 model via Image API
 * - /v1/images/generate for initial images
 * - /v1/images/edit for images with reference (character consistency!)
 *
 * FEATURES:
 * - ✅ Reference image support via edits endpoint
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
  }

  async init() {
    try {
      if (!this.apiKey || this.apiKey.length < 20) {
        throw new Error('Invalid OpenAI API key');
      }
      console.log('✓ OpenAI API key configured');
      console.log('✓ Using gpt-image-1 via Image API');
      console.log('✓ Reference image support enabled (edits endpoint)');
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

    console.log(`  Using gpt-image-1`);

    // Enhance prompt with style descriptors
    let enhancedPrompt = prompt;

    if (type === 'author') {
      enhancedPrompt = `${prompt}, professional documentary photography, 35mm film aesthetic, natural window lighting, Kodak Portra 400 film stock, authentic moment, not posed, editorial style`;
    } else {
      enhancedPrompt = `${prompt}, professional photography, high quality, detailed, editorial cookbook style, natural lighting, warm color palette, shot on film`;
    }

    // Map to gpt-image-1 supported sizes: 1024x1024, 1536x1024, 1024x1536
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

    // Decide which endpoint to use
    const hasReference = useReference && referenceImage && fs.existsSync(referenceImage);

    if (hasReference) {
      console.log(`  Using reference image: ${path.basename(referenceImage)}`);
      console.log(`  Endpoint: /v1/images/edit (with input_fidelity: high)`);
      return await this.generateWithReference(enhancedPrompt, referenceImage, size, outputPath);
    } else {
      console.log(`  Endpoint: /v1/images/generate`);
      return await this.generateWithoutReference(enhancedPrompt, size, outputPath);
    }
  }

  async generateWithoutReference(prompt, size, outputPath) {
    const requestData = {
      model: 'gpt-image-1',
      prompt: prompt,
      size: size,
      quality: 'high'
      // Note: gpt-image-1 doesn't support response_format parameter
      // It returns URLs by default
    };

    console.log(`  Creating generation request...`);

    try {
      const result = await this.makeRequest('/v1/images/generations', 'POST', requestData);

      if (!result.data || !result.data[0]) {
        throw new Error('Invalid response from OpenAI');
      }

      const revisedPrompt = result.data[0].revised_prompt;

      if (revisedPrompt) {
        console.log(`  ℹ️  Model revised prompt:`, revisedPrompt.substring(0, 100) + '...');
      }

      // Handle both URL and base64 responses
      if (result.data[0].url) {
        console.log(`  Downloading image from URL...`);
        await this.downloadImage(result.data[0].url, outputPath);
      } else if (result.data[0].b64_json) {
        console.log(`  Saving base64 image...`);
        this.saveImage(result.data[0].b64_json, outputPath);
      } else {
        throw new Error('No image data in response');
      }

      // Get file size
      const stats = fs.statSync(outputPath);
      const fileSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;

      return {
        path: outputPath,
        size: fileSize,
        model: 'gpt-image-1'
      };

    } catch (error) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  async downloadImage(url, outputPath) {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    console.log(`  URL: ${url}`);

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(outputPath);

      https.get(url, response => {
        console.log(`  Response status: ${response.statusCode}`);

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', err => {
        console.log(`  HTTPS error:`, err);
        fs.unlink(outputPath, () => {});
        reject(new Error(`Download failed: ${err.message}`));
      });

      file.on('error', err => {
        console.log(`  File error:`, err);
        fs.unlink(outputPath, () => {});
        reject(new Error(`File write failed: ${err.message}`));
      });
    });
  }

  async generateWithReference(prompt, referenceImage, size, outputPath) {
    // Use the edits endpoint with multipart/form-data
    // This requires a different approach than JSON requests

    console.log(`  Creating edit request with reference...`);

    try {
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const formData = [];

      // Add model
      formData.push(`--${boundary}\r\n`);
      formData.push(`Content-Disposition: form-data; name="model"\r\n\r\n`);
      formData.push(`gpt-image-1\r\n`);

      // Add prompt
      formData.push(`--${boundary}\r\n`);
      formData.push(`Content-Disposition: form-data; name="prompt"\r\n\r\n`);
      formData.push(`${prompt}\r\n`);

      // Add size
      formData.push(`--${boundary}\r\n`);
      formData.push(`Content-Disposition: form-data; name="size"\r\n\r\n`);
      formData.push(`${size}\r\n`);

      // Add quality
      formData.push(`--${boundary}\r\n`);
      formData.push(`Content-Disposition: form-data; name="quality"\r\n\r\n`);
      formData.push(`high\r\n`);

      // Add input_fidelity (critical for face preservation!)
      formData.push(`--${boundary}\r\n`);
      formData.push(`Content-Disposition: form-data; name="input_fidelity"\r\n\r\n`);
      formData.push(`high\r\n`);

      // Add reference image
      const imageBuffer = fs.readFileSync(referenceImage);
      const fileName = path.basename(referenceImage);
      formData.push(`--${boundary}\r\n`);
      formData.push(`Content-Disposition: form-data; name="image"; filename="${fileName}"\r\n`);
      formData.push(`Content-Type: image/png\r\n\r\n`);

      // Combine text parts
      const textPart = Buffer.from(formData.join(''), 'utf8');

      // Add closing boundary
      const closingBoundary = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');

      // Combine all parts
      const body = Buffer.concat([textPart, imageBuffer, closingBoundary]);

      const result = await this.makeMultipartRequest('/v1/images/edits', body, boundary);

      if (!result.data || !result.data[0]) {
        throw new Error('Invalid response from OpenAI');
      }

      const revisedPrompt = result.data[0].revised_prompt;

      if (revisedPrompt) {
        console.log(`  ℹ️  Model revised prompt:`, revisedPrompt.substring(0, 100) + '...');
      }

      // Handle both URL and base64 responses
      if (result.data[0].url) {
        console.log(`  Downloading image from URL...`);
        await this.downloadImage(result.data[0].url, outputPath);
      } else if (result.data[0].b64_json) {
        console.log(`  Saving base64 image...`);
        this.saveImage(result.data[0].b64_json, outputPath);
      } else {
        throw new Error('No image data in response');
      }

      // Get file size
      const stats = fs.statSync(outputPath);
      const fileSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;

      return {
        path: outputPath,
        size: fileSize,
        model: 'gpt-image-1'
      };

    } catch (error) {
      throw new Error(`Image edit with reference failed: ${error.message}`);
    }
  }

  saveImage(imageBase64, outputPath) {
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

  async makeMultipartRequest(endpoint, body, boundary) {
    const url = `https://api.openai.com${endpoint}`;

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(url, options, res => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(responseBody);

            if (res.statusCode >= 400) {
              const errorMsg = json.error?.message || json.error || responseBody;
              reject(new Error(`OpenAI API error ${res.statusCode}: ${errorMsg}`));
            } else {
              resolve(json);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${responseBody}`));
          }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}

module.exports = DalleBackend;
