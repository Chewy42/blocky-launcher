// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package server

import (
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

// DetectJavaPath scans common system paths and returns the first valid java binary.
func DetectJavaPath() string {
	if jh := os.Getenv("JAVA_HOME"); jh != "" {
		candidate := filepath.Join(jh, "bin", "java")
		if runtime.GOOS == "windows" {
			candidate += ".exe"
		}
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}
	}

	if path, err := exec.LookPath("java"); err == nil {
		return path
	}

	commonPaths := []string{
		"/usr/bin/java",
		"/usr/local/bin/java",
		"/opt/homebrew/opt/openjdk/bin/java",
		"/Library/Java/JavaVirtualMachines",
	}
	for _, p := range commonPaths {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return "java"
}

// ValidateJavaPath runs "java -version" and returns the version string or an error.
func ValidateJavaPath(javaPath string) (string, error) {
	cmd := exec.Command(javaPath, "-version")
	out, err := cmd.CombinedOutput()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(out)), nil
}

// DetectServerJar scans a folder and returns the best candidate server .jar.
func DetectServerJar(folder string) string {
	// Priority patterns
	patterns := []string{
		"HytaleServer.jar",
		"server.jar",
		"hytale*.jar",
		"*.jar",
	}
	for _, pattern := range patterns {
		matches, err := filepath.Glob(filepath.Join(folder, pattern))
		if err == nil && len(matches) > 0 {
			return filepath.Base(matches[0])
		}
	}
	return ""
}

// ValidateServerFolder checks if a folder looks like a Hytale/Minecraft server dir.
func ValidateServerFolder(folder string) (bool, string) {
	if _, err := os.Stat(folder); os.IsNotExist(err) {
		return false, "folder does not exist"
	}
	jar := DetectServerJar(folder)
	if jar == "" {
		return false, "no .jar file found in folder"
	}
	return true, jar
}
