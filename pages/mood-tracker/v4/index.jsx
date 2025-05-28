import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrthographicCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import FullScreenContainer from '../../../components/mood-tracker/v4/FullScreenContainer';
import GameModal from '../../../components/mood-tracker/v4/GameModal';
import TextInputModal from '../../../components/mood-tracker/v4/TextInputModal';
import ScaledScene from '../../../components/mood-tracker/v4/ScaledScene';
import EmotionColumn from '../../../components/mood-tracker/v4/EmotionColumn';
import { FallingModelsScene } from '../../../components/mood-tracker/v4/FallingModels';
import EmojiSelector3D from '../../../components/mood-tracker/v4/EmojiSelector3D';
import Emoji3D from '../../../components/mood-tracker/v4/Emoji3D';
import FallingEmojiManager from '../../../components/mood-tracker/v4/FallingEmojiManager';

// Emoji ID와 실제 Emoji 문자를 매핑합니다.
const emojiIdToChar = {
  'joy': '😀',
  'surprise': '😮',
  'neutral': '😐',
  'sadness': '😖',
  'anger': '😠',
};

// --- 데이터 정의: 이모티콘별 키워드 ---
// const emojiKeywords = { ... }; // Moved to components/mood-tracker/v4/constants.js

// --- 스타일 컴포넌트: 전체 화면 컨테이너 ---
// const FullScreenContainer = ({ children }) => ( ... ); // Moved

// --- UI 컴포넌트: 하단 이모티콘 선택 바 ---
// const IconBarPlaceholder = ({ onEmojiSelect }) => { ... }; // Moved

// --- UI 컴포넌트: 게임 모달 (이모티콘 클릭 시 표시) ---
// const GameModal = ({ isOpen, emoji, onClose }) => { ... }; // Moved

// --- UI 컴포넌트: 첫 화면 텍스트 입력 모달 ---
// const TextInputModal = ({ isOpen, onClose, currentText, onTextChange, onSubmit }) => { ... }; // Moved

// --- 3D 씬 컴포넌트: 저울 모델 및 크기 조정 로직 ---
// function ScaledScene(props) { ... }; // Moved

// --- 감정 컬럼(프레임) 컴포넌트 ---
// function EmotionColumn({ emoji = '😀', keywords = [], sliderValue = 50, onSliderChange }) { ... }; // Moved

