// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

type Profile struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	ServerFolder string  `json:"serverFolder"`
	ServerJar   string   `json:"serverJar"`
	ModsFolder  string   `json:"modsFolder"`
	JavaPath    string   `json:"javaPath"`
	JVMArgs     []string `json:"jvmArgs"`
	ProgramArgs []string `json:"programArgs"`
	ReadySignal string   `json:"readySignal"`
}

type AccountInfo struct {
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	AvatarURL   string `json:"avatarUrl"`
	Tier        string `json:"tier,omitempty"`
}

type Settings struct {
	TerminalFontSize int  `json:"terminalFontSize"`
	TerminalMaxLines int  `json:"terminalMaxLines"`
	ShowTimestamps   bool `json:"showTimestamps"`
	ShowLineNumbers  bool `json:"showLineNumbers"`
	AutoScroll       bool `json:"autoScroll"`
	NotifyOnCrash    bool `json:"notifyOnCrash"`
	CheckUpdates     bool `json:"checkUpdates"`
	AnalyticsOptIn   bool `json:"analyticsOptIn"`
}

type WindowState struct {
	Width     int  `json:"width"`
	Height    int  `json:"height"`
	X         int  `json:"x"`
	Y         int  `json:"y"`
	Maximized bool `json:"maximized"`
}

type Accounts struct {
	BlockyMarketplace *AccountInfo `json:"blockymarketplace,omitempty"`
	BlockyNetworks    *AccountInfo `json:"blockynetworks,omitempty"`
}

type AppConfig struct {
	Version       string      `json:"version"`
	ActiveProfile string      `json:"activeProfile"`
	Profiles      []Profile   `json:"profiles"`
	Settings      Settings    `json:"settings"`
	Accounts      Accounts    `json:"accounts"`
	WindowState   WindowState `json:"windowState"`
	EULAAccepted     bool        `json:"eulaAccepted"`
	EULATimestamp    string      `json:"eulaTimestamp,omitempty"`
	FirstLaunch      bool        `json:"firstLaunch"`
	VoiceGuideReady  bool        `json:"voice_guide_ready"`
}

type Store struct {
	mu       sync.RWMutex
	config   AppConfig
	filePath string
}

func DefaultConfig() AppConfig {
	return AppConfig{
		Version:       "1.0.0",
		ActiveProfile: "default",
		FirstLaunch:   true,
		Profiles: []Profile{
			{
				ID:          "default",
				Name:        "My Hytale Server",
				ServerFolder: "",
				ServerJar:   "",
				ModsFolder:  "mods",
				JavaPath:    "",
				JVMArgs:     []string{"-Xmx4G", "-Xms1G"},
				ProgramArgs: []string{"--nogui"},
				ReadySignal: "Done (",
			},
		},
		Settings: Settings{
			TerminalFontSize: 13,
			TerminalMaxLines: 5000,
			ShowTimestamps:   false,
			ShowLineNumbers:  false,
			AutoScroll:       true,
			NotifyOnCrash:    true,
			CheckUpdates:     true,
			AnalyticsOptIn:   false,
		},
		WindowState: WindowState{
			Width: 1200, Height: 800, X: 100, Y: 100,
		},
	}
}

func NewStore() (*Store, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}
	dir := filepath.Join(homeDir, ".blockylauncher")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}
	filePath := filepath.Join(dir, "config.json")
	s := &Store{filePath: filePath}
	if err := s.load(); err != nil {
		s.config = DefaultConfig()
		_ = s.save()
	}
	return s, nil
}

func (s *Store) load() error {
	data, err := os.ReadFile(s.filePath)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, &s.config)
}

func (s *Store) save() error {
	data, err := json.MarshalIndent(s.config, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.filePath, data, 0644)
}

func (s *Store) Get() AppConfig {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.config
}

func (s *Store) Save(cfg AppConfig) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.config = cfg
	return s.save()
}

func (s *Store) GetActiveProfile() *Profile {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for i, p := range s.config.Profiles {
		if p.ID == s.config.ActiveProfile {
			return &s.config.Profiles[i]
		}
	}
	if len(s.config.Profiles) > 0 {
		return &s.config.Profiles[0]
	}
	return nil
}

func (s *Store) UpdateActiveProfile(p Profile) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, pr := range s.config.Profiles {
		if pr.ID == s.config.ActiveProfile {
			s.config.Profiles[i] = p
			return s.save()
		}
	}
	return nil
}

func (s *Store) SetAccounts(accounts Accounts) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.config.Accounts = accounts
	return s.save()
}

func (s *Store) GetTokenFilePath(service string) string {
	homeDir, _ := os.UserHomeDir()
	return filepath.Join(homeDir, ".blockylauncher", service+"-token")
}

func (s *Store) SaveToken(service, token string) error {
	path := s.GetTokenFilePath(service)
	return os.WriteFile(path, []byte(token), 0600)
}

func (s *Store) LoadToken(service string) (string, error) {
	path := s.GetTokenFilePath(service)
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func (s *Store) DeleteToken(service string) error {
	path := s.GetTokenFilePath(service)
	return os.Remove(path)
}

func (s *Store) AcceptEULA(timestamp string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.config.EULAAccepted = true
	s.config.EULATimestamp = timestamp
	s.config.FirstLaunch = false
	return s.save()
}

func (s *Store) SetFirstLaunchDone() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.config.FirstLaunch = false
	return s.save()
}

func (s *Store) SetVoiceGuideReady() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.config.VoiceGuideReady = true
	return s.save()
}
