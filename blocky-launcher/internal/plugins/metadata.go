// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package plugins

import (
	"archive/zip"
	"bufio"
	"encoding/json"
	"path/filepath"
	"strings"
)

type Metadata struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Description string `json:"description"`
	Author      string `json:"author"`
	MainClass   string `json:"mainClass"`
	Source      string `json:"source"`
	SourceID    string `json:"sourceId"`
}

type pluginJSON struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Description string `json:"description"`
	Author      string `json:"author"`
	Main        string `json:"main"`
	Source      string `json:"source"`
	SourceID    string `json:"source_id"`
}

// ParseMetadata reads a .jar file and extracts plugin metadata.
func ParseMetadata(jarPath string) Metadata {
	meta := Metadata{Source: "local"}

	// Derive name from filename as fallback
	base := filepath.Base(jarPath)
	name := strings.TrimSuffix(base, ".jar")
	name = strings.ReplaceAll(name, "_", " ")
	name = strings.ReplaceAll(name, "-", " ")
	meta.Name = name

	r, err := zip.OpenReader(jarPath)
	if err != nil {
		return meta
	}
	defer r.Close()

	for _, f := range r.File {
		switch f.Name {
		case "plugin.json":
			if rc, err := f.Open(); err == nil {
				var pj pluginJSON
				if json.NewDecoder(rc).Decode(&pj) == nil {
					if pj.Name != "" {
						meta.Name = pj.Name
					}
					meta.Version = pj.Version
					meta.Description = pj.Description
					meta.Author = pj.Author
					meta.MainClass = pj.Main
					if pj.Source != "" {
						meta.Source = pj.Source
					}
					meta.SourceID = pj.SourceID
				}
				rc.Close()
			}
		case "META-INF/MANIFEST.MF":
			if rc, err := f.Open(); err == nil {
				scanner := bufio.NewScanner(rc)
				for scanner.Scan() {
					line := scanner.Text()
					if strings.HasPrefix(line, "Plugin-Name:") {
						meta.Name = strings.TrimSpace(strings.TrimPrefix(line, "Plugin-Name:"))
					} else if strings.HasPrefix(line, "Plugin-Version:") {
						meta.Version = strings.TrimSpace(strings.TrimPrefix(line, "Plugin-Version:"))
					} else if strings.HasPrefix(line, "Plugin-Description:") {
						meta.Description = strings.TrimSpace(strings.TrimPrefix(line, "Plugin-Description:"))
					} else if strings.HasPrefix(line, "Plugin-Author:") {
						meta.Author = strings.TrimSpace(strings.TrimPrefix(line, "Plugin-Author:"))
					} else if strings.HasPrefix(line, "Main-Class:") {
						meta.MainClass = strings.TrimSpace(strings.TrimPrefix(line, "Main-Class:"))
					}
				}
				rc.Close()
			}
		}
	}

	return meta
}
