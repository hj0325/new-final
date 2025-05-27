import React from 'react';

const IconBarPlaceholder = ({ onEmojiSelect }) => {
  const emojis = ['😀', '😮', '😐', '😖', '😠']; 
  return (
    <div style={{
      position: 'absolute',
      bottom: '7vh',
      left: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      gap: '30px',
      zIndex: 20,
    }}>
      {emojis.map((emoji, index) => (
        <div key={index} style={{
          fontSize: '130px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }} onClick={() => onEmojiSelect(emoji)}>
          {emoji}
        </div>
      ))}
    </div>
  );
}

export default IconBarPlaceholder; 