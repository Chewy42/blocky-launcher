// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { ServerCard } from '../components/server/ServerCard'
import { PluginList } from '../components/plugins/PluginList'

interface DashboardProps {
  serverName: string
  serverFolder: string
  onStart: () => void
  onStop: () => void
}

export function Dashboard({ serverName, serverFolder, onStart, onStop }: DashboardProps) {
  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto">
      <ServerCard
        serverName={serverName}
        serverFolder={serverFolder}
        onStart={onStart}
        onStop={onStop}
      />
      <div className="flex-1 glass-card p-5 min-h-0">
        <PluginList />
      </div>
    </div>
  )
}
