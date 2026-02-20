// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { GlassModal } from '../ui/GlassModal'
import { GlassButton } from '../ui/GlassButton'
import { useAuth } from '../../hooks/useAuth'

interface LoginModalProps {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { openMarketplaceLogin, openNetworksLogin } = useAuth()

  const handleMarketplace = () => {
    openMarketplaceLogin()
    onClose()
  }

  const handleNetworks = () => {
    openNetworksLogin()
    onClose()
  }

  return (
    <GlassModal open={open} onClose={onClose} title="Sign in to Your Account" width="w-full max-w-sm">
      <p className="text-sm text-white/60 mb-5 leading-relaxed">
        Sign in to load your purchased plugins directly into your server.
      </p>

      <div className="space-y-3">
        <GlassButton variant="primary" className="w-full justify-center" onClick={handleMarketplace}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Sign in to BlockyMarketplace
        </GlassButton>

        <GlassButton variant="ghost" className="w-full justify-center" onClick={handleNetworks}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          Sign in to BlockyNetworks
        </GlassButton>
      </div>

      <p className="text-xs text-white/25 mt-4 text-center">
        Your browser will open to complete sign-in
      </p>
    </GlassModal>
  )
}
