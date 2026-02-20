// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plugin } from '../../store/pluginStore'
import { formatBytes } from '../../lib/utils'
import { GlassModal } from '../ui/GlassModal'
import { GlassButton } from '../ui/GlassButton'

interface PluginCardProps {
  plugin: Plugin
  onRemove: (filename: string) => void
  onToggle: (filename: string, enabled: boolean) => void
}

const sourceBadge: Record<string, { label: string; color: string }> = {
  blockymarketplace: { label: 'Marketplace', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  blockynetworks: { label: 'Networks', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  local: { label: 'Local', color: 'text-white/40 bg-white/5 border-white/10' },
}

export function PluginCard({ plugin, onRemove, onToggle }: PluginCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const badge = sourceBadge[plugin.source] ?? sourceBadge.local

  return (
    <>
      <motion.div
        className={`glass-card p-4 flex flex-col gap-3 ${!plugin.enabled ? 'opacity-50' : ''}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        layout
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white truncate">{plugin.name}</span>
              {plugin.version && (
                <span className="text-xs text-white/40 font-mono">v{plugin.version}</span>
              )}
            </div>
            {plugin.author && (
              <p className="text-xs text-white/40 mt-0.5">by {plugin.author}</p>
            )}
          </div>
          <span className={`badge border text-xs shrink-0 ${badge.color}`}>{badge.label}</span>
        </div>

        {/* Description */}
        {plugin.description && (
          <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{plugin.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
          <span className="text-xs text-white/30 font-mono">{formatBytes(plugin.fileSize)}</span>
          <div className="flex items-center gap-2">
            {/* Toggle */}
            <button
              onClick={() => onToggle(plugin.filename, !plugin.enabled)}
              className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${plugin.enabled ? 'bg-blocky-green' : 'bg-white/15'}`}
              title={plugin.enabled ? 'Disable' : 'Enable'}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${plugin.enabled ? 'translate-x-4' : 'translate-x-0.5'}`}
              />
            </button>
            {/* Delete */}
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/15 text-white/30 hover:text-red-400 transition-colors"
              title="Remove"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {confirmDelete && (
          <GlassModal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Remove Plugin" width="w-full max-w-sm">
            <p className="text-sm text-white/70 mb-5">
              Remove <strong className="text-white">{plugin.name}</strong>? This will delete the .jar file.
            </p>
            <div className="flex justify-end gap-3">
              <GlassButton onClick={() => setConfirmDelete(false)}>Cancel</GlassButton>
              <GlassButton
                variant="danger"
                onClick={() => { onRemove(plugin.filename); setConfirmDelete(false) }}
              >
                Remove
              </GlassButton>
            </div>
          </GlassModal>
        )}
      </AnimatePresence>
    </>
  )
}
