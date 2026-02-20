// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package terminal

import (
	"sync"
)

// LineType classifies terminal output for frontend colorization.
type LineType string

const (
	LineInfo    LineType = "INFO"
	LineWarn    LineType = "WARN"
	LineError   LineType = "ERROR"
	LineDone    LineType = "DONE"
	LineDefault LineType = "DEFAULT"
)

type Line struct {
	Text      string   `json:"text"`
	Type      LineType `json:"type"`
	Timestamp string   `json:"timestamp"`
}

type Bridge struct {
	mu       sync.Mutex
	lines    []Line
	maxLines int
}

func NewBridge(maxLines int) *Bridge {
	if maxLines <= 0 {
		maxLines = 5000
	}
	return &Bridge{
		lines:    make([]Line, 0, maxLines),
		maxLines: maxLines,
	}
}

func (b *Bridge) AddLine(line Line) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.lines = append(b.lines, line)
	if len(b.lines) > b.maxLines {
		b.lines = b.lines[len(b.lines)-b.maxLines:]
	}
}

func (b *Bridge) GetLines() []Line {
	b.mu.Lock()
	defer b.mu.Unlock()
	out := make([]Line, len(b.lines))
	copy(out, b.lines)
	return out
}

func (b *Bridge) Clear() {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.lines = b.lines[:0]
}

func (b *Bridge) SetMaxLines(n int) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.maxLines = n
}
