// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useAuthStore } from '../../store/authStore'
import { GlassButton } from '../ui/GlassButton'

interface AccountBadgeProps {
  onSignIn: () => void
}

export function AccountBadge({ onSignIn }: AccountBadgeProps) {
  const marketplace = useAuthStore((s) => s.marketplace)

  if (!marketplace) {
    return (
      <GlassButton size="sm" variant="ghost" onClick={onSignIn}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Sign in
      </GlassButton>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {marketplace.avatarUrl ? (
        <img
          src={marketplace.avatarUrl}
          alt={marketplace.displayName}
          className="w-6 h-6 rounded-full object-cover border border-white/15"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-blocky-green/20 border border-blocky-green/30 flex items-center justify-center text-xs text-blocky-green font-semibold">
          {marketplace.displayName?.[0]?.toUpperCase()}
        </div>
      )}
      <span className="text-xs font-medium text-white/80">{marketplace.displayName}</span>
    </div>
  )
}