// --- UI 컴포넌트: 게임 생성 모달 ---
const GameCreationModal = ({ isOpen, keyword, dominantEmoji, dominantKeywords, onClose, onStart }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #B02B3A 0%, #8B1E2B 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.3s ease-in-out'
    }}>
      {/* 배경 장식 요소들 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '20%',
        width: '80px',
        height: '80px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 7s ease-in-out infinite'
      }} />

      <div style={{
        width: '80vw',
        height: '70vh',
        maxWidth: '800px',
        maxHeight: '600px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '3px solid #B02B3A',
        borderRadius: '20px',
        boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '30px',
        position: 'relative',
        backdropFilter: 'blur(10px)',
        animation: 'slideIn 0.4s ease-out'
      }}>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '30px',
            cursor: 'pointer',
            color: '#B02B3A',
            fontWeight: 'bold',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>

        {/* 우세한 이모티콘 표시 */}
        <div style={{
          fontSize: '120px',
          marginBottom: '10px',
          textShadow: '0 4px 8px rgba(0,0,0,0.1)',
          animation: 'bounce 2s ease-in-out infinite'
        }}>
          {dominantEmoji}
        </div>

        {/* 메인 문구 */}
        <h1 style={{
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#B02B3A',
          margin: '0',
          lineHeight: '1.4',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          "{keyword}"의 감정 생물을 만들어 보아요!
        </h1>

        {/* 키워드 표시 */}
        <div style={{
          padding: '15px 30px',
          background: '#D2F2E9',
          borderRadius: '25px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#333',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          animation: 'fadeInUp 0.8s ease-out',
          textAlign: 'center',
          minHeight: '50px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {dominantKeywords && dominantKeywords.length > 0 ? (
            dominantKeywords.map((keyword, index) => (
              <span key={index} style={{
                padding: '5px 12px',
                background: 'rgba(176, 43, 58, 0.1)',
                borderRadius: '15px',
                fontSize: '16px'
              }}>
                {keyword}
              </span>
            ))
          ) : (
            <span style={{ color: '#666', fontSize: '16px' }}>
              감정 키워드가 없습니다
            </span>
          )}
        </div>

        {/* 게임 시작 버튼 */}
        <button 
          style={{
            padding: '15px 40px',
            fontSize: '22px',
            fontWeight: 'bold',
            background: '#B02B3A',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            cursor: 'pointer',
            boxShadow: '0 6px 12px rgba(176, 43, 58, 0.3)',
            transition: 'all 0.3s ease',
            marginTop: '20px',
            animation: 'fadeInUp 1s ease-out'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 16px rgba(176, 43, 58, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 6px 12px rgba(176, 43, 58, 0.3)';
          }}
          onClick={onStart}
        >
          Start
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: scale(0.8);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
};

// --- 생물 만들기 페이지 컴포넌트 ---
const CreationPage = ({ onBack, keyword, dominantEmoji, dominantKeywords }) => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      animation: 'fadeIn 0.5s ease-in-out'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '60px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '800px',
        width: '90%'
      }}>
        <h1 style={{
          fontSize: '36px',
          color: '#B02B3A',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          "{keyword}"의 감정 생물 만들기
        </h1>
        
        <div style={{
          fontSize: '80px',
          marginBottom: '20px'
        }}>
          {dominantEmoji}
        </div>

        <div style={{
          marginBottom: '30px'
        }}>
          <h3 style={{
            fontSize: '20px',
            color: '#666',
            marginBottom: '15px'
          }}>
            감정 키워드
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center'
          }}>
            {dominantKeywords && dominantKeywords.length > 0 ? (
              dominantKeywords.map((keyword, index) => (
                <span key={index} style={{
                  padding: '8px 16px',
                  background: '#D2F2E9',
                  borderRadius: '20px',
                  fontSize: '16px',
                  color: '#333'
                }}>
                  {keyword}
                </span>
              ))
            ) : (
              <span style={{ color: '#999', fontSize: '16px' }}>
                키워드가 없습니다
              </span>
            )}
          </div>
        </div>
        
        <p style={{
          fontSize: '18px',
          color: '#666',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          여기서 감정 생물을 만들어보세요!<br/>
          아직 개발 중인 페이지입니다.
        </p>

        <button
          onClick={onBack}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            background: '#B02B3A',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#8B1E2B';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#B02B3A';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          돌아가기
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// --- 메인 페이지 컴포넌트: MoodTrackerPage ---
export default function MoodTrackerPage() {
  const [showLanding, setShowLanding] = useState(true);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [selectedEmojiForGameModal, setSelectedEmojiForGameModal] = useState(null);
  const [isTextInputModalOpen, setIsTextInputModalOpen] = useState(false);
  const [userInputText, setUserInputText] = useState('');
  const [leftColumnEmoji, setLeftColumnEmoji] = useState('');
  const [rightColumnEmoji, setRightColumnEmoji] = useState('');
  const [selectionCount, setSelectionCount] = useState(0);
  const [emojiKeywords, setEmojiKeywords] = useState({});
  const [leftColumnKeywords, setLeftColumnKeywords] = useState([]);
  const [rightColumnKeywords, setRightColumnKeywords] = useState([]);
  const [leftSliderValue, setLeftSliderValue] = useState(3);
  const [rightSliderValue, setRightSliderValue] = useState(7);
  const [isGameCreationModalOpen, setIsGameCreationModalOpen] = useState(false); // 게임 생성 모달 상태
  const [showCreationPage, setShowCreationPage] = useState(false); // 생물 만들기 페이지 상태

  const bodyProps = { position: [0, 0.5, 0], scale: 1.9, rotation: [0, 0, 0] };
  const wingsProps = { position: [0, -0.02, 0], scale: 1.1, rotation: [0, 0, 0] };
  const wingsPrimitiveOffset = [0, 0, 0];

  const handleEmoji3DClick = (emojiId) => {
    const emojiChar = emojiIdToChar[emojiId];
    if (emojiChar) {
      setSelectedEmojiForGameModal(emojiChar);
      setIsGameModalOpen(true);
    }
  };

  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedEmojiForGameModal(null);
  };

  const handleEmojiSelection = (emoji, keywords) => {
    if (selectionCount === 0) {
      setLeftColumnEmoji(emoji);
      setLeftColumnKeywords(keywords || []);
      setSelectionCount(1);
    } else if (selectionCount === 1) {
      setRightColumnEmoji(emoji);
      setRightColumnKeywords(keywords || []);
      setSelectionCount(2);
    }
    // 2개 선택 후에는 더 이상 변경하지 않음
    closeGameModal();
  };

  const handleKeywordUpdate = (emoji, keywords) => {
    setEmojiKeywords(prev => ({
      ...prev,
      [emoji]: keywords
    }));
  };

  const handlePlayClick = () => {
    setIsTextInputModalOpen(true);
  };

  const handleTextInputSubmit = (text) => {
    setUserInputText(text);
    setShowLanding(false);
  };

  const handleStartGame = () => {
    // 슬라이더 값이 더 큰 이모티콘 결정
    const dominantEmoji = leftSliderValue > rightSliderValue ? leftColumnEmoji : rightColumnEmoji;
    setIsGameCreationModalOpen(true);
  };

  const closeGameCreationModal = () => {
    setIsGameCreationModalOpen(false);
  };

  const handleStartCreation = () => {
    // 모달을 닫고 생물 만들기 페이지로 전환
    setIsGameCreationModalOpen(false);
    setShowCreationPage(true);
  };

  const handleBackToMain = () => {
    // 생물 만들기 페이지에서 메인으로 돌아가기
    setShowCreationPage(false);
  };

  // 슬라이더 값이 더 큰 이모티콘 결정
  const dominantEmoji = leftSliderValue > rightSliderValue ? leftColumnEmoji : rightColumnEmoji;
  // 우세한 이모티콘의 키워드 가져오기
  const dominantKeywords = leftSliderValue > rightSliderValue ? leftColumnKeywords : rightColumnKeywords;

  const keywords = ['기쁨', '즐거움', '행복함', '밝음', '신남', '부드러움', '통통튀는', '화창한'];

  // 생물 만들기 페이지 표시
  if (showCreationPage) {
    return (
      <CreationPage
        onBack={handleBackToMain}
        keyword={userInputText || '감정'}
        dominantEmoji={dominantEmoji}
        dominantKeywords={dominantKeywords}
      />
    );
  }

  if (showLanding) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#B02B3A',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          width: '100%',
          height: '20vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          color: 'rgba(255, 255, 255, 0.66)',
          fontSize: 'calc(min(30vw, 35vh))',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          pointerEvents: 'none',
          textTransform: 'uppercase'
        }}>
          MoMo
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
          <Canvas>
            <OrthographicCamera
              makeDefault
              position={[0, 0, 100]} 
              zoom={25}
            />
            <Suspense fallback={null}>
              <FallingModelsScene />
            </Suspense>
          </Canvas>
        </div>
        <button
          onClick={handlePlayClick}
          style={{
            padding: '50px 100px',
            fontSize: '60px',
            cursor: 'pointer',
            background: 'white',
            color: '#B02B3A',
            border: '5px solid white',
            borderRadius: '25px',
            fontWeight: 'bold',
            boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
            zIndex: 3,
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          Play
        </button>
        <TextInputModal
          isOpen={isTextInputModalOpen}
          onClose={() => setIsTextInputModalOpen(false)}
          currentText={userInputText}
          onTextChange={setUserInputText}
          onSubmit={handleTextInputSubmit}
        />
      </div>
    );
  }

  return (
    <FullScreenContainer>
      {userInputText && (
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 25px',
          background: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          fontSize: '20px',
          fontWeight: '500',
          color: '#333',
          zIndex: 100,
          textAlign: 'center',
          minWidth: '200px',
          maxWidth: '80%',
        }}>
          {userInputText}
        </div>
      )}
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <EmotionColumn 
          emoji={leftColumnEmoji} 
          keywords={leftColumnKeywords} 
          sliderValue={leftSliderValue}
          onSliderChange={setLeftSliderValue}
          onStartGame={handleStartGame}
        />
        <EmotionColumn 
          emoji={rightColumnEmoji} 
          keywords={rightColumnKeywords} 
          sliderValue={rightSliderValue}
          onSliderChange={setRightSliderValue}
          onStartGame={handleStartGame}
        />
      </div>
      <div style={{ width: '90%', height: '90%', maxWidth: '1200px', maxHeight: '900px', position: 'relative', zIndex: 2 }}>
        <Canvas camera={{ position: [0, 3.5, 7], fov: 50 }}> 
          <Suspense fallback={null}>
            <ambientLight intensity={0.25} color="#FFFFFF" />
            <directionalLight 
              position={[8, 10, 5]} 
              intensity={0.2} 
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <directionalLight 
              position={[-8, 5, -8]} 
              intensity={0.1}
              color="#E3F2FD"
            />
            <Environment preset="sunset" intensity={0.8} blur={0.5} />
                        <Physics>
            <ScaledScene
              bodyProps={bodyProps}
              wingsProps={wingsProps}
              wingsPrimitiveOffset={wingsPrimitiveOffset}
              tiltAngle={Math.PI / 20}
              verticalMovementFactor={0.03}
            />
              <EmojiSelector3D 
                onEmojiClick={handleEmoji3DClick} 
                />
              <FallingEmojiManager
                leftCount={leftColumnEmoji ? leftSliderValue : 0}
                rightCount={rightColumnEmoji ? rightSliderValue : 0}
                leftEmojiType={leftColumnEmoji}
                rightEmojiType={rightColumnEmoji}
              />
            </Physics>
          </Suspense>
        </Canvas>
      </div>
      <GameModal 
        isOpen={isGameModalOpen} 
        emoji={selectedEmojiForGameModal} 
        onClose={closeGameModal} 
        onEmojiSelect={handleEmojiSelection}
        onKeywordUpdate={handleKeywordUpdate}
        existingKeywords={emojiKeywords[selectedEmojiForGameModal] || []}
      />
      <GameCreationModal
        isOpen={isGameCreationModalOpen}
        keyword={userInputText || '감정'}
        dominantEmoji={dominantEmoji}
        dominantKeywords={dominantKeywords}
        onClose={closeGameCreationModal}
        onStart={handleStartCreation}
      />
    </FullScreenContainer>
  );
}