import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ElectronProvider } from './context/ElectronContext.jsx'

import { Toaster } from '@/components/ui/sonner'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ElectronProvider>
        <App />
        <Toaster />
      </ElectronProvider>
  </StrictMode>
)
