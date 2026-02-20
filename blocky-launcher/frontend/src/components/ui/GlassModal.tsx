// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GlassModalProps {
  open: boolean
  onClose?: () => void
  title?: string
  children: React.ReactNode
  className?: string
  width?: string
}

export function GlassModal({
  open,
  onClose,
  title,
  children,
  className,
  width = 'w-full max-w-lg',
}: GlassModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 glass-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn('glass-modal relative z-10 p-6', width, className)}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {title && (
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-white">{title}</h2>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
