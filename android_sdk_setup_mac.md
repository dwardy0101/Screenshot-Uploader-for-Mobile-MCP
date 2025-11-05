# Android SDK & Platform Tools Setup on macOS

## 1. Install macOS Command Line Tools

``` bash
xcode-select --install
```

## 2. Install Android Command-line Tools

### A. Create SDK folder

``` bash
mkdir -p ~/Library/Android/sdk
```

### B. Download from Google

Get the macOS command-line tools from:
https://developer.android.com/studio#command-tools

### C. Unzip into SDK directory

``` bash
unzip commandlinetools-mac-*.zip -d ~/Library/Android/sdk/
mv ~/Library/Android/sdk/cmdline-tools ~/Library/Android/sdk/cmdline-tools-temp
mkdir -p ~/Library/Android/sdk/cmdline-tools/latest
mv ~/Library/Android/sdk/cmdline-tools-temp/* ~/Library/Android/sdk/cmdline-tools/latest/
```

## 3. Install Platform Tools (ADB)

``` bash
~/Library/Android/sdk/cmdline-tools/latest/bin/sdkmanager "platform-tools"
```

Verify ADB:

``` bash
~/Library/Android/sdk/platform-tools/adb version
```

## 4. Add to PATH (Zsh)

Edit `.zshrc`:

``` bash
nano ~/.zshrc
```

Add:

``` bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
```

Reload:

``` bash
source ~/.zshrc
```

## 5. Verify Setup

``` bash
adb devices
sdkmanager --version
```

## 6. Ready for mobile-mcp

If ADB is working, mobile-mcp can detect your Android devices or
emulators.
