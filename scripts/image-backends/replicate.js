/**
 * Replicate Backend for Image Generation
 *
 * Uses Replicate API with:
 * - InstantID for face-consistent author photos
 * - SDXL for food/general photography
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class ReplicateBackend {
  constructor(config) {
    this.config = config;
    this.token = config.replicate.token;
    this.faceModel = config.replicate.faceModel || 'zsxkib/instant-id:98aa0c1ba8dd2940b3e03dd47406bf3b80a14c9dfcde0a8b17d2c5e9f40c0fc9';
    this.photoModel = config.replicate.photoModel || 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
  }

  async init() {
    // Verify API token works
    try {
      const response = await this.makeRequest('/v1/models', 'GET');
      console.log('✓ Replicate API connection verified');
    } catch (error) {
      throw new Error(`Failed to connect to Replicate API: ${error.message}`);
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

    // Choose model based on whether we need face reference
    const model = useReference ? this.faceModel : this.photoModel;

    console.log(`  Using model: ${useReference ? 'InstantID (face reference)' : 'SDXL (general)'}`);

    // Prepare input
    let input = {
      prompt: prompt,
      width: width,
      height: height,
      num_inference_steps: 30,
      guidance_scale: 7.5,
      scheduler: "DPMSolverMultistep",
      num_outputs: 1
    };

    // Add reference image if needed
    if (useReference && referenceImage) {
      // Convert local image to data URL
      const imageData = await this.imageToDataURL(referenceImage);
      input.face_image = imageData;
      input.identitynet_strength_ratio = 0.8; // How strongly to follow reference
      input.adapter_strength_ratio = 0.8;
    }

    // Add negative prompt
    input.negative_prompt = "ugly, deformed, noisy, blurry, distorted, out of focus, bad anatomy, extra limbs, poorly drawn face, poorly drawn hands, missing fingers, plastic, fake";

    // For food photography, add quality enhancers
    if (type === 'hero' || type === 'process') {
      input.prompt += ", professional food photography, high quality, detailed, 8k, photorealistic";
      input.negative_prompt += ", CGI, 3D render, cartoon, illustration, painting, drawing, oversaturated";
    }

    // Create prediction
    console.log(`  Creating prediction...`);
    const prediction = await this.createPrediction(model, input);

    // Wait for completion
    console.log(`  Waiting for generation...`);
    const result = await this.waitForPrediction(prediction.id);

    if (result.status === 'failed') {
      throw new Error(`Generation failed: ${result.error}`);
    }

    // Download image
    console.log(`  Downloading image...`);
    const imageUrl = result.output[0]; // SDXL returns array
    await this.downloadImage(imageUrl, outputPath);

    // Get file size
    const stats = fs.statSync(outputPath);
    const size = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;

    return {
      path: outputPath,
      size: size,
      url: imageUrl
    };
  }

  async createPrediction(model, input) {
    const data = {
      version: model.split(':')[1],
      input: input
    };

    return await this.makeRequest('/v1/predictions', 'POST', data);
  }

  async waitForPrediction(predictionId, maxWait = 300000, pollInterval = 2000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      const prediction = await this.makeRequest(`/v1/predictions/${predictionId}`, 'GET');

      if (prediction.status === 'succeeded') {
        return prediction;
      }

      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        throw new Error(`Prediction ${prediction.status}: ${prediction.error || 'Unknown error'}`);
      }

      // Show progress if available
      if (prediction.logs) {
        const logs = prediction.logs.split('\n').filter(l => l.trim());
        if (logs.length > 0) {
          const lastLog = logs[logs.length - 1];
          if (lastLog.includes('%')) {
            process.stdout.write(`\r  Progress: ${lastLog.trim()}  `);
          }
        }
      }

      await this.sleep(pollInterval);
    }

    throw new Error('Prediction timed out');
  }

  async imageToDataURL(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase().replace('.', '');
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
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
    const url = `https://api.replicate.com${endpoint}`;

    const options = {
      method: method,
      headers: {
        'Authorization': `Token ${this.token}`,
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
              reject(new Error(`API error ${res.statusCode}: ${json.detail || json.error || body}`));
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

module.exports = ReplicateBackend;
