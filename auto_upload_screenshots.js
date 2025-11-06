#!/usr/bin/env node
/**
 * Automatic screenshot uploader for Mobile MCP
 * Watches multiple folders for new screenshots and uploads them automatically
 * 
 * Usage:
 *     node scripts/auto_upload_screenshots.js
 * 
 * Environment variables:
 *     MCP_SCREENSHOT_FOLDER - Folders to watch (comma-separated, default: /tmp)
 *                             Also automatically watches scripts directory if defaulting to /tmp
 *     MCP_DRIVE_FOLDER - Google Drive folder name (default: 'MCP Screenshots')
 * 
 * Examples:
 *     # Watch only /tmp
 *     MCP_SCREENSHOT_FOLDER=/tmp node scripts/auto_upload_screenshots.js
 *     
 *     # Watch multiple folders
 *     MCP_SCREENSHOT_FOLDER=/tmp,/Users/name/Documents/scripts node scripts/auto_upload_screenshots.js
 */

const fs = require('fs');
const path = require('path');
const { uploadFileToDrive } = require('./upload_screenshot_to_drive.js');

// Configuration
// Support multiple folders - comma-separated list, or use default common locations
const WATCH_FOLDERS_STR = process.env.MCP_SCREENSHOT_FOLDER || '/tmp';
const WATCH_FOLDERS = WATCH_FOLDERS_STR.split(',').map(f => f.trim()).filter(f => f);
// If only one folder specified, also add scripts directory as fallback
if (WATCH_FOLDERS.length === 1 && WATCH_FOLDERS[0] === '/tmp') {
  // __dirname is the directory where this script is located
  const scriptsDir = __dirname;
  if (scriptsDir !== '/tmp') {
    WATCH_FOLDERS.push(scriptsDir);
  }
}

const DRIVE_FOLDER = process.env.MCP_DRIVE_FOLDER || 'MCP Screenshots';
const FILE_PATTERN = /\.(png|jpg|jpeg|gif|webp)$/i; // Screenshot file extensions

console.log(`👀 Watching folders: ${WATCH_FOLDERS.join(', ')}`);
console.log(`📁 Uploading to Google Drive folder: "${DRIVE_FOLDER}"`);
console.log(`\nPress Ctrl+C to stop watching...\n`);

// Track uploaded files to avoid duplicates
// Use absolute path + file stats (size + mtime) to handle files with same name
// IMPORTANT: Cursor MCP sometimes overwrites the same file (e.g., screenshot.png)
// When a file is overwritten, its mtime (modification time) changes, so we detect it as a new file
const uploadedFiles = new Map(); // Map<fileKey, { path, size, mtime }>

/**
 * Generate a unique key for a file based on its absolute path, size, and modification time
 * This ensures we can detect new versions of files with the same name
 * 
 * IMPORTANT: When Cursor MCP overwrites screenshot.png (same path, new content),
 * the mtime will change, making this a different key, so the new version is uploaded.
 * 
 * @param {string} filePath - Path to the file
 * @param {fs.Stats} stats - File stats object
 * @returns {string} Unique file key
 */
function getFileKey(filePath, stats) {
  const absPath = path.resolve(filePath);
  // Use path + size + mtime to uniquely identify files
  // This handles:
  // 1. Multiple screenshots with same name in different locations
  // 2. Same file being overwritten (new mtime = new key = new upload)
  // 3. Files with same name but different content (different size)
  return `${absPath}:${stats.size}:${stats.mtimeMs}`;
}

/**
 * Check if a file has already been uploaded
 * @param {string} filePath - Path to the file
 * @param {fs.Stats} stats - File stats object
 * @returns {boolean} True if file was already uploaded
 */
function isFileAlreadyUploaded(filePath, stats) {
  const fileKey = getFileKey(filePath, stats);
  return uploadedFiles.has(fileKey);
}

/**
 * Mark a file as uploaded
 * @param {string} filePath - Path to the file
 * @param {fs.Stats} stats - File stats object
 */
function markFileAsUploaded(filePath, stats) {
  const fileKey = getFileKey(filePath, stats);
  uploadedFiles.set(fileKey, {
    path: path.resolve(filePath),
    size: stats.size,
    mtime: stats.mtimeMs,
    uploadedAt: Date.now()
  });
}

function uploadScreenshot(filePath) {
  // Check if file exists and is readable
  if (!fs.existsSync(filePath)) {
    return;
  }

  let stats;
  try {
    stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return;
    }
  } catch (err) {
    // File might not be accessible, ignore
    return;
  }

  // Skip if already uploaded (check by path + size + mtime)
  // Note: If Cursor overwrites screenshot.png, mtime changes, so it's detected as new
  if (isFileAlreadyUploaded(filePath, stats)) {
    console.log(`⏭️  Skipping already uploaded: ${path.basename(filePath)} (same file)\n`);
    return;
  }

  // This will trigger for:
  // - New files with same name but different path
  // - Overwritten files (same path but new mtime/size)
  // - Files that haven't been uploaded yet
  console.log(`📸 New screenshot detected: ${path.basename(filePath)}`);
  console.log(`⏳ Uploading...`);

  uploadFileToDrive(filePath, DRIVE_FOLDER)
    .then((fileId) => {
      markFileAsUploaded(filePath, stats);
      console.log(`✅ Uploaded successfully! (ID: ${fileId})\n`);
    })
    .catch((error) => {
      console.error(`❌ Upload failed: ${error.message}\n`);
    });
}

// Watch multiple folders for new files
WATCH_FOLDERS.forEach((watchFolder) => {
  try {
    // Check if folder exists and is readable
    if (!fs.existsSync(watchFolder)) {
      console.warn(`⚠️  Watch folder does not exist: ${watchFolder}`);
      return;
    }

    fs.watch(watchFolder, { recursive: false }, (eventType, filename) => {
      if (!filename) {
        return;
      }

      // Handle both 'rename' (new file) and 'change' (file modified/overwritten) events
      // Cursor MCP overwrites screenshot.png, which may trigger 'change' or 'rename'
      if (eventType !== 'rename' && eventType !== 'change') {
        return;
      }

      const filePath = path.join(watchFolder, filename);
      
      // Check if it's a screenshot file
      if (!FILE_PATTERN.test(filename)) {
        return;
      }

      // Small delay to ensure file is fully written
      // Use longer delay to ensure file is completely written to disk
      // This is especially important when Cursor overwrites the same file
      setTimeout(() => {
        uploadScreenshot(filePath);
      }, 1000);
    });

    console.log(`✅ Watching: ${watchFolder}`);
  } catch (err) {
    console.warn(`⚠️  Could not watch folder ${watchFolder}: ${err.message}`);
  }
});

// Also check for existing files on startup in all folders
// console.log('Checking for existing screenshots...');
// WATCH_FOLDERS.forEach((watchFolder) => {
//   try {
//     if (!fs.existsSync(watchFolder)) {
//       return;
//     }
    
//     fs.readdir(watchFolder, (err, files) => {
//       if (err) {
//         console.warn(`⚠️  Could not read folder ${watchFolder}: ${err.message}`);
//         return;
//       }

//       files
//         .filter(file => FILE_PATTERN.test(file))
//         .forEach(file => {
//           const filePath = path.join(watchFolder, file);
//           setTimeout(() => uploadScreenshot(filePath), 1000);
//         });
//     });
//   } catch (err) {
//     console.warn(`⚠️  Error checking folder ${watchFolder}: ${err.message}`);
//   }
// });

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping screenshot watcher...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Stopping screenshot watcher...');
  process.exit(0);
});

