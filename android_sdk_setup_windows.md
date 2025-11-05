# Android SDK & Platform Tools Setup on Windows

## 1. Prerequisites

Windows 10 or later is recommended. No additional command-line tools are required for basic setup.

## 2. Install Android Command-line Tools

### A. Create SDK folder

Open PowerShell or Command Prompt and run:

``` powershell
New-Item -ItemType Directory -Force -Path "$env:LOCALAPPDATA\Android\Sdk"
```

Or using Command Prompt:

``` cmd
mkdir "%LOCALAPPDATA%\Android\Sdk"
```

### B. Download from Google

Get the Windows command-line tools from:
https://developer.android.com/studio#command-tools

Download the Windows version (commandlinetools-win-*.zip)

### C. Unzip into SDK directory

Using PowerShell:

``` powershell
Expand-Archive -Path commandlinetools-win-*.zip -DestinationPath "$env:LOCALAPPDATA\Android\Sdk\" -Force
Move-Item "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools" "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools-temp"
New-Item -ItemType Directory -Force -Path "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest"
Move-Item "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools-temp\*" "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\"
Remove-Item "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools-temp"
```

Or using Command Prompt (if you have 7-Zip or similar):

``` cmd
cd %LOCALAPPDATA%\Android\Sdk
unzip commandlinetools-win-*.zip
move cmdline-tools cmdline-tools-temp
mkdir cmdline-tools\latest
move cmdline-tools-temp\* cmdline-tools\latest\
rmdir cmdline-tools-temp
```

## 3. Install Platform Tools (ADB)

``` powershell
& "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" "platform-tools"
```

Or using Command Prompt:

``` cmd
"%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" "platform-tools"
```

Verify ADB:

``` powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" version
```

Or using Command Prompt:

``` cmd
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" version
```

## 4. Add to PATH

### Option A: Using System Environment Variables (Recommended)

1. Press `Win + X` and select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "User variables" (or "System variables" for all users), click "New"
5. Add:
   - Variable name: `ANDROID_HOME`
   - Variable value: `%LOCALAPPDATA%\Android\Sdk`
6. Edit the `Path` variable and add:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\cmdline-tools\latest\bin`
7. Click "OK" on all dialogs
8. Close and reopen your terminal/PowerShell window

### Option B: Using PowerShell Profile

Edit PowerShell profile:

``` powershell
notepad $PROFILE
```

Add:

``` powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin"
```

Reload:

``` powershell
. $PROFILE
```

## 5. Verify Setup

Open a new PowerShell or Command Prompt window and run:

``` powershell
adb devices
sdkmanager --version
```

Or using Command Prompt:

``` cmd
adb devices
sdkmanager --version
```

## 6. Ready for mobile-mcp

If ADB is working, mobile-mcp can detect your Android devices or emulators.

## Additional Notes

- If you encounter permission issues, run PowerShell or Command Prompt as Administrator
- The default SDK location is `%LOCALAPPDATA%\Android\Sdk` (usually `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`)
- You can also use Android Studio which will install the SDK automatically, but this manual setup gives you more control

