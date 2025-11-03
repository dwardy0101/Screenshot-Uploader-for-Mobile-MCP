#!/usr/bin/env python3
"""
Script to upload MCP screenshots to Google Drive.

Usage:
    python3 scripts/upload_screenshot_to_drive.py <screenshot_file_path> [--folder-name FOLDER_NAME]

Requirements:
    pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
"""

import os
import sys
import argparse
from datetime import datetime
from pathlib import Path

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    import pickle
except ImportError as e:
    print(f"Error: Missing required library: {e}")
    print("\nPlease install required libraries:")
    print("  pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")
    sys.exit(1)

# Google Drive API scopes
SCOPES = ['https://www.googleapis.com/auth/drive.file']

# Default folder name in Google Drive
DEFAULT_FOLDER_NAME = 'MCP Screenshots'

# Token and credentials file paths
TOKEN_FILE = os.path.expanduser('~/.google_drive_token.pickle')
CREDENTIALS_FILE_HIDDEN = os.path.expanduser('~/.google_drive_credentials.json')
CREDENTIALS_FILE_VISIBLE = os.path.expanduser('~/google_drive_credentials.json')

def find_credentials_file():
    """Find credentials file - checks both .google_drive_credentials.json (hidden) and google_drive_credentials.json (visible)"""
    if os.path.exists(CREDENTIALS_FILE_HIDDEN):
        return CREDENTIALS_FILE_HIDDEN
    if os.path.exists(CREDENTIALS_FILE_VISIBLE):
        return CREDENTIALS_FILE_VISIBLE
    return None

# Use the found credentials file path
CREDENTIALS_FILE = find_credentials_file() or CREDENTIALS_FILE_HIDDEN  # Default to hidden for backward compatibility


def get_credentials():
    """
    Get valid user credentials from storage or initiate OAuth flow.
    
    Returns:
        Credentials, the obtained credential.
    """
    creds = None
    
    # Load existing token if available
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'rb') as token:
            creds = pickle.load(token)
    
    # If there are no (valid) credentials available, let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            credentials_file = find_credentials_file()
            if not credentials_file:
                print(f"\nError: Credentials file not found.")
                print(f"   Checked: {CREDENTIALS_FILE_HIDDEN}")
                print(f"   Checked: {CREDENTIALS_FILE_VISIBLE}")
                print("\nPlease follow these steps:")
                print("1. Go to https://console.cloud.google.com/")
                print("2. Create a new project or select an existing one")
                print("3. Enable the Google Drive API")
                print("4. Go to 'Credentials' → 'Create Credentials' → 'OAuth client ID'")
                print("5. Choose 'Desktop app' as the application type")
                print(f"6. Download the JSON file and save it as: {CREDENTIALS_FILE_VISIBLE}")
                print(f"   (Or {CREDENTIALS_FILE_HIDDEN} if you prefer a hidden file)")
                sys.exit(1)
            
            flow = InstalledAppFlow.from_client_secrets_file(credentials_file, SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save credentials for the next run
        with open(TOKEN_FILE, 'wb') as token:
            pickle.dump(creds, token)
    
    return creds


def find_or_create_folder(service, folder_name):
    """
    Find a folder by name in Google Drive, or create it if it doesn't exist.
    
    Args:
        service: Google Drive API service object
        folder_name: Name of the folder to find or create
        
    Returns:
        str: The folder ID
    """
    # Search for existing folder
    query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
    items = results.get('files', [])
    
    if items:
        return items[0]['id']
    
    # Create folder if it doesn't exist
    file_metadata = {
        'name': folder_name,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    folder = service.files().create(body=file_metadata, fields='id').execute()
    return folder.get('id')


def upload_file_to_drive(file_path, folder_name=None):
    """
    Upload a file to Google Drive.
    
    Args:
        file_path: Path to the file to upload
        folder_name: Optional folder name in Google Drive (default: 'MCP Screenshots')
        
    Returns:
        str: The file ID of the uploaded file, or None if upload failed
    """
    if folder_name is None:
        folder_name = DEFAULT_FOLDER_NAME
    
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        return None
    
    print(f"Authenticating with Google Drive...")
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    print(f"Finding or creating folder '{folder_name}'...")
    folder_id = find_or_create_folder(service, folder_name)
    
    # Generate filename with timestamp
    filename = os.path.basename(file_path)
    name, ext = os.path.splitext(filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    drive_filename = f"{name}_{timestamp}{ext}"
    
    file_metadata = {
        'name': drive_filename,
        'parents': [folder_id]
    }
    
    print(f"Uploading {filename} as {drive_filename}...")
    media = MediaFileUpload(file_path, resumable=True)
    
    try:
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, webViewLink'
        ).execute()
        
        file_id = file.get('id')
        file_name = file.get('name')
        file_link = file.get('webViewLink')
        
        print(f"\n✅ Upload successful!")
        print(f"   File ID: {file_id}")
        print(f"   File Name: {file_name}")
        print(f"   View Link: {file_link}")
        
        return file_id
    except Exception as e:
        print(f"❌ Upload failed: {str(e)}")
        return None


def main():
    parser = argparse.ArgumentParser(
        description='Upload MCP screenshots to Google Drive',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 scripts/upload_screenshot_to_drive.py /path/to/screenshot.png
  python3 scripts/upload_screenshot_to_drive.py /path/to/screenshot.png --folder-name "Test Screenshots"
        """
    )
    parser.add_argument('file_path', help='Path to the screenshot file to upload')
    parser.add_argument('--folder-name', default=DEFAULT_FOLDER_NAME,
                       help=f'Google Drive folder name (default: {DEFAULT_FOLDER_NAME})')
    
    args = parser.parse_args()
    
    upload_file_to_drive(args.file_path, args.folder_name)


if __name__ == '__main__':
    main()





