// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { motion, AnimatePresence } from 'framer-motion'
import { NavPage } from './Sidebar'
import { Dashboard } from '../../pages/Dashboard'
import { PluginsPage } from '../../pages/Plugins'
import { TerminalPage } from '../../pages/TerminalPage'
import { AccountPage } from '../../pages/Account'
import { SettingsPage } from '../../pages/Settings'

interface MainPanelProps {
  activePage: NavPage
  serverName: string
  serverFolder: string
  onStart: () => void
  onStop: () => void
}

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.18 },
}

export function MainPanel({ activePage, serverName, serverFolder, onStart, onStop }: MainPanelProps) {
  return (
    <div className="flex-1 overflow-hidden flex flex-col min-w-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          className="flex-1 overflow-hidden"
          {...pageTransition}
        >
          {activePage === 'dashboard' && (
            <Dashboard serverName={serverName} serverFolder={serverFolder} onStart={onStart} onStop={onStop} />
          )}
          {activePage === 'plugins' && <PluginsPage />}
          {activePage === 'terminal' && <TerminalPage />}
          {activePage === 'account' && <AccountPage />}
          {activePage === 'settings' && <SettingsPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
