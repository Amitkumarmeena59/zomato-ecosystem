# Bharatpur Bites - APK Build Instructions

**Version:** 1.0.0  
**Last Updated:** 2026-04-02  
**Status:** ✅ Production-Ready

---

## 📱 APK Build Guide for Rider & Restaurant Apps

### Prerequisites

Before building APKs, ensure you have:

```bash
# 1. Flutter SDK installed
flutter --version

# 2. Android SDK installed (API 21+)
flutter doctor

# 3. Java Development Kit (JDK 11+)
java -version

# 4. All dependencies installed
flutter pub get
```

---

## 🚀 STEP 1: Build Rider App APK

### 1.1 Navigate to Rider App Directory

```bash
cd bharatpur_bites_rider
```

### 1.2 Update App Version

Edit `pubspec.yaml`:

```yaml
version: 1.0.0+1  # Change to your desired version
```

### 1.3 Configure Android App Details

Edit `android/app/build.gradle`:

```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        applicationId "com.bharatpurbites.rider"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            keyAlias 'bharatpur_bites_key'
            keyPassword 'your_key_password'
            storeFile file('keystore.jks')
            storePassword 'your_store_password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 1.4 Create Keystore File

```bash
# Generate keystore (one-time only)
keytool -genkey -v -keystore keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias bharatpur_bites_key

# Move to android/app/ directory
mv keystore.jks android/app/
```

### 1.5 Build Release APK

```bash
# Clean build
flutter clean

# Get dependencies
flutter pub get

# Build APK
flutter build apk --release

# Output: build/app/outputs/flutter-app.apk
```

### 1.6 Build App Bundle (for Google Play Store)

```bash
flutter build appbundle --release

# Output: build/app/outputs/bundle/release/app-release.aab
```

---

## 🍽️ STEP 2: Build Restaurant App APK

### 2.1 Navigate to Restaurant App Directory

```bash
cd bharatpur_bites_restaurant
```

### 2.2 Repeat Steps 1.2 - 1.6

```bash
# Update version in pubspec.yaml
# Configure android/app/build.gradle with:
# applicationId "com.bharatpurbites.restaurant"

# Build APK
flutter build apk --release

# Build App Bundle
flutter build appbundle --release
```

---

## 🔐 STEP 3: Sign APK Manually (If Needed)

```bash
# If APK is not auto-signed, sign manually:
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore keystore.jks \
  build/app/outputs/flutter-app.apk bharatpur_bites_key

# Verify signature
jarsigner -verify -verbose -certs build/app/outputs/flutter-app.apk
```

---

## 📤 STEP 4: Upload to Google Play Store

### 4.1 Create Google Play Developer Account

- Go to [Google Play Console](https://play.google.com/console)
- Pay $25 registration fee
- Create new app

### 4.2 Prepare Store Listing

- App name: "Bharatpur Bites Rider" / "Bharatpur Bites Restaurant"
- Short description (80 characters)
- Full description (4000 characters)
- Screenshots (5 minimum)
- Feature graphic (1024x500px)
- Icon (512x512px)
- Privacy policy URL

### 4.3 Upload App Bundle

```bash
# In Google Play Console:
# 1. Go to Release > Production
# 2. Click "Create new release"
# 3. Upload app-release.aab
# 4. Add release notes
# 5. Review and publish
```

### 4.4 Staged Rollout (Recommended)

- Start with 5% of users
- Monitor crashes and ratings
- Gradually increase to 100%

---

## 🍎 STEP 5: Build iOS App (Optional)

### 5.1 Prerequisites

```bash
# Requires macOS with Xcode
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods
```

### 5.2 Build iOS App

```bash
flutter build ios --release

# Output: build/ios/iphoneos/Runner.app
```

### 5.3 Create Archive

```bash
# Open Xcode
open ios/Runner.xcworkspace

