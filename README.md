# CryptoastApp

React Native mobile app for Cryptoast.fr, displaying crypto news articles using WordPress REST API.

## Prerequisites

- Node.js (v20+)
- Bun
- Xcode (for iOS)
- Watchman
- iOS Simulator

## Setup

```bash
# Install dependencies
bun install

# Configure NativeWind
bun add nativewind
bun add -D tailwindcss@3.3.2
```

## Development

```bash
# Start iOS Simulator first (required)
open -a Simulator

# Then run the app
bun run ios
```

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
├── babel.config.js   # Babel configuration
└── tailwind.config.js # TailwindCSS configuration
```

## API

The app uses the WordPress REST API from Cryptoast.fr:

- Articles endpoint: `https://cryptoast.fr/wp-json/wp/v2/posts`
- Pagination: `?page=1&per_page=10&_embed=true`
