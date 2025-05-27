import React from 'react';

function EmotionColumn({ emoji = '😀', keywords = [], sliderValue = 50, onSliderChange }) {
  return (
    <div style={{
      width: 260,
      minWidth: 220,
      minHeight: '100vh',
      background: '#B02B3A',
      borderRadius: 30,
      padding: '24px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 24,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        width: '100%',
        background: '#D2F2E9',
        color: '#222',
        fontWeight: 700,
        fontSize: 22,
        borderRadius: 12,
        textAlign: 'center',
        padding: '10px 0',
        marginTop: 22, 
        marginBottom: 1
      }}>감정 무게</div>
      <div style={{
        width: '90%',
        background: 'white',
        borderRadius: 18,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '18px 0 18px 0',
        marginBottom: 30
      }}>
        <div style={{ fontSize: 60, marginBottom: 10, minHeight: 72 }}>{emoji || ''}</div>
        <div style={{ width: '80%', height: 18, background: '#BFE2D6', borderRadius: 9, position: 'relative', margin: '10px 0' }}>
          <div style={{
            position: 'absolute',
            left: `calc(${sliderValue}% - 18px)`,
            top: -7,
            width: 32,
            height: 32,
            background: '#E94B5A',
            borderRadius: '50%',
            boxShadow: '0 2px 6px rgba(0,0,0,0.13)',
            border: '3px solid #fff',
            transition: 'left 0.2s'
          }} />
        </div>
      </div>
      <div style={{
        width: '90%',
        background: 'white',
        borderRadius: 18,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        padding: '16px 10px',
        marginBottom: 8,
        fontSize: 18,
        color: '#222',
        textAlign: 'left',
        minHeight: 90,
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>감정 배워보기</div>
        <div style={{ minHeight: 24 }}>
          {keywords && keywords.length > 0 ? keywords.map((k, i) => (
            <span key={i} style={{ marginRight: 8 }}>{k}</span>
          )) : ''}
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <button
        style={{
          width: '90%',
          background: 'white',
          color: '#B02B3A',
          border: 'none',
          borderRadius: 18,
          fontWeight: 700,
          fontSize: 20,
          padding: '12px 0',
          marginTop: 'auto',
          marginBottom: 40,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          cursor: 'pointer'
        }}
      >만들기 시작</button>
    </div>
  );
}

export default EmotionColumn; 