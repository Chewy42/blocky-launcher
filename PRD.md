# PRD: BlockyLauncher — Hytale Server Manager
**Product Requirements Document v1.0**
**Owner:** Favela Tech LLC
**Last Updated:** 2026-02-20
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Company & Legal Context](#2-company--legal-context)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [Target Audience](#4-target-audience)
5. [Technical Architecture](#5-technical-architecture)
6. [Design System — Apple Liquid Glass Aesthetic](#6-design-system--apple-liquid-glass-aesthetic)
7. [Feature Specifications](#7-feature-specifications)
8. [User Flows](#8-user-flows)
9. [API Integration](#9-api-integration)
10. [Data Models](#10-data-models)
11. [Legal, Privacy & Disclaimers](#11-legal-privacy--disclaimers)
12. [Open Source Strategy](#12-open-source-strategy)
13. [Testing Requirements](#13-testing-requirements)
14. [Release Checklist](#14-release-checklist)
15. [Future Roadmap](#15-future-roadmap)

---

## 1. Executive Summary

**BlockyLauncher** is a free, open-source desktop application built by Favela Tech LLC that provides Hytale server operators with a beautiful, intuitive GUI for managing their server lifecycle. It combines drag-and-drop plugin management, an integrated terminal, BlockyMarketplace and BlockyNetworks account integration, and one-click server start/stop — all wrapped in a premium Apple-inspired "liquid glass" visual aesthetic.

The app is the official companion tool for the BlockyMarketplace and BlockyNetworks platforms, enabling players and server owners to:
- Load purchased/claimed plugins directly from their account into their server
- Manage the local Hytale server process with a live terminal
- Organize, add, and remove .jar plugin files via drag-and-drop

**Elevator pitch:** "The cleanest way to run your Hytale server."

---

## 2. Company & Legal Context

- **Company:** Favela Tech LLC
- **Owner:** Matt Favela
- **Products:** BlockyMarketplace (`blockymarketplace.com`), BlockyNetworks (`blockynetworks.com`)
- **All intellectual property**, source code, design assets, branding, trademarks, and copyrights for BlockyLauncher are exclusively owned by Favela Tech LLC and Matt Favela.
- **Not affiliated with Hypixel Studios or the Hytale game.** All Hytale game assets, names, and trademarks are property of Hypixel Studios. BlockyLauncher is an independent third-party tool.

### IP Ownership Statement
Every file in this repository carries an implicit copyright notice:
> Copyright © 2026 Favela Tech LLC. All rights reserved.

The open-source MIT license grants usage rights to end users but does **not** transfer ownership of the BlockyLauncher brand, BlockyMarketplace brand, BlockyNetworks brand, or associated visual assets (logos, icons, color palette) from Favela Tech LLC.

---

## 3. Product Vision & Goals

### Vision
Make Hytale server management feel as polished and effortless as using a native macOS app — with zero terminal expertise required, yet powerful enough for advanced users.

### Primary Goals
1. **Reduce friction** to zero for loading purchased BlockyMarketplace plugins onto a server
2. **Provide a premium, brand-aligned UI** that makes BlockyMarketplace/BlockyNetworks look world-class
3. **Serve as a growth funnel** — new server owners discover BlockyMarketplace through the "Load from account" feature
4. **Open source credibility** — a high-quality public repo builds developer trust and community

### Success Metrics
- App downloads within 90 days of launch: >500
- BlockyMarketplace/BlockyNetworks account sign-ins via app: >200
- GitHub stars within 90 days: >100
- Reported crashes or critical bugs at launch: 0

---

## 4. Target Audience

### Primary: Hytale Server Operators
- Age: 16–30
- Technical comfort: Intermediate (can run a .jar, edit config files)
- Pain points: Juggling file explorer + terminal + browser to manage plugins; hard to remember which plugins are loaded; no visibility into server state
- Desire: Something that "just works" and looks great

### Secondary: Plugin Developers
- Want a quick way to drop their in-development .jar onto a running server
- Value drag-and-drop + live terminal output

### Tertiary: New/Casual Server Owners
- May have never run a server before
- Need the server start configuration wizard to be bulletproof
- Will be most likely to create a BlockyMarketplace account through the app

---

## 5. Technical Architecture

### Stack
| Layer | Technology | Rationale |
|---|---|---|
| Backend / Core | **Go 1.22+** | Fast, single-binary distribution, excellent process/OS APIs, cross-platform |
| Desktop Shell | **Wails v2** | Go + web frontend bridge, native window chrome, OS integrations |
| Frontend | **React 18 + TypeScript** | Component model fits complex UI; broad ecosystem |
| Styling | **Tailwind CSS v3 + custom CSS** | Utility-first, pairs with glassmorphism custom classes |
| Animations | **Framer Motion** | Fluid, spring-based transitions |
| State | **Zustand** | Lightweight, predictable state for plugin list / server state |
| HTTP Client | **Go net/http** | API calls to BlockyMarketplace / BlockyNetworks Convex |
| File Watching | **Go fsnotify** | Detect .jar changes in mods/ folder |
| IPC | **Wails event bus** | Go → React real-time updates (terminal output, plugin list) |
| Build | **Wails CLI** | Cross-platform builds for macOS, Windows, Linux |

### Process Architecture

```
┌─────────────────────────────────────────────────────┐
│                   BlockyLauncher                    │
│                                                     │
│  ┌─────────────────┐     ┌─────────────────────┐   │
│  │   React UI      │◄────│   Wails Bridge      │   │
│  │  (TypeScript)   │────►│   (Go ↔ JS IPC)     │   │
│  └─────────────────┘     └──────────┬──────────┘   │
│                                     │               │
│                          ┌──────────▼──────────┐   │
│                          │   Go Backend Core   │   │
│                          │                     │   │
│                          │  ServerManager      │   │
│                          │  PluginManager      │   │
│                          │  AuthService        │   │
│                          │  FileWatcher        │   │
│                          │  TerminalBridge     │   │
│                          │  ConfigStore        │   │
│                          └──────────┬──────────┘   │
│                                     │               │
│              ┌──────────────────────┼──────────────┐│
│              ▼                      ▼              ▼│
│         Local FS              Hytale Server   BlockyMarketplace│
│         (mods/, jars)         (OS Process)    / BlockyNetworks │
│                                               Convex APIs      │
└─────────────────────────────────────────────────────┘
```

### File Structure

```
hytale-plugin-ui/
├── PRD.md
├── README.md
├── LICENSE                     (MIT)
├── go.mod
├── go.sum
├── main.go                     (Wails entry)
├── app.go                      (App struct, Wails bindings)
├── wails.json
├── internal/
│   ├── server/
│   │   ├── manager.go          (start/stop/detect Hytale server process)
│   │   └── config.go           (server launch config: jar path, args, JVM flags)
│   ├── plugins/
│   │   ├── manager.go          (scan mods/, install, remove .jars)
│   │   └── metadata.go         (parse plugin manifest from .jar)
│   ├── auth/
│   │   ├── service.go          (OAuth / token flow for BlockyMarketplace + BlockyNetworks)
│   │   └── token_store.go      (secure OS keychain storage)
│   ├── marketplace/
│   │   ├── client.go           (BlockyMarketplace Convex API calls)
│   │   └── models.go           (Plugin, Purchase, Server structs)
│   ├── networks/
│   │   ├── client.go           (BlockyNetworks Convex API calls)
│   │   └── models.go           (Server, Org structs)
│   ├── terminal/
│   │   └── bridge.go           (pty bridge for server stdin/stdout)
│   ├── filewatcher/
│   │   └── watcher.go          (fsnotify wrapper for mods/ dir)
│   └── config/
│       └── store.go            (app config: server path, window state, prefs)
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── store/              (Zustand stores)
│   │   │   ├── serverStore.ts
│   │   │   ├── pluginStore.ts
│   │   │   └── authStore.ts
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TitleBar.tsx
│   │   │   │   └── MainPanel.tsx
│   │   │   ├── server/
│   │   │   │   ├── ServerCard.tsx
│   │   │   │   ├── StartStopButton.tsx
│   │   │   │   ├── ServerConfigModal.tsx
│   │   │   │   └── StatusIndicator.tsx
│   │   │   ├── plugins/
│   │   │   │   ├── PluginList.tsx
│   │   │   │   ├── PluginCard.tsx
│   │   │   │   ├── DropZone.tsx
│   │   │   │   └── AccountPlugins.tsx
│   │   │   ├── terminal/
│   │   │   │   └── Terminal.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginModal.tsx
│   │   │   │   └── AccountBadge.tsx
│   │   │   └── ui/
│   │   │       ├── GlassCard.tsx
│   │   │       ├── GlassButton.tsx
│   │   │       ├── GlassModal.tsx
│   │   │       └── AnimatedBadge.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Plugins.tsx
│   │   │   ├── Terminal.tsx
│   │   │   ├── Account.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   │   ├── useServer.ts
│   │   │   ├── usePlugins.ts
│   │   │   ├── useTerminal.ts
│   │   │   └── useAuth.ts
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── glass.css       (liquid glass CSS primitives)
│   │   └── lib/
│   │       ├── wails.ts        (typed Wails bindings)
│   │       └── utils.ts
│   └── public/
│       ├── logo.svg
│       └── fonts/
├── build/
│   ├── appicon.png
│   ├── darwin/                 (macOS app bundle assets)
│   └── windows/                (Windows installer assets)
└── scripts/
    ├── build-all.sh
    └── release.sh
```

---

## 6. Design System — Apple Liquid Glass Aesthetic

### Design Philosophy
BlockyLauncher uses a design language inspired by Apple's **visionOS / macOS Sequoia liquid glass** visual style:
- Deep, layered translucency
- Multi-stop glassmorphism backgrounds
- Vivid accent colors that feel "lit from within"
- Smooth spring-physics animations — nothing hard-cuts
- Generous whitespace and clear typographic hierarchy
- Ambient light simulation on card edges

### Color Palette

```css
/* Brand */
--blocky-green:    #19B36B;   /* Primary CTA, active indicators */
--blocky-green-glow: rgba(25, 179, 107, 0.35);

/* Glass surfaces */
--glass-bg:        rgba(255, 255, 255, 0.08);
--glass-bg-hover:  rgba(255, 255, 255, 0.13);
--glass-border:    rgba(255, 255, 255, 0.18);
--glass-border-active: rgba(255, 255, 255, 0.35);
--glass-shadow:    rgba(0, 0, 0, 0.4);

/* App backgrounds */
--bg-base:         #0A0A0F;   /* Near-black deep space */
--bg-gradient-1:   #0D1117;
--bg-gradient-2:   #111827;

/* Text */
--text-primary:    rgba(255, 255, 255, 0.95);
--text-secondary:  rgba(255, 255, 255, 0.60);
--text-muted:      rgba(255, 255, 255, 0.35);

/* Status */
--status-running:  #19B36B;
--status-stopped:  rgba(255, 255, 255, 0.35);
--status-error:    #E03A3E;
--status-warning:  #F2B705;
```

### Typography
- **Display / Headings:** SF Pro Display (macOS) / Inter (fallback) — semibold, tracked
- **Body:** SF Pro Text / Inter — regular 14–15px
- **Mono / Terminal:** JetBrains Mono — terminal output, file paths
- Weights: 400 (body), 500 (labels), 600 (headings), 700 (CTA)

### Glass Component Spec

```css
/* GlassCard — base reusable surface */
.glass-card {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),  /* top-edge light */
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);         /* bottom-edge shadow */
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.20);
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.20),
    0 0 0 1px rgba(25, 179, 107, 0.15);  /* subtle green ring on hover */
}

/* GlassButton — primary CTA */
.glass-button-primary {
  background: linear-gradient(135deg,
    rgba(25, 179, 107, 0.85),
    rgba(16, 130, 80, 0.90));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(25, 179, 107, 0.5);
  border-radius: 12px;
  box-shadow:
    0 4px 20px rgba(25, 179, 107, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  color: white;
  font-weight: 600;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.glass-button-primary:active {
  transform: scale(0.97);
}
```

### Window Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [●][●][●]  BlockyLauncher          [Server: MyServer ▼]  [▸ Run]│  ← TitleBar (custom, native-style)
├──────────┬───────────────────────────────────────────────────────┤
│          │                                                        │
│ SIDEBAR  │           MAIN PANEL                                  │
│          │                                                        │
│ ▸ Server │  ┌──────────────────────────────────────────────────┐ │
│ ▸ Plugins│  │  Server Card                                     │ │
│ ▸ Terminal│  │  myfolder/HytaleServer.jar  [●Running] [■ Stop] │ │
│ ▸ Account│  └──────────────────────────────────────────────────┘ │
│          │                                                        │
│ ─────── │  ┌──────────────────────────────────────────────────┐ │
│ [Avatar] │  │  Plugins (8 loaded)        [+ Add]  [Account ↓] │ │
│ [Login]  │  │                                                  │ │
│          │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │ │
│          │  │  │Plugin│ │Plugin│ │Plugin│ │Plugin│ ...       │ │
│          │  │  └──────┘ └──────┘ └──────┘ └──────┘          │ │
│          │  │                                                  │ │
│          │  │  ┌──────────────────────────────────────────┐  │ │
│          │  │  │     Drop .jar files here to install      │  │ │
│          │  │  └──────────────────────────────────────────┘  │ │
│          │  └──────────────────────────────────────────────────┘ │
│          │                                                        │
└──────────┴───────────────────────────────────────────────────────┘
```

### Animation Spec
| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Page transition | Fade + slide Y(+8px → 0) | 220ms | ease-out |
| Modal open | Scale(0.96→1) + fade | 200ms | spring(300, 28) |
| Plugin card mount | Stagger fade-up per card | 60ms stagger | ease-out |
| Start button press | Scale(1→0.96→1) + glow pulse | 180ms | spring |
| Plugin drop | Scale border glow + card fly-in | 300ms | spring |
| Status dot | Pulse keyframe (running) | 2s | ease-in-out loop |

---

## 7. Feature Specifications

### 7.1 Server Folder Selection & Configuration

**Description:** The user selects the root folder of their Hytale server installation. BlockyLauncher remembers this path and uses it as the working directory for all operations.

**Behavior:**
- On first launch: full-screen onboarding wizard → "Select your server folder"
- File picker opens to a native OS dialog
- App validates that the selected folder contains a valid server structure (looks for `.jar` files at root or a `server.jar` / `HytaleServer.jar` pattern)
- If no valid server jar found: warning banner with "Configure manually" option
- Server folder path stored in app config (persistent)
- Multiple server profiles supported (advanced): each profile has a name, folder path, and launch config

**Server Config Fields:**
```
serverName:    string        (display name)
serverFolder:  string        (absolute path to server root)
serverJar:     string        (relative path to main server .jar)
jvmArgs:       []string      (e.g. ["-Xmx4G", "-Xms1G"])
programArgs:   []string      (args passed to the server jar)
javaPath:      string        (auto-detected or manually set)
modsFolder:    string        (default: serverFolder/mods)
autoDetect:    bool          (whether to auto-detect from folder structure)
```

**Auto-detection logic (Go):**
1. Scan folder for `*.jar` files at root
2. Check for `mods/` subdirectory
3. Check for `eula.txt` (strong Hytale/Minecraft server signal)
4. Check for `server.properties` or `config/` folder
5. Score candidates and pre-fill ServerJar field with highest match

---

### 7.2 Plugin Management

**Description:** Displays all `.jar` files in the server's `mods/` directory as visual plugin cards, and supports drag-and-drop installation of new plugins.

**Plugin Card UI:**
- Displays: plugin name (parsed from manifest or filename), version if available, file size, source badge (local / BlockyMarketplace / BlockyNetworks)
- Toggle switch: enable/disable (moves .jar to/from `mods/disabled/` folder)
- Delete button (with confirmation dialog)
- Open folder button

**Drag and Drop:**
- Drop zone visible at bottom of plugin list
- Full-window drop target when dragging (whole window highlights with glass border glow)
- On drop: copy .jar to `mods/` folder → file watcher triggers → plugin list refreshes with animation
- Supports multiple .jar files dropped simultaneously
- Shows progress for large files

**File Watcher:**
- Uses `fsnotify` to watch `mods/` directory for changes
- On Create/Delete/Rename: push event via Wails event bus → React updates plugin list
- Debounce: 300ms to avoid rapid duplicate events

**Plugin Metadata Parsing (Go):**
```go
// Extract from .jar manifest or plugin.json
type PluginMetadata struct {
    Name        string
    Version     string
    Description string
    Author      string
    MainClass   string
    Source      string // "local" | "blockymarketplace" | "blockynetworks"
    SourceID    string // marketplace plugin ID if applicable
}
```
Parse order:
1. Check for `plugin.json` at jar root
2. Check `META-INF/MANIFEST.MF` for `Plugin-Name`, `Plugin-Version`
3. Fallback: use filename (strip `.jar`, clean underscores/dashes)

---

### 7.3 Server Start / Stop / Restart

**Description:** A prominent Start/Stop button controls the Hytale server process. BlockyLauncher manages the OS process and pipes its stdin/stdout to the built-in terminal.

**Server States:**
```
STOPPED    → grey dot, "Start Server" button (green)
STARTING   → yellow pulsing dot, "Starting..." (disabled)
RUNNING    → green pulsing dot, "Stop Server" button (red)
STOPPING   → yellow pulsing dot, "Stopping..." (disabled)
CRASHED    → red dot, "Server Crashed" banner, "Restart" button
```

**Start flow (Go):**
1. Validate `serverJar` exists and is readable
2. Build command: `javaPath -jvmArgs... -jar serverJar programArgs...`
3. `exec.Command(...)` with `Stdin`, `Stdout`, `Stderr` piped
4. Start process → emit `server:state:starting` event
5. Watch stdout for ready signal (configurable pattern, default: `Done (`)
6. On ready signal → emit `server:state:running`
7. Buffer stdout/stderr lines → push to terminal via `wails.EventsEmit("terminal:line", line)`

**Stop flow:**
1. Send `stop` command to stdin
2. Wait up to 15s for graceful exit
3. If timeout: `SIGTERM` → wait 5s → `SIGKILL`
4. Emit `server:state:stopped`

**Crash detection:**
- Monitor process exit code
- Non-zero exit → emit `server:state:crashed` with exit code

**Run Configuration Wizard:**
- Accessible via gear icon on server card
- Fields: Java path (auto-detect button), JVM memory (slider: 512MB–16GB), additional JVM args, program args
- "Test" button: runs `java -version` with selected path to validate
- Java auto-detection: scans common paths + `which java` + `JAVA_HOME`

---

### 7.4 Built-in Terminal

**Description:** A full interactive terminal panel showing live server output with the ability to type commands directly into the server stdin.

**Features:**
- Scrolling output buffer (last 5,000 lines in memory, configurable)
- Color code parsing: ANSI escape codes rendered as colored text
- Auto-scroll to bottom (toggle-able)
- Input field at bottom: Enter submits to server stdin
- Command history: Up/Down arrows cycle through previous commands
- Clear button
- Copy to clipboard button
- Search/filter bar (highlight matching lines)
- Font size controls (+/-)

**UI spec:**
- Background: `rgba(0, 0, 0, 0.6)` with `backdrop-filter: blur(8px)`
- Text: JetBrains Mono 13px
- Line numbers optional (toggle)
- Timestamp per line optional (toggle)
- Output types styled differently:
  - `[INFO]` — white
  - `[WARN]` — `#F2B705`
  - `[ERROR]` / `[SEVERE]` — `#E03A3E`
  - `[DONE]` / server ready — `#19B36B`

**Go implementation:**
```go
// Stream server output line-by-line to frontend
go func() {
    scanner := bufio.NewScanner(proc.Stdout)
    for scanner.Scan() {
        line := scanner.Text()
        app.emitTerminalLine(line)
    }
}()

// Accept commands from frontend
func (a *App) SendCommand(cmd string) error {
    if a.serverProc == nil {
        return fmt.Errorf("server not running")
    }
    _, err := fmt.Fprintln(a.serverStdin, cmd)
    return err
}
```

---

### 7.5 BlockyMarketplace Account Integration

**Description:** Users can sign in to their BlockyMarketplace account to see all plugins they own/have purchased and load them directly into their server with one click.

**Auth flow:**
1. User clicks "Sign in to BlockyMarketplace" in Account panel or when viewing plugin list
2. App opens system browser to `blockymarketplace.com/api/launcher/auth?callback=blockylauncher://auth`
3. User authenticates via Clerk on website
4. Website redirects to `blockylauncher://auth?token=...` (deep link)
5. App registers `blockylauncher://` protocol handler on install
6. Token stored in OS secure keychain (`keyring` Go library)
7. Account panel shows: avatar, username, plugin count, subscription tier

**Owned Plugins Panel:**
- Calls BlockyMarketplace API: `GET /api/launcher/plugins/owned` (authenticated)
- Returns list of purchased plugin records with download URLs
- Each plugin shown with:
  - Plugin name + version
  - Thumbnail if available
  - "Install to Server" button
  - Status badge: Installed / Not Installed / Update Available
- Search/filter within owned plugins
- Sort: by name, purchase date, recently updated

**Install flow:**
1. User clicks "Install to Server"
2. App downloads .jar from signed URL (progress bar)
3. Writes to `mods/` folder
4. File watcher picks it up → plugin list refreshes
5. Toast notification: "BlockyMarketplace Plugin installed ✓"

**BlockyNetworks Integration (parallel):**
- Same auth flow for `blockynetworks.com`
- Shows claimed/registered servers and their companion plugin
- "Install BlockyNetworks companion" button → downloads official companion .jar

---

### 7.6 Multi-Server Profile Management

**Description:** Advanced users can configure multiple server setups and switch between them.

- Profile list in Settings
- Each profile: name, icon (emoji picker), server folder, launch config
- Active profile shown in TitleBar dropdown
- Switching profiles updates all panels to reflect new server

---

### 7.7 Settings

| Setting | Type | Default |
|---|---|---|
| Theme | toggle | Dark (only — glass requires dark) |
| Launch on startup | toggle | Off |
| Auto-detect Java | toggle | On |
| Terminal font size | slider 10–18 | 13 |
| Terminal max lines | number | 5000 |
| Show timestamps | toggle | Off |
| Show line numbers | toggle | Off |
| Notify on server crash | toggle | On |
| Auto-scroll terminal | toggle | On |
| Update check on launch | toggle | On |
| Analytics (anonymous) | toggle | Off — opt-in only |
| Reset all settings | button | — |

---

### 7.8 Onboarding Wizard

Full-screen first-launch experience:
1. **Welcome screen** — BlockyLauncher logo, tagline, "Get Started"
2. **Select server folder** — file picker, validation, "Skip for now"
3. **Configure Java** — auto-detect, show detected version, manual override
4. **Connect account (optional)** — "Sign in to BlockyMarketplace" or "Skip"
5. **All set!** — summary screen, "Open BlockyLauncher"

---

## 8. User Flows

### Flow 1: First Launch
```
App opens
  └─► Onboarding wizard shown
        └─► Select server folder
              └─► Java auto-detected
                    └─► (Optional) Sign in to BlockyMarketplace
                          └─► Dashboard shown with server card
```

### Flow 2: Start Server
```
Dashboard visible
  └─► Click "Start Server" button
        └─► ServerManager.Start() called
              └─► Process spawned with piped I/O
                    └─► Terminal shows live output
                          └─► Status → STARTING → RUNNING
                                └─► Green dot pulses, button becomes "Stop"
```

### Flow 3: Install Plugin from Drag and Drop
```
User drags .jar from Finder/Explorer
  └─► Window border glows (drag-over state)
        └─► Drop on DropZone
              └─► File copied to mods/ folder
                    └─► fsnotify event fires
                          └─► Plugin list refreshes (new card animates in)
                                └─► Toast: "Plugin installed"
```

### Flow 4: Load Owned Plugin from Account
```
User opens Account panel
  └─► Owned plugins list loaded from API
        └─► User clicks "Install to Server" on a plugin
              └─► Download progress shown
                    └─► .jar written to mods/
                          └─► Plugin card appears in Plugins panel
                                └─► Toast: "BlockyMarketplace Plugin installed ✓"
```

### Flow 5: Sign In to BlockyMarketplace
```
User clicks "Sign in to BlockyMarketplace"
  └─► System browser opens to auth URL
        └─► User logs in on website
              └─► Browser redirects to blockylauncher://auth?token=...
                    └─► App catches deep link
                          └─► Token stored in keychain
                                └─► Account panel shows avatar + owned plugins
```

---

## 9. API Integration

### BlockyMarketplace Launcher API

All endpoints require `Authorization: Bearer <token>` header.

| Endpoint | Method | Description |
|---|---|---|
| `/api/launcher/auth/verify` | GET | Verify token validity, return user profile |
| `/api/launcher/plugins/owned` | GET | List all owned plugins (purchased + free claimed) |
| `/api/launcher/plugins/{id}/download` | GET | Get signed download URL for plugin .jar |
| `/api/launcher/plugins/{id}/versions` | GET | List available versions |

### BlockyNetworks Launcher API

| Endpoint | Method | Description |
|---|---|---|
| `/api/launcher/auth/verify` | GET | Verify token, return user profile |
| `/api/launcher/servers/claimed` | GET | List servers claimed by this user |
| `/api/launcher/companion/download` | GET | Get companion plugin download URL |

### Deep Link Protocol
- macOS: Register `blockylauncher://` via `Info.plist` `CFBundleURLTypes`
- Windows: Register `blockylauncher://` via registry `HKEY_CLASSES_ROOT`
- Linux: `.desktop` file with `MimeType=x-scheme-handler/blockylauncher`

---

## 10. Data Models

### AppConfig (persisted to `~/.blockylauncher/config.json`)
```json
{
  "version": "1.0.0",
  "activeProfile": "default",
  "profiles": [
    {
      "id": "default",
      "name": "My Hytale Server",
      "serverFolder": "/Users/matt/HytaleServer",
      "serverJar": "HytaleServer.jar",
      "modsFolder": "mods",
      "javaPath": "/usr/bin/java",
      "jvmArgs": ["-Xmx4G", "-Xms1G"],
      "programArgs": ["--nogui"],
      "readySignal": "Done ("
    }
  ],
  "settings": {
    "terminalFontSize": 13,
    "terminalMaxLines": 5000,
    "showTimestamps": false,
    "showLineNumbers": false,
    "autoScroll": true,
    "notifyOnCrash": true,
    "checkUpdates": true,
    "analyticsOptIn": false
  },
  "accounts": {
    "blockymarketplace": {
      "username": "mfavela",
      "displayName": "Matt",
      "avatarUrl": "...",
      "tier": "Founder Pro"
    },
    "blockynetworks": {
      "username": "mfavela",
      "displayName": "Matt",
      "avatarUrl": "..."
    }
  },
  "windowState": {
    "width": 1200,
    "height": 800,
    "x": 100,
    "y": 100,
    "maximized": false
  }
}
```

### LocalPlugin (in-memory, from mods/ scan)
```json
{
  "filename": "BlockyMarketplace-1.0.1.jar",
  "path": "/Users/matt/HytaleServer/mods/BlockyMarketplace-1.0.1.jar",
  "name": "BlockyMarketplace",
  "version": "1.0.1",
  "description": "BlockyMarketplace companion plugin",
  "author": "Favela Tech LLC",
  "enabled": true,
  "fileSize": 1048576,
  "source": "blockymarketplace",
  "sourceId": "plugin_xyz",
  "installedAt": "2026-02-20T12:00:00Z"
}
```

### OwnedPlugin (from API)
```json
{
  "id": "plugin_xyz",
  "name": "Chat Colors",
  "version": "1.0.0",
  "description": "Personalize your chat name colour",
  "thumbnailUrl": "...",
  "purchasedAt": "2026-02-15T00:00:00Z",
  "isInstalled": false,
  "updateAvailable": false
}
```

---

## 11. Legal, Privacy & Disclaimers

### Copyright Notice
All source code, design assets, brand assets, documentation, and compiled binaries are:
> Copyright © 2026 Favela Tech LLC. All Rights Reserved.

The MIT license applies to the source code only, granting use/modification/distribution rights to end users. It does not transfer the BlockyLauncher, BlockyMarketplace, or BlockyNetworks trademarks, logos, or brand identity.

### Third-Party Disclaimer (displayed in app About screen and README)
> BlockyLauncher is an independent third-party tool developed by Favela Tech LLC. It is not affiliated with, endorsed by, or officially connected to Hypixel Studios or the Hytale game. "Hytale" is a trademark of Hypixel Studios. All trademarks belong to their respective owners.

### Terms of Service (displayed in app on first launch, full text at `blockymarketplace.com/terms`)
Key clauses:
1. **Acceptance** — By using BlockyLauncher you agree to these Terms. If you disagree, uninstall.
2. **Ownership** — BlockyLauncher and all associated IP is owned by Favela Tech LLC / Matt Favela.
3. **License to Use** — Favela Tech LLC grants you a personal, non-exclusive, non-transferable license to use BlockyLauncher.
4. **No Warranty** — The app is provided "as is" without warranty of any kind.
5. **Limitation of Liability** — Favela Tech LLC shall not be liable for any data loss, server damage, or other damages arising from use of BlockyLauncher.
6. **Third-Party Services** — BlockyMarketplace and BlockyNetworks accounts are subject to their respective Terms of Service.
7. **Third-Party Disclaimer** — Not affiliated with Hypixel Studios or Hytale.
8. **Prohibited Use** — Do not use BlockyLauncher to distribute malware, infringe IP rights, or violate applicable law.
9. **Governing Law** — Laws of the State of California, USA.

### Privacy Policy Summary (full text at `blockymarketplace.com/privacy`)
**Data collected:**
- Server folder path (stored locally only)
- BlockyMarketplace / BlockyNetworks auth tokens (stored in OS keychain)
- App settings (stored locally at `~/.blockylauncher/`)
- Crash reports (only if user opts in)
- Anonymous usage analytics (only if user explicitly opts in — default OFF)

**Data NOT collected:**
- Server content, world data, or player data
- Plugin source code or .jar contents
- Terminal output

**Data sharing:**
- No data sold to third parties — ever
- Auth tokens sent only to `blockymarketplace.com` and `blockynetworks.com` APIs
- No third-party advertising SDKs

### EULA Acceptance
- First launch shows a modal: "By continuing you agree to our Terms of Service and Privacy Policy" with "I Agree" / "Quit" buttons
- Agreement timestamp stored in config

---

## 12. Open Source Strategy

### Repository
- GitHub: `Chewy42/blocky-launcher` (public)
- License: MIT
- `README.md` — clear setup instructions, screenshots, feature list
- `CONTRIBUTING.md` — how to contribute, code style, PR process
- `CODE_OF_CONDUCT.md` — standard Contributor Covenant
- `SECURITY.md` — responsible disclosure policy (email: security@blockymarketplace.com)
- GitHub Topics: `hytale`, `hytale-plugin`, `hytale-server`, `server-manager`, `go`, `wails`, `desktop-app`

### What is NOT open-sourced
- Backend API endpoints for token issuance / signed download URLs (server-side only)
- Favela Tech LLC branding assets (logos, icons) — included in repo under a separate non-commercial license

### Release Process
1. All tests pass (`go test ./...`)
2. Build for macOS (arm64 + amd64), Windows (amd64), Linux (amd64)
3. GitHub Release with binaries attached
4. Repo set to public
5. Announcement post

---

## 13. Testing Requirements

### Unit Tests (Go)
- `ServerManager`: start, stop, crash detection, java path detection
- `PluginManager`: scan mods/, parse metadata, enable/disable
- `AuthService`: token storage/retrieval, expiry handling
- `FileWatcher`: event debounce, create/delete/rename handling
- `ConfigStore`: read/write/migrate config

### Integration Tests
- Full server start/stop cycle with a mock Hytale jar
- Plugin install via drag-and-drop (file system test)
- API client mocks for BlockyMarketplace / BlockyNetworks

### E2E Tests (Playwright or equivalent via Wails test harness)
- Onboarding wizard completion
- Plugin install from drag-and-drop
- Server start → terminal output → stop
- Account login flow (mocked deep link)

### Manual QA Checklist (pre-release)
- [ ] App launches on macOS 13+ (Intel + Apple Silicon)
- [ ] App launches on Windows 10/11
- [ ] App launches on Ubuntu 22.04
- [ ] Server folder detection works correctly
- [ ] Drag-and-drop installs .jar to mods/
- [ ] Server starts and terminal shows output
- [ ] Server stop works cleanly
- [ ] Server crash shows error state
- [ ] BlockyMarketplace login flow completes end-to-end
- [ ] Owned plugins list loads and installs correctly
- [ ] Settings persist across restarts
- [ ] EULA acceptance stored correctly
- [ ] Disclaimer visible in About screen
- [ ] No crash on fresh install (no prior config)

---

## 14. Release Checklist

- [ ] PRD reviewed and approved
- [ ] All Go unit tests passing
- [ ] All React/TypeScript components render without console errors
- [ ] EULA acceptance modal implemented
- [ ] Disclaimer "Not affiliated with Hypixel Studios" in About + README
- [ ] Copyright notice in all source files
- [ ] Privacy Policy and Terms of Service URLs correct and live
- [ ] Deep link protocol registered on all platforms
- [ ] macOS notarization completed (for Gatekeeper)
- [ ] Windows code signing completed
- [ ] GitHub repo created as public
- [ ] README includes screenshots
- [ ] Release binaries attached to GitHub release
- [ ] BlockyMarketplace plugin listing pages link to GitHub repo
- [ ] Discord / X announcement prepared

---

## 15. Future Roadmap

| Feature | Priority | Notes |
|---|---|---|
| Plugin version manager (multiple versions per plugin) | High | Switch between plugin versions |
| Server log history (save terminal output to file) | High | Per-session log files |
| Plugin compatibility warnings | Medium | Detect conflicting plugins |
| Scheduled restarts | Medium | Cron-style restart config |
| Remote server management | Low | SSH into remote server |
| Plugin marketplace browse in-app | Medium | Browse BlockyMarketplace without leaving app |
| Server performance metrics overlay | Low | RAM/CPU while server running |
| Dark/light/custom themes | Low | Currently dark only |
| Plugin dependency resolver | Medium | Auto-install dependencies |
| Mobile companion app | Low | Monitor server from phone |

---

*This document is the single source of truth for BlockyLauncher. Any implementation decisions not covered here should be added to this document before being built.*

*Copyright © 2026 Favela Tech LLC. All Rights Reserved.*
