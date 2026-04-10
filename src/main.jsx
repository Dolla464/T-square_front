import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "bootstrap-icons/font/bootstrap-icons.css";
import './index.css'
import App from './App.jsx'
import './i18n'; // استيراد إعدادات الترجمة

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
