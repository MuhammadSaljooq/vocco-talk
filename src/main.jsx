import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Ensure root element exists and has background
const rootElement = document.getElementById('root')
if (rootElement) {
  rootElement.style.backgroundColor = '#020304'
  rootElement.style.minHeight = '100vh'
}

const root = ReactDOM.createRoot(rootElement)

// Render app immediately - no loading delay
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

