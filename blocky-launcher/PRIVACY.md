# BlockyLauncher — Privacy Policy

**Copyright © 2026 Favela Tech LLC. All Rights Reserved.**
**Effective Date:** February 20, 2026

---

## Overview

Favela Tech LLC built BlockyLauncher as a free, open-source desktop application. This Privacy Policy explains what information the App collects, how it is used, and your rights regarding that information.

**We are strongly committed to your privacy. BlockyLauncher is designed to be minimally invasive and to keep your data local by default.**

---

## 1. Information We Collect

### 1.1 Information Stored Locally (on Your Device)

The following information is stored **only on your local device** in `~/.blockylauncher/`:

| Data | Purpose | Location |
|---|---|---|
| Server folder path | Remember your server location | `~/.blockylauncher/config.json` |
| Server launch configuration | JVM args, Java path, etc. | `~/.blockylauncher/config.json` |
| App preferences & settings | Terminal font size, toggles, etc. | `~/.blockylauncher/config.json` |
| Window state | Remember window size and position | `~/.blockylauncher/config.json` |
| EULA acceptance timestamp | Compliance record | `~/.blockylauncher/config.json` |
| Auth tokens | BlockyMarketplace / BlockyNetworks login | `~/.blockylauncher/*.token` (mode 0600) |
| Account display info | Username, avatar URL, tier | `~/.blockylauncher/config.json` |

### 1.2 Information Transmitted to Our Services

When you sign in to BlockyMarketplace or BlockyNetworks:

- Your authentication token is sent to `blockymarketplace.com` or `blockynetworks.com` APIs to verify your identity and retrieve your owned plugins
- No other personal data is transmitted without your explicit action

### 1.3 Optional Analytics (Opt-In Only)

Anonymous, aggregated usage analytics may be collected **only if you explicitly opt in** in Settings. This is **OFF by default**. If enabled, it may include:

- App version, OS platform and version
- Feature usage counts (e.g., "server started N times")
- Crash reports

No personally identifiable information is included in analytics.

---

## 2. Information We Do NOT Collect

We explicitly do **not** collect or transmit:

- Server world data, player data, or game content
- Plugin source code or `.jar` file contents
- Server terminal output
- Your server's IP address or network information
- File system contents beyond paths you explicitly configure
- Keystrokes or clipboard content

---

## 3. How We Use Information

- **Auth tokens** — Sent only to `blockymarketplace.com` and `blockynetworks.com` to authenticate API calls on your behalf
- **Config data** — Stored locally only, used to restore your preferences between sessions
- **Analytics (opt-in)** — Used to understand feature usage and improve BlockyLauncher

---

## 4. Data Sharing

**We do not sell, rent, or share your personal information with third parties** for advertising or marketing purposes, ever.

Data may be shared only:

- With `blockymarketplace.com` and `blockynetworks.com` as necessary for account features you use
- If required by law (e.g., court order or lawful government request)

---

## 5. Data Security

- Auth tokens are stored in files with restricted permissions (mode 0600 on Unix/macOS)
- All API communication uses HTTPS
- We do not store your passwords — authentication is handled by Clerk on our website

---

## 6. Data Retention

All data is stored locally and is under your control. You can delete it at any time by:

- Removing `~/.blockylauncher/` directory
- Signing out from the Account page (deletes auth tokens)
- Uninstalling the app

---

## 7. Children's Privacy

BlockyLauncher is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us personal information, contact us at privacy@blockymarketplace.com.

---

## 8. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of significant changes via an in-app notice or a new version release. Your continued use of the App after changes constitutes acceptance.

---

## 9. Contact

For privacy questions or data requests:

**Favela Tech LLC**
Email: privacy@blockymarketplace.com
Website: https://blockymarketplace.com/privacy

---

## 10. Third-Party Disclaimer

BlockyLauncher is an independent third-party tool. It is not affiliated with Hypixel Studios or the Hytale game. Third-party services (BlockyMarketplace, BlockyNetworks) have their own privacy policies which govern your use of those services.

---

*Copyright © 2026 Favela Tech LLC. All Rights Reserved.*
