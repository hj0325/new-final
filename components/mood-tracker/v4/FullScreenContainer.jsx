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
    background: 'linear-gradient(135deg, #87CEEB 0%, #87CEFA 50%, #B0E0E6 100%)',
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