# Upload Screenshots to Google Drive - User Guide

## 📋 What is this?

This tool helps you automatically upload screenshots from your computer to Google Drive. It's especially useful for sharing test screenshots with your team.

**What you'll get:**
- ✅ Automatically upload screenshots to Google Drive
- ✅ Organize screenshots into folders
- ✅ Share screenshots easily with your team
- ✅ No need to manually upload files through a browser

---

## 🚀 Quick Start (If You Just Want to Use It)

If someone else has already set up the Google Cloud part for you:

1. **Make sure you have the credentials file**
   - Ask your team lead where the credentials file is located (`.google_drive_credentials.json` or `google_drive_credentials.json`)
   - You need to copy it to your home folder

2. **Install the tools needed**
   ```bash
   cd /path/to/NativeCamp-Android
   npm install googleapis open
   ```

3. **Choose your usage method:**

   **Option A: Manual Upload (One at a time)**
   ```bash
   node scripts/upload_screenshot_to_drive.js /path/to/your/screenshot.png
   ```
   
   **Option B: Automatic Upload (Recommended for Mobile MCP users)**
   - See the [Automatic Upload section](#-automatic-upload-with-cursor-ai-mobile-mcp) below
   - Just run the watcher script and all Mobile MCP screenshots upload automatically!

4. **Follow the prompts** (first time only)
   - A browser window will open
   - Sign in with your Google account
   - Click "Allow" when asked for permissions
   - Done! Your screenshot is uploaded (or future ones will auto-upload).

**That's it!** You're ready to use it.

---

## 📝 Prerequisites Checklist

Before you start, make sure you have:

- [ ] **Node.js installed** on your computer
  - Not sure? Open Terminal/Command Prompt and type: `node --version`
  - If you see a version number (like `v18.0.0`), you're good!
  - If you see "command not found", download it from [nodejs.org](https://nodejs.org/)
  
- [ ] **A Google account** (any Gmail account works)

- [ ] **Access to Google Cloud Console** 
  - You'll need permission to create a project (ask your manager if unsure)

---

## 🛠️ Full Setup Instructions

> **Note for QAs/Testers**: If your team has a shared Google Cloud setup, you might be able to skip steps 1-4 and just use the credentials file your team provides. Ask your team lead first!

### Part 1: Setting Up Google Cloud (One-Time Setup)

#### Step 1: Create a Google Cloud Project

1. Open your web browser and go to: **https://console.cloud.google.com/**
2. Sign in with your Google account
3. At the top of the page, you'll see a dropdown that might say "Select a project" or show a project name
   - Click on this dropdown
4. Click the **"NEW PROJECT"** button (or "Create Project")
5. Fill in:
   - **Project name**: "Screenshot Uploader" (or any name you like)
   - **Organization**: Leave as default (unless your company requires otherwise)
6. Click **"CREATE"** button
7. Wait a few seconds for the project to be created
8. Make sure your new project is selected in the dropdown at the top

**What you'll see**: Your new project name should appear at the top of the page.

---

#### Step 2: Enable Google Drive API

The API is like a permission that lets the tool talk to Google Drive.

1. On the left side of the page, click the **☰ menu icon** (three horizontal lines, also called "hamburger menu")
2. Look for **"APIs & Services"** in the menu and click it
3. Click **"Library"** from the submenu
4. In the search box at the top, type: **"Google Drive API"**
5. You should see "Google Drive API" appear - click on it
6. On the next page, click the big blue **"ENABLE"** button
7. Wait a moment - you'll see a message saying it's enabled

**What you'll see**: A page with information about Google Drive API and a green checkmark or success message.

---

#### Step 3: Create OAuth Credentials (The Key That Lets You Upload)

OAuth is just a secure way for Google to verify it's really you uploading files.

**First, set up the OAuth consent screen:**

1. Still in Google Cloud Console, click **"APIs & Services"** → **"OAuth consent screen"** (in the left menu)
2. You'll see a question about what type of app - choose **"External"** (unless your company uses Google Workspace)
3. Click **"CREATE"**
4. Fill in these fields:
   - **App name**: "Screenshot Uploader" 
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"SAVE AND CONTINUE"**
6. On the "Scopes" page, just click **"SAVE AND CONTINUE"** (default is fine)
7. On the "Test users" page:
   - If you see your email already listed, click **"SAVE AND CONTINUE"**
   - If not, click **"ADD USERS"**, type your email, click **"ADD"**, then **"SAVE AND CONTINUE"**
8. Review the summary and click **"BACK TO DASHBOARD"**

**Now create the OAuth client:**

1. Click **"APIs & Services"** → **"Credentials"** (in the left menu)
2. At the top, click **"+ CREATE CREDENTIALS"** button
3. Click **"OAuth client ID"** from the dropdown
4. You'll see a form - fill it in:
   - **Application type**: Select **"Desktop app"** from the dropdown
   - **Name**: "Screenshot Desktop Tool" (or any name)
5. Click **"CREATE"**
6. A popup window will appear showing your Client ID and Client Secret
   - ⚠️ **You don't need to copy these** - we'll download a file instead
   - Click **"OK"** to close the popup

**What you'll see**: Your new OAuth client will appear in a list under "OAuth 2.0 Client IDs".

---

#### Step 4: Download Your Credentials File

This file contains the keys that let the tool connect to Google Drive.

1. In the "Credentials" page, find your OAuth client (the one you just created)
2. You'll see a **download icon (⬇️)** at the end of the row - click it
   - Or click on the name of your OAuth client, then look for a download button
3. A file will download (usually to your Downloads folder)
   - The file name will be something like `client_secret_123456789-abc.apps.googleusercontent.com.json`

4. **Rename and move this file:**
   
   **Option A: Visible filename (Easier on Mac - Recommended)**
   - **On Mac**: 
     - Open Finder
     - Press `Cmd + Shift + G` (or go to Go → Go to Folder)
     - Type: `~` and press Enter (this opens your home folder)
     - Copy the downloaded file from Downloads to this folder
     - Rename it to: `google_drive_credentials.json` (no dot needed!)
   - **On Windows**:
     - Open File Explorer
     - Navigate to: `C:\Users\YourUsername\` (replace YourUsername with your actual username)
     - Copy the downloaded file from Downloads to this folder
     - Rename it to: `google_drive_credentials.json`
   - **On Linux**:
     - Move the file: `mv ~/Downloads/client_secret_*.json ~/google_drive_credentials.json`
   
   **Option B: Hidden filename (if you prefer hidden files)**
   - Use the same steps above, but name it `.google_drive_credentials.json` (with a dot)
   - **Note**: On Mac, Finder won't let you create files starting with a dot. Use Terminal instead:
     ```bash
     mv ~/Downloads/client_secret_*.json ~/.google_drive_credentials.json
     ```

5. **Verify it's in the right place:**
   - **Mac/Linux**: Open Terminal and type:
     ```bash
     ls -la ~/google_drive_credentials.json
     # or if using hidden version:
     ls -la ~/.google_drive_credentials.json
     ```
   - **Windows**: Open PowerShell and type:
     ```powershell
     Test-Path $env:USERPROFILE\google_drive_credentials.json
     # or if using hidden version:
     Test-Path $env:USERPROFILE\.google_drive_credentials.json
     ```
   - You should see the file path displayed (if it says "False" or "not found", the file isn't in the right place)

**What you'll see**: A file in your home folder called `google_drive_credentials.json` (or `.google_drive_credentials.json` if using hidden version)

**Note**: The script supports both filenames! The visible version (without dot) is easier to create in Finder on Mac.

---

#### Step 5: Set Up Redirect URI

This tells Google where to send you after you log in.

1. Go back to Google Cloud Console → **"APIs & Services"** → **"Credentials"**
2. Click on your OAuth client name (the one you created)
3. Scroll down to **"Authorized redirect URIs"** section
4. Click **"+ ADD URI"** button
5. Type exactly: `http://localhost:8080`
6. Click **"SAVE"** at the bottom

**What you'll see**: Your redirect URI added to the list.

---

### Part 2: Install Required Tools

1. **Open Terminal (Mac/Linux) or Command Prompt/PowerShell (Windows)**

2. **Navigate to the project folder:**
   ```bash
   cd /path/to/NativeCamp-Android
   ```
   *(Replace with your actual project path)*

3. **Install the required packages:**
   ```bash
   npm install googleapis open
   ```
   
4. **Wait for installation to finish** - you'll see a message when it's done

**What you'll see**: A lot of text scrolling, ending with something like "added X packages" or similar.

---

## 🎯 How to Use the Tool

### First Time: Authentication

The first time you use the tool, you need to sign in to Google.

1. **Take a screenshot** or find an image file you want to upload

2. **Open Terminal/Command Prompt** and run:
   ```bash
   node scripts/upload_screenshot_to_drive.js /path/to/your/screenshot.png
   ```
   *(Replace `/path/to/your/screenshot.png` with the actual path to your file)*

3. **What happens next:**
   - The tool checks for your credentials file ✅
   - Your web browser will open automatically (or you'll see a URL to copy)
   - You'll see a Google sign-in page
   - **Sign in** with your Google account
   - You'll see a page asking for permission - click **"Allow"** or **"Continue"**
   - Your browser will show "Authentication successful!" 
   - **Close the browser tab** and go back to Terminal

4. **That's it!** The tool saved your login info, so you won't need to do this again.

**What you'll see in Terminal:**
```
Authenticating with Google Drive...
Finding or creating folder 'MCP Screenshots'...
Uploading screenshot.png as screenshot_20250124_143022.png...

✅ Upload successful!
   File ID: 1a2b3c4d5e6f7g8h9i0j
   File Name: screenshot_20250124_143022.png
   View Link: https://drive.google.com/file/d/...
```

---

### Regular Usage: Uploading Screenshots

After the first-time setup, uploading is super simple:

#### Option 1: Upload to Default Folder

```bash
node scripts/upload_screenshot_to_drive.js /path/to/screenshot.png
```

This uploads to a folder called "MCP Screenshots" in your Google Drive.

#### Option 2: Upload to a Custom Folder

```bash
node scripts/upload_screenshot_to_drive.js /path/to/screenshot.png --folder-name "Test Results"
```

This uploads to a folder called "Test Results" (creates it if it doesn't exist).

---

## 📸 Common Usage Examples

### Example 1: Upload a Screenshot from Your Desktop

**Mac:**
```bash
node scripts/upload_screenshot_to_drive.js ~/Desktop/screenshot.png
```

**Windows:**
```bash
node scripts/upload_screenshot_to_drive.js C:\Users\YourName\Desktop\screenshot.png
```

### Example 2: Upload Multiple Screenshots to Different Folders

```bash
# Upload bug screenshot to "Bugs" folder
node scripts/upload_screenshot_to_drive.js ~/Desktop/bug1.png --folder-name "Bugs"

# Upload feature screenshot to "New Features" folder
node scripts/upload_screenshot_to_drive.js ~/Desktop/feature1.png --folder-name "New Features"
```

### Example 3: Upload a Screenshot from Temporary Folder

If MCP tools save screenshots to `/tmp`:
```bash
node scripts/upload_screenshot_to_drive.js /tmp/screenshot.png --folder-name "MCP Tests"
```

---

## 💡 Tips for Testers

### Tip 1: Organize by Test Run

Create folders for different test sessions:
```bash
node scripts/upload_screenshot_to_drive.js screenshot.png --folder-name "Test Run - 2025-01-24"
```

### Tip 2: Organize by Bug or Feature

```bash
# For bugs
node scripts/upload_screenshot_to_drive.js bug_screenshot.png --folder-name "Bug Reports"

# For new features
node scripts/upload_screenshot_to_drive.js feature_screenshot.png --folder-name "Feature Tests"
```

### Tip 3: Quick Access with Alias (Mac/Linux)

Add this to your `~/.zshrc` or `~/.bashrc` file:
```bash
alias upload-screenshot='node /path/to/NativeCamp-Android/scripts/upload_screenshot_to_drive.js'
```

Then reload:
```bash
source ~/.zshrc
```

Now you can just type:
```bash
upload-screenshot ~/Desktop/test.png
```

---

## 🤖 Automatic Upload with Cursor AI Mobile MCP

### What is This?

When using **Cursor AI with Mobile MCP** to take screenshots, you can set up automatic uploads so every screenshot is instantly uploaded to Google Drive. No manual commands needed!

### How It Works

When Mobile MCP takes a screenshot, it saves the file to a location on your computer. We'll set up a "watcher" that automatically detects new screenshot files and uploads them for you.

---

### Option 1: File Watcher Script (Recommended)

This script watches a folder for new screenshots and automatically uploads them.

**Step 1: Create the watcher script**

Create a new file called `auto_upload_screenshots.js` in the `scripts` folder:

```javascript
#!/usr/bin/env node
/**
 * Automatic screenshot uploader for Mobile MCP
 * Watches a folder for new screenshots and uploads them automatically
 */

const fs = require('fs');
const path = require('path');
const { uploadFileToDrive } = require('./upload_screenshot_to_drive.js');

// Configuration
const WATCH_FOLDER = process.env.MCP_SCREENSHOT_FOLDER || '/tmp';
const DRIVE_FOLDER = process.env.MCP_DRIVE_FOLDER || 'MCP Screenshots';
const FILE_PATTERN = /\.(png|jpg|jpeg|gif|webp)$/i; // Screenshot file extensions

console.log(`👀 Watching folder: ${WATCH_FOLDER}`);
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

// Watch for new files
fs.watch(WATCH_FOLDER, { recursive: false }, (eventType, filename) => {
  if (!filename || eventType !== 'rename') {
    return;
  }

  const filePath = path.join(WATCH_FOLDER, filename);
  
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

// Also check for existing files on startup (optional)
console.log('Checking for existing screenshots...');
fs.readdir(WATCH_FOLDER, (err, files) => {
  if (err) {
    console.warn(`⚠️  Could not read folder: ${err.message}`);
    return;
  }

  files
    .filter(file => FILE_PATTERN.test(file))
    .forEach(file => {
      const filePath = path.join(WATCH_FOLDER, file);
      setTimeout(() => uploadScreenshot(filePath), 1000);
    });
});
```

**Step 2: Make it executable (Mac/Linux)**

```bash
chmod +x scripts/auto_upload_screenshots.js
```

**Step 3: Find where Mobile MCP saves screenshots**

When you take a screenshot with Mobile MCP in Cursor, check the output - it usually shows where the file was saved. Common locations:
- `/tmp/screenshot.png`
- `/tmp/mcp_screenshot_*.png`
- `~/Desktop/screenshot.png`

Or check Cursor's Mobile MCP settings/documentation for the screenshot path.

**Step 4: Run the watcher**

```bash
# If screenshots go to /tmp (default)
node scripts/auto_upload_screenshots.js

# Or specify a custom folder
MCP_SCREENSHOT_FOLDER=~/Desktop node scripts/auto_upload_screenshots.js

# Or specify a custom Google Drive folder name
MCP_DRIVE_FOLDER="Test Run - $(date +%Y-%m-%d)" node scripts/auto_upload_screenshots.js
```

**Step 5: Keep it running**

- **Option A: Run in a separate terminal window** and leave it open
- **Option B: Run in background** (Mac/Linux):
  ```bash
  nohup node scripts/auto_upload_screenshots.js > /tmp/screenshot_uploader.log 2>&1 &
  ```
- **Option C: Use a terminal multiplexer** like `tmux` or `screen`

**What happens:**
- The script watches the folder for new screenshot files
- When Mobile MCP saves a screenshot, the script detects it automatically
- The screenshot is uploaded to Google Drive
- You see a confirmation message in the terminal

---

### Option 2: Wrapper Script (Alternative)

If you prefer to call the upload script manually after each screenshot, you can use a wrapper:

**Step 1: Create a wrapper script** `upload_latest_mcp_screenshot.sh`:

```bash
#!/bin/bash
# Uploads the most recent screenshot from MCP

SCREENSHOT_DIR="/tmp"
LATEST_SCREENSHOT=$(ls -t "$SCREENSHOT_DIR"/mcp_screenshot_*.png 2>/dev/null | head -1)

if [ -z "$LATEST_SCREENSHOT" ]; then
    echo "❌ No MCP screenshot found in $SCREENSHOT_DIR"
    exit 1
fi

echo "📸 Uploading latest screenshot: $(basename "$LATEST_SCREENSHOT")"
node scripts/upload_screenshot_to_drive.js "$LATEST_SCREENSHOT" --folder-name "MCP Screenshots"
```

**Step 2: Make it executable:**

```bash
chmod +x scripts/upload_latest_mcp_screenshot.sh
```

**Step 3: Use it after taking screenshots:**

```bash
# After Mobile MCP takes a screenshot, run:
./scripts/upload_latest_mcp_screenshot.sh
```

---

### Option 3: Integration with Cursor AI Settings

If Cursor AI supports post-screenshot hooks or commands:

1. Open Cursor settings
2. Look for "Mobile MCP" or "Screenshot" settings
3. Set a post-screenshot command to:
   ```bash
   node /path/to/NativeCamp-Android/scripts/upload_screenshot_to_drive.js "$SCREENSHOT_PATH" --folder-name "MCP Screenshots"
   ```

*(This depends on Cursor's specific configuration options)*

---

### Tips for Automatic Uploads

**💡 Organize by Date:**
```bash
# Upload to a folder named with today's date
MCP_DRIVE_FOLDER="MCP Screenshots - $(date +%Y-%m-%d)" node scripts/auto_upload_screenshots.js
```

**💡 Organize by Session:**
```bash
# Upload to a folder with timestamp
MCP_DRIVE_FOLDER="MCP Session - $(date +%Y%m%d_%H%M%S)" node scripts/auto_upload_screenshots.js
```

**💡 Filter by File Name:**
If Mobile MCP creates files with specific patterns (like `mcp_screenshot_*.png`), the watcher script will automatically detect and upload them.

**💡 Multiple Watchers:**
You can run multiple watchers for different folders:
```bash
# Terminal 1: Watch /tmp
node scripts/auto_upload_screenshots.js

# Terminal 2: Watch Desktop with different folder
MCP_SCREENSHOT_FOLDER=~/Desktop MCP_DRIVE_FOLDER="Desktop Screenshots" node scripts/auto_upload_screenshots.js
```

---

### Stopping the Automatic Upload

- **If running in foreground**: Press `Ctrl+C` in the terminal
- **If running in background**: Find the process and kill it:
  ```bash
  # Find the process
  ps aux | grep auto_upload_screenshots
  
  # Kill it (replace PID with the number you see)
  kill <PID>
  ```

---

## ⚠️ Troubleshooting

### Problem: "Credentials file not found"

**What it means**: The tool can't find your credentials file.

**How to fix:**
1. Check if the file exists in your home folder (the script checks both filenames):
   - **Mac/Linux**: Open Terminal and type:
     ```bash
     ls -la ~/google_drive_credentials.json
     ls -la ~/.google_drive_credentials.json
     ```
   - **Windows**: Check if file exists:
     - `C:\Users\YourName\google_drive_credentials.json`
     - `C:\Users\YourName\.google_drive_credentials.json`
2. The filename can be either:
   - `google_drive_credentials.json` (visible, recommended - easier to create in Finder)
   - `.google_drive_credentials.json` (hidden, requires Terminal on Mac)
3. If the file isn't there, go back to [Step 4](#step-4-download-your-credentials-file) and download it again
4. **Mac users**: If you're trying to create `.google_drive_credentials.json` (with dot) in Finder, it won't work. Use `google_drive_credentials.json` (without dot) instead - it works the same!

---

### Problem: "Port 8080 is already in use"

**What it means**: Another program is using the port the tool needs.

**How to fix:**
1. **Mac/Linux**: Close any apps that might be using port 8080 (like web servers)
2. **Or ask your IT team** to help you identify what's using the port
3. Try again - sometimes the other program was just starting up

---

### Problem: "Missing required module" or "Cannot find module 'googleapis'"

**What it means**: The required packages aren't installed.

**How to fix:**
1. Open Terminal/Command Prompt
2. Navigate to the project folder:
   ```bash
   cd /path/to/NativeCamp-Android
   ```
3. Install the packages:
   ```bash
   npm install googleapis open
   ```
4. Try uploading again

---

### Problem: Browser doesn't open automatically

**What it means**: Your system might not support auto-opening browsers.

**How to fix:**
1. The tool will show you a URL in the Terminal/Command Prompt
2. **Copy that URL** (it will look like: `https://accounts.google.com/...`)
3. **Paste it into your browser** and press Enter
4. Continue with the sign-in process

---

### Problem: "Authentication failed" or "Invalid grant"

**What it means**: Your saved login expired or was revoked.

**How to fix:**
1. **Delete the saved token** (this forces you to sign in again):
   - **Mac/Linux**: Run `rm ~/.google_drive_token.json` in Terminal
   - **Windows**: Delete the file `C:\Users\YourName\.google_drive_token.json`
2. Run the upload command again
3. Sign in again when the browser opens

---

### Problem: "File not found"

**What it means**: The file path you provided doesn't exist.

**How to fix:**
1. **Check the file path is correct:**
   - Make sure there are no typos
   - On Mac/Linux, paths are case-sensitive
2. **Try using the full path** (absolute path):
   - **Mac/Linux**: `/Users/yourname/Desktop/screenshot.png`
   - **Windows**: `C:\Users\YourName\Desktop\screenshot.png`
3. **Or drag and drop the file** into Terminal to get the correct path (works on Mac/Linux)

---

### Problem: "Upload failed: Insufficient permissions"

**What it means**: The tool doesn't have permission to upload to Google Drive.

**How to fix:**
1. **Delete your token file** and re-authenticate (see "Authentication failed" above)
2. When signing in, **make sure to click "Allow"** for all permissions
3. If it still doesn't work, check that Google Drive API is enabled in Google Cloud Console

---

### Problem: "Invalid redirect URI"

**What it means**: The redirect URI in Google Cloud Console doesn't match what the tool expects.

**How to fix:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click on your OAuth client
3. Make sure `http://localhost:8080` is in the "Authorized redirect URIs" list
4. Click "Save"
5. Delete your token file and try again

---

### Problem: Upload is very slow or times out

**What it means**: Network connection issue or Google Drive is having problems.

**How to fix:**
1. Check your internet connection
2. Wait a few minutes and try again
3. Check if Google Drive is working: go to [drive.google.com](https://drive.google.com) in your browser

---

### Problem: Automatic upload watcher doesn't detect screenshots

**What it means**: The watcher script isn't seeing new files, or Mobile MCP saves to a different folder.

**How to fix:**
1. **Check the folder being watched:**
   - The script shows which folder it's watching when it starts
   - Make sure Mobile MCP saves screenshots to that folder
   
2. **Verify the screenshot location:**
   - Take a screenshot with Mobile MCP
   - Note the file path shown in Cursor's output
   - Make sure this matches the watched folder

3. **Set the correct folder:**
   ```bash
   # If Mobile MCP saves to a different folder, use:
   MCP_SCREENSHOT_FOLDER=/actual/path/to/screenshots node scripts/auto_upload_screenshots.js
   ```

4. **Check file permissions:**
   - Make sure the script can read files from the watched folder
   - Try: `ls -la /tmp/screenshot*.png` (or your screenshot folder)

5. **Check file extensions:**
   - The watcher only looks for: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
   - If Mobile MCP uses a different extension, you may need to modify the script

---

### Problem: Automatic upload uploads the same file multiple times

**What it means**: The duplicate detection isn't working properly.

**How to fix:**
1. **Restart the watcher** - it tracks files by filename, so if files have the same name, it might upload twice
2. **Check the console output** - it should say "Uploaded successfully" only once per file
3. If it keeps happening, you can modify the script to track files by full path instead of just filename

---

## 🔒 Security & Privacy

### What the Tool Can Do

✅ Upload new files to Google Drive  
✅ Create folders in your Google Drive  
✅ Access files that THIS tool created  
✅ Share those files (you control sharing in Google Drive)

### What the Tool Cannot Do

❌ See all files in your Google Drive  
❌ Delete files you didn't upload with this tool  
❌ Modify existing files  
❌ Access files created by other apps

**Bottom line**: This tool can only manage files it creates itself. It can't see or change your other Google Drive files.

### Keeping Your Files Safe

- **Don't share your credentials file** (`google_drive_credentials.json` or `.google_drive_credentials.json`) with anyone
- **Don't share your token file** (`.google_drive_token.json`) with anyone
- **Keep these files in your home folder** - don't put them in shared folders or upload them anywhere

---

## 📞 Getting Help

### If Something Isn't Working

1. **Read the error message** carefully - it usually tells you what's wrong
2. **Check the Troubleshooting section** above
3. **Verify your setup**:
   - [ ] Credentials file is in the right place
   - [ ] Google Drive API is enabled
   - [ ] Redirect URI is set correctly
   - [ ] Packages are installed (`npm install` completed successfully)
4. **Ask your team** - someone else might have had the same issue

### Common Questions

**Q: Can I use this with my work Google account?**  
A: Yes, as long as you have permission to create projects in Google Cloud Console.

**Q: Will this upload all my screenshots automatically?**  
A: No, you need to run the command each time you want to upload a screenshot.

**Q: Where do the uploaded files go?**  
A: They go to a folder in your Google Drive (default: "MCP Screenshots" or whatever folder name you specify).

**Q: Can I delete uploaded files?**  
A: Yes, through Google Drive in your browser - the tool can only upload, not delete.

**Q: Do I need to sign in every time?**  
A: No, only the first time. After that, the tool uses your saved login.

---

## ✅ Setup Checklist

Use this checklist to make sure everything is set up correctly:

### Initial Setup
- [ ] Node.js is installed (`node --version` shows a version number)
- [ ] Google Cloud project is created
- [ ] Google Drive API is enabled
- [ ] OAuth consent screen is configured
- [ ] OAuth client ID is created (Desktop app type)
- [ ] Credentials file is downloaded
- [ ] Credentials file is renamed to `google_drive_credentials.json` (or `.google_drive_credentials.json` for hidden)
- [ ] Credentials file is in home folder (`~` on Mac/Linux, `C:\Users\YourName\` on Windows)
- [ ] Redirect URI `http://localhost:8080` is added
- [ ] Packages are installed (`npm install googleapis open` completed)

### First Use
- [ ] Ran the upload command successfully
- [ ] Browser opened for authentication
- [ ] Signed in with Google account
- [ ] Clicked "Allow" for permissions
- [ ] Saw "Authentication successful" message
- [ ] Screenshot uploaded successfully
- [ ] Can see the file in Google Drive

---

## 🎉 You're All Set!

Once you've completed the setup, uploading screenshots is just one command away:

```bash
node scripts/upload_screenshot_to_drive.js /path/to/screenshot.png
```

Happy testing! 🚀
