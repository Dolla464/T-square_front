import React from 'react';
import { Spinner } from 'react-bootstrap';
import logo from './assets/logo-dark.webp';

/**
 * Loading Component
 * A professional and lightweight loading screen for T-Square platform.
 * Displays the brand logo with a subtle pulse animation and a branded spinner.
 */
const Loading = () => {
  const primaryRed = '#c51c24';
  


  return (
    <div 
      className="loading-container d-flex flex-column justify-content-center align-items-center vh-100"
      style={{ backgroundColor: '#f8f9fa' }}
    >
      {/* يظهر اللوجو فقط في أول مرة يفتح فيها المستخدم الموقع في الجلسة الحالية */}
        <div className="logo-wrapper mb-4 text-center">
          <img 
            src={logo} 
            alt="T-Square Logo" 
            className="img-fluid"
            style={{ 
              maxWidth: '180px', 
              height: 'auto',
              animation: 'logo-pulse 2s infinite ease-in-out'
            }} 
          />
        </div>
      

      {/* سبينر التحميل يظهر دائماً */}
      <div className="spinner-wrapper">
        <Spinner variant='danger'
          animation="border" 
          role="status"
          
        >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>

      {/* Internal CSS for Logo Pulse Animation */}
      <style>
        {`
          @keyframes logo-pulse {
            0% { transform: scale(0.98); opacity: 0.85; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(0.98); opacity: 0.85; }
          }
          .loading-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
          }
        `}
      </style>
    </div>
  );
};

export default Loading;
