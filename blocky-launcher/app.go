// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package main

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"blocky-launcher/internal/auth"
	"blocky-launcher/internal/config"
	"blocky-launcher/internal/filewatcher"
	"blocky-launcher/internal/marketplace"
	"blocky-launcher/internal/networks"
	"blocky-launcher/internal/plugins"
	"blocky-launcher/internal/server"
	"blocky-launcher/internal/terminal"

	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App is the main application struct exposed to the Wails frontend.
type App struct {
	ctx           context.Context
	configStore   *config.Store
	serverManager *server.Manager
	pluginManager *plugins.Manager
	authService   *auth.Service
	mpClient      *marketplace.Client
	bnClient      *networks.Client
	termBridge    *terminal.Bridge
	fileWatcher   *filewatcher.Watcher
}

// NewApp creates and returns a new App instance.
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts.
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Initialize config store
	var err error
	a.configStore, err = config.NewStore()
	if err != nil {
		fmt.Println("Failed to init config store:", err)
		return
	}

	cfg := a.configStore.Get()

	// Terminal bridge
	a.termBridge = terminal.NewBridge(cfg.Settings.TerminalMaxLines)

	// Server manager
	a.serverManager = server.NewManager(
		func(line string) {
			lineType := classifyLine(line)
			tLine := terminal.Line{
				Text:      line,
				Type:      lineType,
				Timestamp: time.Now().Format("15:04:05"),
			}
			a.termBridge.AddLine(tLine)
			wailsruntime.EventsEmit(a.ctx, "terminal:line", tLine)
		},
		func(state server.State, info string) {
			wailsruntime.EventsEmit(a.ctx, "server:state", map[string]string{
				"state": string(state),
				"info":  info,
			})
		},
	)

	// Plugin manager
	profile := a.configStore.GetActiveProfile()
	modsFolder := ""
	if profile != nil && profile.ServerFolder != "" {
		modsFolder = filepath.Join(profile.ServerFolder, profile.ModsFolder)
	}
	a.pluginManager = plugins.NewManager(modsFolder)

	// Auth service
	a.authService, _ = auth.NewService()

	// Marketplace client
	mpToken, _ := a.authService.GetToken(auth.ServiceMarketplace)
	a.mpClient = marketplace.NewClient(mpToken)

	// Networks client
	bnToken, _ := a.authService.GetToken(auth.ServiceNetworks)
	a.bnClient = networks.NewClient(bnToken)

	// File watcher
	a.fileWatcher, _ = filewatcher.New(func(event filewatcher.Event) {
		wailsruntime.EventsEmit(a.ctx, "plugins:updated", map[string]string{
			"type":     string(event.Type),
			"filename": event.Filename,
		})
	})
	if modsFolder != "" {
		_ = a.fileWatcher.Watch(modsFolder)
	}
}

func (a *App) shutdown(ctx context.Context) {
	if a.fileWatcher != nil {
		a.fileWatcher.Stop()
	}
	if a.serverManager != nil {
		if a.serverManager.GetState() == server.StateRunning {
			_ = a.serverManager.Stop()
		}
	}
}

// ─── Config ───────────────────────────────────────────────────────────────────

func (a *App) GetConfig() config.AppConfig {
	return a.configStore.Get()
}

func (a *App) SaveConfig(cfg config.AppConfig) error {
	if err := a.configStore.Save(cfg); err != nil {
		return err
	}
	a.termBridge.SetMaxLines(cfg.Settings.TerminalMaxLines)
	return nil
}

func (a *App) AcceptEULA() error {
	return a.configStore.AcceptEULA(time.Now().Format(time.RFC3339))
}

// ─── Server Folder ────────────────────────────────────────────────────────────

func (a *App) SelectServerFolder() (string, error) {
	folder, err := wailsruntime.OpenDirectoryDialog(a.ctx, wailsruntime.OpenDialogOptions{
		Title: "Select Hytale Server Folder",
	})
	if err != nil || folder == "" {
		return "", err
	}
	return folder, nil
}

type FolderValidation struct {
	Valid      bool   `json:"valid"`
	Message    string `json:"message"`
	DetectedJar string `json:"detectedJar"`
}

func (a *App) ValidateServerFolder(folder string) FolderValidation {
	valid, result := server.ValidateServerFolder(folder)
	if valid {
		return FolderValidation{Valid: true, Message: "Server folder detected", DetectedJar: result}
	}
	return FolderValidation{Valid: false, Message: result}
}

