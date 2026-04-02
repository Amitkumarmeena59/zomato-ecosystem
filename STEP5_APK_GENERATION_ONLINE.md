# Bharatpur Bites - APK Generation Guide (Online Compilers)

**Version:** 1.0.0  
**Status:** Production-Ready  
**Method:** No Heavy PC Required (Cloud-based)

---

## 🎯 Overview

Generate APK without needing Android Studio or heavy PC using:
- **Codemagic** (Recommended - Free tier available)
- **FlutLab** (Browser-based)
- **AppMySoft** (Simple UI)

---

## 🚀 Method 1: Codemagic (Recommended)

### Step 1: Setup Codemagic

1. Go to [codemagic.io](https://codemagic.io)
2. Sign up with GitHub/GitLab account
3. Connect your Flutter repository

### Step 2: Create Build Configuration

1. Click "New app"
2. Select your Flutter repository
3. Click "Start your first build"

### Step 3: Configure Build Settings

**Create `codemagic.yaml` in project root:**

```yaml
workflows:
  android-release:
    name: Android Release Build
    instance_type: mac_mini
    max_build_duration: 120
    environment:
      android_signing:
        - bharatpur_bites_key
      vars:
        PACKAGE_NAME: "com.bharatpurbites.rider"
        BUNDLE_ID: "com.bharatpurbites.rider"
    scripts:
      - name: Set up local.properties
        script: |
          echo "flutter.sdk=$HOME/programs/flutter" > android/local.properties
      - name: Get Flutter packages
        script: |
          flutter pub get
      - name: Build APK
        script: |
          flutter build apk \
            --release \
            --build-name=1.0.0 \
            --build-number=$BUILD_NUMBER
    artifacts:
      - build/app/outputs/flutter-app.apk
    publishing:
      email:
        recipients:
          - your-email@example.com
        notify:
          success: true
          failure: true
```

### Step 4: Upload Keystore

1. Go to Codemagic > Team settings > Android signing
2. Upload your `keystore.jks` file
3. Enter keystore password
4. Enter key alias and password

**Don't have keystore? Create one:**

```bash
# On your local PC
keytool -genkey -v -keystore keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias bharatpur_bites_key

# Then upload to Codemagic
```

### Step 5: Start Build

1. Click "Build"
2. Wait for build to complete (5-10 minutes)
3. Download APK from artifacts

### Step 6: Download APK

```
Codemagic Dashboard → Your App → Latest Build → Download APK
```

---

## 🎯 Method 2: FlutLab (Browser-Based)

### Step 1: Setup FlutLab

1. Go to [flutlab.io](https://flutlab.io)
2. Sign up with Google/GitHub
3. Create new project

### Step 2: Upload Code

1. Click "Import from GitHub"
2. Select your repository
3. Wait for code to load

### Step 3: Configure Build

1. Go to Settings > Android
2. Upload keystore file
3. Enter keystore details

### Step 4: Build APK

1. Click "Build APK"
2. Wait for build (10-15 minutes)
3. Download from "Artifacts"

---

## 📱 Method 3: AppMySoft (Simplest)

### Step 1: Setup

1. Go to [appmysoft.com](https://appmysoft.com)
2. Upload your Flutter project (ZIP file)
3. Select "Android APK"

### Step 2: Configure

1. Enter app name: "Bharatpur Bites Rider"
2. Package name: "com.bharatpurbites.rider"
3. Upload keystore

### Step 3: Build

1. Click "Build"
2. Wait for email with download link
3. Download APK

---

## 🔑 Generate Keystore (If Needed)

### On Windows/Mac/Linux:

```bash
# Generate keystore
keytool -genkey -v -keystore bharatpur_bites.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias bharatpur_bites_key

# When prompted, enter:
# Keystore password: your_password
# Key password: your_password
# Name: Bharatpur Bites
# Organizational Unit: Engineering
# Organization: Bharatpur Bites
# City: Agra
# State: UP
# Country: IN
```

### Save keystore details:

```
Keystore file: bharatpur_bites.jks
Keystore password: your_password
Key alias: bharatpur_bites_key
Key password: your_password
```

---

## 📦 APK File Structure

After build completes, you'll get:

```
build/app/outputs/
├── flutter-app.apk (Universal APK - 40-60 MB)
├── app-armeabi-v7a-release.apk (32-bit - 25-35 MB)
├── app-arm64-v8a-release.apk (64-bit - 25-35 MB)
└── app-x86_64-release.apk (x86 - 30-40 MB)
```

**Recommended:** Download `app-arm64-v8a-release.apk` (most compatible)

---

## 🧪 Test APK Before Release

### Install on Test Device

```bash
# Connect Android device
adb devices

# Install APK
adb install build/app/outputs/flutter-app.apk

# Uninstall
adb uninstall com.bharatpurbites.rider
```

### Test Checklist

- [ ] App launches without crash
- [ ] OTP login works
- [ ] GPS tracking works
- [ ] Push notifications work
- [ ] Order acceptance works
- [ ] Delivery OTP verification works
- [ ] App works offline
- [ ] No memory leaks

---

## 📤 Upload to Google Play Store

### Step 1: Create Developer Account

1. Go to [play.google.com/console](https://play.google.com/console)
2. Pay $25 registration fee
3. Create new app

### Step 2: Prepare Store Listing

**App Information:**
- App name: "Bharatpur Bites Rider"
- Short description: "Earn money delivering food"
- Full description: (4000 characters max)
- Category: "Lifestyle"

**Screenshots (5 minimum):**
- Home screen
- Order acceptance
- GPS tracking
- Earnings dashboard
- Delivery completion

**Graphics:**
- Feature graphic: 1024x500px
- Icon: 512x512px
- Banner: 1280x720px

### Step 3: Upload APK

1. Go to Release > Production
2. Click "Create new release"
3. Upload `app-arm64-v8a-release.apk`
4. Add release notes
5. Review and publish

### Step 4: Staged Rollout (Recommended)

1. Start with 5% of users
2. Monitor crashes for 2 days
3. Increase to 25%
4. Increase to 50%
5. Increase to 100%

---

## 🔄 Update APK (New Version)

### Step 1: Update Version

Edit `pubspec.yaml`:

```yaml
version: 1.0.1+2  # Increment build number
```

### Step 2: Rebuild

1. Go to Codemagic
2. Click "Build"
3. Wait for new APK

### Step 3: Upload to Play Store

1. Go to Release > Production
2. Click "Create new release"
3. Upload new APK
4. Update version notes
5. Publish

---

## 📊 Expected Build Times

| Method | Time | Cost |
|--------|------|------|
| Codemagic | 5-10 min | Free (5 builds/month) |
| FlutLab | 10-15 min | Free |
| AppMySoft | 15-20 min | Free |
| Local PC | 10-20 min | Free (but needs setup) |

---

## 🐛 Troubleshooting

### Issue: "Build failed - Gradle error"

**Solution:**
```bash
# Clean build
flutter clean
flutter pub get
flutter build apk --release
```

### Issue: "Keystore not found"

**Solution:**
1. Upload keystore to cloud builder
2. Or generate new keystore
3. Re-upload and retry

### Issue: "APK not downloading"

**Solution:**
1. Check email for download link
2. Try different browser
3. Contact support

### Issue: "App crashes on startup"

**Solution:**
1. Check logs: `flutter logs`
2. Rebuild with debug info
3. Test on emulator first

---

## 🚀 Continuous Integration (CI/CD)

### Auto-build on GitHub Push

**Create `.github/workflows/build.yml`:**

```yaml
name: Build APK

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.13.0'
    
    - name: Get dependencies
      run: flutter pub get
    
    - name: Build APK
      run: flutter build apk --release
    
    - name: Upload APK
      uses: actions/upload-artifact@v2
      with:
        name: app-release.apk
        path: build/app/outputs/flutter-app.apk
```

---

## 📋 Pre-Release Checklist

- [ ] All features tested
- [ ] No crashes or errors
- [ ] Performance optimized
- [ ] Privacy policy updated
- [ ] Terms of service finalized
- [ ] Support email configured
- [ ] Version number updated
- [ ] Changelog prepared
- [ ] Screenshots updated
- [ ] Store listing complete
- [ ] Keystore backed up
- [ ] Release notes written

---

## 📞 Support

- **Codemagic Support:** support@codemagic.io
- **FlutLab Support:** support@flutlab.io
- **Flutter Docs:** flutter.dev/docs

---

## 🎯 Next Steps

1. ✅ Generate APK using Codemagic
2. ✅ Test on real device
3. ✅ Upload to Google Play Store
4. ✅ Monitor crash reports
5. ✅ Update regularly

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0
