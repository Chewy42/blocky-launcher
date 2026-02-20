// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package marketplace

type UserProfile struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	AvatarURL   string `json:"avatarUrl"`
	Tier        string `json:"tier"`
}

type OwnedPlugin struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Version         string `json:"version"`
	Description     string `json:"description"`
	ThumbnailURL    string `json:"thumbnailUrl"`
	PurchasedAt     string `json:"purchasedAt"`
	IsInstalled     bool   `json:"isInstalled"`
	UpdateAvailable bool   `json:"updateAvailable"`
	DownloadURL     string `json:"downloadUrl,omitempty"`
}

type PluginVersion struct {
	Version   string `json:"version"`
	CreatedAt string `json:"createdAt"`
	Changelog string `json:"changelog"`
}
