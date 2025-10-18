#!/usr/bin/env node

const { getStateStatus } = require('../lib/state/init');

async function main() {
  try {
    const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

    const status = await getStateStatus({
      stateDir: 'manuscript/.state',
      verbose
    });

    if (!status.initialized) {
      console.log(status.message);
      return;
    }

    // Display status
    console.log('\n════════════════════════════════════════');
    console.log('  📚 MANUSCRIPT STATE STATUS');
    console.log('════════════════════════════════════════\n');

    console.log(`📖 ${status.project.name}`);
    console.log(`   Type: ${status.project.type} / ${status.project.genre}`);
    console.log(`   Chapters: ${status.project.totalChapters}`);
    console.log(`   Total Words: ${status.project.totalWords.toLocaleString()}`);
    console.log(`   Reviews: ${status.project.totalReviews}`);
    console.log(`   Cost: $${status.project.totalCost}\n`);

    console.log('📊 Status Breakdown:');
    for (const [statusName, count] of Object.entries(status.stats.byStatus)) {
      if (count > 0) {
        console.log(`   ${statusName}: ${count}`);
      }
    }

    console.log(`\n📈 Statistics:`);
    console.log(`   Average word count: ${status.stats.averageWordCount.toLocaleString()}`);
    console.log(`   Never reviewed: ${status.stats.chaptersNeverReviewed}`);
    console.log(`   With pending actions: ${status.stats.chaptersWithPendingActions}`);

    console.log(`\n⚠️  Attention Needed:`);
    console.log(`   Chapters needing review: ${status.attention.needsReview}`);
    console.log(`   Chapters with pending actions: ${status.attention.withPendingActions}`);

    if (verbose && status.needsReviewList) {
      console.log(`\n📝 Chapters Needing Review:`);
      status.needsReviewList.forEach(ch => console.log(`   - ${ch}`));
    }

    if (verbose && status.withActionsList && status.withActionsList.length > 0) {
      console.log(`\n✅ Chapters With Pending Actions:`);
      status.withActionsList.forEach(item =>
        console.log(`   - ${item.chapter} (${item.actionCount} actions)`)
      );
    }

    console.log('\n════════════════════════════════════════\n');
  } catch (error) {
    console.error('Error getting state status:', error.message);
    process.exit(1);
  }
}

main();
