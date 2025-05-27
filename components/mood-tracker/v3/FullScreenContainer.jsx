import React from 'react';

const FullScreenContainer = ({ children }) => (
  <div style={{
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '10px',
    alignItems: 'center',
    background: '#ffffff',
    overflow: 'hidden',
    position: 'relative'
  }}>
    {children}
  </div>
);

export default FullScreenContainer; 