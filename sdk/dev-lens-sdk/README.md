# Dev Lens SDK

SDK for integrating Dev Lens network and console monitoring into your React Native applications.

## Installation

```bash
npm install dev-lens-sdk
# or
yarn add dev-lens-sdk
# or
pnpm add dev-lens-sdk
```

## Quick Start

Add **one line** to your app entry point (e.g., `index.js`):

```javascript
import DevLens from 'dev-lens-sdk';

// That's it! One line to enable monitoring
new DevLens().init();
```

Now open the Dev Lens desktop app and you'll see all network requests and console logs in real-time!

## Configuration

```javascript
import DevLens from 'dev-lens-sdk';

const devLens = new DevLens({
  baseUrl: 'http://127.0.0.1:9527', // Dev Lens server URL
  enabled: __DEV__, // Only enable in development mode
});

devLens.init();
```

## How It Works

### React Native
- Uses React Native's official `XHRInterceptor` from `react-native/Libraries/Network/XHRInterceptor`
- Automatically detects React Native environment
- Captures all network requests (fetch, XMLHttpRequest, etc.)
- Intercepts WebSocket connections (connect, send, receive, close, error)
- Intercepts console logs (log, warn, error, info)

### Web
- Uses fetch interceptor for web environments
- Intercepts WebSocket connections
- Captures console logs

## API

### `new DevLens(options)`

Create a new Dev Lens instance.

**Options:**
- `baseUrl` (string): Dev Lens server URL. Default: `http://127.0.0.1:9527`
- `enabled` (boolean): Enable/disable monitoring. Default: `true`

### `devLens.init()`

Initialize all interceptors. This is the only method you need to call!

### `devLens.sendNetworkLog(request)`

Manually send a network log (advanced usage).

### `devLens.sendConsoleLog(log)`

Manually send a console log (advanced usage).

## Example

```javascript
// index.js
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import DevLens from 'dev-lens-sdk';

// Enable Dev Lens in development mode
if (__DEV__) {
  new DevLens().init();
}

AppRegistry.registerComponent(appName, () => App);
```

## Requirements

- React Native 0.60+
- Dev Lens desktop app running on your machine

## Troubleshooting

### Network requests not showing up?

1. Make sure Dev Lens desktop app is running
2. Check that your device/emulator can reach `http://127.0.0.1:9527`
3. For physical devices, use your computer's IP address:
   ```javascript
   new DevLens({ baseUrl: 'http://192.168.1.100:9527' }).init();
   ```

### Console logs not appearing?

Make sure you're calling `console.log`, `console.warn`, or `console.error` after initializing Dev Lens.

## License

MIT