func (a *App) SetServerFolder(folder string) error {
	profile := a.configStore.GetActiveProfile()
	if profile == nil {
		return fmt.Errorf("no active profile")
	}
	profile.ServerFolder = folder
	if profile.ServerJar == "" {
		profile.ServerJar = server.DetectServerJar(folder)
	}
	modsFolder := filepath.Join(folder, profile.ModsFolder)
	a.pluginManager.SetModsFolder(modsFolder)
	_ = a.fileWatcher.Watch(modsFolder)
	return a.configStore.UpdateActiveProfile(*profile)
}

// ─── Server Management ────────────────────────────────────────────────────────

func (a *App) GetServerState() string {
	return string(a.serverManager.GetState())
}

func (a *App) StartServer() error {
	profile := a.configStore.GetActiveProfile()
	if profile == nil {
		return fmt.Errorf("no server profile configured")
	}
	if profile.ServerFolder == "" {
		return fmt.Errorf("server folder not set")
	}
	if profile.ServerJar == "" {
		return fmt.Errorf("server jar not set")
	}

	javaPath := profile.JavaPath
	if javaPath == "" {
		javaPath = server.DetectJavaPath()
	}

	return a.serverManager.Start(server.StartConfig{
		JavaPath:    javaPath,
		ServerFolder: profile.ServerFolder,
		ServerJar:   profile.ServerJar,
		JVMArgs:     profile.JVMArgs,
		ProgramArgs: profile.ProgramArgs,
		ReadySignal: profile.ReadySignal,
	})
}

func (a *App) StopServer() error {
	return a.serverManager.Stop()
}

func (a *App) SendCommand(cmd string) error {
	return a.serverManager.SendCommand(cmd)
}

// ─── Java Detection ───────────────────────────────────────────────────────────

type JavaInfo struct {
	Path    string `json:"path"`
	Version string `json:"version"`
	Valid   bool   `json:"valid"`
}

func (a *App) DetectJava() JavaInfo {
	path := server.DetectJavaPath()
	version, err := server.ValidateJavaPath(path)
	return JavaInfo{Path: path, Version: version, Valid: err == nil}
}

func (a *App) ValidateJavaPath(javaPath string) JavaInfo {
	version, err := server.ValidateJavaPath(javaPath)
	return JavaInfo{Path: javaPath, Version: version, Valid: err == nil}
}

// ─── Plugins ──────────────────────────────────────────────────────────────────

func (a *App) GetPlugins() ([]plugins.Plugin, error) {
	return a.pluginManager.ScanPlugins()
}

func (a *App) InstallPluginFromPath(srcPath string) (plugins.Plugin, error) {
	p, err := a.pluginManager.InstallJar(srcPath)
	if err != nil {
		return plugins.Plugin{}, err
	}
	wailsruntime.EventsEmit(a.ctx, "plugins:updated", map[string]string{"type": "create", "filename": p.Filename})
	return p, nil
}

func (a *App) RemovePlugin(filename string) error {
	return a.pluginManager.RemovePlugin(filename)
}

func (a *App) EnablePlugin(filename string) error {
	return a.pluginManager.EnablePlugin(filename)
}

func (a *App) DisablePlugin(filename string) error {
	return a.pluginManager.DisablePlugin(filename)
}

func (a *App) OpenPluginsFolder() {
	profile := a.configStore.GetActiveProfile()
	if profile == nil {
		return
	}
	modsFolder := filepath.Join(profile.ServerFolder, profile.ModsFolder)
	wailsruntime.BrowserOpenURL(a.ctx, "file://"+modsFolder)
}

// ─── Terminal ─────────────────────────────────────────────────────────────────

func (a *App) GetTerminalHistory() []terminal.Line {
	return a.termBridge.GetLines()
}

