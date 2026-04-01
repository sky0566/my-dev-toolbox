# Text Viewer

An elegant Android document reader app that supports browsing and reading local HTML and PDF files.

## ✨ Features

### 📂 Smart File Browser
- Browse local HTML and PDF files
- Quick path access (Download, Documents, Storage)
- Filter by file type (HTML/PDF/All)
- Recent files history

### 📖 HTML Reader
- WebView rendering with full HTML support
- **Auto-extract TOC**: Generate table of contents from H1-H6 headings
- Sidebar navigation
- Font size adjustment (50%-200%)
- Night mode toggle
- Tap to hide/show toolbar

### 📄 PDF Reader
- Smooth PDF rendering
- **Auto-extract PDF bookmarks**
- Page slider for quick navigation
- Page number display
- Night mode
- Zoom support

### 🎨 UI Design
- Material Design 3 style
- Smooth reading experience
- Card-based layout
- Fluid animations

## 🛠️ Build

### Requirements
- **JDK 17** or higher
- **Android SDK** (API 34)
- **Android Studio** Hedgehog or higher (recommended)

### Option 1: Using Android Studio (Recommended)

1. Open Android Studio
2. Select `File` -> `Open`
3. Select the `Text Viewer` project folder
4. Wait for Gradle sync to complete
5. Click `Build` -> `Build Bundle(s) / APK(s)` -> `Build APK(s)`
6. APK location: `app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Command Line Build

```bash
# Windows
cd "Text Viewer"
.\gradlew.bat assembleDebug

# Linux/Mac
cd "Text Viewer"
chmod +x gradlew
./gradlew assembleDebug
```

### Generate Signed Release APK

```bash
# Generate signing key (first time)
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key

# Build Release version
.\gradlew.bat assembleRelease
```

## 📱 Installation

1. Transfer the APK file to your phone
2. Open the APK file to install (allow installation from unknown sources)
3. Grant storage permission on first launch
4. Select HTML or PDF files to read

## 🔧 Project Structure

```
Text Viewer/
├── app/
│   ├── src/main/
│   │   ├── java/com/docreader/app/
│   │   │   ├── MainActivity.kt          # Main screen
│   │   │   ├── FileBrowserActivity.kt   # File browser
│   │   │   ├── HtmlReaderActivity.kt    # HTML reader
│   │   │   ├── PdfReaderActivity.kt     # PDF reader
│   │   │   ├── adapter/                 # RecyclerView adapters
│   │   │   ├── model/                   # Data models
│   │   │   └── util/                    # Utility classes
│   │   ├── res/
│   │   │   ├── layout/                  # Layout files
│   │   │   ├── drawable/                # Icons and backgrounds
│   │   │   ├── values/                  # Colors, strings, themes
│   │   │   └── menu/                    # Menus
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── gradle.properties
```

## 📦 Dependencies

- **AndroidX** - Core components
- **Material Components** - Material Design UI
- **android-pdf-viewer** - PDF rendering library
- **Kotlin Coroutines** - Async processing

## 📋 Permissions

- `READ_EXTERNAL_STORAGE` - Read local files
- `MANAGE_EXTERNAL_STORAGE` - Access all files on Android 11+
- `INTERNET` - WebView resource loading

## 🎯 Feature Details

### Table of Contents
- **HTML**: Auto-parse H1-H6 tags to generate TOC
- **PDF**: Read embedded PDF bookmarks/outline as TOC

### Night Mode
- HTML: CSS injection, doesn't modify original file
- PDF: Built-in night mode in PDF renderer

### Reading History
- Auto-record last 20 opened files
- Quick re-open support

## 📄 License

MIT License
