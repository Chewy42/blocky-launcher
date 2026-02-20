// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package networks

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const baseURL = "https://blockynetworks.com"

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

func (c *Client) GetClaimedServers() ([]ClaimedServer, error) {
	var servers []ClaimedServer
	if err := c.doGet("/api/launcher/servers/claimed", &servers); err != nil {
		return nil, err
	}
	return servers, nil
}

func (c *Client) GetCompanionDownloadURL() (string, error) {
	var result struct {
		URL      string `json:"url"`
		Filename string `json:"filename"`
	}
	if err := c.doGet("/api/launcher/companion/download", &result); err != nil {
		return "", err
	}
	return result.URL, nil
}

func (c *Client) DownloadCompanion() ([]byte, string, error) {
	url, err := c.GetCompanionDownloadURL()
	if err != nil {
		return nil, "", err
	}

	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, "", fmt.Errorf("download failed: status %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	return data, "BlockyNetworks-Companion.jar", err
}
