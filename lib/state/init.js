const fs = require('fs');
const path = require('path');
const StateManager = require('./StateManager');
const BookConfig = require('./BookConfig');
const ContentAnalyzer = require('../content/ContentAnalyzer');
const { ensureDir } = require('../utils/fileUtils');

/**
 * Initialize state for a manuscript
 * Creates:
 * - book-config.json (if missing)
 * - project.json
 * - preferences.json
 * - chapter states for all .md files
 *
 * @param {object} options - Initialization options
 * @returns {Promise<object>} - Initialization results
 */
async function initializeState(options = {}) {
  const {
    manuscriptDir = 'manuscript',
    stateDir = 'manuscript/.state',
    bookType = 'non-fiction',
    bookGenre = 'cookbook',
    bookTitle = 'Untitled Book',
    skipAnalysis = false
  } = options;

  console.log('Initializing state...');

  // Step 1: Ensure directories exist
  await ensureDir(stateDir);
  await ensureDir(path.join(stateDir, 'chapters'));

  // Step 2: Create book config if missing
  const bookConfigPath = path.join(stateDir, 'book-config.json');
  let bookConfig;

  if (!fs.existsSync(bookConfigPath)) {
    console.log(`Creating book config (${bookType}/${bookGenre})...`);
    const config = await BookConfig.createDefault(bookType, bookGenre, bookConfigPath);

    // Update title
    bookConfig = new BookConfig(bookConfigPath);
    await bookConfig.load();
    await bookConfig.update({ title: bookTitle });
  } else {
    console.log('Book config already exists');
    bookConfig = new BookConfig(bookConfigPath);
    await bookConfig.load();
  }

  // Step 3: Initialize StateManager
  const stateManager = new StateManager({ stateDir });
  await stateManager.initialize();

  // Step 4: Find all chapter files
  const files = fs.readdirSync(manuscriptDir);
  const chapterFiles = files.filter(f => f.startsWith('chapter-') && f.endsWith('.md'));

  console.log(`Found ${chapterFiles.length} chapter files`);

  // Step 5: Create or update chapter states
  const analyzer = new ContentAnalyzer(bookConfig);
  const results = {
    created: [],
    updated: [],
    analyzed: []
  };

  for (const file of chapterFiles) {
    const filePath = path.join(manuscriptDir, file);
    const chapterName = file.replace('.md', '');

    // Check if state exists
    const existingState = await stateManager.getChapterState(chapterName);

    if (!existingState) {
      // Create new state
      console.log(`Creating state for ${chapterName}...`);
      await stateManager.createChapterState(filePath);
      results.created.push(chapterName);
    } else {
      results.updated.push(chapterName);
    }

    // Analyze content if requested
    if (!skipAnalysis) {
      console.log(`Analyzing ${chapterName}...`);
      const analysis = await analyzer.analyzeChapter(filePath);

      // Update state with analysis results
      await stateManager.updateChapterState(chapterName, {
        wordCount: analysis.wordCount,
        characteristics: {
          ...analysis.characteristics
        }
      });

      results.analyzed.push(chapterName);
    }
  }

  // Step 6: Recalculate project stats
  await stateManager.recalculateProjectStats();

  const stats = await stateManager.getChapterStatistics();

  console.log('\nInitialization complete!');
  console.log(`Created: ${results.created.length} chapter states`);
  console.log(`Updated: ${results.updated.length} chapter states`);
  console.log(`Analyzed: ${results.analyzed.length} chapters`);
  console.log(`Total words: ${stats.totalWords}`);

  return {
    stateManager,
    bookConfig,
    results,
    stats
  };
}

/**
 * Sync state with manuscript files
 * Updates word counts and characteristics for all chapters
 *
 * @param {object} options - Sync options
 * @returns {Promise<object>} - Sync results
 */
