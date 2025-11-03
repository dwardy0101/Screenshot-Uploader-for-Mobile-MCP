#!/bin/bash
# Uploads the most recent screenshot from MCP
# Searches in both /tmp and the scripts directory
# 
# Usage:
#     ./scripts/upload_latest_mcp_screenshot.sh
# 
# Or set environment variables:
#     SCREENSHOT_DIR - Primary directory to search (default: /tmp)
#                      Also automatically searches in scripts directory
#     DRIVE_FOLDER - Google Drive folder name (default: "MCP Screenshots")

SCREENSHOT_DIR="${SCREENSHOT_DIR:-/tmp}"
DRIVE_FOLDER="${DRIVE_FOLDER:-MCP Screenshots}"

# Get the script directory (where screenshots might also be saved)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Search in both /tmp and scripts directory
SEARCH_DIRS=("$SCREENSHOT_DIR" "$SCRIPT_DIR")

# Try to find the most recent screenshot across all directories
LATEST_SCREENSHOT=""
LATEST_TIME=0

for SEARCH_DIR in "${SEARCH_DIRS[@]}"; do
    # Skip if directory doesn't exist
    [ ! -d "$SEARCH_DIR" ] && continue
    
    # Try MCP-specific pattern first
    for screenshot in "$SEARCH_DIR"/mcp_screenshot_*.png 2>/dev/null; do
        [ -f "$screenshot" ] || continue
        file_time=$(stat -f %m "$screenshot" 2>/dev/null || stat -c %Y "$screenshot" 2>/dev/null)
        if [ -n "$file_time" ] && [ "$file_time" -gt "$LATEST_TIME" ]; then
            LATEST_TIME=$file_time
            LATEST_SCREENSHOT="$screenshot"
        fi
    done
    
    # Try generic screenshot pattern
    for screenshot in "$SEARCH_DIR"/screenshot*.png 2>/dev/null; do
        [ -f "$screenshot" ] || continue
        file_time=$(stat -f %m "$screenshot" 2>/dev/null || stat -c %Y "$screenshot" 2>/dev/null)
        if [ -n "$file_time" ] && [ "$file_time" -gt "$LATEST_TIME" ]; then
            LATEST_TIME=$file_time
            LATEST_SCREENSHOT="$screenshot"
        fi
    done
    
    # Try any PNG file as last resort
    for screenshot in "$SEARCH_DIR"/*.png 2>/dev/null; do
        [ -f "$screenshot" ] || continue
        file_time=$(stat -f %m "$screenshot" 2>/dev/null || stat -c %Y "$screenshot" 2>/dev/null)
        if [ -n "$file_time" ] && [ "$file_time" -gt "$LATEST_TIME" ]; then
            LATEST_TIME=$file_time
            LATEST_SCREENSHOT="$screenshot"
        fi
    done
done

if [ -z "$LATEST_SCREENSHOT" ]; then
    echo "❌ No screenshot found"
    echo "   Searched in: ${SEARCH_DIRS[*]}"
    echo "   Tried patterns: mcp_screenshot_*.png, screenshot*.png, *.png"
    exit 1
fi

echo "📸 Uploading latest screenshot: $(basename "$LATEST_SCREENSHOT")"
echo "📁 Destination folder: $DRIVE_FOLDER"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Run the upload script
node "$SCRIPT_DIR/upload_screenshot_to_drive.js" "$LATEST_SCREENSHOT" --folder-name "$DRIVE_FOLDER"

