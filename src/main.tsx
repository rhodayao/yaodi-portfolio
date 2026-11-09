import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/archivo'
import '@fontsource-variable/space-grotesk'
import './styles/global.css'
import './styles/project.css'
import './styles/admin.css'
import App from './App'
import { ContentProvider } from './context/ContentContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ContentProvider>
        <App />
      </ContentProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
