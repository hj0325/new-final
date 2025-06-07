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
    background: '#000000',
    overflow: 'hidden',
    position: 'relative'
  }}>
    {/* 배경 MOMO 텍스트 */}
    <div style={{
      position: 'absolute',
      top: '30%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: 'min(30vw, 30vh)',
      fontWeight: 'bold',
      color: 'rgba(255, 255, 255, 0.19)',
      fontFamily: 'Arial, sans-serif',
      pointerEvents: 'none',
      zIndex: 0,
      userSelect: 'none'
    }}>
      MOMO
    </div>
    {children}
  </div>
);

export default FullScreenContainer; 