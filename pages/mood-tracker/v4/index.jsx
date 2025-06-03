import React, { useState, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrthographicCamera, useGLTF } from '@react-three/drei';
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
import { FallingSelectedEmojiScene } from '../../../components/mood-tracker/v4/FallingSelectedEmojiScene';

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
const GameCreationModal = ({ isOpen, keyword, dominantEmojis = [], dominantKeywords, onClose, onStart }) => {
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
      animation: 'fadeIn 0.3s ease-in-out',
      overflow: 'hidden'
    }}>
      {/* 3D 떨어지는 이모티콘 배경 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[0, 10, 10]} intensity={1} />
            <directionalLight position={[0, -10, -5]} intensity={0.3} />
            <FallingSelectedEmojiScene dominantEmojis={dominantEmojis} />
          </Suspense>
        </Canvas>
      </div>

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
        animation: 'slideIn 0.4s ease-out',
        zIndex: 10
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

        {/* 우세한 이모티콘들 표시 */}
        <div style={{
          fontSize: dominantEmojis.length > 1 ? '80px' : '120px',
          marginBottom: '10px',
          textShadow: '0 4px 8px rgba(0,0,0,0.1)',
          animation: 'bounce 2s ease-in-out infinite',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: dominantEmojis.length > 1 ? '10px' : '0'
        }}>
          {dominantEmojis.length > 0 ? dominantEmojis.map((emoji, index) => (
            <span key={index} style={{
              fontSize: dominantEmojis.length > 3 ? '60px' : dominantEmojis.length > 1 ? '80px' : '120px'
            }}>
              {emoji}
            </span>
          )) : '😀'}
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
          오늘의 감정 생물을 만들어 보아요!
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
                borderRadius: '15px',
                fontSize: '20px'
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
            fontSize: '25px',
            fontWeight: 'medium',
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
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Float효과를 위한 3D 모델 컴포넌트
const FloatingModel = ({ url, position, rotationSpeed = 0.01, floatSpeed = 0.02, floatAmplitude = 0.5, scale = [0.8, 0.8, 0.8] }) => {
  const mesh = useRef();
  const { scene } = useGLTF(url);
  
  useFrame((state) => {
    if (mesh.current) {
      // 둥실거리는 효과
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * floatSpeed) * floatAmplitude;
      // 회전 효과
      mesh.current.rotation.y += rotationSpeed;
      mesh.current.rotation.x += rotationSpeed * 0.5;
    }
  });

  return (
    <primitive 
      ref={mesh} 
      object={scene.clone()} 
      position={position} 
      scale={scale}
    />
  );
};

