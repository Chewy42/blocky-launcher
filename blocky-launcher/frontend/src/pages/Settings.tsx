// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useState, useEffect } from 'react'
import { App } from '../lib/wails'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { useToastStore } from '../store/toastStore'

interface Settings {
  terminalFontSize: number
  terminalMaxLines: number
  showTimestamps: boolean
  showLineNumbers: boolean
  autoScroll: boolean
  notifyOnCrash: boolean
  checkUpdates: boolean
  analyticsOptIn: boolean
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-5.5 rounded-full relative transition-colors duration-200 shrink-0 ${value ? 'bg-blocky-green' : 'bg-white/15'}`}
    >
      <span
        className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-medium text-white/85">{label}</p>
        {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function SettingsPage() {
  const push = useToastStore((s) => s.push)
  const [settings, setSettings] = useState<Settings>({
    terminalFontSize: 13,
    terminalMaxLines: 5000,
    showTimestamps: false,
    showLineNumbers: false,
    autoScroll: true,
    notifyOnCrash: true,
    checkUpdates: true,
    analyticsOptIn: false,
  })

  useEffect(() => {
    App.GetConfig().then((cfg) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (cfg.settings) setSettings(cfg.settings as any)
    })
  }, [])

  const update = (key: keyof Settings, value: unknown) => {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const handleSave = async () => {
    try {
      const cfg = await App.GetConfig()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await App.SaveConfig({ ...(cfg as any), settings: settings as any })
      push('Settings saved', 'success')
    } catch (err: unknown) {
      push(String(err), 'error')
    }
  }

  const handleReset = async () => {
    const defaults: Settings = {
      terminalFontSize: 13,
      terminalMaxLines: 5000,
      showTimestamps: false,
      showLineNumbers: false,
      autoScroll: true,
      notifyOnCrash: true,
      checkUpdates: true,
      analyticsOptIn: false,
    }
    setSettings(defaults)
    push('Settings reset to defaults', 'info')
  }

  return (
    <div className="h-full overflow-y-auto p-5 space-y-4">
      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-1">Terminal</h3>
        <div className="space-y-0.5">
          <SettingRow label="Font Size" description={`${settings.terminalFontSize}px`}>
            <input
              type="range"
              min={10}
              max={18}
              value={settings.terminalFontSize}
              onChange={(e) => update('terminalFontSize', parseInt(e.target.value))}
              className="w-28 accent-blocky-green"
            />
          </SettingRow>
          <SettingRow label="Max Lines" description="Lines kept in terminal buffer">
            <input
              type="number"
              min={100}
              max={20000}
              step={500}
              value={settings.terminalMaxLines}
              onChange={(e) => update('terminalMaxLines', parseInt(e.target.value))}
              className="glass-input w-24 px-2.5 py-1.5 text-sm text-right font-mono"
            />
          </SettingRow>
          <SettingRow label="Auto-scroll">
            <Toggle value={settings.autoScroll} onChange={(v) => update('autoScroll', v)} />
          </SettingRow>
          <SettingRow label="Show Timestamps">
            <Toggle value={settings.showTimestamps} onChange={(v) => update('showTimestamps', v)} />
          </SettingRow>
          <SettingRow label="Show Line Numbers">
            <Toggle value={settings.showLineNumbers} onChange={(v) => update('showLineNumbers', v)} />
          </SettingRow>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-1">Notifications</h3>
        <div>
          <SettingRow label="Notify on Server Crash">
            <Toggle value={settings.notifyOnCrash} onChange={(v) => update('notifyOnCrash', v)} />
          </SettingRow>
          <SettingRow label="Check for Updates on Launch">
            <Toggle value={settings.checkUpdates} onChange={(v) => update('checkUpdates', v)} />
          </SettingRow>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-1">Privacy</h3>
        <div>
          <SettingRow label="Anonymous Analytics" description="Help improve BlockyLauncher (opt-in only)">
            <Toggle value={settings.analyticsOptIn} onChange={(v) => update('analyticsOptIn', v)} />
          </SettingRow>
        </div>
      </GlassCard>

      <div className="flex items-center justify-between gap-3">
        <GlassButton size="sm" variant="ghost" onClick={handleReset} className="text-red-400/80">
          Reset All Settings
        </GlassButton>
        <GlassButton size="sm" variant="primary" onClick={handleSave}>
          Save Settings
        </GlassButton>
      </div>

      {/* About */}
      <GlassCard className="text-center" padding="p-4">
        <p className="text-xs font-semibold text-white/70">BlockyLauncher v1.0.0</p>
        <p className="text-xs text-white/35 mt-1">Copyright © 2026 Favela Tech LLC</p>
        <p className="text-xs text-white/25 mt-1">
          Not affiliated with Hypixel Studios or the Hytale game.
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            onClick={() => App.OpenURL('https://blockymarketplace.com/terms')}
            className="text-xs text-blocky-green hover:underline"
          >
            Terms of Service
          </button>
          <button
            onClick={() => App.OpenURL('https://blockymarketplace.com/privacy')}
            className="text-xs text-blocky-green hover:underline"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => App.OpenURL('https://github.com/Chewy42/blocky-launcher')}
            className="text-xs text-blocky-green hover:underline"
          >
            GitHub
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
