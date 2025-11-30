// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './app.jsx'
// import Admin from './admin.jsx'

// // Simple Router Logic
// const Path = window.location.pathname;

// let ComponentToShow = App; // Default to App
// if (Path === '/admin') {
//   ComponentToShow = Admin; // Show Admin if URL is /admin
// }

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <ComponentToShow />
//   </StrictMode>,
// )










import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app.jsx'
import Admin from './admin.jsx'

// Simple Router Logic
const Path = window.location.pathname;

let ComponentToShow = App; 
if (Path === '/admin') {
  ComponentToShow = Admin;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ComponentToShow />
  </StrictMode>,
)