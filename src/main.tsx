import { getRouter } from './router'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const router = getRouter()

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)