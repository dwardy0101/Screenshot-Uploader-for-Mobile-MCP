# Testing auto_upload_screenshots.js

## Fixed Bugs

### 1. Duplicate Filename Bug ✅ FIXED

**Problem:**
- The script tracked uploaded files by filename only (`path.basename()`)
- When multiple screenshots had the same name "screenshot.png", only the first one was uploaded
- Subsequent screenshots with the same name were incorrectly skipped
- **Important**: Cursor MCP sometimes overwrites the same file (e.g., `screenshot.png`), replacing the previous image

**Solution:**
- Changed tracking to use: `absolute_path + file_size + modification_time`
- This creates a unique key for each file, even if they share the same name
- When Cursor overwrites `screenshot.png`, the mtime changes, so it's detected as a new file
- Files are now tracked using a `Map` instead of a `Set`
- File watcher now handles both 'rename' (new files) and 'change' (overwritten files) events

**How to Test:**
```bash
# Test 1: Same filename, different locations
# Create screenshot.png in /tmp
touch /tmp/screenshot.png
# Create screenshot.png in scripts directory
touch screenshot.png
# Both should be uploaded (they're different files)

# Test 2: Same filename, different times
# Create screenshot.png
touch screenshot.png
# Wait for upload
sleep 2
# Overwrite screenshot.png (new mtime)
touch screenshot.png
# New version should be uploaded (different mtime)
```

### 2. Upload Timing Issue ✅ FIXED

**Problem:**
- Used 500ms delay before upload, which might not be enough for large screenshots
- Files could be uploaded before they're fully written to disk

**Solution:**
- Increased delay to 1000ms (1 second) to ensure file is complete
- Better file stat checking before upload

**How to Test:**
```bash
# Create a large screenshot (several MB)
# Verify it uploads completely without truncation
```

## Manual Testing Checklist

### Basic Functionality
- [ ] Script starts and watches specified folders
- [ ] Logs show which folders are being watched
- [ ] Script continues running (doesn't crash)

### Duplicate Filename Fix
- [ ] Create `screenshot.png` in folder A → uploads
- [ ] Create `screenshot.png` in folder B (same name) → uploads (different file)
- [ ] **Cursor overwrites `screenshot.png`** → new version uploads (mtime changed)
- [ ] Overwrite `screenshot.png` with new content → new version uploads
- [ ] Create same file again without changes → skips (correctly)

### Error Handling
- [ ] Non-existent watch folder → logs warning, continues
- [ ] Non-image file created → ignored (correctly)
- [ ] Upload failure → logs error, continues watching
- [ ] File deleted before upload → handles gracefully

### Configuration
- [ ] `MCP_SCREENSHOT_FOLDER` environment variable works
- [ ] Multiple folders (comma-separated) are watched
- [ ] `MCP_DRIVE_FOLDER` environment variable works
- [ ] Defaults work when env vars not set

## Running Tests

The script includes comprehensive specifications in `auto_upload_screenshots.spec.js`. 
For actual unit tests, you would need to set up a test framework like Jest.

## Known Behavior

1. **File Tracking**: Uses absolute path + size + mtime for uniqueness
2. **Upload Delay**: 1 second delay after file detection to ensure write completion
3. **Skip Logic**: Files with exact same path, size, and mtime are skipped
4. **Error Recovery**: Failed uploads don't mark files as uploaded, allowing retry

## Troubleshooting

### Screenshot not uploading?
1. Check if file is in a watched folder
2. Check file extension (must be .png, .jpg, .jpeg, .gif, .webp)
3. Check console logs for errors
4. Verify Google Drive authentication is working
5. Check if file was already uploaded (same path + size + mtime)

### Multiple screenshots with same name?
- ✅ This should now work! Each unique file is tracked separately
- Files are identified by path + size + mtime, not just name

### Script not detecting new files?
- Check if folder exists and is readable
- Verify `fs.watch()` is working (check console for warnings)
- Try increasing the delay if files are large

