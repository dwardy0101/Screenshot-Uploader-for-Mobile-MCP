# MCP Screenshot Auto-Upload Notes

## Issue
When the AI uses `mobile_take_screenshot`, the screenshot is returned as image data but **NOT saved to disk**. This means the auto-upload watcher cannot detect it.

## Solution
Always use `mobile_save_screenshot` instead of `mobile_take_screenshot` when you want automatic uploads to work.

## Usage Pattern

When taking screenshots via AI that should trigger auto-upload:

1. Generate a timestamp: `date +%Y%m%d_%H%M%S`
2. Use `mobile_save_screenshot` with path: `/tmp/mcp_screenshot_<timestamp>.png`
3. The auto-upload watcher in `/tmp` will detect the new file and upload it

## Example
```bash
# Generate timestamp first
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Then save screenshot
mobile_save_screenshot device=R5CX30LM86F saveTo=/tmp/mcp_screenshot_${TIMESTAMP}.png
```

## Auto-Upload Configuration
- **Watch Folders**: `/tmp` and scripts directory (by default)
  - Configurable via `MCP_SCREENSHOT_FOLDER` (comma-separated for multiple folders)
  - Automatically watches scripts directory if defaulting to `/tmp`
  - MCP sometimes saves screenshots to the scripts directory instead of `/tmp`
- **File Patterns**: `mcp_screenshot_*.png`, `screenshot*.png`, or any `*.png`
- **Drive Folder**: `MCP Screenshots` (configurable via `MCP_DRIVE_FOLDER`)

## Multi-Directory Support
The auto-upload watcher now supports multiple directories:
- **Default behavior**: Watches both `/tmp` and the scripts directory automatically
- **Custom folders**: Use comma-separated list: `MCP_SCREENSHOT_FOLDER=/tmp,/path/to/folder1,/path/to/folder2`

