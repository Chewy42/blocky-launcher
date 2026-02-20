// Copyright © 2026 Favela Tech LLC. All Rights Reserved.
import React from 'react'
import {createRoot} from 'react-dom/client'
import './styles/globals.css'
import App from './App'

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
)
