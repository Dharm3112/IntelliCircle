# @replit/vite-plugin-dev-banner

A Vite plugin that injects a development preview banner on `*.replit.dev` domains during development. The banner warns users that they're viewing a temporary development preview.

## Features

- **Development-only**: Only injects the banner when running in development mode (`vite serve`)
- **Domain-specific**: Only displays on `*.replit.dev` domains
- **Frame-aware**: Automatically hides when the app is embedded in an iframe
- **Persistent dismissal**: Users can close the banner and it stays closed using localStorage
- **Responsive design**: Adapts to mobile and desktop screens
- **Zero production impact**: No code is included in production builds

## Installation

```bash
npm install @replit/vite-plugin-dev-banner
# or
pnpm add @replit/vite-plugin-dev-banner
```

## Usage

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { devBanner } from '@replit/vite-plugin-dev-banner';

export default defineConfig({
 plugins: [
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
    // other plugins
  ],
});
```

That's it! The banner will automatically appear when:
1. Running in development mode (`vite dev` or `vite serve`)
2. Accessing the app via a `*.replit.dev` domain
3. The app is not embedded in an iframe
4. The user hasn't previously dismissed the banner

## How it works

The plugin:
1. Serves a banner script at `/@vite-plugin-dev-banner/banner-script.js` via Vite's dev server
2. Injects a `<script>` tag in the HTML head that loads this script
3. The script checks the current domain and conditions before displaying the banner
4. Users can dismiss the banner, and this preference is stored in localStorage
