# Contributing to BlockyLauncher

Thank you for your interest in contributing to BlockyLauncher!

**Copyright © 2026 Favela Tech LLC. All Rights Reserved.**

---

## Before You Contribute

By submitting a pull request, you agree that:

1. Your contribution is your own original work
2. You grant Favela Tech LLC a perpetual, worldwide, non-exclusive, royalty-free license to use, modify, and distribute your contribution as part of BlockyLauncher
3. You have read and agree to the [Terms of Service](TERMS.md)

All contributions remain subject to the project's MIT License.

---

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/blocky-launcher.git`
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Set up development environment (see [README.md](README.md))

---

## Development Workflow

```bash
# Start dev server with hot reload
wails dev

# Run Go tests
go test ./...

# Build frontend only
cd frontend && npm run build

# Build production app
wails build
```

---

## Code Style

### Go

- Follow standard Go formatting (`gofmt`)
- Use `golint` and `go vet`
- Keep functions focused and well-named
- Add copyright header to new files: `// Copyright © 2026 Favela Tech LLC. All Rights Reserved.`

### TypeScript / React

- Use TypeScript strictly — no `any` unless absolutely necessary
- Functional components with hooks
- Zustand for global state, local state for component-specific state
- Framer Motion for all animations
- Follow the existing glassmorphism design system in `src/styles/glass.css`

---

## Pull Request Guidelines

1. Keep PRs focused — one feature or fix per PR
2. Write a clear PR title and description
3. Reference any related GitHub issues
4. Ensure all tests pass: `go test ./...`
5. Ensure frontend builds: `cd frontend && npm run build`
6. Add tests for new Go functionality

---

## What We Welcome

- Bug fixes
- Performance improvements
- New Hytale server detection heuristics
- Better ANSI color parsing in terminal
- Accessibility improvements
- Documentation improvements

## What to Discuss First

Open a GitHub issue before starting on:

- New major features
- Architecture changes
- Changes to the auth flow or API integration

---

## Code of Conduct

Be respectful and constructive. This project follows the
[Code of Conduct](../CODE_OF_CONDUCT.md).

Violations may be reported to: conduct@blockymarketplace.com

---

*Copyright © 2026 Favela Tech LLC. All Rights Reserved.*
