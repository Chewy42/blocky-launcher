// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import { Terminal } from '../components/terminal/Terminal'

export function TerminalPage() {
  return (
    <div className="h-full flex flex-col p-5">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-sm font-semibold text-white">Server Terminal</h2>
        <span className="badge badge-gray">Live</span>
      </div>
      <div className="flex-1 min-h-0">
        <Terminal />
      </div>
    </div>
  )
}
