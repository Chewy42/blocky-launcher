// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Sidebar, NavPage } from './components/layout/Sidebar'
import { TitleBar } from './components/layout/TitleBar'
import { MainPanel } from './components/layout/MainPanel'
import { LoginModal } from './components/auth/LoginModal'
import { ToastContainer } from './components/ui/ToastContainer'
import { Onboarding } from './pages/Onboarding'
import { useServer } from './hooks/useServer'
import { usePlugins } from './hooks/usePlugins'
import { useServerStore } from './store/serverStore'
import { useAuthStore } from './store/authStore'
import { App as WailsApp, EventsOn, Events } from './lib/wails'
import type { ServerState } from './store/serverStore'

export default function App() {
  const [activePage, setActivePage] = useState<NavPage>('dashboard')
  const [loginOpen, setLoginOpen] = useState(false)
  const [serverName, setServerName] = useState('')
  const [serverFolder, setServerFolder] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [appReady, setAppReady] = useState(false)

  const { setState: setServerState } = useServerStore()
  const { setMarketplace, setNetworks } = useAuthStore()
  const { startServer, stopServer } = useServer()
  const { refresh: refreshPlugins } = usePlugins()

  useEffect(() => {
    WailsApp.GetConfig().then((cfg) => {
      if (cfg.firstLaunch || !cfg.eulaAccepted) {
        setShowOnboarding(true)
      }
      const profile = cfg.profiles?.find((p: { id: string }) => p.id === cfg.activeProfile) ?? cfg.profiles?.[0]
      if (profile) {
        setServerName(profile.name || 'My Server')
        setServerFolder(profile.serverFolder || '')
      }
      if (cfg.accounts?.blockymarketplace) setMarketplace(cfg.accounts.blockymarketplace)
      if (cfg.accounts?.blockynetworks) setNetworks(cfg.accounts.blockynetworks)
      setAppReady(true)
    }).catch(() => {
      setShowOnboarding(true)
      setAppReady(true)
    })

    WailsApp.GetServerState().then((state) => {
      if (state) setServerState(state as ServerState)
    })

    const unsubState = EventsOn(Events.SERVER_STATE, (data: { state: string; info: string }) => {
      setServerState(data.state as ServerState, data.info)
    })

    const unsubPlugins = EventsOn(Events.PLUGINS_UPDATED, () => {
      refreshPlugins()
    })

    const unsubAuth = EventsOn(Events.AUTH_UPDATED, (service: string) => {
      WailsApp.GetConfig().then((cfg) => {
        if (service === 'blockymarketplace' && cfg.accounts?.blockymarketplace) {
          setMarketplace(cfg.accounts.blockymarketplace)
        }
        if (service === 'blockynetworks' && cfg.accounts?.blockynetworks) {
          setNetworks(cfg.accounts.blockynetworks)
        }
      })
    })

    return () => {
      unsubState?.()
      unsubPlugins?.()
      unsubAuth?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (appReady && !showOnboarding) {
      refreshPlugins()
    }
  }, [appReady, showOnboarding, refreshPlugins])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    WailsApp.GetConfig().then((cfg) => {
      const profile = cfg.profiles?.find((p: { id: string }) => p.id === cfg.activeProfile) ?? cfg.profiles?.[0]
      if (profile) {
        setServerName(profile.name || 'My Server')
        setServerFolder(profile.serverFolder || '')
      }
    })
    refreshPlugins()
  }

  if (!appReady) return null

  if (showOnboarding) {
    return (
      <>
        <Onboarding onComplete={handleOnboardingComplete} />
        <ToastContainer />
      </>
    )
  }

  return (
    <div className="app-bg h-screen flex flex-col overflow-hidden">
      <TitleBar serverName={serverName} onStart={startServer} onStop={stopServer} />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          onLoginClick={() => setLoginOpen(true)}
        />
        <MainPanel
          activePage={activePage}
          serverName={serverName}
          serverFolder={serverFolder}
          onStart={startServer}
          onStop={stopServer}
        />
      </div>

      <AnimatePresence>
        {loginOpen && <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />}
      </AnimatePresence>

      <ToastContainer />
    </div>
  )
}
