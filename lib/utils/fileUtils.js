const fs = require('fs');
const path = require('path');

/**
 * Atomic file write using temp file + rename pattern
 * Prevents corruption if process crashes during write
 *
 * @param {string} filePath - Path to file to write
 * @param {any} data - Data to write (will be JSON.stringified)
 * @returns {Promise<void>}
 */
async function atomicWrite(filePath, data) {
  const tempPath = `${filePath}.tmp`;
  const backupPath = `${filePath}.backup`;

  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await ensureDir(dir);

    // Write to temp file first
    const jsonData = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(tempPath, jsonData, 'utf8');

    // Create backup of existing file if it exists
    if (fs.existsSync(filePath)) {
      await fs.promises.copyFile(filePath, backupPath);
    }

    // Atomic rename (OS-level atomic operation)
    await fs.promises.rename(tempPath, filePath);

    // Clean up backup after successful write
    if (fs.existsSync(backupPath)) {
      await fs.promises.unlink(backupPath);
    }
  } catch (error) {
    // Clean up temp file if it exists
    if (fs.existsSync(tempPath)) {
      await fs.promises.unlink(tempPath);
    }

    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
}

/**
 * Atomic file read with error handling
 *
 * @param {string} filePath - Path to file to read
 * @returns {Promise<any>} - Parsed JSON data or null if file doesn't exist
 */
async function atomicRead(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If backup exists, try to recover from it
    const backupPath = `${filePath}.backup`;
    if (fs.existsSync(backupPath)) {
      console.warn(`Main file corrupted, attempting recovery from backup: ${filePath}`);
      try {
        const backupData = await fs.promises.readFile(backupPath, 'utf8');
        const parsed = JSON.parse(backupData);

        // Restore from backup
        await fs.promises.copyFile(backupPath, filePath);
        console.warn(`Successfully recovered from backup: ${filePath}`);

        return parsed;
      } catch (backupError) {
        throw new Error(`Failed to read file ${filePath} and backup recovery failed: ${backupError.message}`);
      }
    }

    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

/**
 * Ensure directory exists, create if missing
 *
 * @param {string} dirPath - Path to directory
 * @returns {Promise<void>}
 */
async function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Create backup copy of file
 *
 * @param {string} filePath - Path to file to backup
 * @returns {Promise<string>} - Path to backup file
 */
async function backupFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Cannot backup non-existent file: ${filePath}`);
  }

  const backupPath = `${filePath}.backup`;
  await fs.promises.copyFile(filePath, backupPath);
  return backupPath;
}

module.exports = {
  atomicWrite,
  atomicRead,
  ensureDir,
  backupFile
};
