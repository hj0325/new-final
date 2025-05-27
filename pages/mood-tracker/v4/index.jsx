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

  const keywords = ['기쁨', '즐거움', '행복함', '밝음', '신남', '부드러움', '통통튀는', '화창한'];

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
        />
        <EmotionColumn 
          emoji={rightColumnEmoji} 
          keywords={rightColumnKeywords} 
          sliderValue={rightSliderValue}
          onSliderChange={setRightSliderValue}
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
    </FullScreenContainer>
  );
}