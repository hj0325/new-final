import React from 'react';
import { useRouter } from 'next/router';

export default function LandingPage() {
  const router = useRouter();

  const handlePlayClick = () => {
    router.push('/mood-tracker');
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'red', // 빨간색 배경
      flexDirection: 'column'
    }}>
      <button
        onClick={handlePlayClick}
        style={{
          padding: '20px 40px',
          fontSize: '24px',
          cursor: 'pointer',
          background: 'white',
          color: 'red',
          border: '2px solid white',
          borderRadius: '10px',
          fontWeight: 'bold',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        }}
      >
        Play
      </button>
    </div>
  );
} 