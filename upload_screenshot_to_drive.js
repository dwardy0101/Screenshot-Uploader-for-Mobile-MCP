#!/usr/bin/env node
/**
 * Script to upload MCP screenshots to Google Drive.
 * 
 * Usage:
 *     node scripts/upload_screenshot_to_drive.js <screenshot_file_path> [--folder-name FOLDER_NAME]
 * 
 * Requirements:
 *     npm install googleapis open
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const http = require('http');
const url = require('url');
let open;
try {
  open = require('open');
  // Handle both default export and named export
  if (typeof open === 'object' && open.default) {
    open = open.default;
  }
} catch (e) {
  // If open is not available, we'll just log the URL
  open = async (url) => {
    console.log('Please open this URL manually:', url);
    return Promise.resolve();
  };
}

// Google Drive API scopes
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Default folder name in Google Drive
const DEFAULT_FOLDER_NAME = 'MCP Screenshots';

// Token and credentials file paths
const TOKEN_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.google_drive_token.json');
const HOME_DIR = process.env.HOME || process.env.USERPROFILE;

/**
 * Find credentials file - checks both .google_drive_credentials.json (hidden) and google_drive_credentials.json (visible)
 * @return {string|null} Path to credentials file, or null if not found
 */
function findCredentialsFile() {
  const hiddenPath = path.join(HOME_DIR, '.google_drive_credentials.json');
  const visiblePath = path.join(HOME_DIR, 'google_drive_credentials.json');
  
  if (fs.existsSync(hiddenPath)) {
    return hiddenPath;
  }
  if (fs.existsSync(visiblePath)) {
    return visiblePath;
  }
  return null;
}

/**
 * Reads previously authorized credentials from the save file.
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.promises.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 * @param {Object} tokens - OAuth2 tokens
 * @param {Object} clientInfo - Client ID and secret info
 * @return {Promise<void>}
 */
async function saveCredentials(tokens, clientInfo) {
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: clientInfo.client_id,
    client_secret: clientInfo.client_secret,
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token,
    expiry_date: tokens.expiry_date,
  }, null, 2);
  await fs.promises.writeFile(TOKEN_PATH, payload);
}

/**
 * Get a new OAuth2 client and authorize it.
 * @param {OAuth2Client} oAuth2Client - OAuth2 client instance
 * @param {Object} clientInfo - Client ID and secret info
 * @param {string} redirectUri - Redirect URI from credentials
 * @return {Promise<OAuth2Client>}
 */