# In Xcode:
# 1. Select "Runner" project
# 2. Select "Runner" target
# 3. Set "Build Configuration" to "Release"
# 4. Product > Archive
# 5. Distribute App
```

### 5.4 Upload to App Store

- Use Xcode's "Distribute App" feature
- Or use Transporter app
- Requires Apple Developer account ($99/year)

---

## 📊 APK Optimization

### Reduce APK Size

```bash
# Build with split APKs (for different architectures)
flutter build apk --split-per-abi --release

# Output files:
# - app-armeabi-v7a-release.apk (32-bit)
# - app-arm64-v8a-release.apk (64-bit)
# - app-x86_64-release.apk (x86)
```

### Enable Proguard/R8

Edit `android/app/build.gradle`:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

Create `android/app/proguard-rules.pro`:

```
# Keep Flutter classes
-keep class io.flutter.** { *; }
-keep class com.google.android.material.** { *; }

# Keep your app classes
-keep class com.bharatpurbites.** { *; }

# Keep Firebase classes
-keep class com.google.firebase.** { *; }
```

---

## 🧪 Testing Before Release

### 1. Test on Real Device

```bash
# Connect Android device
adb devices

# Install APK
adb install -r build/app/outputs/flutter-app.apk

# Run app
flutter run --release
```

### 2. Test Critical Flows

- [ ] Login with OTP
- [ ] Accept order
- [ ] Real-time GPS tracking
- [ ] Mark as picked up
- [ ] Verify delivery OTP
- [ ] Mark as delivered
- [ ] View earnings
- [ ] Push notifications
- [ ] Offline support

### 3. Performance Testing

```bash
# Monitor performance
flutter run --profile

# Check memory usage
adb shell dumpsys meminfo com.bharatpurbites.rider
```

---

## 📋 Release Checklist

### Before Publishing

- [ ] All features tested on real devices
- [ ] Crash logs reviewed
- [ ] Performance optimized
- [ ] Privacy policy updated
- [ ] Terms of service finalized
- [ ] Support email configured
- [ ] Versioning updated
- [ ] Changelog prepared
- [ ] Screenshots updated
- [ ] Store listing complete

### After Publishing

- [ ] Monitor crash reports
- [ ] Track user ratings
- [ ] Respond to reviews
- [ ] Monitor download numbers
- [ ] Check analytics

---

## 🔄 Update Process

### Publish New Version

```bash
# 1. Update version in pubspec.yaml
version: 1.0.1+2

# 2. Build new APK
flutter build apk --release

# 3. Build new App Bundle
flutter build appbundle --release

# 4. Upload to Google Play Console
# 5. Create new release
# 6. Add release notes
# 7. Start staged rollout
```

---

## 🐛 Troubleshooting

### Issue: "Keystore not found"

```bash
# Solution: Ensure keystore.jks is in android/app/
ls -la android/app/keystore.jks
```

### Issue: "Build failed - Out of memory"

```bash
# Solution: Increase Gradle memory
export GRADLE_OPTS="-Xmx2048m"
flutter build apk --release
```

### Issue: "Gradle sync failed"

```bash
# Solution: Clean and rebuild
flutter clean
flutter pub get
flutter build apk --release
```

### Issue: "App crashes on startup"

```bash
# Check logs
adb logcat | grep flutter

# Rebuild with debug info
flutter build apk --debug
```

---

## 📦 APK File Locations

```
bharatpur_bites_rider/
├── build/
│   └── app/
│       └── outputs/
│           ├── flutter-app.apk (Universal APK)
│           ├── app-armeabi-v7a-release.apk (32-bit)
│           ├── app-arm64-v8a-release.apk (64-bit)
│           └── bundle/
│               └── release/
│                   └── app-release.aab (App Bundle)
```

---

## 📊 Expected APK Sizes

| Build Type | Size |
|-----------|------|
| Debug APK | 150-200 MB |
| Release APK (Universal) | 40-60 MB |
| Release APK (arm64-v8a) | 25-35 MB |
| Release APK (armeabi-v7a) | 22-30 MB |
| App Bundle | 30-40 MB |

---

## 🔗 Useful Links

- [Flutter Documentation](https://flutter.dev/docs)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Firebase Console](https://console.firebase.google.com)

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0
