// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { App } from '../lib/wails'
import { GlassButton } from '../components/ui/GlassButton'
import { VoiceGuidePlayer } from '../components/ui/VoiceGuidePlayer'
import { useToastStore } from '../store/toastStore'

type Step = 'welcome' | 'eula' | 'folder' | 'java' | 'account' | 'done'

interface OnboardingProps {
  onComplete: () => void
}

// Human-readable labels used in aria-label and displayed in the player.
const STEP_LABELS: Record<Step, string> = {
  welcome: 'Welcome to BlockyLauncher',
  eula: 'Terms & Privacy',
  folder: 'Select Server Folder',
  java: 'Configure Java',
  account: 'Connect Account',
  done: 'You\'re all set!',
}

// Fallback captions shown when audio is unavailable or the user skips the guide.
const STEP_CAPTIONS: Record<Step, string> = {
  welcome: 'Welcome to BlockyLauncher — the cleanest way to manage and run your Hytale server. Click Get Started to begin.',
  eula: 'Please review the Terms of Service and Privacy Policy below, then click I Agree to continue.',
  folder: 'Choose the root folder where your Hytale server is installed so BlockyLauncher can manage it.',
  java: 'BlockyLauncher needs Java 17 or later to run your server. Click Auto-Detect to find a local installation automatically.',
  account: 'Sign in to BlockyMarketplace or BlockyNetworks to access your purchased plugins and claimed servers.',
  done: 'Setup is complete — BlockyLauncher is ready. Click Open BlockyLauncher to get started!',
}

/**
 * Returns the audio URL for the given step.
 * Files are served from /public/audio/ so Vite passes them through without
 * hashing; missing files cause the player to silently degrade to null.
 */
