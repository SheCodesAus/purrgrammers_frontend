// in our previous project we deleted app.jsx and used main.jsx as a direct routing approach
// this app is better suited to use the react standard approach where main.jsx handles routing and app.jsx handles application logic
// our tool in particular - 
// complex state management, authentication context, conditional rendering, component hierarchy
// also easier to unit test - if we do so

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './components/AuthProvider.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