async function syncState(options = {}) {
  const {
    manuscriptDir = 'manuscript',
    stateDir = 'manuscript/.state',
    chapterName = null // If provided, only sync this chapter
  } = options;

  console.log('Syncing state...');

  // Initialize StateManager
  const stateManager = new StateManager({ stateDir });
  await stateManager.initialize();

  const bookConfig = stateManager.getBookConfig();
  const analyzer = new ContentAnalyzer(bookConfig);

  const results = {
    synced: [],
    errors: []
  };

  if (chapterName) {
    // Sync specific chapter
    try {
      const filePath = path.join(manuscriptDir, `${chapterName}.md`);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Chapter file not found: ${filePath}`);
      }

      console.log(`Syncing ${chapterName}...`);
      const analysis = await analyzer.analyzeChapter(filePath);

      await stateManager.updateChapterState(chapterName, {
        wordCount: analysis.wordCount,
        characteristics: {
          ...analysis.characteristics
        }
      });

      results.synced.push(chapterName);
    } catch (error) {
      results.errors.push({ chapterName, error: error.message });
    }
  } else {
    // Sync all chapters
    const chapters = await stateManager.getAllChapterStates();

    for (const chapter of chapters) {
      try {
        const filePath = chapter.file;

        if (!fs.existsSync(filePath)) {
          console.warn(`Warning: Chapter file not found: ${filePath}`);
          continue;
        }

        const chapterName = path.basename(filePath, '.md');
        console.log(`Syncing ${chapterName}...`);

        const analysis = await analyzer.analyzeChapter(filePath);

        await stateManager.updateChapterState(chapterName, {
          wordCount: analysis.wordCount,
          characteristics: {
            ...analysis.characteristics
          }
        });

        results.synced.push(chapterName);
      } catch (error) {
        results.errors.push({
          chapterName: chapter.file,
          error: error.message
        });
      }
    }
  }

  // Recalculate project stats
  await stateManager.recalculateProjectStats();

  console.log(`\nSync complete!`);
  console.log(`Synced: ${results.synced.length} chapters`);
  if (results.errors.length > 0) {
    console.log(`Errors: ${results.errors.length}`);
  }

  return results;
}

/**
 * Get current state status
 * Shows overview of project and chapter states
 *
 * @param {object} options - Status options
 * @returns {Promise<object>} - Status information
 */
async function getStateStatus(options = {}) {
  const {
    stateDir = 'manuscript/.state',
    verbose = false
  } = options;

  // Check if state exists
  if (!fs.existsSync(stateDir)) {
    return {
      initialized: false,
      message: 'State not initialized. Run `npm run state:init` to initialize.'
    };
  }

  // Initialize StateManager
  const stateManager = new StateManager({ stateDir });
  await stateManager.initialize();

  // Get project info
  const projectState = stateManager.getProjectState();
  const bookConfig = stateManager.getBookConfig().getAll();
  const stats = await stateManager.getChapterStatistics();

  // Find chapters needing attention
  const needsReview = await stateManager.findChaptersNeedingReview();
  const withActions = await stateManager.findChaptersWithPendingActions();

  const status = {
    initialized: true,
    project: {
      name: projectState.name,
      type: bookConfig.type,
      genre: bookConfig.genre,
      totalChapters: stats.total,
      totalWords: stats.totalWords,
      totalReviews: stats.totalReviews,
      totalCost: stats.totalCost.toFixed(2)
    },
    stats: {
      byStatus: stats.byStatus,
      averageWordCount: stats.averageWordCount,
      chaptersNeverReviewed: stats.chaptersNeverReviewed,
      chaptersWithPendingActions: stats.chaptersWithPendingActions
    },
    attention: {
      needsReview: needsReview.length,
      withPendingActions: withActions.length
    }
  };

  if (verbose) {
    status.chapters = await stateManager.getAllChapterStates();
    status.needsReviewList = needsReview.map(ch => path.basename(ch.file, '.md'));
    status.withActionsList = withActions.map(item => ({
      chapter: path.basename(item.chapter.file, '.md'),
      actionCount: item.actions.length
    }));
  }

  return status;
}

module.exports = {
  initializeState,
  syncState,
  getStateStatus
};
