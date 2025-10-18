const fs = require('fs');

/**
 * ContentAnalyzer - Analyzes chapter content based on book configuration
 *
 * Provides genre-aware content analysis:
 * - Word count and reading time
 * - Genre-specific content detection (recipes, code, dialogue, etc.)
 * - Complexity assessment
 * - Characteristics extraction
 */
class ContentAnalyzer {
  constructor(bookConfig) {
    this.bookConfig = bookConfig;
  }

  /**
   * Analyze a chapter file
   * @param {string} filePath - Path to chapter markdown file
   * @returns {Promise<object>} - Analysis results
   */
  async analyzeChapter(filePath) {
    // Read file content
    const content = await fs.promises.readFile(filePath, 'utf8');

    // Calculate basic metrics
    const wordCount = this._countWords(content);
    const readingTime = this._estimateReadingTime(wordCount);

    // Detect content characteristics based on book config
    const characteristics = await this._detectCharacteristics(content);

    // Assess complexity
    const complexity = this._assessComplexity(content, characteristics);

    return {
      wordCount,
      estimatedReadingTime: readingTime,
      characteristics: {
        complexity,
        ...characteristics
      }
    };
  }

  /**
   * Count words in text
   * @private
   */
  _countWords(text) {
    // Remove markdown headers, code blocks, and other markup
    const cleaned = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^#+\s+/gm, '')        // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text only
      .replace(/[#*_`]/g, '');        // Remove markdown formatting

    const words = cleaned.trim().split(/\s+/);
    return words.filter(w => w.length > 0).length;
  }

  /**
   * Estimate reading time in minutes
   * Average reading speed: 200-250 words per minute
   * @private
   */
  _estimateReadingTime(wordCount) {
    const wordsPerMinute = 225;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Detect genre-specific characteristics based on book config
   * @private
   */
  async _detectCharacteristics(content) {
    const characteristics = {};
    const contentTypes = this.bookConfig.getContentTypes();
    const detectionPatterns = this.bookConfig.getDetectionPatterns();

    // Check each content type that's enabled in book config
    for (const [contentType, enabled] of Object.entries(contentTypes)) {
      if (!enabled) continue;

      // Map contentType to characteristic name
      // hasRecipes -> hasRecipes
      // hasCodeSamples -> hasCodeSamples
      // etc.
      const characteristicName = contentType;

      // Get detection patterns for this content type
      const patternKey = this._getPatternKey(contentType);
      const patterns = detectionPatterns[patternKey]?.patterns || [];

      // Detect if content contains any of the patterns
      if (patterns.length > 0) {
        characteristics[characteristicName] = this._detectPatterns(content, patterns);

        // Count occurrences if detected
        if (characteristics[characteristicName]) {
          const count = this._countPatternOccurrences(content, patterns);
          characteristics[`${patternKey}Count`] = count;
        }
      }
    }

    return characteristics;
  }

  /**
   * Map content type flag to pattern key
   * hasRecipes -> 'recipes'
   * hasCodeSamples -> 'code'
   * hasDialogue -> 'dialogue'
   * @private
   */
  _getPatternKey(contentType) {
    const mapping = {
      'hasRecipes': 'recipes',
      'hasCodeSamples': 'code',
      'hasDialogue': 'dialogue',
      'hasFootnotes': 'footnotes',
      'hasScientificClaims': 'scientific',
      'hasHistoricalClaims': 'historical',
      'hasTechnicalContent': 'technical'
    };
    return mapping[contentType] || contentType.replace('has', '').toLowerCase();
  }

  /**
   * Detect if content contains any of the given patterns
   * @private
   */
  _detectPatterns(content, patterns) {
    return patterns.some(pattern => {
      // Use case-insensitive search
      const regex = new RegExp(pattern, 'i');
      return regex.test(content);
    });
  }

  /**
   * Count occurrences of patterns in content
   * @private
   */
  _countPatternOccurrences(content, patterns) {
    let count = 0;
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex);
      if (matches) {
        count += matches.length;
      }
    }
    return count;
  }

  /**
   * Assess content complexity
   * Factors:
   * - Word count
   * - Sentence length
   * - Presence of technical/complex content
   * @private
   */
  _assessComplexity(content, characteristics) {
    let complexityScore = 0;

    // Word count factor
    const wordCount = this._countWords(content);
    if (wordCount > 5000) complexityScore += 2;
    else if (wordCount > 3000) complexityScore += 1;

    // Average sentence length
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = wordCount / sentences.length;
    if (avgSentenceLength > 25) complexityScore += 1;
    if (avgSentenceLength > 35) complexityScore += 1;

    // Technical content
    if (characteristics.hasCodeSamples) complexityScore += 2;
    if (characteristics.hasTechnicalContent) complexityScore += 1;
    if (characteristics.hasFootnotes) complexityScore += 1;

    // Map score to complexity level
    if (complexityScore >= 5) return 'high';
    if (complexityScore >= 3) return 'medium';
    return 'low';
  }

  /**
   * Analyze all chapters in a directory
   * @param {string} manuscriptDir - Directory containing chapter markdown files
   * @returns {Promise<object[]>} - Array of {file, analysis} objects
   */
  async analyzeAllChapters(manuscriptDir = 'manuscript') {
    const files = await fs.promises.readdir(manuscriptDir);
    const chapterFiles = files.filter(f =>
      f.startsWith('chapter-') && f.endsWith('.md')
    );

    const results = [];
    for (const file of chapterFiles) {
      const filePath = `${manuscriptDir}/${file}`;
      const analysis = await this.analyzeChapter(filePath);
      results.push({
        file: filePath,
        name: file.replace('.md', ''),
        ...analysis
      });
    }

    return results;
  }

  /**
   * Quick content scan - lighter weight analysis
   * Just word count and basic detection, no deep analysis
   * @param {string} filePath - Path to chapter markdown file
   * @returns {Promise<object>} - Basic analysis results
   */
  async quickScan(filePath) {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const wordCount = this._countWords(content);

    return {
      wordCount,
      estimatedReadingTime: this._estimateReadingTime(wordCount)
    };
  }

  /**
   * Extract specific content sections
   * Useful for review prompts that need context
   * @param {string} filePath - Path to chapter markdown file
   * @param {object} options - Extract options {type, maxLength}
   * @returns {Promise<string[]>} - Array of extracted sections
   */
  async extractSections(filePath, options = {}) {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const sections = [];

    // Extract by type
    switch (options.type) {
      case 'recipes':
        return this._extractRecipes(content);
      case 'code':
        return this._extractCodeBlocks(content);
      case 'dialogue':
        return this._extractDialogue(content);
      case 'headers':
        return this._extractHeaders(content);
      default:
        return [];
    }
  }

  /**
   * Extract recipe sections from content
   * @private
   */
  _extractRecipes(content) {
    const recipes = [];
    const recipePattern = /## Recipe:([^#]+)/gi;
    let match;

    while ((match = recipePattern.exec(content)) !== null) {
      recipes.push(match[0].trim());
    }

    return recipes;
  }

  /**
   * Extract code blocks from content
   * @private
   */
  _extractCodeBlocks(content) {
    const codeBlocks = [];
    const codePattern = /```[\s\S]*?```/g;
    let match;

    while ((match = codePattern.exec(content)) !== null) {
      codeBlocks.push(match[0]);
    }

    return codeBlocks;
  }

  /**
   * Extract dialogue from content
   * @private
   */
  _extractDialogue(content) {
    const dialogue = [];
    // Simple pattern: lines with quotes
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.includes('"') || line.includes('"') || line.includes('"')) {
        dialogue.push(line.trim());
      }
    }

    return dialogue;
  }

  /**
   * Extract markdown headers
   * @private
   */
  _extractHeaders(content) {
    const headers = [];
    const headerPattern = /^#+\s+(.+)$/gm;
    let match;

    while ((match = headerPattern.exec(content)) !== null) {
      headers.push(match[0].trim());
    }

    return headers;
  }
}

module.exports = ContentAnalyzer;
