// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
// BlockyLauncher — Hytale Server Manager
// Not affiliated with Hypixel Studios or the Hytale game.
package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:             "BlockyLauncher",
		Width:             1200,
		Height:            800,
		MinWidth:          900,
		MinHeight:         600,
		DisableResize:     false,
		Fullscreen:        false,
		Frameless:         false,
		BackgroundColour:  &options.RGBA{R: 10, G: 10, B: 15, A: 255},
		AssetServer:       &assetserver.Options{Assets: assets},
		OnStartup:         app.startup,
		OnShutdown:        app.shutdown,
		Bind:              []interface{}{app},
		EnableDefaultContextMenu: false,
		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: true,
				HideTitle:                  false,
				HideTitleBar:               false,
				FullSizeContent:            true,
				UseToolbar:                 false,
			},
			Appearance:           mac.NSAppearanceNameDarkAqua,
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			About: &mac.AboutInfo{
				Title:   "BlockyLauncher",
				Message: "Hytale Server Manager v1.0.0\nCopyright © 2026 Favela Tech LLC.\nNot affiliated with Hypixel Studios.",
			},
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
