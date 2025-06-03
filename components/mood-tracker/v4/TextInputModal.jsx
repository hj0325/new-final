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
    <div style={{
      position: 'fixed',
      top: '48%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '60vw',
      height: '60vh',
      maxWidth: '600px',
      maxHeight: '400px',
      backgroundColor: 'rgba(255, 255, 255, 0.90)',
      border: '2px solid #eee',
      borderRadius: '10px',
      boxShadow: '0 8px 13px rgba(0, 0, 0, 0.71)',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      zIndex: 1001,
    }}>
      <h2 style={{ textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '30px', color: '#333' }}>
        오늘 너의 감정은 어땠어?
      </h2>
      <input
        type="date"
        value={currentText || getDefaultDate()}
        onChange={handleDateChange}
        style={{
          width: '90%',
          height: '100px',
          padding: '30px',
          fontSize: '30px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          boxSizing: 'border-box',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: 'white'
        }}
      />
      <button onClick={handleSubmit} style={{
        padding: '12px 25px',
        fontSize: '18px',
        cursor: 'pointer',
        background: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        alignSelf: 'center',
      }}>
        확인
      </button>
    </div>
  );
};

export default TextInputModal; 