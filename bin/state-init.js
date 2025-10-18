#!/usr/bin/env node

const { initializeState } = require('../lib/state/init');

async function main() {
  try {
    const bookTitle = process.env.BOOK_TITLE || 'Drain Salad: A Culinary Journey Through Mysterious Plumbing';
    const bookType = process.env.BOOK_TYPE || 'non-fiction';
    const bookGenre = process.env.BOOK_GENRE || 'cookbook';

    await initializeState({
      manuscriptDir: 'manuscript',
      stateDir: 'manuscript/.state',
      bookType,
      bookGenre,
      bookTitle,
      skipAnalysis: false
    });

    console.log('\nState initialized successfully!');
    console.log('Run `npm run state:status` to see current state.');
  } catch (error) {
    console.error('Error initializing state:', error.message);
    process.exit(1);
  }
}

main();
