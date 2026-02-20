// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package auth

import (
	"os"
	"path/filepath"
)

type TokenStore struct {
	dir string
}

func NewTokenStore() (*TokenStore, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}
	dir := filepath.Join(homeDir, ".blockylauncher")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}
	return &TokenStore{dir: dir}, nil
}

func (t *TokenStore) Save(service, token string) error {
	path := filepath.Join(t.dir, service+".token")
	return os.WriteFile(path, []byte(token), 0600)
}

func (t *TokenStore) Load(service string) (string, error) {
	path := filepath.Join(t.dir, service+".token")
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func (t *TokenStore) Delete(service string) error {
	path := filepath.Join(t.dir, service+".token")
	err := os.Remove(path)
	if os.IsNotExist(err) {
		return nil
	}
	return err
}

func (t *TokenStore) Has(service string) bool {
	_, err := t.Load(service)
	return err == nil
}