// --- 생물 만들기 페이지 컴포넌트 ---
const CreationPage = ({ onBack, keyword, dominantEmojis, dominantKeywords }) => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'url(/second.jpg) center/cover no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      animation: 'fadeIn 0.5s ease-in-out',
      position: 'relative'
    }}>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      {/* 상단에 우세한 이모티콘과 키워드 표시 */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '15px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 100,
        textAlign: 'center',
        minWidth: '300px',
        maxWidth: '80%'
      }}>
        {/* 우세한 이모티콘 표시 */}
        <div style={{
          fontSize: '60px',
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {dominantEmojis && dominantEmojis.length > 0 ? dominantEmojis.map((emoji, index) => (
            <span key={index}>{emoji}</span>
          )) : '😀'}
        </div>
        
        {/* 키워드 표시 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {dominantKeywords && dominantKeywords.length > 0 ? (
            dominantKeywords.map((keyword, index) => (
              <span key={index} style={{
                padding: '5px 12px',
                background: '#D2F2E9',
                borderRadius: '15px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#333'
              }}>
                {keyword}
              </span>
            ))
          ) : (
            <span style={{ color: '#666', fontSize: '14px' }}>
              감정 키워드가 없습니다
            </span>
          )}
        </div>
      </div>
      
      {/* 3D 씬 */}
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          
          {/* 4개의 3D 모델들을 중앙 주변에 배치 */}
          <FloatingModel 
            url="/box.gltf" 
            position={[-4, 0, 0]} 
            rotationSpeed={0.008}
            floatSpeed={0.015}
            floatAmplitude={0.3}
            scale={[1,1,1]}
          />
          <FloatingModel 
            url="/clinder.gltf" 
            position={[-1.3, 0, 0]} 
            rotationSpeed={0.012}
            floatSpeed={0.02}
            floatAmplitude={0.4}
            scale={[1,1,1]}
          />
          <FloatingModel 
            url="/hexagon.gltf" 
            position={[1.3, 0, 0]} 
            rotationSpeed={0.01}
            floatSpeed={0.018}
            floatAmplitude={0.35}
            scale={[1,1,1]}
          />
          <FloatingModel 
            url="/star.gltf" 
            position={[4, 0, 0]} 
            rotationSpeed={0.015}
            floatSpeed={0.025}
            floatAmplitude={0.45}
            scale={[1,1,1]}
          />
        </Suspense>
      </Canvas>
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
  const [positiveEmojis, setPositiveEmojis] = useState([]); // 긍정 이모티콘들
  const [negativeEmojis, setNegativeEmojis] = useState([]); // 부정 이모티콘들
  const [positiveKeywords, setPositiveKeywords] = useState([]); // 긍정 키워드들
  const [negativeKeywords, setNegativeKeywords] = useState([]); // 부정 키워드들
  const [leftSliderValue, setLeftSliderValue] = useState(3);
  const [rightSliderValue, setRightSliderValue] = useState(7);
  const [isGameCreationModalOpen, setIsGameCreationModalOpen] = useState(false); // 게임 생성 모달 상태
  const [showCreationPage, setShowCreationPage] = useState(false); // 생물 만들기 페이지 상태
  
  // 실제로 바구니에 떨어진 이모티콘 개수 추적
  const [actualLeftCount, setActualLeftCount] = useState(0);
  const [actualRightCount, setActualRightCount] = useState(0);

  // 슬라이더 값에 따른 저울 기울기 계산
  const calculateTiltAngle = () => {
    const difference = rightSliderValue - leftSliderValue;
    const maxTilt = Math.PI / 8; // 최대 기울기 각도를 좀 더 크게 (22.5도)
    const normalizedDifference = difference / 10; // 슬라이더는 0-10 범위이므로
    const tiltAngle = normalizedDifference * maxTilt;
    
    // 디버깅용 로그 (나중에 제거 가능)
    console.log(`Left: ${leftSliderValue}, Right: ${rightSliderValue}, Difference: ${difference}, TiltAngle: ${tiltAngle}`);
    
    return tiltAngle; // 양수면 오른쪽으로 기울어짐, 음수면 왼쪽으로 기울어짐
  };

  const dynamicTiltAngle = calculateTiltAngle();

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

  const handleEmojiSelection = (emoji, keywords, type) => {
    if (type === 'positive') {
      setPositiveEmojis(prev => [...prev, emoji]);
      setPositiveKeywords(prev => [...prev, ...keywords]);
    } else if (type === 'negative') {
      setNegativeEmojis(prev => [...prev, emoji]);
      setNegativeKeywords(prev => [...prev, ...keywords]);
    }
    closeGameModal();
  };

  const handleKeywordUpdate = (emoji, keywords) => {
    // 키워드 업데이트 기능 (필요시 구현)
  };

  const handlePlayClick = () => {
    setIsTextInputModalOpen(true);
  };

  const handleTextInputSubmit = (text) => {
    setUserInputText(text);
    setShowLanding(false);
  };

  const handleStartGame = () => {
    setIsGameCreationModalOpen(true);
  };

  const closeGameCreationModal = () => {
    setIsGameCreationModalOpen(false);
  };

  const handleStartCreation = () => {
    setIsGameCreationModalOpen(false);
    setShowCreationPage(true);
  };

  const handleBackToMain = () => {
    setShowCreationPage(false);
  };

  // 이모티콘이 바구니에 도달했을 때 처리하는 함수
  const handleEmojiLanded = (landedInfo) => {
    const { emojiType, basket, position } = landedInfo;
    
    console.log(`${emojiType} landed in ${basket} basket at position:`, position);
    
    // 실제 바구니에 떨어진 개수 증가
    if (basket === 'left') {
      setActualLeftCount(prev => prev + 1);
    } else if (basket === 'right') {
      setActualRightCount(prev => prev + 1);
    }
  };

  // 우세한 이모티콘들 결정 (배열로 변경)
  const dominantEmojis = actualLeftCount > actualRightCount ? positiveEmojis : negativeEmojis;
  
  // 우세한 키워드 가져오기
  const dominantKeywords = actualLeftCount > actualRightCount ? positiveKeywords : negativeKeywords;

  const keywords = ['기쁨', '즐거움', '행복함', '밝음', '신남', '부드러움', '통통튀는', '화창한'];

  // Implementation of showCreationPage
  if (showCreationPage) {
    return (
      <CreationPage
        onBack={handleBackToMain}
        keyword={userInputText || '감정'}
        dominantEmojis={dominantEmojis}
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
        background: 'url(/first.png) center/cover no-repeat',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
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
            padding: '30px 60px',
            fontSize: '36px',
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
          emojis={positiveEmojis} 
          keywords={positiveKeywords} 
          sliderValue={leftSliderValue}
          onSliderChange={setLeftSliderValue}
          onStartGame={handleStartGame}
        />
        <EmotionColumn 
          emojis={negativeEmojis} 
          keywords={negativeKeywords} 
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
              tiltAngle={dynamicTiltAngle}
              verticalMovementFactor={0.03}
            />
              <EmojiSelector3D 
                onEmojiClick={handleEmoji3DClick} 
                />
              <FallingEmojiManager
                leftCount={positiveEmojis.length > 0 ? leftSliderValue : 0}
                rightCount={negativeEmojis.length > 0 ? rightSliderValue : 0}
                leftEmojiTypes={positiveEmojis}
                rightEmojiTypes={negativeEmojis}
                onEmojiLanded={handleEmojiLanded}
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
        existingKeywords={[]}
      />
      <GameCreationModal
        isOpen={isGameCreationModalOpen}
        keyword={userInputText || '감정'}
        dominantEmojis={dominantEmojis}
        dominantKeywords={dominantKeywords}
        onClose={closeGameCreationModal}
        onStart={handleStartCreation}
      />
    </FullScreenContainer>
  );
}