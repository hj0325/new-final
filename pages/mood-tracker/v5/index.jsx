import React, { useState, Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrthographicCamera, useGLTF } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useControls } from 'leva';
import FullScreenContainer from '../../../components/mood-tracker/v4/FullScreenContainer';
import GameModal from '../../../components/mood-tracker/v4/GameModal';
import TextInputModal from '../../../components/mood-tracker/v4/TextInputModal';
import ScaledScene from '../../../components/mood-tracker/v4/ScaledScene';
import EmotionColumn from '../../../components/mood-tracker/v4/EmotionColumn';
import { FallingModelsScene } from '../../../components/mood-tracker/v4/FallingModels';
import EmojiSelector3D from '../../../components/mood-tracker/v4/EmojiSelector3D';
import Emoji3D from '../../../components/mood-tracker/v4/Emoji3D';
import BasketEmojiManager from '../../../components/mood-tracker/v5/BasketEmojiManager';
import PhysicsGround from '../../../components/mood-tracker/v5/PhysicsGround';
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
const FloatingModel = ({ url, position, rotationSpeed = 0.01, floatSpeed = 0.02, floatAmplitude = 0.5, scale = [0.8, 0.8, 0.8], onClick, shapeId }) => {
  const groupRef = useRef();
  const { scene } = useGLTF(url);
  
  useFrame((state) => {
    if (groupRef.current) {
      // 둥실거리는 효과
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * floatSpeed) * floatAmplitude;
      // 회전 효과
      groupRef.current.rotation.y += rotationSpeed;
      groupRef.current.rotation.x += rotationSpeed * 0.5;
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();
    console.log(`Clicked on ${shapeId}`); // 디버깅용
    if (onClick) {
      onClick(shapeId);
    }
  };

  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'default';
  };

  return (
    <group ref={groupRef} position={position}>
      <primitive 
        object={scene.clone()} 
        scale={scale}
      />
      {/* 클릭 가능한 투명한 박스 */}
      <mesh 
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

// --- 떨어지는 도형 컴포넌트 ---
const FallingShape = ({ shapeInfo, position, scale = [0.8, 0.8, 0.8] }) => {
  const { scene } = useGLTF(getShapeModelPath(shapeInfo));
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return (
    <RigidBody
      type="dynamic"
      position={position}
colliders="cuboid"
      restitution={0.3}
      friction={0.8}
    >
      <primitive 
        object={clonedScene} 
        scale={scale}
      />
    </RigidBody>
  );
};

// 도형별 모델 경로 반환 함수
const getShapeModelPath = (shapeInfo) => {
  const pathMap = {
    '파란 네모': '/box.gltf',
    '빨간 길쭉이': '/clinder.gltf',
    '노란 뾰족이': '/hexagon.gltf',
    '초록 별': '/star.gltf'
  };
  return pathMap[shapeInfo.name] || '/box.gltf';
};

// --- 가상 바닥 컴포넌트 ---
const InvisibleGround = () => {
  return (
    <RigidBody type="fixed" position={[0, -3, 0]}>
      <mesh>
        <boxGeometry args={[20, 0.1, 20]} />
        <meshStandardMaterial 
          color="#F5E6A8" 
          transparent 
          opacity={0} // 완전히 투명하게
        />
      </mesh>
    </RigidBody>
  );
};

// 도형 게임창 모달 컴포넌트
const ShapeGameModal = ({ isOpen, shapeInfo, onClose, onSelect }) => {
  if (!isOpen || !shapeInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 3000,
      animation: 'fadeIn 0.3s ease-in-out'
    }}>
      <div style={{
        width: '500px',
        height: '400px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        animation: 'slideIn 0.4s ease-out'
      }}>
        {/* 도형 이름 */}
        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#333',
          margin: '0',
          textAlign: 'center'
        }}>
          {shapeInfo.name}
        </h2>

        {/* 도형 설명 */}
        <p style={{
          fontSize: '20px',
          color: '#555',
          textAlign: 'center',
          lineHeight: '1.6',
          margin: '20px 0',
          flex: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          {shapeInfo.description}
        </p>

        {/* 버튼들 */}
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* 선택 버튼 */}
          <button
            onClick={() => {
              if (onSelect) onSelect(shapeInfo);
              onClose();
            }}
            style={{
              padding: '12px 40px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#45a049';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#4CAF50';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            선택
          </button>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            style={{
              padding: '12px 40px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#ff5252';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#ff6b6b';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            닫기
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// --- 생물 만들기 페이지 컴포넌트 ---
const CreationPage = ({ onBack, keyword, dominantEmojis, dominantKeywords }) => {
  const [isShapeGameModalOpen, setIsShapeGameModalOpen] = useState(false);
  const [selectedShapeInfo, setSelectedShapeInfo] = useState(null);
  const [selectedShapes, setSelectedShapes] = useState([]); // 선택된 도형들 저장

  // 도형 정보 정의
  const shapeInfoMap = {
    'box': {
      name: '파란 네모',
      description: '나는 뾰족하지만 넓은 마음을 가지고 있어!'
    },
    'cylinder': {
      name: '빨간 길쭉이',
      description: '나는 길쭉길쭉하고 동글동글하지만 강해!'
    },
    'hexagon': {
      name: '노란 뾰족이',
      description: '나는 뾰족뾰족! 날카롭지만 다양한 모습을 가지고 있어'
    },
    'star': {
      name: '초록 별',
      description: '나는 반짝반짝 빛나는 별이야!'
    }
  };

  const handleShapeClick = (shapeId) => {
    console.log(`handleShapeClick called with shapeId: ${shapeId}`); // 디버깅용
    const shapeInfo = shapeInfoMap[shapeId];
    console.log('Shape info:', shapeInfo); // 디버깅용
    setSelectedShapeInfo(shapeInfo);
    setIsShapeGameModalOpen(true);
  };

  const closeShapeGameModal = () => {
    console.log('Closing shape game modal'); // 디버깅용
    setIsShapeGameModalOpen(false);
    // 약간의 지연을 두고 상태를 초기화
    setTimeout(() => {
      setSelectedShapeInfo(null);
    }, 300);
  };

  const handleShapeSelect = (shapeInfo) => {
    console.log('Shape selected:', shapeInfo);
    // 선택된 도형을 배열에 추가
    setSelectedShapes(prev => [...prev, {
      ...shapeInfo,
      id: Date.now(), // 고유 ID 생성
      position: [
        Math.random() * 4 - 2, // X: -2 ~ 2 범위
        8, // Y: 높은 위치에서 시작
        Math.random() * 4 - 2  // Z: -2 ~ 2 범위
      ]
    }]);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#F5E6A8', // 베이지색으로 변경
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
            {/* 가상 바닥 */}
            <InvisibleGround />
            
            {/* 선택된 도형들 - 떨어지는 효과 */}
            {selectedShapes.map((shape) => (
              <FallingShape
                key={shape.id}
                shapeInfo={shape}
                position={shape.position}
                scale={[0.8, 0.8, 0.8]}
              />
            ))}
            
            {/* 하단의 3D 이모티콘들 - 메인 페이지와 동일한 위치와 크기 */}
            <EmojiSelector3D onEmojiClick={() => {}} />
            
            {/* 4개의 3D 모델들을 중앙 주변에 배치 */}
            <FloatingModel 
              url="/box.gltf" 
              position={[-4, 0, 0]} 
              rotationSpeed={0.008}
              floatSpeed={0.015}
              floatAmplitude={0.3}
              scale={[1,1,1]}
              onClick={handleShapeClick}
              shapeId="box"
            />
            <FloatingModel 
              url="/clinder.gltf" 
              position={[-1.3, 0, 0]} 
              rotationSpeed={0.012}
              floatSpeed={0.02}
              floatAmplitude={0.4}
              scale={[1,1,1]}
              onClick={handleShapeClick}
              shapeId="cylinder"
            />
            <FloatingModel 
              url="/hexagon.gltf" 
              position={[1.3, 0, 0]} 
              rotationSpeed={0.01}
              floatSpeed={0.018}
              floatAmplitude={0.35}
              scale={[1,1,1]}
              onClick={handleShapeClick}
              shapeId="hexagon"
            />
            <FloatingModel 
              url="/star.gltf" 
              position={[4, 0, 0]} 
              rotationSpeed={0.015}
              floatSpeed={0.025}
              floatAmplitude={0.45}
              scale={[1,1,1]}
              onClick={handleShapeClick}
              shapeId="star"
            />
          </Physics>
        </Suspense>
      </Canvas>

      {/* 도형 게임창 모달 */}
      <ShapeGameModal 
        isOpen={isShapeGameModalOpen}
        shapeInfo={selectedShapeInfo}
        onClose={closeShapeGameModal}
        onSelect={handleShapeSelect}
      />
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
  const [showColumns, setShowColumns] = useState(false); // 양쪽 칼럼 표시 상태
  
  // Leva를 사용한 바구니 이모티콘 조정 컨트롤
  const { 
    emojiScale, 
    emojiSpacing, 
    basketHeight, 
    basketCapacity,
    leftBasketX,
    rightBasketX,
    randomnessRange,
    animationSpeed,
    bobAmplitude,
    zPositionRange,
    zPositionOffset
  } = useControls('바구니 이모티콘 설정', {
    emojiScale: { 
      value: 1.33, 
      min: 0.1, 
      max: 1.5, 
      step: 0.05,
      label: '이모티콘 크기'
    },
    emojiSpacing: { 
      value: 0.25, 
      min: 0.2, 
      max: 0.6, 
      step: 0.05,
      label: '이모티콘 간격'
    },
    basketHeight: { 
      value: 2.1, 
      min: 1.0, 
      max: 5.0, 
      step: 0.1,
      label: '바구니 높이'
    },
    basketCapacity: { 
      value: 20, 
      min: 5, 
      max: 30, 
      step: 1,
      label: '바구니 용량'
    },
    leftBasketX: { 
      value: -1.3, 
      min: -3, 
      max: -1, 
      step: 0.1,
      label: '왼쪽 바구니 X 위치'
    },
    rightBasketX: { 
      value: 1.6, 
      min: 0.5, 
      max: 2.5, 
      step: 0.1,
      label: '오른쪽 바구니 X 위치'
    },
    randomnessRange: { 
      value: 0.11, 
      min: 0, 
      max: 0.3, 
      step: 0.01,
      label: '랜덤 위치 범위'
    },
    animationSpeed: { 
      value: 1.4, 
      min: 0.1, 
      max: 2.0, 
      step: 0.1,
      label: '애니메이션 속도'
    },
    bobAmplitude: { 
      value: 0.07, 
      min: 0, 
      max: 0.1, 
      step: 0.01,
      label: '위아래 움직임 크기'
    },
    zPositionRange: { 
      value: 0.45, 
      min: 0.05, 
      max: 0.5, 
      step: 0.05,
      label: 'Z축 위치 범위 (바구니 깊이)'
    },
    zPositionOffset: { 
      value: -0.2, 
      min: -0.3, 
      max: 0.3, 
      step: 0.05,
      label: 'Z축 위치 오프셋 (앞뒤 조절)'
    }
  });

  // 슬라이더 값에 따른 저울 기울기 계산
  const calculateTiltAngle = () => {
    const difference = rightSliderValue - leftSliderValue;
    const maxTilt = Math.PI / 8; // 최대 기울기 각도를 좀 더 크게 (22.5도)
    const normalizedDifference = difference / 10; // 슬라이더는 0-10 범위이므로
    const tiltAngle = normalizedDifference * maxTilt;
    
    return tiltAngle; // 양수면 오른쪽으로 기울어짐, 음수면 왼쪽으로 기울어짐
  };

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
    // 긍정/부정 버튼 클릭 시 양쪽 칼럼 표시
    setShowColumns(true);
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

  // 우세한 이모티콘들 결정 (슬라이더 값 기반으로 변경)
  const dominantEmojis = leftSliderValue > rightSliderValue ? positiveEmojis : negativeEmojis;
  
  // 우세한 키워드 가져오기 (슬라이더 값 기반으로 변경)
  const dominantKeywords = leftSliderValue > rightSliderValue ? positiveKeywords : negativeKeywords;

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

  // 현재 날짜와 시간 가져오기
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[now.getDay()];
    const hour = now.getHours();
    const minute = now.getMinutes().toString().padStart(2, '0');
    
    return `${year}년 ${month}월 ${day}일 (${dayName}) 오후 ${hour}:${minute}`;
  };

  return (
    <FullScreenContainer>
      {/* 상단 헤더 바 (배경만) */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        left: '0px',
        width: '100%',
        background: '#F5E6A8',
        border: '5px solid #B02B3A',
        height: '80px', // 원래 두께로 복원
        zIndex: 99,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}></div>

      {/* 상단 헤더 텍스트들 (별도 위치) */}
      <div style={{
        position: 'absolute',
        top: '-15px', // 더 아래로 이동
        left: '0px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        padding: '15px 40px 15px 40px'
      }}>
        {/* 왼쪽: 제목 */}
        <div style={{
          color: '#333',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          이모티콘을 이용해 오늘의 감정 무게를 측정하고 기록하세요
        </div>
        
        {/* 빨간 구분선 */}
        <div style={{
          width: '6px',
          height: '40px',
          background: '#B02B3A'
        }}></div>
        
        {/* 중간: 오늘의 감정 기록하기 */}
        <div style={{
          color: '#333',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          오늘의 감정 기록하기
        </div>
        
        {/* 빨간 구분선 */}
        <div style={{
          width: '6px',
          height: '40px',
          background: '#B02B3A'
        }}></div>
        
        {/* 오른쪽: 날짜와 시간 */}
        <div style={{
          color: '#666',
          fontSize: '14px'
        }}>
          {getCurrentDateTime()}
        </div>
      </div>

      {userInputText && (
        <div style={{
          position: 'absolute',
          top: '50px', // 상단 헤더 아래로 이동 (조정된 위치에 맞춤)
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
      
      {/* 만들기 시작 버튼 - 이모티콘이 있고 슬라이더가 조작되었을 때만 표시 */}
      {showColumns && (positiveEmojis.length > 0 || negativeEmojis.length > 0) && (
        <button
          onClick={handleStartGame}
          style={{
            position: 'absolute',
            bottom: '260px', // 하단 이모티콘 위쪽으로 이동
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '15px 30px',
            fontSize: '22px',
            fontWeight: 'bold',
            background: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '18px',
            boxShadow: '0 4px 12px rgba(176, 43, 58, 0.3)',
            cursor: 'pointer',
            zIndex: 100,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateX(-50%) scale(1.05)';
            e.target.style.boxShadow = '0 6px 16px rgba(176, 43, 58, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateX(-50%) scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(176, 43, 58, 0.3)';
          }}
        >
          만들기 시작
        </button>
      )}
      {showColumns && (
        <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
          <EmotionColumn 
            emojis={positiveEmojis} 
            keywords={positiveKeywords} 
            sliderValue={leftSliderValue}
            onSliderChange={setLeftSliderValue}
          />
          <EmotionColumn 
            emojis={negativeEmojis} 
            keywords={negativeKeywords} 
            sliderValue={rightSliderValue}
            onSliderChange={setRightSliderValue}
          />
        </div>
      )}
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
            <PhysicsGround />
            <ScaledScene
              bodyProps={bodyProps}
              wingsProps={wingsProps}
              wingsPrimitiveOffset={wingsPrimitiveOffset}
              tiltAngle={calculateTiltAngle()}
              verticalMovementFactor={0.03}
            />
              <EmojiSelector3D 
                onEmojiClick={handleEmoji3DClick} 
                />
              <BasketEmojiManager
                leftCount={positiveEmojis.length > 0 ? leftSliderValue : 0}
                rightCount={negativeEmojis.length > 0 ? rightSliderValue : 0}
                leftEmojiTypes={positiveEmojis}
                rightEmojiTypes={negativeEmojis}
                emojiScale={emojiScale}
                emojiSpacing={emojiSpacing}
                basketHeight={basketHeight}
                basketCapacity={basketCapacity}
                leftBasketX={leftBasketX}
                rightBasketX={rightBasketX}
                randomnessRange={randomnessRange}
                animationSpeed={animationSpeed}
                bobAmplitude={bobAmplitude}
                zPositionRange={zPositionRange}
                zPositionOffset={zPositionOffset}
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