#!/usr/bin/env node

const { syncState } = require('../lib/state/init');

async function main() {
  try {
    const chapterName = process.argv[2]; // Optional chapter name

    await syncState({
      manuscriptDir: 'manuscript',
      stateDir: 'manuscript/.state',
      chapterName
    });

    console.log('\nSync complete!');
  } catch (error) {
    console.error('Error syncing state:', error.message);
    process.exit(1);
  }
}

main();
