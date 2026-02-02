import React, { useState } from 'react';
import { emojiKeywords } from './constants';
// import { emojiKeywords } from './constants'; //This will be used once constants.js is created

const GameModal = ({ isOpen, emoji, onClose, onEmojiSelect, onKeywordUpdate, existingKeywords = [] }) => {
  const [currentKeywordInput, setCurrentKeywordInput] = React.useState('');
  const [userKeywords, setUserKeywords] = React.useState([]);
  const [hoveredButton, setHoveredButton] = useState(null);

  React.useEffect(() => {
    if (isOpen && emoji) {
      setCurrentKeywordInput('');
      setUserKeywords(existingKeywords);
    }
  }, [isOpen, emoji, existingKeywords]); 

  if (!isOpen || !emoji) return null;

  const handleAddKeyword = () => {
    if (currentKeywordInput.trim() !== '') {
      const newKeywords = [...userKeywords, currentKeywordInput.trim()];
      setUserKeywords(newKeywords);
      setCurrentKeywordInput('');
      if (onKeywordUpdate) {
        onKeywordUpdate(emoji, newKeywords);
      }
    }
  };

  return (
    <React.Fragment>
      {/* 배경 블러 레이어: 기능 영향 없도록 클릭 통과 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 8000,
          background: 'rgba(0, 0, 0, 0.10)',
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none',
        }}
      />

      {/* 모달 카드 */}
      <div
        style={{
          position: 'fixed',
          top: '48%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9001,
          pointerEvents: 'auto',
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          style={{
            width: 'min(520px, 90vw)',
            height: 'auto',
            minHeight: '360px',
            maxHeight: '70vh',
            overflowY: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.90)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '26px',
            // 블랙 그림자 대신 화이트 글로우
            boxShadow: '0 22px 70px rgba(255, 255, 255, 0.38), 0 0 46px rgba(255, 229, 122, 0.25)',
            padding: '28px 26px 34px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'auto',
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
          }}
        >
          {/* 제목 + 키워드(오른쪽) 묶음을 함께 가운데 정렬 */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                maxWidth: '100%',
              }}
            >
              <h2
                style={{
                  textAlign: 'center',
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 500,
                  color: '#111827',
                  lineHeight: 1.2,
                }}
              >
                오늘의 감정 이유
              </h2>

              {userKeywords.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxWidth: '100%',
                  }}
                >
                  {userKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '7px 12px',
                        background: 'rgba(255, 229, 122, 0.65)',
                        border: '1px solid rgba(255, 200, 61, 0.25)',
                        borderRadius: '999px',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#111827',
                        boxShadow: '0 10px 22px rgba(255, 255, 255, 0.22), 0 6px 14px rgba(0,0,0,0.06)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 레이아웃 안정화를 위해 입력 영역을 아래로 */}
          <div style={{ height: '20px' }} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: 'min(400px, 100%)',
              marginTop: '0px',
            }}
          >
            <input
              type="text"
              value={currentKeywordInput}
              onChange={(e) => setCurrentKeywordInput(e.target.value)}
              placeholder="선택 이유"
              style={{
                flexGrow: 1,
                minWidth: 0,
                height: '64px',
                padding: '18px 18px',
                fontSize: '16px',
                borderRadius: '16px',
                border: '1px solid rgba(17, 24, 39, 0.14)',
                boxSizing: 'border-box',
                background: 'rgba(255, 255, 255, 0.90)',
                boxShadow: '0 10px 22px rgba(255, 255, 255, 0.18), 0 6px 14px rgba(0,0,0,0.06)',
                outline: 'none',
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddKeyword();
                }
              }}
            />
            <button
              onClick={handleAddKeyword}
              style={{
                padding: '14px 16px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
                background: 'linear-gradient(180deg, rgba(92, 184, 92, 1) 0%, rgba(76, 175, 80, 1) 100%)',
                color: 'white',
                border: '1px solid rgba(17, 24, 39, 0.10)',
                borderRadius: '16px',
                boxShadow: '0 14px 28px rgba(255, 255, 255, 0.18), 0 10px 22px rgba(0,0,0,0.10)',
                transition: 'transform 0.12s ease',
              }}
            >
              추가
            </button>
          </div>

          <div style={{ flex: 1, minHeight: '24px' }} />
          <div style={{ display: 'flex', gap: '20px', marginTop: 'auto', justifyContent: 'center', paddingTop: '4px' }}>
            {/* 긍정 버튼 - 동그라미, 노란색 */}
            <button
              onClick={() => userKeywords.length > 0 && onEmojiSelect && onEmojiSelect(emoji, userKeywords, 'positive')}
              onMouseEnter={() => setHoveredButton('positive')}
              onMouseLeave={() => setHoveredButton(null)}
              disabled={userKeywords.length === 0}
              style={{
                width: '92px',
                height: '92px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: userKeywords.length > 0 ? 'pointer' : 'not-allowed',
                background: userKeywords.length > 0 ? '#FFD700' : 'rgba(255, 215, 0, 0.32)',
                color: userKeywords.length > 0 ? '#333' : 'rgba(17, 24, 39, 0.55)',
                border: 'none',
                borderRadius: '50%', // 동그라미
                transition: 'all 0.3s ease',
                boxShadow:
                  hoveredButton === 'positive' && userKeywords.length > 0
                    ? '0 0 20px #FFD700, 0 0 30px #FFD700, 0 0 40px #FFD700'
                    : '0 14px 28px rgba(255, 255, 255, 0.18)',
                transform: hoveredButton === 'positive' && userKeywords.length > 0 ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              긍정
            </button>

            {/* 부정 버튼 - 네모, 빨간색 */}
            <button
              onClick={() => userKeywords.length > 0 && onEmojiSelect && onEmojiSelect(emoji, userKeywords, 'negative')}
              onMouseEnter={() => setHoveredButton('negative')}
              onMouseLeave={() => setHoveredButton(null)}
              disabled={userKeywords.length === 0}
              style={{
                width: '92px',
                height: '92px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: userKeywords.length > 0 ? 'pointer' : 'not-allowed',
                background: userKeywords.length > 0 ? '#FF4444' : 'rgba(255, 68, 68, 0.30)',
                color: userKeywords.length > 0 ? 'white' : 'rgba(17, 24, 39, 0.55)',
                border: 'none',
                borderRadius: '14px', // 네모 (조금 더 둥글게)
                transition: 'all 0.3s ease',
                boxShadow:
                  hoveredButton === 'negative' && userKeywords.length > 0
                    ? '0 0 20px #FF4444, 0 0 30px #FF4444, 0 0 40px #FF4444'
                    : '0 14px 28px rgba(255, 255, 255, 0.18)',
                transform: hoveredButton === 'negative' && userKeywords.length > 0 ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              부정
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default GameModal; 