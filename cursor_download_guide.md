# How to Download and Install Cursor

This guide will walk you through downloading and installing Cursor, the AI-powered code editor.

## What is Cursor?

Cursor is an AI-powered code editor built on VS Code that helps developers write code faster with AI assistance. It features:
- AI code completion and suggestions
- AI chat for code assistance
- Code editing powered by AI models
- Integration with popular AI models

## Step-by-Step Download Guide

### Step 1: Visit the Official Website

1. Open your web browser (Chrome, Firefox, Safari, Edge, etc.)
2. Navigate to the official Cursor website:
   - **URL**: https://cursor.sh
   - Or search for "Cursor editor" in your search engine

### Step 2: Navigate to Download Section

1. On the Cursor homepage, look for a **"Download"** button or link
2. This is typically located in the top navigation bar or as a prominent button on the homepage
3. Click on the download button

### Step 3: Select Your Operating System

Cursor will typically detect your operating system automatically, but you can manually select:

- **macOS** (for Apple Mac computers)
- **Windows** (for Windows 10/11)
- **Linux** (for various Linux distributions)

### Step 4: Download the Installer

1. Click the download button for your operating system
2. The download will begin automatically
3. Wait for the download to complete (the file size is typically 100-200 MB)

### Step 5: Install Cursor

#### For macOS:

1. **Locate the downloaded file**:
   - Usually in your `Downloads` folder
   - File name: `Cursor-*.dmg` or `Cursor-*.zip`

2. **Open the installer**:
   - Double-click the `.dmg` file
   - A window will open with the Cursor application

3. **Drag to Applications**:
   - Drag the Cursor icon to your Applications folder
   - Or double-click the Cursor icon to open it directly

4. **First launch**:
   - If you see a security warning, go to:
     - System Settings → Privacy & Security
     - Click "Open Anyway" next to the Cursor message
   - Or right-click the app and select "Open"

5. **Optional**: Add to Dock
   - Right-click Cursor in the Dock and select "Options → Keep in Dock"

#### For Windows:

1. **Locate the downloaded file**:
   - Usually in your `Downloads` folder
   - File name: `Cursor-*.exe`

2. **Run the installer**:
   - Double-click the `.exe` file
   - If Windows asks for permission, click "Yes" or "Run"

3. **Follow the installation wizard**:
   - Accept the license agreement (if prompted)
   - Choose installation location (default is usually fine)
   - Select additional options (desktop shortcut, etc.)
   - Click "Install"

4. **Launch Cursor**:
   - The installer may offer to launch Cursor immediately
   - Or find Cursor in your Start menu and click it

#### For Linux:

1. **Locate the downloaded file**:
   - Usually in your `Downloads` folder
   - File name: `Cursor-*.AppImage` or `*.deb` (Debian/Ubuntu) or `*.rpm` (Fedora)

2. **For AppImage**:
   ```bash
   chmod +x Cursor-*.AppImage
   ./Cursor-*.AppImage
   ```

3. **For .deb (Debian/Ubuntu)**:
   ```bash
   sudo dpkg -i cursor-*.deb
   sudo apt-get install -f  # Fix any dependency issues
   ```

4. **For .rpm (Fedora/RHEL)**:
   ```bash
   sudo rpm -i cursor-*.rpm
   ```

5. **Launch Cursor**:
   - Find Cursor in your applications menu
   - Or run `cursor` from the terminal

### Step 6: First-Time Setup

1. **Welcome Screen**:
   - You may see a welcome screen or tutorial
   - Follow the prompts to get started

2. **Sign In (Optional)**:
   - You may be prompted to sign in or create an account
   - This is usually optional but may unlock additional features

3. **Choose Settings**:
   - Configure your preferences (theme, font, etc.)
   - You can change these later in Settings

4. **Install Extensions (Optional)**:
   - Cursor supports VS Code extensions
   - Install language extensions, themes, or other tools as needed

## Alternative: Using Package Managers

### macOS (Homebrew):

```bash
brew install --cask cursor
```

### Windows (Chocolatey):

```powershell
choco install cursor
```

### Windows (Scoop):

```powershell
scoop bucket add extras
scoop install cursor
```

### Linux (Snap):

```bash
sudo snap install cursor
```

## Verification

To verify Cursor is installed correctly:

1. **Launch Cursor**
2. **Open a file or folder**:
   - File → Open File (or Open Folder)
   - Or use `Cmd+O` (Mac) / `Ctrl+O` (Windows/Linux)
3. **Check version**:
   - Help → About (Mac)
   - Help → About (Windows/Linux)
   - Or `Cmd+,` (Mac) / `Ctrl+,` (Windows/Linux) to open Settings

## Troubleshooting

### macOS Issues:

- **"Cursor is damaged" error**:
  ```bash
  xattr -cr /Applications/Cursor.app
  ```

- **Permission denied**:
  - Go to System Settings → Privacy & Security
  - Allow Cursor to run

### Windows Issues:

- **Antivirus blocking**:
  - Add Cursor to your antivirus exception list
  - Temporarily disable antivirus during installation

- **Installation fails**:
  - Run installer as Administrator
  - Check Windows version compatibility (Windows 10 or later required)

### Linux Issues:

- **Missing dependencies**:
  ```bash
  sudo apt-get update
  sudo apt-get install -f
  ```

- **Permission issues**:
  - Use `sudo` for system-wide installation
  - Or install to user directory

## Next Steps

After installation:

1. **Explore the interface**: Familiarize yourself with the editor
2. **Try AI features**: Use `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux) for AI editing
3. **Open AI chat**: Use `Cmd+L` (Mac) / `Ctrl+L` (Windows/Linux)
4. **Customize settings**: Adjust themes, fonts, and preferences
5. **Install extensions**: Add language support and tools you need

## System Requirements

- **macOS**: macOS 10.15 (Catalina) or later
- **Windows**: Windows 10 (64-bit) or later
- **Linux**: Modern distributions with glibc 2.28 or later
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB minimum

## Resources

- **Official Website**: https://cursor.sh
- **Documentation**: https://docs.cursor.sh
- **GitHub**: https://github.com/getcursor/cursor (if available)
- **Support**: Check the official website for support channels

---

**Note**: Always download Cursor from the official website (cursor.sh) to ensure you get the legitimate, secure version of the software.