async function getNewToken(oAuth2Client, clientInfo, redirectUri) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    
    console.log('Authorize this app by visiting this url:', authUrl);
    console.log('Or open it in your browser...');
    
    // Try to open browser, but continue if it fails
    open(authUrl).catch(() => {
      console.log('Could not open browser automatically. Please visit the URL above.');
    });
    
    // Parse redirect URI to get port and host
    const redirectUrl = new url.URL(redirectUri);
    const port = redirectUrl.port ? parseInt(redirectUrl.port) : 8080;
    const host = redirectUrl.hostname || 'localhost';
    
    // Use a simple callback handler
    const server = http.createServer(async (req, res) => {
      try {
        const reqUrl = new url.URL(req.url, redirectUri);
        const code = reqUrl.searchParams.get('code');
        const error = reqUrl.searchParams.get('error');
        
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<h1>Authentication Error: ${error}</h1><p>Please try again.</p>`);
          server.close();
          reject(new Error(`Authentication failed: ${error}`));
          return;
        }
        
        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Authentication successful!</h1><p>You can close this window and return to the console.</p>');
          server.close();
          
          const { tokens } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);
          await saveCredentials(tokens, clientInfo);
          resolve(oAuth2Client);
        } else if (req.url !== '/') {
          // Handle any other path
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>Not Found</h1>');
        }
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>Error</h1><p>${e.message}</p>`);
        server.close();
        reject(e);
      }
    });
    
    server.listen(port, host, () => {
      console.log(`Waiting for authorization on ${redirectUri}...`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is in use. Please close any applications using this port.`);
        reject(new Error(`Port ${port} is already in use`));
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Load or request or authorization to call APIs.
 * @return {Promise<OAuth2Client>}
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  
  // Check if credentials file exists (try both hidden and visible versions)
  const credentialsPath = findCredentialsFile();
  if (!credentialsPath) {
    const hiddenPath = path.join(HOME_DIR, '.google_drive_credentials.json');
    const visiblePath = path.join(HOME_DIR, 'google_drive_credentials.json');
    console.error(`\nError: Credentials file not found.`);
    console.error(`   Checked: ${hiddenPath}`);
    console.error(`   Checked: ${visiblePath}`);
    console.error('\nPlease follow these steps:');
    console.error('1. Go to https://console.cloud.google.com/');
    console.error('2. Create a new project or select an existing one');
    console.error('3. Enable the Google Drive API');
    console.error('4. Go to \'Credentials\' → \'Create Credentials\' → \'OAuth client ID\'');
    console.error('5. Choose \'Desktop app\' as the application type');
    console.error(`6. Download the JSON file and save it as: ${visiblePath}`);
    console.error(`   (Or ${hiddenPath} if you prefer a hidden file)`);
    process.exit(1);
  }

  const content = await fs.promises.readFile(credentialsPath);
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  // If redirect URI is http://localhost (no port), use port 8080 to avoid needing root
  let redirectUri = redirect_uris && redirect_uris[0] ? redirect_uris[0] : 'http://localhost:8080';
  if (redirectUri === 'http://localhost') {
    redirectUri = 'http://localhost:8080';
    console.warn('Note: Using http://localhost:8080 for redirect. Make sure this is added as an authorized redirect URI in Google Cloud Console.');
  }
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

  // Check if we have previously stored a token
  const token = await loadSavedCredentialsIfExist();
  if (token) {
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Get new token
  const clientInfo = { client_id, client_secret };
  return await getNewToken(oAuth2Client, clientInfo, redirectUri);
}

/**
 * Find a folder by name in Google Drive, or create it if it doesn't exist.
 * @param {google.drive} drive - Google Drive API service
 * @param {string} folderName - Name of the folder
 * @return {Promise<string>} The folder ID
 */
async function findOrCreateFolder(drive, folderName) {
  try {
    // Search for existing folder
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    const files = response.data.files;
    if (files && files.length > 0) {
      return files[0].id;
    }

    // Create folder if it doesn't exist
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return folder.data.id;
  } catch (error) {
    throw new Error(`Error managing folder: ${error.message}`);
  }
}

/**
 * Upload a file to Google Drive.
 * @param {string} filePath - Path to the file to upload
 * @param {string} folderName - Optional folder name in Google Drive
 * @return {Promise<string>} The file ID of the uploaded file
 */
async function uploadFileToDrive(filePath, folderName = DEFAULT_FOLDER_NAME) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  console.log('Authenticating with Google Drive...');
  const authClient = await authorize();
  const drive = google.drive({ version: 'v3', auth: authClient });

  console.log(`Finding or creating folder '${folderName}'...`);
  const folderId = await findOrCreateFolder(drive, folderName);

  // Generate filename with timestamp
  const filename = path.basename(filePath);
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
  const driveFilename = `${name}_${timestamp}${ext}`;

  const fileMetadata = {
    name: driveFilename,
    parents: [folderId],
  };

  const media = {
    mimeType: getMimeType(ext),
    body: fs.createReadStream(filePath),
  };

  console.log(`Uploading ${filename} as ${driveFilename}...`);
  
  try {
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    const fileId = file.data.id;
    const fileName = file.data.name;
    const fileLink = file.data.webViewLink;

    console.log('\n✅ Upload successful!');
    console.log(`   File ID: ${fileId}`);
    console.log(`   File Name: ${fileName}`);
    console.log(`   View Link: ${fileLink}`);

    return fileId;
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

/**
 * Get MIME type from file extension.
 * @param {string} ext - File extension
 * @return {string} MIME type
 */
function getMimeType(ext) {
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * Parse command line arguments.
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const filePath = args[0];
  let folderName = DEFAULT_FOLDER_NAME;

  // Parse --folder-name option
  const folderIndex = args.indexOf('--folder-name');
  if (folderIndex !== -1 && args[folderIndex + 1]) {
    folderName = args[folderIndex + 1];
  }

  return { filePath, folderName };
}

/**
 * Main function.
 */
async function main() {
  const { filePath, folderName } = parseArgs();

  if (!filePath) {
    console.error('Usage: node scripts/upload_screenshot_to_drive.js <screenshot_file_path> [--folder-name FOLDER_NAME]');
    console.error('\nExamples:');
    console.error('  node scripts/upload_screenshot_to_drive.js /path/to/screenshot.png');
    console.error('  node scripts/upload_screenshot_to_drive.js /path/to/screenshot.png --folder-name "Test Screenshots"');
    process.exit(1);
  }

  try {
    await uploadFileToDrive(filePath, folderName);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { uploadFileToDrive, authorize };

