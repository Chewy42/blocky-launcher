// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package auth

import (
	"fmt"
	"net/url"
)

const (
	ServiceMarketplace = "blockymarketplace"
	ServiceNetworks    = "blockynetworks"

	marketplaceAuthURL = "https://blockymarketplace.com/api/launcher/auth"
	networksAuthURL    = "https://blockynetworks.com/api/launcher/auth"

	callbackScheme = "blockylauncher"
)

type Service struct {
	store *TokenStore
}

func NewService() (*Service, error) {
	store, err := NewTokenStore()
	if err != nil {
		return nil, err
	}
	return &Service{store: store}, nil
}

// GetAuthURL returns the browser URL the user should visit to authenticate.
func (s *Service) GetAuthURL(service string) (string, error) {
	callback := url.QueryEscape(callbackScheme + "://auth/" + service)
	switch service {
	case ServiceMarketplace:
		return fmt.Sprintf("%s?callback=%s&source=launcher", marketplaceAuthURL, callback), nil
	case ServiceNetworks:
		return fmt.Sprintf("%s?callback=%s&source=launcher", networksAuthURL, callback), nil
	}
	return "", fmt.Errorf("unknown service: %s", service)
}

// HandleCallback extracts the token from a deep-link callback URL and stores it.
func (s *Service) HandleCallback(rawURL string) (string, string, error) {
	u, err := url.Parse(rawURL)
	if err != nil {
		return "", "", fmt.Errorf("invalid callback URL: %w", err)
	}

	token := u.Query().Get("token")
	if token == "" {
		return "", "", fmt.Errorf("no token in callback URL")
	}

	// Determine service from path: blockylauncher://auth/blockymarketplace
	service := ServiceMarketplace
	if len(u.Path) > 1 {
		service = u.Path[1:] // strip leading "/"
	}

	if err := s.store.Save(service, token); err != nil {
		return "", "", err
	}

	return service, token, nil
}

func (s *Service) GetToken(service string) (string, error) {
	return s.store.Load(service)
}

func (s *Service) SaveToken(service, token string) error {
	return s.store.Save(service, token)
}

func (s *Service) DeleteToken(service string) error {
	return s.store.Delete(service)
}

func (s *Service) IsSignedIn(service string) bool {
	return s.store.Has(service)
}
