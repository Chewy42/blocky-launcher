// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
package server

import (
	"bufio"
	"fmt"
	"io"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type State string

const (
	StateStopped  State = "STOPPED"
	StateStarting State = "STARTING"
	StateRunning  State = "RUNNING"
	StateStopping State = "STOPPING"
	StateCrashed  State = "CRASHED"
)

type LineCallback func(line string)
type StateCallback func(state State, info string)

type Manager struct {
	mu          sync.Mutex
	state       State
	cmd         *exec.Cmd
	stdin       io.WriteCloser
	onLine      LineCallback
	onState     StateCallback
	stopCh      chan struct{}
	exitCode    int
}

func NewManager(onLine LineCallback, onState StateCallback) *Manager {
	return &Manager{
		state:   StateStopped,
		onLine:  onLine,
		onState: onState,
	}
}

func (m *Manager) GetState() State {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.state
}

func (m *Manager) setState(s State, info string) {
	m.mu.Lock()
	m.state = s
	m.mu.Unlock()
	if m.onState != nil {
		m.onState(s, info)
	}
}

type StartConfig struct {
	JavaPath    string
	ServerFolder string
	ServerJar   string
	JVMArgs     []string
	ProgramArgs []string
	ReadySignal string
}

func (m *Manager) Start(cfg StartConfig) error {
	m.mu.Lock()
	if m.state != StateStopped && m.state != StateCrashed {
		m.mu.Unlock()
		return fmt.Errorf("server is already %s", m.state)
	}
	m.mu.Unlock()

	if cfg.JavaPath == "" {
		cfg.JavaPath = DetectJavaPath()
	}
	if cfg.ReadySignal == "" {
		cfg.ReadySignal = "Done ("
	}

	jarPath := filepath.Join(cfg.ServerFolder, cfg.ServerJar)

	args := []string{}
	args = append(args, cfg.JVMArgs...)
	args = append(args, "-jar", jarPath)
	args = append(args, cfg.ProgramArgs...)

	cmd := exec.Command(cfg.JavaPath, args...)
	cmd.Dir = cfg.ServerFolder

	stdin, err := cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("failed to create stdin pipe: %w", err)
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to create stdout pipe: %w", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start server: %w", err)
	}

	m.mu.Lock()
	m.cmd = cmd
	m.stdin = stdin
	m.stopCh = make(chan struct{})
	m.mu.Unlock()

	m.setState(StateStarting, "")

	go m.readLines(stdout, cfg.ReadySignal)
	go m.readLines(stderr, "")
	go m.waitForExit()

	return nil
}

func (m *Manager) readLines(r io.Reader, readySignal string) {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		line := scanner.Text()
		if m.onLine != nil {
			m.onLine(line)
		}
		if readySignal != "" && strings.Contains(line, readySignal) {
			m.setState(StateRunning, "")
		}
	}
}

func (m *Manager) waitForExit() {
	err := m.cmd.Wait()
	m.mu.Lock()
	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		}
	}
	currentState := m.state
	m.state = StateStopped
	m.cmd = nil
	m.stdin = nil
	m.mu.Unlock()

	if currentState == StateStopping {
		m.setState(StateStopped, "")
	} else if exitCode != 0 {
		m.setState(StateCrashed, fmt.Sprintf("exit code %d", exitCode))
	} else {
		m.setState(StateStopped, "")
	}
}

func (m *Manager) Stop() error {
	m.mu.Lock()
	if m.state != StateRunning && m.state != StateStarting {
		m.mu.Unlock()
		return fmt.Errorf("server is not running")
	}
	stdin := m.stdin
	m.mu.Unlock()

	m.setState(StateStopping, "")

	if stdin != nil {
		_, _ = fmt.Fprintln(stdin, "stop")
	}

	done := make(chan struct{})
	go func() {
		m.mu.Lock()
		cmd := m.cmd
		m.mu.Unlock()
		if cmd != nil {
			_ = cmd.Wait()
		}
		close(done)
	}()

	select {
	case <-done:
		return nil
	case <-time.After(15 * time.Second):
		m.mu.Lock()
		cmd := m.cmd
		m.mu.Unlock()
		if cmd != nil && cmd.Process != nil {
			_ = cmd.Process.Kill()
		}
		return nil
	}
}

func (m *Manager) SendCommand(cmd string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.stdin == nil {
		return fmt.Errorf("server not running")
	}
	_, err := fmt.Fprintln(m.stdin, cmd)
	return err
}
