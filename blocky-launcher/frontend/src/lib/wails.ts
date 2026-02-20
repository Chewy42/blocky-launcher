// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
// Typed Wails bindings — wraps auto-generated JS from Go methods

import * as AppBindings from '../../wailsjs/go/main/App'
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime'

export const App = AppBindings

export { EventsOn, EventsOff }

// Event name constants
export const Events = {
  SERVER_STATE:    'server:state',
  TERMINAL_LINE:   'terminal:line',
  TERMINAL_CLEAR:  'terminal:clear',
  PLUGINS_UPDATED: 'plugins:updated',
  AUTH_UPDATED:    'auth:updated',
} as const
