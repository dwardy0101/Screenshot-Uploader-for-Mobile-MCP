# Upload MCP Screenshots to Google Drive

This script allows you to automatically upload screenshots taken with MCP (Model Context Protocol) to your Google Drive.

## Setup Instructions

### 1. Install Required Python Libraries

```bash
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

### 2. Set Up Google Drive API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Desktop app" as the application type
   - Give it a name (e.g., "MCP Screenshots Uploader")
   - Click "Create"
5. Download the credentials:
   - Click the download icon (⬇️) next to your newly created OAuth client
   - Save the JSON file in your home directory as either:
     - `google_drive_credentials.json` (recommended - easier to create in Finder on Mac)
     - `~/.google_drive_credentials.json` (hidden file, requires Terminal on Mac)
   
   **Note**: On Mac, Finder won't let you create files starting with a dot. Use `google_drive_credentials.json` (without dot) instead - both work the same!

### 3. First Run (Authentication)

The first time you run the script, it will:
1. Open a browser window for Google OAuth authentication
2. Ask you to sign in and grant permissions
3. Save the authentication token for future use

## Usage

### Basic Usage

After taking a screenshot with MCP, you can upload it directly:

```bash
python3 scripts/upload_screenshot_to_drive.py /path/to/screenshot.png
```

### Custom Folder Name

Upload to a specific folder in Google Drive:

```bash
python3 scripts/upload_screenshot_to_drive.py /path/to/screenshot.png --folder-name "My Test Screenshots"
```

### Integration with MCP

When using MCP tools that save screenshots:

1. Take a screenshot using MCP (it will save to a local path)
2. Use the script to upload it:

```bash
python3 scripts/upload_screenshot_to_drive.py /tmp/screenshot.png
```

Or create a shell alias/function for convenience:

```bash
# Add to your ~/.zshrc or ~/.bashrc
alias mcp-upload='python3 /path/to/NativeCamp-Android/scripts/upload_screenshot_to_drive.py'
```

Then use:
```bash
mcp-upload /path/to/screenshot.png
```

## File Naming

The script automatically adds a timestamp to uploaded files:
- Original: `screenshot.png`
- Uploaded: `screenshot_20250124_143022.png`

This prevents filename conflicts in Google Drive.

## Troubleshooting

### "Credentials file not found"
- Make sure you've saved the OAuth credentials JSON file in your home directory as:
  - `google_drive_credentials.json` (visible, recommended)
  - `~/.google_drive_credentials.json` (hidden)
- The script checks both filenames automatically
- Check the file path and permissions
- **Mac users**: If you tried creating `.google_drive_credentials.json` (with dot) in Finder, it won't work. Use `google_drive_credentials.json` (without dot) instead!

### "Missing required library"
- Run: `pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib`

### Authentication expired
- Delete `~/.google_drive_token.pickle` and run the script again to re-authenticate

### Permission denied
- Make sure the script is executable: `chmod +x scripts/upload_screenshot_to_drive.py`

## Security Notes

- Credentials are stored locally in your home directory
- The token file (`~/.google_drive_token.pickle`) contains your access token
- Keep these files secure and don't share them
- The OAuth flow only requests `drive.file` scope (can only access files created by this app)