function audioSrcForStep(step: Step): string {
  return `/audio/voice-guide-${step}.mp3`
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const push = useToastStore((s) => s.push)
  const [step, setStep] = useState<Step>('welcome')
  const [serverFolder, setServerFolder] = useState('')
  const [javaInfo, setJavaInfo] = useState<{ path: string; version: string } | null>(null)

  const handleBrowseFolder = async () => {
    const folder = await App.SelectServerFolder()
    if (folder) {
      setServerFolder(folder)
      await App.SetServerFolder(folder)
    }
  }

  const handleDetectJava = async () => {
    const info = await App.DetectJava()
    setJavaInfo(info)
  }

  const handleAcceptEULA = async () => {
    try {
      await App.AcceptEULA()
      setStep('folder')
    } catch (err: unknown) {
      push(String(err), 'error')
    }
  }

  const slideProps = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  }

  return (
    <div className="onboarding-bg h-full flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-6">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div key="welcome" className="text-center" {...slideProps}>
              <div className="w-20 h-20 rounded-3xl bg-blocky-green/20 border-2 border-blocky-green/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(25,179,107,0.25)]">
                <svg className="w-10 h-10 text-blocky-green" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">BlockyLauncher</h1>
              <p className="text-white/55 text-base mb-6">The cleanest way to run your Hytale server.</p>
              <VoiceGuidePlayer
                src={audioSrcForStep('welcome')}
                label={STEP_LABELS.welcome}
                captions={STEP_CAPTIONS.welcome}
                autoPlay
                className="mb-6 text-left"
              />
              <GlassButton variant="primary" size="lg" className="w-full justify-center" onClick={() => setStep('eula')}>
                Get Started
              </GlassButton>
              <p className="text-xs text-white/25 mt-4">
                Not affiliated with Hypixel Studios or the Hytale game.
              </p>
            </motion.div>
          )}

          {step === 'eula' && (
            <motion.div key="eula" {...slideProps}>
              <h2 className="text-xl font-semibold text-white mb-2">Terms & Privacy</h2>
              <p className="text-white/50 text-sm mb-4">Please review and accept to continue.</p>
              <VoiceGuidePlayer
                src={audioSrcForStep('eula')}
                label={STEP_LABELS.eula}
                captions={STEP_CAPTIONS.eula}
                autoPlay
                className="mb-4"
              />
              <div className="glass-card p-4 mb-5 max-h-52 overflow-y-auto text-xs text-white/55 leading-relaxed space-y-2">
                <p><strong className="text-white/80">Copyright © 2026 Favela Tech LLC. All Rights Reserved.</strong></p>
                <p>BlockyLauncher is provided "as is" without warranty. Favela Tech LLC shall not be liable for data loss or server damage arising from use.</p>
                <p>BlockyLauncher is not affiliated with Hypixel Studios or the Hytale game. "Hytale" is a trademark of Hypixel Studios.</p>
                <p>By clicking "I Agree" you accept the Terms of Service and Privacy Policy at blockymarketplace.com/terms and blockymarketplace.com/privacy.</p>
              </div>
              <div className="flex gap-3">
                <GlassButton variant="ghost" className="flex-1 justify-center" onClick={() => window.close()}>
                  Quit
                </GlassButton>
                <GlassButton variant="primary" className="flex-1 justify-center" onClick={handleAcceptEULA}>
                  I Agree
                </GlassButton>
              </div>
            </motion.div>
          )}

          {step === 'folder' && (
            <motion.div key="folder" {...slideProps}>
              <h2 className="text-xl font-semibold text-white mb-2">Select Server Folder</h2>
              <p className="text-white/50 text-sm mb-4">Choose the root folder of your Hytale server installation.</p>
              <VoiceGuidePlayer
                src={audioSrcForStep('folder')}
                label={STEP_LABELS.folder}
                captions={STEP_CAPTIONS.folder}
                autoPlay
                className="mb-4"
              />
              <div
                className="glass-card p-5 mb-4 cursor-pointer hover:border-blocky-green/30 transition-colors text-center"
                onClick={handleBrowseFolder}
              >
                {serverFolder ? (
                  <p className="text-sm font-mono text-blocky-green break-all">{serverFolder}</p>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-white/25 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                    </svg>
                    <p className="text-sm text-white/40">Click to select folder</p>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                <GlassButton variant="ghost" className="flex-1 justify-center" onClick={() => setStep('java')}>
                  Skip
                </GlassButton>
                <GlassButton variant="primary" className="flex-1 justify-center" onClick={() => setStep('java')}>
                  Continue
                </GlassButton>
              </div>
            </motion.div>
          )}

          {step === 'java' && (
            <motion.div key="java" {...slideProps}>
              <h2 className="text-xl font-semibold text-white mb-2">Configure Java</h2>
              <p className="text-white/50 text-sm mb-4">BlockyLauncher needs Java to run your server.</p>
              <VoiceGuidePlayer
                src={audioSrcForStep('java')}
                label={STEP_LABELS.java}
                captions={STEP_CAPTIONS.java}
                autoPlay
                className="mb-4"
              />
              <GlassButton variant="ghost" className="w-full justify-center mb-3" onClick={handleDetectJava}>
                Auto-Detect Java
              </GlassButton>
              {javaInfo && (
                <div className="glass-card p-3 mb-4 text-center">
                  <p className="text-xs text-blocky-green font-mono">{javaInfo.path}</p>
                  <p className="text-xs text-white/50 mt-1">{javaInfo.version}</p>
                </div>
              )}
              <div className="flex gap-3 mt-2">
                <GlassButton variant="ghost" className="flex-1 justify-center" onClick={() => setStep('account')}>
                  Skip
                </GlassButton>
                <GlassButton variant="primary" className="flex-1 justify-center" onClick={() => setStep('account')}>
                  Continue
                </GlassButton>
              </div>
            </motion.div>
          )}

          {step === 'account' && (
            <motion.div key="account" {...slideProps}>
              <h2 className="text-xl font-semibold text-white mb-2">Connect Account</h2>
              <p className="text-white/50 text-sm mb-4">Sign in to load your purchased plugins directly from BlockyMarketplace.</p>
              <VoiceGuidePlayer
                src={audioSrcForStep('account')}
                label={STEP_LABELS.account}
                captions={STEP_CAPTIONS.account}
                autoPlay
                className="mb-4"
              />
              <div className="space-y-3 mb-4">
                <GlassButton variant="primary" className="w-full justify-center" onClick={() => {
                  App.GetMarketplaceAuthURL().then((url) => App.OpenURL(url))
                }}>
                  Sign in to BlockyMarketplace
                </GlassButton>
                <GlassButton variant="ghost" className="w-full justify-center" onClick={() => {
                  App.GetNetworksAuthURL().then((url) => App.OpenURL(url))
                }}>
                  Sign in to BlockyNetworks
                </GlassButton>
              </div>
              <GlassButton variant="ghost" className="w-full justify-center text-white/40" onClick={() => setStep('done')}>
                Skip for now
              </GlassButton>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" className="text-center" {...slideProps}>
              <div className="w-16 h-16 rounded-2xl bg-blocky-green/20 border border-blocky-green/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(25,179,107,0.2)]">
                <svg className="w-8 h-8 text-blocky-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">All Set!</h2>
              <p className="text-white/50 text-sm mb-5">BlockyLauncher is ready to use.</p>
              <VoiceGuidePlayer
                src={audioSrcForStep('done')}
                label={STEP_LABELS.done}
                captions={STEP_CAPTIONS.done}
                autoPlay
                className="mb-6"
              />
              <GlassButton
                variant="primary"
                size="lg"
                className="w-full justify-center"
                onClick={() => {
                  App.MarkVoiceGuideReady().catch(() => {/* non-critical */})
                  onComplete()
                }}
              >
                Open BlockyLauncher
              </GlassButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        {step !== 'welcome' && step !== 'done' && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {(['eula', 'folder', 'java', 'account'] as Step[]).map((s) => (
              <div
                key={s}
                className={`w-1.5 h-1.5 rounded-full transition-all ${s === step ? 'bg-blocky-green w-4' : 'bg-white/20'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
