import React from 'react';

function EmotionColumn({ emojis = [], keywords = [], sliderValue = 5, onSliderChange }) {
  // 이모티콘 개수에 따른 동적 높이 계산
  const baseEmojiHeight = 150; // 기본 이모티콘 영역 높이
  const emojiHeight = 65; // 이모티콘당 추가 높이
  const dynamicEmojiSectionHeight = baseEmojiHeight + (Math.max(0, emojis.length - 1) * emojiHeight);
  const totalEmotionWeightHeight = dynamicEmojiSectionHeight + 80; // 제목과 패딩 포함
  
  return (
    <div style={{
      width: 260,
      minWidth: 220,
      minHeight: '100vh',
      background: '#F5E6A8',
      borderRadius: 30,
      padding: '24px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 24,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
    }}>
      {/* 첫 번째 빨간 네모 박스 - 감정 무게 섹션 */}
      <div style={{
        width: '100%',
        background: '#B02B3A',
        borderRadius: 15,
        padding: '15px',
        marginTop: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: `${totalEmotionWeightHeight}px` // 동적 높이
      }}>
        {/* 감정 무게 제목 */}
        <div style={{
          width: '100%',
          background: 'white',
          color: '#222',
          fontWeight: 700,
          fontSize: 22,
          borderRadius: 12,
          textAlign: 'center',
          padding: '10px 0'
        }}>감정 무게</div>
        
        {/* 이모티콘 + 슬라이더 영역 */}
        <div style={{
          width: '100%',
          background: 'white',
          borderRadius: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '18px 0',
          flex: 1
        }}>
          <div style={{ 
            fontSize: 60,
            marginBottom: 10, 
            minHeight: emojis.length > 0 ? (emojis.length * 65) : 72,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0px',
            flex: 1
          }}>
            {emojis.length > 0 ? emojis.map((emoji, index) => (
              <span key={index} style={{ 
                fontSize: 60,
                lineHeight: '65px'
              }}>
                {emoji}
              </span>
            )) : ''}
          </div>
          <div 
            style={{ 
              width: '80%', 
              height: 18, 
              background: '#BFE2D6', 
              borderRadius: 9, 
              position: 'relative', 
              margin: '10px 0',
              cursor: 'pointer'
            }}
            onMouseDown={(e) => {
              if (!onSliderChange) return;
              e.preventDefault();
              
              const rect = e.currentTarget.getBoundingClientRect();
              const startX = rect.left;
              const width = rect.width;
              
              const handleMove = (clientX) => {
                const x = clientX - startX;
                const percentage = Math.max(0, Math.min(100, (x / width) * 100));
                const newValue = Math.round((percentage / 100) * 10);
                onSliderChange(newValue);
              };
              
              const handleMouseMove = (moveEvent) => handleMove(moveEvent.clientX);
              const handleTouchMove = (touchEvent) => {
                touchEvent.preventDefault();
                handleMove(touchEvent.touches[0].clientX);
              };
              
              const handleEnd = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleEnd);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleEnd);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleEnd);
              document.addEventListener('touchmove', handleTouchMove, { passive: false });
              document.addEventListener('touchend', handleEnd);
              
              handleMove(e.clientX);
            }}
            onTouchStart={(e) => {
              if (!onSliderChange) return;
              e.preventDefault();
              
              const rect = e.currentTarget.getBoundingClientRect();
              const startX = rect.left;
              const width = rect.width;
              
              const handleMove = (clientX) => {
                const x = clientX - startX;
                const percentage = Math.max(0, Math.min(100, (x / width) * 100));
                const newValue = Math.round((percentage / 100) * 10);
                onSliderChange(newValue);
              };
              
              handleMove(e.touches[0].clientX);
            }}
          >
            <div style={{
              position: 'absolute',
              left: `calc(${(sliderValue / 10) * 100}% - 16px)`,
              top: -7,
              width: 32,
              height: 32,
              background: '#E94B5A',
              borderRadius: '50%',
              boxShadow: '0 2px 6px rgba(0,0,0,0.13)',
              border: '3px solid #fff',
              transition: 'left 0.2s',
              cursor: 'grab'
            }} />
            <div style={{
              position: 'absolute',
              top: 25,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 14,
              fontWeight: 600,
              color: '#666'
            }}>
              {sliderValue}
            </div>
          </div>
        </div>
      </div>

      {/* 두 번째 빨간 네모 박스 - 감정 끝말잇기 섹션 */}
      <div style={{
        width: '100%',
        background: '#B02B3A',
        borderRadius: 15,
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: '200px' // 고정 높이 유지
      }}>
        {/* 감정 끝말잇기 제목 */}
        <div style={{
          width: '100%',
          background: 'white',
          color: '#222',
          fontWeight: 700,
          fontSize: 22,
          borderRadius: 12,
          textAlign: 'center',
          padding: '10px 0'
        }}>감정 끝말잇기</div>
        
        {/* 추가된 키워드 영역 */}
        <div style={{
          width: '100%',
          background: 'white',
          borderRadius: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          padding: '16px 15px',
          fontSize: 18,
          color: '#222',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          minHeight: '100px'
        }}>
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}>
            {keywords && keywords.length > 0 ? keywords.map((k, i) => (
              <span key={i} style={{ 
                fontSize: 16,
                padding: '4px 8px',
                background: '#F0F0F0',
                borderRadius: '8px',
                marginRight: 4
              }}>{k}</span>
            )) : (
              <span style={{ color: '#999', fontSize: 16 }}>키워드가 여기에 표시됩니다</span>
            )}
          </div>
        </div>
      </div>
      
      <div style={{ flex: 1 }} />
    </div>
  );
}

export default EmotionColumn; 