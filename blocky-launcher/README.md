# BlockyLauncher

**The cleanest way to run your Hytale server.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Built with Wails](https://img.shields.io/badge/Built%20with-Wails%20v2-blue)](https://wails.io)
[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8)](https://go.dev)

> **Not affiliated with Hypixel Studios or the Hytale game.** "Hytale" is a trademark of Hypixel Studios. BlockyLauncher is an independent third-party tool developed by Favela Tech LLC.

---

## Overview

BlockyLauncher is a free, open-source desktop application for Hytale server operators. It provides a beautiful, intuitive GUI for managing your server lifecycle — from one-click start/stop to drag-and-drop plugin management and BlockyMarketplace account integration.

**Built by [Favela Tech LLC](https://blockymarketplace.com) — creators of [BlockyMarketplace](https://blockymarketplace.com) and [BlockyNetworks](https://blockynetworks.com).**

### Features

- **Server Management** — Start, stop, restart your Hytale server with one click
- **Live Terminal** — See server output in real-time, send commands directly
- **Plugin Management** — Drag-and-drop `.jar` installation, enable/disable, remove
- **BlockyMarketplace Integration** — Sign in to load your purchased plugins directly to your server
- **BlockyNetworks Integration** — Manage your BlockyNetworks companion plugin
- **Auto-detect Java** — Automatically finds your Java installation
- **Multi-server Profiles** — Manage multiple server configurations
- **Apple Liquid Glass UI** — Premium macOS-inspired visual design
- **First-launch Onboarding** — Guided setup for new users

---

## Screenshots

> Screenshots coming in v1.0 release.

---

## Installation

### Download

Download the latest release for your platform from the [GitHub Releases](https://github.com/Chewy42/blocky-launcher/releases) page:

| Platform | Download |
|---|---|
| macOS (Apple Silicon) | `BlockyLauncher_darwin_arm64.dmg` |
| macOS (Intel) | `BlockyLauncher_darwin_amd64.dmg` |
| Windows | `BlockyLauncher_windows_amd64_installer.exe` |
| Linux | `BlockyLauncher_linux_amd64.tar.gz` |

### Requirements

- **Java 17+** — Required to run the Hytale server (BlockyLauncher can auto-detect this)
- **macOS 12+**, **Windows 10/11**, or **Ubuntu 20.04+**
- 4GB RAM minimum (8GB+ recommended for server + launcher)

---

## Development

### Prerequisites

- [Go 1.22+](https://go.dev/dl/)
- [Node.js 18+](https://nodejs.org/)
- [Wails v2](https://wails.io/docs/gettingstarted/installation)

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### Setup

```bash
# Clone the repository
git clone https://github.com/Chewy42/blocky-launcher.git
cd blocky-launcher

# Install frontend dependencies
cd frontend && npm install && cd ..

# Run in development mode (hot reload)
wails dev
```

### Build

```bash
# Build for current platform
wails build

# Build for all platforms (requires cross-compilation setup)
./scripts/build-all.sh
```

### Project Structure

```
blocky-launcher/
├── main.go                   # Wails entry point
├── app.go                    # App struct, all Go↔JS bindings
├── internal/
│   ├── server/               # Server process management
│   ├── plugins/              # Plugin scanning and installation
│   ├── auth/                 # BlockyMarketplace/Networks auth
│   ├── marketplace/          # BlockyMarketplace API client
│   ├── networks/             # BlockyNetworks API client
│   ├── terminal/             # Terminal line buffer
│   ├── filewatcher/          # fsnotify wrapper for mods/ dir
│   └── config/               # App config persistence
├── frontend/
│   └── src/
│       ├── components/       # React components (layout, server, plugins, terminal, auth, ui)
│       ├── pages/            # Page views (Dashboard, Plugins, Terminal, Account, Settings)
│       ├── store/            # Zustand state stores
│       ├── hooks/            # React hooks
│       ├── styles/           # CSS (Tailwind + glass design system)
│       └── lib/              # Wails bindings + utilities
└── build/                    # Platform-specific build assets
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Go 1.22+ |
| Desktop Shell | Wails v2 |
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS v3 + custom glassmorphism CSS |
| Animations | Framer Motion |
| State | Zustand |
| File Watching | fsnotify |

---

## Legal

- **License:** [MIT](LICENSE) — See license file for important notices about brand ownership
- **Terms of Service:** [TERMS.md](TERMS.md) | https://blockymarketplace.com/terms
- **Privacy Policy:** [PRIVACY.md](PRIVACY.md) | https://blockymarketplace.com/privacy

**Copyright © 2026 Favela Tech LLC. All Rights Reserved.**

The MIT license applies to the source code. The BlockyLauncher, BlockyMarketplace, and BlockyNetworks brand names, logos, and visual assets remain the exclusive property of Favela Tech LLC.

> BlockyLauncher is not affiliated with Hypixel Studios. "Hytale" is a trademark of Hypixel Studios. All trademarks belong to their respective owners.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

To report a security vulnerability, email: **security@blockymarketplace.com**

Do not open a public GitHub issue for security vulnerabilities.
