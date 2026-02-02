import React from 'react';

function EmotionColumn({ emojis = [], keywords = [], sliderValue = 5, onSliderChange, variant }) {
  const isV5 = variant === 'v5';
  // 이모티콘 개수에 따른 동적 높이 계산
  const baseEmojiHeight = 150; // 기본 이모티콘 영역 높이
  const emojiHeight = 65; // 이모티콘당 추가 높이
  const dynamicEmojiSectionHeight = baseEmojiHeight + (Math.max(0, emojis.length - 1) * emojiHeight);
  const minHeight = 280; // 최소 높이 보장 (슬라이더가 넘치지 않도록)
  const totalEmotionWeightHeight = Math.max(minHeight, dynamicEmojiSectionHeight + 80); // 제목과 패딩 포함

  const primaryKeyword = keywords && keywords.length > 0 ? keywords[0] : '';
  const extraKeywords = keywords && keywords.length > 1 ? keywords.slice(1) : [];
  const primaryEmoji = emojis && emojis.length > 0 ? emojis[0] : '';
  const extraEmojis = emojis && emojis.length > 1 ? emojis.slice(1) : [];

  const attachSliderDrag = (targetEl, startClientX) => {
    if (!onSliderChange) return;

    const rect = targetEl.getBoundingClientRect();
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

    handleMove(startClientX);
  };

  const containerStyle = {
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
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    ...(isV5
      ? {
          // v5: 바깥 노란 컨테이너 제거(투명)
          width: 272,
          minWidth: 240,
          minHeight: 'auto',
          background: 'transparent',
          borderRadius: 0,
          padding: 0,
          gap: 18,
          boxShadow: 'none',
          border: 'none',
        }
      : null),
  };

  const sectionStyleBase = {
    width: '100%',
    background: '#B02B3A',
    borderRadius: 15,
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    ...(isV5
      ? {
          // v5: 3D 저울의 체리 느낌으로 더 밝게
          background: 'linear-gradient(180deg, #FF5C83 0%, #E94B5A 100%)',
          borderRadius: 22,
          padding: '14px',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 10px 18px rgba(17,24,39,0.10)',
        }
      : null),
  };

  const sectionTitleStyle = {
    width: '100%',
    background: 'white',
    color: '#222',
    fontWeight: 700,
    fontSize: 22,
    borderRadius: 12,
    textAlign: 'center',
    padding: '10px 0',
    ...(isV5
      ? {
          borderRadius: 16,
          padding: '11px 0',
          boxShadow: '0 2px 10px rgba(17,24,39,0.08)',
          letterSpacing: '-0.01em',
        }
      : null),
  };

  const whiteCardStyle = {
    width: '100%',
    background: 'white',
    borderRadius: 18,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    ...(isV5
      ? {
          borderRadius: 22,
          boxShadow: '0 10px 22px rgba(17,24,39,0.10)',
          border: '1px solid rgba(17,24,39,0.06)',
        }
      : null),
  };

  const sliderTrackStyle = {
    width: '80%',
    height: 18,
    background: '#BFE2D6',
    borderRadius: 9,
    position: 'relative',
    margin: '10px 0',
    cursor: 'pointer',
    ...(isV5
      ? {
          height: 16,
          borderRadius: 999,
          background: 'linear-gradient(90deg, #CFF0E6 0%, #BFE2D6 55%, #B7DDD0 100%)',
          boxShadow: 'inset 0 1px 2px rgba(17,24,39,0.12)',
        }
      : null),
  };

  const sliderKnobStyle = {
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
    cursor: 'grab',
    ...(isV5
      ? {
          top: -9,
          width: 34,
          height: 34,
          background: 'linear-gradient(180deg, #FF6B87 0%, #E94B5A 100%)',
          boxShadow: '0 10px 18px rgba(17,24,39,0.18)',
          border: '3px solid rgba(255,255,255,0.95)',
        }
      : null),
  };
  
  if (isV5) {
    // v5: 2번째 스샷 느낌(작고 정갈한 비율)
    const trackHeight = 16;
    const knobSize = 40;
    const pillFontSize = 16;

    return (
      <div
        style={{
          width: 280,
          minWidth: 240,
          borderRadius: 38,
          padding: 10,
          background: 'linear-gradient(180deg, #FF6B87 0%, #E94B5A 100%)',
          boxShadow: '0 14px 26px rgba(17,24,39,0.16)',
          position: 'relative',
        }}
      >
        {/* 바깥 프레임 하이라이트 */}
        <div
          style={{
            position: 'absolute',
            inset: 6,
            borderRadius: 34,
            border: '2px solid rgba(255,255,255,0.20)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            background: 'white',
            borderRadius: 32,
            padding: '14px 14px 12px',
            minHeight: 300,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* 상단 행 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                padding: '7px 12px',
                borderRadius: 14,
                background: 'linear-gradient(180deg, #FF5C83 0%, #E94B5A 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: pillFontSize,
                lineHeight: 1,
                boxShadow: '0 10px 18px rgba(233,75,90,0.20)',
                maxWidth: 110,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {primaryKeyword || ' '}
            </div>
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 500,
                color: '#8A8A8A',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transform: 'translateX(8px)',
              }}
            >
              이 감정이 얼마나 차지해?
            </div>
            {/* 우측 여백(비율 맞춤) */}
            <div style={{ width: 10 }} />
          </div>

          {/* 이모지 영역 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingTop: 0,
            }}
          >
            <div style={{ fontSize: 84, lineHeight: 1 }}>
              {primaryEmoji}
            </div>
            {extraEmojis.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {extraEmojis.map((e, idx) => (
                  <span key={idx} style={{ fontSize: 20, lineHeight: 1 }}>{e}</span>
                ))}
              </div>
            )}
          </div>

          {/* 슬라이더 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: '88%',
                height: trackHeight,
                borderRadius: 999,
                background: 'linear-gradient(90deg, #BFF3E9 0%, #BFE2D6 55%, #B7DDD0 100%)',
                boxShadow: 'inset 0 2px 5px rgba(17,24,39,0.12)',
                position: 'relative',
                cursor: 'pointer',
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                attachSliderDrag(e.currentTarget, e.clientX);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                attachSliderDrag(e.currentTarget, e.touches[0].clientX);
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: `calc(${(sliderValue / 10) * 100}% - ${knobSize / 2}px)`,
                  top: -(knobSize - trackHeight) / 2,
                  width: knobSize,
                  height: knobSize,
                  borderRadius: '50%',
                  background: 'linear-gradient(180deg, #FF4F7D 0%, #E5285F 100%)',
                  boxShadow: '0 10px 16px rgba(17,24,39,0.16)',
                  border: '5px solid rgba(255,255,255,0.96)',
                  transition: 'left 0.18s ease',
                }}
              />
            </div>

            <div style={{ width: '40%', textAlign: 'center' }}>
              <div style={{ fontSize: pillFontSize, fontWeight: 600, color: '#6B7280', lineHeight: 1 }}>
                {sliderValue}
              </div>
              <div style={{ height: 2, background: 'rgba(107,114,128,0.18)', marginTop: 8 }} />
            </div>

            {extraKeywords.length > 0 && (
              <div style={{ width: '92%', display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 2 }}>
                {extraKeywords.map((k, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 12,
                      padding: '5px 9px',
                      borderRadius: 999,
                      background: 'linear-gradient(180deg, #F7F7F8 0%, #EFEFF3 100%)',
                      border: '1px solid rgba(17,24,39,0.08)',
                      color: '#374151',
                    }}
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* 첫 번째 빨간 네모 박스 - 감정 무게 섹션 */}
      <div
        style={{
          ...sectionStyleBase,
          ...(isV5 ? { marginTop: 10 } : { marginTop: 22 }),
          height: `${totalEmotionWeightHeight}px`, // 동적 높이
        }}
      >
        {/* 감정 무게 제목 */}
        <div style={sectionTitleStyle}>감정 무게</div>
        
        {/* 이모티콘 + 슬라이더 영역 */}
        <div
          style={{
            ...whiteCardStyle,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: isV5 ? '18px 0 16px' : '18px 0',
            flex: 1,
          }}
        >
          <div style={{ 
            fontSize: 60,
            marginBottom: 10, 
            minHeight: emojis.length > 0 ? (emojis.length * 65) : 100, // 최소 높이 증가
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
            style={sliderTrackStyle}
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
            <div style={sliderKnobStyle} />
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
      <div
        style={{
          ...sectionStyleBase,
          height: '200px', // 고정 높이 유지
        }}
      >
        {/* 감정 끝말잇기 제목 */}
        <div style={sectionTitleStyle}>감정 끝말잇기</div>
        
        {/* 추가된 키워드 영역 */}
        <div
          style={{
            ...whiteCardStyle,
            padding: '16px 15px',
            fontSize: 18,
            color: '#222',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            minHeight: '100px',
          }}
        >
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: isV5 ? '10px' : '8px'
          }}>
            {keywords && keywords.length > 0 ? keywords.map((k, i) => (
              <span key={i} style={{ 
                fontSize: 16,
                padding: isV5 ? '6px 10px' : '4px 8px',
                background: isV5 ? 'linear-gradient(180deg, #F7F7F8 0%, #EFEFF3 100%)' : '#F0F0F0',
                borderRadius: isV5 ? '999px' : '8px',
                border: isV5 ? '1px solid rgba(17,24,39,0.08)' : 'none',
                boxShadow: isV5 ? '0 2px 6px rgba(17,24,39,0.08)' : 'none'
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