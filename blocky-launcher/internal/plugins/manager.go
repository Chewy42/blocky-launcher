// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package plugins

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type Plugin struct {
	Filename    string   `json:"filename"`
	Path        string   `json:"path"`
	Name        string   `json:"name"`
	Version     string   `json:"version"`
	Description string   `json:"description"`
	Author      string   `json:"author"`
	Enabled     bool     `json:"enabled"`
	FileSize    int64    `json:"fileSize"`
	Source      string   `json:"source"`
	SourceID    string   `json:"sourceId"`
	InstalledAt string   `json:"installedAt"`
}

type Manager struct {
	modsFolder string
}

func NewManager(modsFolder string) *Manager {
	return &Manager{modsFolder: modsFolder}
}

func (m *Manager) SetModsFolder(folder string) {
	m.modsFolder = folder
}

// ScanPlugins reads the mods/ directory and returns all discovered plugins.
func (m *Manager) ScanPlugins() ([]Plugin, error) {
	if m.modsFolder == "" {
		return nil, nil
	}

	var plugins []Plugin

	entries, err := os.ReadDir(m.modsFolder)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(strings.ToLower(entry.Name()), ".jar") {
			continue
		}
		fullPath := filepath.Join(m.modsFolder, entry.Name())
		info, err := entry.Info()
		if err != nil {
			continue
		}
		meta := ParseMetadata(fullPath)
		plugins = append(plugins, Plugin{
			Filename:    entry.Name(),
			Path:        fullPath,
			Name:        meta.Name,
			Version:     meta.Version,
			Description: meta.Description,
			Author:      meta.Author,
			Enabled:     true,
			FileSize:    info.Size(),
			Source:      meta.Source,
			SourceID:    meta.SourceID,
			InstalledAt: info.ModTime().Format(time.RFC3339),
		})
	}

	// Also scan disabled/ subfolder
	disabledDir := filepath.Join(m.modsFolder, "disabled")
	if dentries, err := os.ReadDir(disabledDir); err == nil {
		for _, entry := range dentries {
			if entry.IsDir() || !strings.HasSuffix(strings.ToLower(entry.Name()), ".jar") {
				continue
			}
			fullPath := filepath.Join(disabledDir, entry.Name())
			info, err := entry.Info()
			if err != nil {
				continue
			}
			meta := ParseMetadata(fullPath)
			plugins = append(plugins, Plugin{
				Filename:    entry.Name(),
				Path:        fullPath,
				Name:        meta.Name,
				Version:     meta.Version,
				Description: meta.Description,
				Author:      meta.Author,
				Enabled:     false,
				FileSize:    info.Size(),
				Source:      meta.Source,
				SourceID:    meta.SourceID,
				InstalledAt: info.ModTime().Format(time.RFC3339),
			})
		}
	}

	return plugins, nil
}

// InstallJar copies a .jar file into the mods folder.
func (m *Manager) InstallJar(srcPath string) (Plugin, error) {
	if err := os.MkdirAll(m.modsFolder, 0755); err != nil {
		return Plugin{}, err
	}
	filename := filepath.Base(srcPath)
	destPath := filepath.Join(m.modsFolder, filename)

	if err := copyFile(srcPath, destPath); err != nil {
		return Plugin{}, err
	}

	info, err := os.Stat(destPath)
	if err != nil {
		return Plugin{}, err
	}
	meta := ParseMetadata(destPath)

	return Plugin{
		Filename:    filename,
		Path:        destPath,
		Name:        meta.Name,
		Version:     meta.Version,
		Description: meta.Description,
		Author:      meta.Author,
		Enabled:     true,
		FileSize:    info.Size(),
		Source:      meta.Source,
		SourceID:    meta.SourceID,
		InstalledAt: time.Now().Format(time.RFC3339),
	}, nil
}

// InstallDownloaded saves downloaded bytes to the mods folder.
func (m *Manager) InstallDownloaded(filename string, data []byte) (Plugin, error) {
	if err := os.MkdirAll(m.modsFolder, 0755); err != nil {
		return Plugin{}, err
	}
	destPath := filepath.Join(m.modsFolder, filename)
	if err := os.WriteFile(destPath, data, 0644); err != nil {
		return Plugin{}, err
	}
	info, err := os.Stat(destPath)
	if err != nil {
		return Plugin{}, err
	}
	meta := ParseMetadata(destPath)
	return Plugin{
		Filename:    filename,
		Path:        destPath,
		Name:        meta.Name,
		Version:     meta.Version,
		Description: meta.Description,
		Author:      meta.Author,
		Enabled:     true,
		FileSize:    info.Size(),
		Source:      "blockymarketplace",
		SourceID:    meta.SourceID,
		InstalledAt: time.Now().Format(time.RFC3339),
	}, nil
}

// RemovePlugin deletes a plugin .jar from disk.
func (m *Manager) RemovePlugin(filename string) error {
	paths := []string{
		filepath.Join(m.modsFolder, filename),
		filepath.Join(m.modsFolder, "disabled", filename),
	}
	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			return os.Remove(p)
		}
	}
	return fmt.Errorf("plugin not found: %s", filename)
}

// EnablePlugin moves a .jar from disabled/ back to mods/.
func (m *Manager) EnablePlugin(filename string) error {
	src := filepath.Join(m.modsFolder, "disabled", filename)
	dst := filepath.Join(m.modsFolder, filename)
	return os.Rename(src, dst)
}

// DisablePlugin moves a .jar from mods/ to disabled/ subfolder.
func (m *Manager) DisablePlugin(filename string) error {
	disabledDir := filepath.Join(m.modsFolder, "disabled")
	if err := os.MkdirAll(disabledDir, 0755); err != nil {
		return err
	}
	src := filepath.Join(m.modsFolder, filename)
	dst := filepath.Join(disabledDir, filename)
	return os.Rename(src, dst)
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}
