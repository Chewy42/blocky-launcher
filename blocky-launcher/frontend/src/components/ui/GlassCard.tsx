// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: string
}

export function GlassCard({
  children,
  className,
  hover = false,
  onClick,
  padding = 'p-5',
}: GlassCardProps) {
  return (
    <motion.div
      className={cn('glass-card', padding, hover && 'cursor-pointer', className)}
      whileHover={hover ? { scale: 1.01 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
