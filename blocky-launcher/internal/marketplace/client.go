// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package marketplace

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const baseURL = "https://blockymarketplace.com"

type Client struct {
	token      string
	httpClient *http.Client
}

func NewClient(token string) *Client {
	return &Client{
		token: token,
		httpClient: &http.Client{Timeout: 15 * time.Second},
	}
}

func (c *Client) SetToken(token string) {
	c.token = token
}

func (c *Client) doGet(path string, out interface{}) error {
	req, err := http.NewRequest("GET", baseURL+path, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.token)
	req.Header.Set("User-Agent", "BlockyLauncher/1.0")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 401 {
		return fmt.Errorf("unauthorized: token expired or invalid")
	}
	if resp.StatusCode != 200 {
		return fmt.Errorf("API error: status %d", resp.StatusCode)
	}

	return json.NewDecoder(resp.Body).Decode(out)
}

func (c *Client) VerifyToken() (*UserProfile, error) {
	var profile UserProfile
	if err := c.doGet("/api/launcher/auth/verify", &profile); err != nil {
		return nil, err
	}
	return &profile, nil
}

func (c *Client) GetOwnedPlugins() ([]OwnedPlugin, error) {
	var plugins []OwnedPlugin
	if err := c.doGet("/api/launcher/plugins/owned", &plugins); err != nil {
		return nil, err
	}
	return plugins, nil
}

func (c *Client) GetPluginVersions(pluginID string) ([]PluginVersion, error) {
	var versions []PluginVersion
	if err := c.doGet(fmt.Sprintf("/api/launcher/plugins/%s/versions", pluginID), &versions); err != nil {
		return nil, err
	}
	return versions, nil
}

func (c *Client) GetDownloadURL(pluginID string) (string, error) {
	var result struct {
		URL string `json:"url"`
	}
	if err := c.doGet(fmt.Sprintf("/api/launcher/plugins/%s/download", pluginID), &result); err != nil {
		return "", err
	}
	return result.URL, nil
}

func (c *Client) DownloadPlugin(pluginID string) ([]byte, string, error) {
	downloadURL, err := c.GetDownloadURL(pluginID)
	if err != nil {
		return nil, "", err
	}

	req, err := http.NewRequest("GET", downloadURL, nil)
	if err != nil {
		return nil, "", err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, "", fmt.Errorf("download failed: status %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", err
	}

	// Try to get filename from content-disposition
	filename := pluginID + ".jar"
	if cd := resp.Header.Get("Content-Disposition"); cd != "" {
		if idx := len("filename="); idx < len(cd) {
			filename = cd[idx:]
		}
	}

	return data, filename, nil
}
