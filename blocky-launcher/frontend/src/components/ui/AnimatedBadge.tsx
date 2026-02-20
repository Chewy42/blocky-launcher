// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

type Color = 'green' | 'red' | 'yellow' | 'gray'

interface AnimatedBadgeProps {
  label: string
  color?: Color
  pulse?: boolean
  className?: string
}

const colorClass: Record<Color, string> = {
  green: 'badge-green',
  red: 'badge-red',
  yellow: 'badge-yellow',
  gray: 'badge-gray',
}

export function AnimatedBadge({ label, color = 'gray', pulse, className }: AnimatedBadgeProps) {
  return (
    <motion.span
      className={cn('badge', colorClass[color], className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {pulse && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
          style={{
            background: color === 'green' ? '#19B36B' : color === 'red' ? '#E03A3E' : '#F2B705',
            animation: 'statusPulse 2s ease-in-out infinite',
          }}
        />
      )}
      {label}
    </motion.span>
  )
}
