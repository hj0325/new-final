import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrthographicCamera } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import FullScreenContainer from '../../../components/mood-tracker/v3/FullScreenContainer';
import GameModal from '../../../components/mood-tracker/v3/GameModal';
import TextInputModal from '../../../components/mood-tracker/v3/TextInputModal';
import ScaledScene from '../../../components/mood-tracker/v3/ScaledScene';
import EmotionColumn from '../../../components/mood-tracker/v3/EmotionColumn';
import { FallingModelsScene } from '../../../components/mood-tracker/v3/FallingModels';
import EmojiSelector3D from '../../../components/mood-tracker/v3/EmojiSelector3D';
import Emoji3D from '../../../components/mood-tracker/v3/Emoji3D';

// Emoji ID와 실제 Emoji 문자를 매핑합니다.
const emojiIdToChar = {
  'joy': '😀',
  'surprise': '😮',
  'neutral': '😐',
  'sadness': '😖',
  'anger': '😠',
};

// --- 데이터 정의: 이모티콘별 키워드 ---
// const emojiKeywords = { ... }; // Moved to components/mood-tracker/v3/constants.js

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
  const [droppedEmojis, setDroppedEmojis] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const bodyProps = { position: [0, 0.5, 0], scale: 1.9, rotation: [0, 0, 0] };
  const wingsProps = { position: [0, -0.02, 0], scale: 1.1, rotation: [0, 0, 0] };
  const wingsPrimitiveOffset = [0, 0, 0];

  const handleEmoji3DClick = (emojiId) => {
    // 처음 이모티콘 클릭시 안내 문구 숨기기
    if (showInstructions) {
      setShowInstructions(false);
    }
    
    const emojiChar = emojiIdToChar[emojiId];
    if (emojiChar) {
      setSelectedEmojiForGameModal(emojiChar);
    setIsGameModalOpen(true);
    }
  };

  const handleEmojiDrop = (emojiId, position, modelPath, emojiScale) => {
    console.log(`Emoji ${emojiId} dropped at`, position, `with model ${modelPath} and scale ${emojiScale}`);
    const newDroppedEmoji = {
      id: emojiId,
      modelPath: modelPath,
      position: [position.x, position.y, position.z],
      scale: emojiScale,
      key: `${emojiId}-${Date.now()}`
    };
    setDroppedEmojis(prev => [...prev, newDroppedEmoji]);
  };

  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedEmojiForGameModal(null);
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
      <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <EmotionColumn emoji="😀" keywords={keywords} sliderValue={0} />
        <EmotionColumn emoji="😞" keywords={keywords} sliderValue={0} />
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
                onEmojiDrop={handleEmojiDrop}
              />
              {droppedEmojis.map(emoji => (
                <Emoji3D 
                  key={emoji.key} 
                  emojiId={emoji.id} 
                  modelPath={emoji.modelPath} 
                  initialPosition={emoji.position} 
                  scale={emoji.scale}
                  draggable={false}
                />
              ))}
            </Physics>
          </Suspense>
        </Canvas>
      </div>
      {showInstructions && (
        <div style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '15px 30px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '25px',
          fontSize: '18px',
          fontWeight: '500',
          zIndex: 100,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          fontFamily: 'Arial, sans-serif',
        }}>
          이모티콘을 클릭하고 오늘의 감정을 입력하세요
        </div>
      )}
      <GameModal isOpen={isGameModalOpen} emoji={selectedEmojiForGameModal} onClose={closeGameModal} />
    </FullScreenContainer>
  );
}