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
const uploadedFiles = new Set();

function uploadScreenshot(filePath) {
  const fileKey = path.basename(filePath);
  
  // Skip if already uploaded
  if (uploadedFiles.has(fileKey)) {
    return;
  }

  // Check if file exists and is readable
  if (!fs.existsSync(filePath)) {
    return;
  }

  console.log(`📸 New screenshot detected: ${path.basename(filePath)}`);
  console.log(`⏳ Uploading...`);

  uploadFileToDrive(filePath, DRIVE_FOLDER)
    .then((fileId) => {
      uploadedFiles.add(fileKey);
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
      if (!filename || eventType !== 'rename') {
        return;
      }

      const filePath = path.join(watchFolder, filename);
      
      // Check if it's a screenshot file
      if (!FILE_PATTERN.test(filename)) {
        return;
      }

      // Small delay to ensure file is fully written
      setTimeout(() => {
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            uploadScreenshot(filePath);
          }
        } catch (err) {
          // File might not exist yet, ignore
        }
      }, 500);
    });

    console.log(`✅ Watching: ${watchFolder}`);
  } catch (err) {
    console.warn(`⚠️  Could not watch folder ${watchFolder}: ${err.message}`);
  }
});

// Also check for existing files on startup in all folders
console.log('Checking for existing screenshots...');
WATCH_FOLDERS.forEach((watchFolder) => {
  try {
    if (!fs.existsSync(watchFolder)) {
      return;
    }
    
    fs.readdir(watchFolder, (err, files) => {
      if (err) {
        console.warn(`⚠️  Could not read folder ${watchFolder}: ${err.message}`);
        return;
      }

      files
        .filter(file => FILE_PATTERN.test(file))
        .forEach(file => {
          const filePath = path.join(watchFolder, file);
          setTimeout(() => uploadScreenshot(filePath), 1000);
        });
    });
  } catch (err) {
    console.warn(`⚠️  Error checking folder ${watchFolder}: ${err.message}`);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping screenshot watcher...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Stopping screenshot watcher...');
  process.exit(0);
});

