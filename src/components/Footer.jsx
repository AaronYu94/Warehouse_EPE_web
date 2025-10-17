import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #e9ecef',
      padding: '8px 16px',
      fontSize: '12px',
      color: '#6c757d',
      textAlign: 'center',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <strong>WareEPE</strong> v1.0.0 - Vietnam Export Processing Warehouse Management System
      </div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        © 2025 Aaron(Hawen) Yu. All rights reserved.
      </div>
      <div style={{ flex: 1, textAlign: 'right' }}>
        Contact: <a href="mailto:aaronyu0094@gmail.com" style={{ color: '#007bff', textDecoration: 'none' }}>
          aaronyu0094@gmail.com
        </a>
      </div>
    </footer>
  );
};

export default Footer; 