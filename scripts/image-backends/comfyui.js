/**
 * ComfyUI Backend for Image Generation
 *
 * Uses local ComfyUI API with IP-Adapter for face reference
 * Requires ComfyUI running locally with IP-Adapter nodes installed
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

class ComfyUIBackend {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.comfyui.url || 'http://127.0.0.1:8188';
  }

  async init() {
    // Verify ComfyUI is running
    try {
      await this.makeRequest('/system_stats');
      console.log('✓ ComfyUI API connection verified');
    } catch (error) {
      throw new Error(`Failed to connect to ComfyUI at ${this.baseUrl}: ${error.message}\nMake sure ComfyUI is running.`);
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

    console.log(`  Note: ComfyUI workflow needs to be set up manually`);
    console.log(`  This is a placeholder - implement your ComfyUI workflow`);

    // This is a simplified example - you'd need to:
    // 1. Create a workflow JSON with IP-Adapter nodes
    // 2. Upload reference image if needed
    // 3. Queue the prompt
    // 4. Wait for completion
    // 5. Download result

    throw new Error('ComfyUI backend requires manual workflow setup. See documentation.');

    // Example workflow structure (commented out):
    /*
    const workflow = {
      "3": {
        "class_type": "KSampler",
        "inputs": {
          "seed": Math.floor(Math.random() * 1000000),
          "steps": 30,
          "cfg": 7.5,
          "sampler_name": "dpmpp_2m",
          "scheduler": "karras",
          "denoise": 1.0,
          // ... more nodes
        }
      },
      // Add IP-Adapter nodes for reference image
      // Add CLIP text encode nodes for prompt
      // etc.
    };

    const result = await this.queuePrompt(workflow);
    await this.waitForCompletion(result.prompt_id);
    await this.downloadResult(result.prompt_id, outputPath);
    */
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = new URL(endpoint, this.baseUrl);

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = http.request(url, options, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve(json);
          } catch (e) {
            resolve(body);
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

module.exports = ComfyUIBackend;
