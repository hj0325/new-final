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
    background: 'url(/second.jpg) center/cover no-repeat',
    overflow: 'hidden',
    position: 'relative'
  }}>
    {children}
  </div>
);

export default FullScreenContainer; 