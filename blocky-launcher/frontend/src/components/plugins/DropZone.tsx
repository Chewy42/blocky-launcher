// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface DropZoneProps {
  onDrop: (paths: string[]) => void
  onBrowse: () => void
}

export function DropZone({ onDrop, onBrowse }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    const paths: string[] = []
    for (const item of Array.from(e.dataTransfer.files)) {
      if (item.name.endsWith('.jar')) {
        // In Wails, file path accessible via webkitRelativePath or direct
        const path = (item as File & { path?: string }).path || item.name
        if (path) paths.push(path)
      }
    }
    if (paths.length > 0) onDrop(paths)
  }, [onDrop])

  return (
    <motion.div
      className={`drop-zone flex flex-col items-center justify-center gap-3 py-8 px-6 cursor-pointer select-none ${dragging ? 'drop-zone-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onBrowse}
      animate={dragging ? { scale: 1.01 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${dragging ? 'border-blocky-green bg-blocky-green/15 text-blocky-green' : 'border-white/15 bg-white/5 text-white/30'}`}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <div className="text-center">
        <p className={`text-sm font-medium transition-colors ${dragging ? 'text-blocky-green' : 'text-white/40'}`}>
          {dragging ? 'Drop to install' : 'Drop .jar files here to install'}
        </p>
        <p className="text-xs text-white/25 mt-1">or click to browse</p>
      </div>
    </motion.div>
  )
}