func (a *App) ClearTerminal() {
	a.termBridge.Clear()
	wailsruntime.EventsEmit(a.ctx, "terminal:clear", nil)
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

func (a *App) GetMarketplaceAuthURL() (string, error) {
	return a.authService.GetAuthURL(auth.ServiceMarketplace)
}

func (a *App) GetNetworksAuthURL() (string, error) {
	return a.authService.GetAuthURL(auth.ServiceNetworks)
}

func (a *App) SignInWithToken(service, token string) error {
	if err := a.authService.SaveToken(service, token); err != nil {
		return err
	}
	cfg := a.configStore.Get()
	switch service {
	case auth.ServiceMarketplace:
		a.mpClient.SetToken(token)
		profile, err := a.mpClient.VerifyToken()
		if err != nil {
			return err
		}
		cfg.Accounts.BlockyMarketplace = &config.AccountInfo{
			Username:    profile.Username,
			DisplayName: profile.DisplayName,
			AvatarURL:   profile.AvatarURL,
			Tier:        profile.Tier,
		}
	case auth.ServiceNetworks:
		a.bnClient.SetToken(token)
		profile, err := a.bnClient.VerifyToken()
		if err != nil {
			return err
		}
		cfg.Accounts.BlockyNetworks = &config.AccountInfo{
			Username:    profile.Username,
			DisplayName: profile.DisplayName,
			AvatarURL:   profile.AvatarURL,
		}
	}
	if err := a.configStore.Save(cfg); err != nil {
		return err
	}
	wailsruntime.EventsEmit(a.ctx, "auth:updated", service)
	return nil
}

func (a *App) SignOut(service string) error {
	if err := a.authService.DeleteToken(service); err != nil {
		return err
	}
	cfg := a.configStore.Get()
	switch service {
	case auth.ServiceMarketplace:
		cfg.Accounts.BlockyMarketplace = nil
	case auth.ServiceNetworks:
		cfg.Accounts.BlockyNetworks = nil
	}
	if err := a.configStore.Save(cfg); err != nil {
		return err
	}
	wailsruntime.EventsEmit(a.ctx, "auth:updated", service)
	return nil
}

func (a *App) IsSignedIn(service string) bool {
	return a.authService.IsSignedIn(service)
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

func (a *App) GetOwnedPlugins() ([]marketplace.OwnedPlugin, error) {
	return a.mpClient.GetOwnedPlugins()
}

func (a *App) InstallOwnedPlugin(pluginID string) (plugins.Plugin, error) {
	data, filename, err := a.mpClient.DownloadPlugin(pluginID)
	if err != nil {
		return plugins.Plugin{}, err
	}

	profile := a.configStore.GetActiveProfile()
	if profile == nil {
		return plugins.Plugin{}, fmt.Errorf("no active profile")
	}

	modsFolder := filepath.Join(profile.ServerFolder, profile.ModsFolder)
	a.pluginManager.SetModsFolder(modsFolder)

	p, err := a.pluginManager.InstallDownloaded(filename, data)
	if err != nil {
		return plugins.Plugin{}, err
	}
	p.Source = "blockymarketplace"
	p.SourceID = pluginID

	wailsruntime.EventsEmit(a.ctx, "plugins:updated", map[string]string{"type": "create", "filename": p.Filename})
	return p, nil
}

// ─── Networks ─────────────────────────────────────────────────────────────────

func (a *App) GetClaimedServers() ([]networks.ClaimedServer, error) {
	return a.bnClient.GetClaimedServers()
}

func (a *App) InstallNetworksCompanion() (plugins.Plugin, error) {
	data, filename, err := a.bnClient.DownloadCompanion()
	if err != nil {
		return plugins.Plugin{}, err
	}

	profile := a.configStore.GetActiveProfile()
	if profile == nil {
		return plugins.Plugin{}, fmt.Errorf("no active profile")
	}

	modsFolder := filepath.Join(profile.ServerFolder, profile.ModsFolder)
	a.pluginManager.SetModsFolder(modsFolder)

	p, err := a.pluginManager.InstallDownloaded(filename, data)
	if err != nil {
		return plugins.Plugin{}, err
	}
	p.Source = "blockynetworks"

	wailsruntime.EventsEmit(a.ctx, "plugins:updated", map[string]string{"type": "create", "filename": p.Filename})
	return p, nil
}

// ─── System ───────────────────────────────────────────────────────────────────

func (a *App) OpenURL(rawURL string) {
	wailsruntime.BrowserOpenURL(a.ctx, rawURL)
}

func (a *App) OpenFileDialog() (string, error) {
	file, err := wailsruntime.OpenFileDialog(a.ctx, wailsruntime.OpenDialogOptions{
		Title: "Select Plugin .jar",
		Filters: []wailsruntime.FileFilter{
			{DisplayName: "Java Archive (*.jar)", Pattern: "*.jar"},
		},
	})
	return file, err
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func classifyLine(line string) terminal.LineType {
	upper := strings.ToUpper(line)
	switch {
	case strings.Contains(upper, "[ERROR]") || strings.Contains(upper, "[SEVERE]"):
		return terminal.LineError
	case strings.Contains(upper, "[WARN]"):
		return terminal.LineWarn
	case strings.Contains(upper, "DONE (") || strings.Contains(upper, "[DONE]"):
		return terminal.LineDone
	case strings.Contains(upper, "[INFO]"):
		return terminal.LineInfo
	default:
		return terminal.LineDefault
	}
}
