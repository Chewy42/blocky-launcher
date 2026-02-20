#!/usr/bin/env bash
# Copyright © 2026 Favela Tech LLC. All Rights Reserved.
# BlockyLauncher — Build all platforms
set -e

VERSION="${1:-1.0.0}"
OUT_DIR="./dist"
mkdir -p "$OUT_DIR"

echo "Building BlockyLauncher v$VERSION for all platforms..."

echo "▸ macOS (arm64)..."
GOOS=darwin GOARCH=arm64 wails build -clean -platform darwin/arm64 -o "$OUT_DIR/BlockyLauncher_darwin_arm64"

echo "▸ macOS (amd64)..."
GOOS=darwin GOARCH=amd64 wails build -platform darwin/amd64 -o "$OUT_DIR/BlockyLauncher_darwin_amd64"

echo "▸ Windows (amd64)..."
GOOS=windows GOARCH=amd64 wails build -platform windows/amd64 -nsis -o "$OUT_DIR/BlockyLauncher_windows_amd64"

echo "▸ Linux (amd64)..."
GOOS=linux GOARCH=amd64 wails build -platform linux/amd64 -o "$OUT_DIR/BlockyLauncher_linux_amd64"

echo "✓ All builds complete. Output in $OUT_DIR/"
ls -la "$OUT_DIR/"
