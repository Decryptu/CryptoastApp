# CryptoastApp

React Native mobile app for Cryptoast.fr, displaying crypto news articles using WordPress REST API.

## Prerequisites

- Bun (preferred package manager)
- Node.js (v20+)
- Xcode (for iOS)
- Android Studio (for Android)
- Watchman
- iOS Simulator
- Java Development Kit (JDK) for Android development

## Setup

```bash
# Install dependencies with Bun
bun install

# Configure NativeWind
bun add nativewind
bun add -D tailwindcss@3.3.2
```

## Development

```bash
# Start the development server
bun run start
# or
npx expo start

# Start iOS Simulator first (optional)
open -a Simulator

# Run on iOS
bun run ios
# or
npx expo run:ios

# Run on Android
bun run android
# or
npx expo run:android
```

### Simulator Shortcuts

- iOS: You can open the developer menu at any time with the ⌘ + D keyboard shortcut
- Android: Ctrl + M (Windows/Linux) or ⌘ + M (macOS)

## Building for Production

### iOS Build

```bash
# Create iOS build
bunx eas build --platform ios

# Build for TestFlight
bunx eas build --platform ios --profile preview

# Submit to App Store
bunx eas submit --platform ios

# Build for App Store
bunx eas build --platform ios --profile production
```

### Android Build

```bash
# Create Android build
bunx eas build --platform android

# Build APK for testing
bunx eas build --platform android --profile preview

# Submit to Play Store
bunx eas submit --platform android

# Build for Play Store
bunx eas build --platform android --profile production
```

### Build Profiles

Configure build profiles in `eas.json`:

- `development`: For development builds
- `preview`: For TestFlight/Internal testing
- `production`: For App Store/Play Store submission

## Project Structure

```t
CryptoastApp/
├── components/         # Reusable components
│   └── ArticleCard.tsx
├── services/          # API services
│   └── api.ts
├── types/            # TypeScript definitions
│   └── article.ts
├── App.tsx           # Main app component
├── package.json      # Dependencies and scripts
├── bun.lockb         # Bun lock file
├── babel.config.js   # Babel configuration
└── tailwind.config.js # TailwindCSS configuration
```

## Scripts in package.json

```json
{
  "scripts": {
    "start": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "web": "expo start --web"
  }
}
```

## API

The app uses the WordPress REST API from Cryptoast.fr:

- Articles endpoint: `https://cryptoast.fr/wp-json/wp/v2/posts`
- Pagination: `?page=1&per_page=10&_embed=true`

## Common Issues

### iOS

- Ensure Xcode and CocoaPods are up to date
- Run `pod install` in the `ios` directory if needed
- Check signing certificates in Xcode

### Android

- Verify Android SDK installation
- Check `local.properties` file exists with correct SDK path
- Ensure Gradle version is compatible

### Package Management

- Use `bun install` instead of `npm install` or `yarn`
- If you encounter any issues with native dependencies, try clearing Bun's cache with `bun pm cache rm`
