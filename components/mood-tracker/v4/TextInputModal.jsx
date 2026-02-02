import React from 'react';

const TextInputModal = ({ isOpen, onClose, currentText, onTextChange, onSubmit }) => {
  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(currentText);
    onClose();
  };

  // Convert current text to date format if it's already a date, otherwise use today
  const getDefaultDate = () => {
    if (currentText && currentText.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return currentText;
    }
    return new Date().toISOString().split('T')[0];
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    // Format the date to show it nicely (optional: you can change this format)
    onTextChange(selectedDate);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        zIndex: 1001,
        // 기존과 동일하게: 바깥 클릭이 기능에 영향 없도록 이벤트는 통과
        pointerEvents: 'none',
        background: 'rgba(0, 0, 0, 0.10)',
        backdropFilter: 'blur(4px)',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="momoModal"
        style={{
          width: 'min(540px, 88vw)',
          maxHeight: 'min(540px, 80vh)',
          background: 'rgba(255, 255, 255, 0.94)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          boxShadow: '0 18px 50px rgba(0,0,0,0.22)',
          padding: '38px 34px 34px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '18px',
          pointerEvents: 'auto',
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif",
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
              gap: '18px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '6px',
              borderRadius: '999px',
                marginTop: '-10px',
                marginBottom: '8px',
                background: 'linear-gradient(90deg, rgba(255, 229, 122, 0.95), rgba(255, 200, 61, 0.95))',
                boxShadow: '0 10px 22px rgba(255, 200, 61, 0.20)',
            }}
          />
          <h2
            style={{
              textAlign: 'center',
                margin: 3,
              fontSize: '30px',
                fontWeight: 500,
              letterSpacing: '-0.02em',
              color: '#1f2937',
              lineHeight: 1.25,
            }}
          >
            오늘 너의 감정은 어땠어?
          </h2>
        </div>

        <input
          className="momoDate"
          type="date"
          value={currentText || getDefaultDate()}
          onChange={handleDateChange}
          style={{
            width: '100%',
            height: '96px',
            padding: '20px 18px',
            fontSize: '32px',
            fontWeight: 500,
            borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.95)',
            boxSizing: 'border-box',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'linear-gradient(180deg, #ffffff 0%, #fff7f9 100%)',
            color: '#111827',
            boxShadow: '0 10px 26px rgba(17, 24, 39, 0.08)',
          }}
        />

        {/* 버튼을 아래로 내려 컨텐츠 분리감 주기 */}
        <div style={{ flex: 1, minHeight: '18px' }} />

        <button
          className="momoBtn"
          onClick={handleSubmit}
          style={{
            width: 'min(260px, 100%)',
            padding: '16px 22px',
            fontSize: '20px',
            fontWeight: 500,
            cursor: 'pointer',
            background: 'linear-gradient(180deg, #FFE57A 0%, #FFC83D 100%)',
            color: '#111827',
            border: '1px solid rgba(17, 24, 39, 0.12)',
            borderRadius: '18px',
            alignSelf: 'center',
            boxShadow: '0 12px 26px rgba(17, 24, 39, 0.14)',
            transition: 'transform 0.12s ease, box-shadow 0.12s ease',
            marginTop: '12px',
          }}
        >
          확인
        </button>

        <style jsx>{`
          .momoModal {
            animation: momoPop 180ms ease-out;
          }
          .momoBtn:hover {
            transform: translateY(-1px);
            box-shadow: 0 16px 34px rgba(17, 24, 39, 0.18);
          }
          .momoBtn:active {
            transform: translateY(0px);
          }
          .momoDate:focus,
          .momoBtn:focus {
            outline: none;
          }
          .momoDate:focus-visible,
          .momoBtn:focus-visible {
            box-shadow: 0 0 0 4px rgba(255, 200, 61, 0.35), 0 12px 26px rgba(17, 24, 39, 0.08);
          }
          @keyframes momoPop {
            from {
              opacity: 0;
              transform: translateY(6px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TextInputModal; 