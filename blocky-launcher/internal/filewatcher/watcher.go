// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package filewatcher

import (
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
)

type EventType string

const (
	EventCreate EventType = "create"
	EventRemove EventType = "remove"
	EventRename EventType = "rename"
)

type Event struct {
	Type     EventType
	Filename string
}

type Callback func(event Event)

type Watcher struct {
	mu       sync.Mutex
	watcher  *fsnotify.Watcher
	folder   string
	callback Callback
	debounce map[string]*time.Timer
	done     chan struct{}
}

func New(callback Callback) (*Watcher, error) {
	w, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}
	return &Watcher{
		watcher:  w,
		callback: callback,
		debounce: make(map[string]*time.Timer),
		done:     make(chan struct{}),
	}, nil
}

func (w *Watcher) Watch(folder string) error {
	w.mu.Lock()
	defer w.mu.Unlock()

	if w.folder != "" {
		_ = w.watcher.Remove(w.folder)
	}
	w.folder = folder

	if err := w.watcher.Add(folder); err != nil {
		return err
	}

	go w.loop()
	return nil
}

func (w *Watcher) loop() {
	for {
		select {
		case event, ok := <-w.watcher.Events:
			if !ok {
				return
			}
			if !strings.HasSuffix(strings.ToLower(event.Name), ".jar") {
				continue
			}
			w.handleEvent(event)
		case _, ok := <-w.watcher.Errors:
			if !ok {
				return
			}
		case <-w.done:
			return
		}
	}
}

func (w *Watcher) handleEvent(event fsnotify.Event) {
	filename := filepath.Base(event.Name)

	w.mu.Lock()
	if timer, ok := w.debounce[filename]; ok {
		timer.Stop()
	}
	w.debounce[filename] = time.AfterFunc(300*time.Millisecond, func() {
		var evType EventType
		switch {
		case event.Has(fsnotify.Create):
			evType = EventCreate
		case event.Has(fsnotify.Remove):
			evType = EventRemove
		case event.Has(fsnotify.Rename):
			evType = EventRename
		default:
			return
		}
		if w.callback != nil {
			w.callback(Event{Type: evType, Filename: filename})
		}
	})
	w.mu.Unlock()
}

func (w *Watcher) Stop() {
	close(w.done)
	_ = w.watcher.Close()
}
