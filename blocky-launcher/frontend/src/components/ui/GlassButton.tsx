// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'danger' | 'ghost'

interface GlassButtonProps {
  children: React.ReactNode
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
}

const variantClass: Record<Variant, string> = {
  primary: 'glass-button-primary',
  danger: 'glass-button-danger',
  ghost: 'glass-button-ghost',
}

const sizeClass = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function GlassButton({
  children,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className,
  type = 'button',
}: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      className={cn(variantClass[variant], sizeClass[size], 'rounded-xl font-medium select-none flex items-center gap-2', className)}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
    >
      {loading && (
        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}
