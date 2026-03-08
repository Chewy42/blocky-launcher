# Voice Guide Audio Files

Place finalized voice guide MP3s here. Each file corresponds to an onboarding step.

| File | Step | Content |
|------|------|---------|
| `voice-guide-welcome.mp3` | Welcome | Introduction to BlockyLauncher |
| `voice-guide-eula.mp3` | Terms & Privacy | Summary of the license agreement |
| `voice-guide-folder.mp3` | Select Server Folder | How to choose a server directory |
| `voice-guide-java.mp3` | Configure Java | Java detection and requirements |
| `voice-guide-account.mp3` | Connect Account | BlockyMarketplace / BlockyNetworks sign-in |
| `voice-guide-done.mp3` | All Set | Completion message |

## Requirements
- Format: MP3 (44.1 kHz, 128 kbps or higher)
- Max duration per clip: ~60 seconds
- The player degrades gracefully if a file is missing — no error is shown to the user.

## Accessibility
The `VoiceGuidePlayer` component is fully keyboard-navigable:
- **Space** — play / pause (when player container is focused)
- **Arrow Left / Right** — seek ±5 seconds on the progress slider
- All controls have `aria-label` attributes and meet WCAG 2.1 AA contrast requirements.
