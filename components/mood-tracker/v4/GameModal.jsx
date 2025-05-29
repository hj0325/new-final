import React from 'react';
import { emojiKeywords } from './constants';
// import { emojiKeywords } from './constants'; //This will be used once constants.js is created

const GameModal = ({ isOpen, emoji, onClose, onEmojiSelect, onKeywordUpdate, existingKeywords = [] }) => {
  const [currentKeywordInput, setCurrentKeywordInput] = React.useState('');
  const [userKeywords, setUserKeywords] = React.useState([]);

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
    <div style={{
      position: 'fixed',
      top: '48%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '60vw',
      height: 'auto',
      minHeight: '40vh',
      maxHeight: '70vh',
      overflowY: 'auto',
      maxWidth: '600px',
      backgroundColor: 'rgba(255, 255, 255, 0.90)',
      border: '2px solid #eee',
      borderRadius: '10px',
      boxShadow: '0 8px 13px rgba(0, 0, 0, 0.71)',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      zIndex: 1000,
    }}>
      <span style={{ fontSize: '100px', marginBottom: '0px' }}>{emoji}</span>
      <h2 style={{ textAlign: 'center', marginTop: '0px', marginBottom: '10px', fontSize: '22px' }}>오늘의 감정 이유</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '90%', marginBottom:'10px' }}>
        <input 
          type="text"
          value={currentKeywordInput}
          onChange={(e) => setCurrentKeywordInput(e.target.value)}
          placeholder="선택 이유"
          style={{
            flexGrow: 1,
            padding: '10px 15px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            boxSizing: 'border-box'
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddKeyword();
            }
          }}
        />
        <button onClick={handleAddKeyword} style={{
          padding: '10px 15px',
          fontSize: '16px',
          cursor: 'pointer',
          background: '#5cb85c',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}>
          추가
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px', 
        justifyContent: 'center', 
        width: '100%', 
        padding: '10px 0', 
        minHeight: '50px' 
      }}>
        {userKeywords.length > 0 ? userKeywords.map((keyword, index) => (
          <span key={index} style={{
            padding: '8px 15px',
            background: '#ffc0cb',
            borderRadius: '30px',
            fontSize: '18px'
          }}>
            {keyword}
          </span>
        )) : (
          <span style={{color: '#888', fontSize: '16px'}}>입력한 키워드가 여기에 표시됩니다.</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <button onClick={() => onEmojiSelect && onEmojiSelect(emoji, userKeywords, 'positive')} style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}>
          긍정
        </button>
        <button onClick={() => onEmojiSelect && onEmojiSelect(emoji, userKeywords, 'negative')} style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          background: '#5cb85c',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}>
          부정
        </button>
      </div>
    </div>
  );
};

export default GameModal; 