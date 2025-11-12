# Dev Lens

<div align="center">
  <img src="https://raw.githubusercontent.com/ICEPepsiCola/react-native-dev-lens/main/public/logo.svg" width="120" height="120" alt="Dev Lens Logo">
  <p><strong>An elegant network monitoring tool for developers</strong></p>
  <p>Real-time monitoring of network requests and console logs with dark/light theme support</p>
  <p>
    <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
  </p>
</div>

## 📦 Project Structure

- **Root** - Tauri desktop application
- **sdk/** - React Native SDK (published to NPM as `react-native-dev-lens`)

## ✨ Features

- � **国 Network Monitoring** - Real-time capture of HTTP requests and WebSocket connections
- � **\*Detailed Information** - View request/response headers, body, CORS status, etc.
- 🎨 **Theme Switching** - Support for dark/light mode with modern UI
- 🌍 **Internationalization** - English/Chinese language support
- � **Smart Filtering** - Filter by URL and request type
- 💻 **Console Logs** - Capture and display application logs (info/warn/error)

## 🚀 Quick Start

### For Users (React Native Developers)

1. **Download Dev Lens App**

   Download the latest release from [GitHub Releases](https://github.com/ICEPepsiCola/react-native-dev-lens/releases)

2. **Install SDK in your React Native project**

   ```bash
   npm install react-native-dev-lens
   # or
   yarn add react-native-dev-lens
   # or
   pnpm add react-native-dev-lens
   ```

3. **Add one line to your app entry point** (e.g., `index.js` or `App.js`)

   ```javascript
   import DevLens from "react-native-dev-lens";

   // That's it! One line to enable monitoring
   new DevLens().init();
   ```

4. **Open Dev Lens App**

   Launch the Dev Lens desktop app, and you'll see all network requests and console logs in real-time!

### Configuration (Optional)

```javascript
import DevLens from "react-native-dev-lens";

// Only enable in development mode
if (__DEV__) {
  new DevLens().init();
}
```

## 📦 What's Included

- **Dev Lens App** - Desktop application (macOS/Windows/Linux)
- **react-native-dev-lens** - NPM package for easy integration

## 🛠️ For Contributors

### Prerequisites

- Node.js 18+
- Rust 1.70+
- pnpm

### Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

### Project Structure

```
dev-lens/
├── src/                    # Frontend source code
│   ├── App.tsx            # Main application component
│   ├── i18n.ts            # Internationalization config
│   └── assets/            # Static assets
├── src-tauri/             # Tauri backend
│   ├── src/
│   │   └── lib.rs         # Rust backend with HTTP server
│   └── icons/             # Application icons
├── sdk/                   # SDK for integration
│   └── react-native-dev-lens/      # NPM package
└── public/                # Public assets
```

## 🔧 Technical Stack

- **Frontend**: React 19 + TypeScript
- **Desktop Framework**: Tauri 2.0
- **UI Components**: DaisyUI + Tailwind CSS
- **Backend**: Rust + Axum (HTTP server on port 9527)
- **Internationalization**: i18next + react-i18next
- **Build Tool**: Vite

## 📡 How It Works

1. Dev Lens app starts an HTTP server on `http://127.0.0.1:9527`
2. The SDK uses React Native's official `XHRInterceptor` to capture network requests
3. The SDK intercepts console logs (log, warn, error, info)
4. The SDK sends data to Dev Lens via HTTP POST requests
5. Dev Lens displays the data in real-time with a beautiful UI

**Note:** For physical devices, you'll need to use your computer's IP address instead of `127.0.0.1`

## 🎯 Use Cases

- Debug network requests during development
- View API response data and headers
- Track WebSocket connections
- Monitor application log output
- Check CORS configuration
- Inspect request/response timing

## 📝 API Endpoints

Dev Lens exposes the following HTTP endpoints:

- `POST http://127.0.0.1:9527/api/network` - Receive network logs
- `POST http://127.0.0.1:9527/api/console` - Receive console logs

## 🌟 Why Dev Lens?

- **Zero Configuration** - Just one line of code to integrate
- **Non-Intrusive** - Doesn't affect your app's performance
- **Beautiful UI** - Modern design with dark/light theme
- **Cross-Platform** - Works on macOS, Windows, and Linux
- **Open Source** - Free and open source

## 📄 License

MIT License

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 🔗 Links

- [GitHub Repository](https://github.com/ICEPepsiCola/react-native-dev-lens)
- [Issue Tracker](https://github.com/ICEPepsiCola/react-native-dev-lens/issues)
- [Releases](https://github.com/ICEPepsiCola/react-native-dev-lens/releases)

---

<div align="center">
  Made with ❤️ by Dev Lens Team
</div>
