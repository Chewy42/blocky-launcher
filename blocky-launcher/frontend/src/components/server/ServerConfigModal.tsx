// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useState, useEffect } from 'react'
import { GlassModal } from '../ui/GlassModal'
import { GlassButton } from '../ui/GlassButton'
import { App } from '../../lib/wails'
import { useToastStore } from '../../store/toastStore'

interface ServerConfigModalProps {
  open: boolean
  onClose: () => void
}

export function ServerConfigModal({ open, onClose }: ServerConfigModalProps) {
  const push = useToastStore((s) => s.push)
  const [serverFolder, setServerFolder] = useState('')
  const [serverJar, setServerJar] = useState('')
  const [javaPath, setJavaPath] = useState('')
  const [javaInfo, setJavaInfo] = useState('')
  const [jvmArgs, setJvmArgs] = useState('-Xmx4G -Xms1G')
  const [readySignal, setReadySignal] = useState('Done (')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    App.GetConfig().then((cfg) => {
      const p = cfg.profiles?.find((p: { id: string }) => p.id === cfg.activeProfile) ?? cfg.profiles?.[0]
      if (p) {
        setServerFolder(p.serverFolder || '')
        setServerJar(p.serverJar || '')
        setJavaPath(p.javaPath || '')
        setJvmArgs((p.jvmArgs || []).join(' '))
        setReadySignal(p.readySignal || 'Done (')
      }
    })
  }, [open])

  const handleBrowseFolder = async () => {
    const folder = await App.SelectServerFolder()
    if (folder) {
      setServerFolder(folder)
      const v = await App.ValidateServerFolder(folder)
      if (v.detectedJar) setServerJar(v.detectedJar)
    }
  }

  const handleDetectJava = async () => {
    const info = await App.DetectJava()
    setJavaPath(info.path)
    setJavaInfo(info.version || (info.valid ? 'Detected' : 'Not found'))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const cfg = await App.GetConfig()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profiles = (cfg.profiles || []) as unknown as Array<Record<string, unknown>>
      const idx = profiles.findIndex((p) => p['id'] === cfg.activeProfile)
      const profile: Record<string, unknown> = idx >= 0
        ? { ...profiles[idx] }
        : { id: 'default', name: 'My Server', modsFolder: 'mods', programArgs: ['--nogui'], readySignal: 'Done (' }
      profile['serverFolder'] = serverFolder
      profile['serverJar'] = serverJar
      profile['javaPath'] = javaPath
      profile['jvmArgs'] = jvmArgs.trim() ? jvmArgs.trim().split(/\s+/) : []
      profile['readySignal'] = readySignal
      if (idx >= 0) profiles[idx] = profile
      else profiles.push(profile)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await App.SaveConfig({ ...(cfg as any), profiles: profiles as any })
      if (serverFolder) await App.SetServerFolder(serverFolder)
      push('Configuration saved', 'success')
      onClose()
    } catch (err: unknown) {
      push(String(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <GlassModal open={open} onClose={onClose} title="Server Configuration" width="w-full max-w-xl">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">Server Folder</label>
          <div className="flex gap-2">
            <input
              className="glass-input flex-1 px-3 py-2 text-sm font-mono"
              value={serverFolder}
              onChange={(e) => setServerFolder(e.target.value)}
              placeholder="/path/to/HytaleServer"
            />
            <GlassButton size="sm" onClick={handleBrowseFolder}>Browse</GlassButton>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">Server JAR</label>
          <input
            className="glass-input w-full px-3 py-2 text-sm font-mono"
            value={serverJar}
            onChange={(e) => setServerJar(e.target.value)}
            placeholder="HytaleServer.jar"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">Java Path</label>
          <div className="flex gap-2">
            <input
              className="glass-input flex-1 px-3 py-2 text-sm font-mono"
              value={javaPath}
              onChange={(e) => setJavaPath(e.target.value)}
              placeholder="Auto-detect"
            />
            <GlassButton size="sm" onClick={handleDetectJava}>Detect</GlassButton>
          </div>
          {javaInfo && <p className="text-xs text-emerald-400 mt-1 font-mono">{javaInfo}</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">JVM Arguments</label>
          <input
            className="glass-input w-full px-3 py-2 text-sm font-mono"
            value={jvmArgs}
            onChange={(e) => setJvmArgs(e.target.value)}
            placeholder="-Xmx4G -Xms1G"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/60 mb-1.5 block">Ready Signal</label>
          <input
            className="glass-input w-full px-3 py-2 text-sm font-mono"
            value={readySignal}
            onChange={(e) => setReadySignal(e.target.value)}
            placeholder="Done ("
          />
          <p className="text-xs text-white/30 mt-1">Text pattern in stdout that indicates the server is ready</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <GlassButton onClick={onClose}>Cancel</GlassButton>
          <GlassButton variant="primary" onClick={handleSave} loading={saving}>Save</GlassButton>
        </div>
      </div>
    </GlassModal>
  )
}
