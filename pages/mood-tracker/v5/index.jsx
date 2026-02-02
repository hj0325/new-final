import React, { useState, Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, useGLTF } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { Leva, useControls } from 'leva';
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

// 프리뷰 모델 미리 로드
['/models/emotion1.gltf', '/models/emotion2.gltf', '/models/emotion3.gltf', '/models/emotion4.gltf', '/models/emotion5.gltf']
  .forEach((p) => useGLTF.preload(p));

// (Rapier 없는) 3D 이모티콘 프리뷰 - 블러 위에 올릴 용도
const EmojiPreview3D = ({ emojiId, scale = 1, position = [0, 0, 0] }) => {
  const modelPath = `/models/emotion${{ joy: 1, surprise: 2, neutral: 3, sadness: 4, anger: 5 }[emojiId] || 1}.gltf`;
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return <primitive object={clonedScene} scale={scale} position={position} />;
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

// 떨어지는 3D 이모티콘 컴포넌트
const FallingEmoji = ({ emojiId, position, scale = [0.8, 0.8, 0.8] }) => {
  const modelPath = `/models/emotion${{'joy': 1, 'surprise': 2, 'neutral': 3, 'sadness': 4, 'anger': 5}[emojiId] || 1}.gltf`;
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return (
    <RigidBody 
      type="dynamic" 
      position={position}
      colliders="hull"
      restitution={0.4}
      friction={0.6}
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
    '분홍 둥글이': '/circle.gltf',
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
        {/* 도형 이모티콘 */}
        <div style={{
          fontSize: '80px',
          margin: '0',
          textAlign: 'center'
        }}>
          {shapeInfo.emoji || shapeInfo.name}
        </div>

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
const CreationPage = ({ onBack, keyword, dominantEmojis, dominantKeywords, positiveEmojis, negativeEmojis, leftSliderValue, rightSliderValue }) => {
  const [isShapeGameModalOpen, setIsShapeGameModalOpen] = useState(false);
  const [selectedShapeInfo, setSelectedShapeInfo] = useState(null);
  const [selectedShapes, setSelectedShapes] = useState([]); // 선택된 도형들 저장
  const [fallingEmojis, setFallingEmojis] = useState([]); // 떨어지는 이모티콘들

  // 도형 ID에서 모델 경로 반환하는 함수
  const getShapeModelPathById = (shapeId) => {
    const shapeModels = {
      'box': '/box.gltf',
      'cylinder': '/clinder.gltf',
      'circle': '/circle.gltf',
      'hexagon': '/hexagon.gltf',
      'star': '/star.gltf'
    };
    return shapeModels[shapeId] || '/box.gltf';
  };

  // 페이지 로드 시 떨어지는 이모티콘들 생성
  useEffect(() => {
    const emojis = [];
    const emojiCharToId = {'😀': 'joy', '😮': 'surprise', '😐': 'neutral', '😖': 'sadness', '😠': 'anger'};
    
    // 긍정 이모티콘들 추가 (왼쪽에서 떨어짐)
    positiveEmojis.forEach((emojiChar, index) => {
      const emojiId = emojiCharToId[emojiChar];
      if (emojiId) {
        for (let i = 0; i < leftSliderValue; i++) {
          emojis.push({
            id: `positive-${index}-${i}-${Date.now()}`,
            emojiId,
            position: [
              -8 + Math.random() * 6, // 왼쪽 영역을 훨씬 더 넓게 (-8에서 -2)
              8 + Math.random() * 6, // 더 높은 위치에서 시작 (8에서 14)
              -6 + Math.random() * 4 // 뒤쪽에서 떨어지게 (-6에서 -2)
            ]
          });
        }
      }
    });

    // 부정 이모티콘들 추가 (오른쪽에서 떨어짐)
    negativeEmojis.forEach((emojiChar, index) => {
      const emojiId = emojiCharToId[emojiChar];
      if (emojiId) {
        for (let i = 0; i < rightSliderValue; i++) {
          emojis.push({
            id: `negative-${index}-${i}-${Date.now()}`,
            emojiId,
            position: [
              2 + Math.random() * 6, // 오른쪽 영역을 훨씬 더 넓게 (2에서 8)
              8 + Math.random() * 6, // 더 높은 위치에서 시작 (8에서 14)
              -6 + Math.random() * 4 // 뒤쪽에서 떨어지게 (-6에서 -2)
            ]
          });
        }
      }
    });

    setFallingEmojis(emojis);
  }, [positiveEmojis, negativeEmojis, leftSliderValue, rightSliderValue]);

  // 도형 정보 정의
  const shapeInfoMap = {
    'box': {
      name: '파란 네모',
      description: '나는 뾰족하지만 넓은 마음을 가지고 있어!',
      emoji: '😀'
    },
    'cylinder': {
      name: '빨간 길쭉이',
      description: '나는 길쭉길쭉하고 동글동글하지만 강해!',
      emoji: '😮'
    },
    'circle': {
      name: '분홍 둥글이',
      description: '나는 둥그렇게 돌아가지! 때에 따라 다양한 모습으로 변할 수 있어',
      emoji: '😐'
    },
    'hexagon': {
      name: '노란 뾰족이',
      description: '나는 뾰족뾰족! 날카롭지만 다양한 모습을 가지고 있어',
      emoji: '😖'
    },
    'star': {
      name: '초록 별',
      description: '나는 반짝반짝 빛나는 별이야!',
      emoji: '😠'
    }
  };

  // 이모티콘과 도형 연결 매핑 (기쁨-파란 네모 / 놀람-빨간 기둥 / 무표정-분홍 둥글이 / 슬픔-노란 뾰족이 / 화남-초록 별)
  const emojiToShapeMap = {
    'joy': 'box',        // 기쁨 -> 파란 네모
    'surprise': 'cylinder', // 놀람 -> 빨간 기둥
    'neutral': 'circle',    // 무표정 -> 분홍 둥글이
    'sadness': 'hexagon',   // 슬픔 -> 노란 뾰족이
    'anger': 'star'         // 화남 -> 초록 별
  };

  // 슬라이더 값에 따라 우세한 이모티콘 결정
  const getDominantEmojis = () => {
    if (leftSliderValue > rightSliderValue) {
      return positiveEmojis;
    } else if (rightSliderValue > leftSliderValue) {
      return negativeEmojis;
    } else {
      // 같을 경우 모든 이모티콘 포함
      return [...positiveEmojis, ...negativeEmojis];
    }
  };

  // 우세한 이모티콘에서 첫 번째 이모티콘의 도형 ID 가져오기
  const getDominantShapeId = () => {
    const dominantEmojis = getDominantEmojis();
    if (dominantEmojis.length > 0) {
      // 첫 번째 이모티콘에서 이모티콘 ID 추출 (예: '😀' -> 'joy')
      const emojiChar = dominantEmojis[0];
      for (const [emojiId, emojiValue] of Object.entries({'joy': '😀', 'surprise': '😮', 'neutral': '😐', 'sadness': '😖', 'anger': '😠'})) {
        if (emojiValue === emojiChar) {
          return emojiToShapeMap[emojiId];
        }
      }
    }
    return 'box'; // 기본값
  };

  // 선택되지 않은 도형들 가져오기
  const getUnselectedShapes = () => {
    const dominantShapeId = getDominantShapeId();
    return Object.keys(shapeInfoMap).filter(shapeId => shapeId !== dominantShapeId);
  };

  const handleShapeClick = (shapeId) => {
    console.log(`handleShapeClick called with shapeId: ${shapeId}`); // 디버깅용
    const shapeInfo = shapeInfoMap[shapeId];
    console.log('Shape info:', shapeInfo); // 디버깅용
    setSelectedShapeInfo(shapeInfo);
    setIsShapeGameModalOpen(true);
  };

  // 이모티콘 클릭 핸들러 - 연결된 도형의 설명창을 엽니다
  const handleEmojiClick = (emojiId) => {
    console.log(`handleEmojiClick called with emojiId: ${emojiId}`); // 디버깅용
    const shapeId = emojiToShapeMap[emojiId];
    if (shapeId) {
      const shapeInfo = shapeInfoMap[shapeId];
      console.log('Shape info from emoji click:', shapeInfo); // 디버깅용
      setSelectedShapeInfo(shapeInfo);
      setIsShapeGameModalOpen(true);
    }
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

  const dominantShapeId = getDominantShapeId();
  const unselectedShapes = getUnselectedShapes();

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

      {/* 왼쪽 칼럼 */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '250px',
        height: '80%',
        background: '#87CEEB', // 하늘색 배경으로 변경
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10
      }}>
        {/* 상단: 감정 생물 만들기 */}
        <div style={{
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'black', // 텍스트 색상을 검은색으로 변경
          marginBottom: '20px',
          padding: '10px',
          background: 'white', // 완전 흰색 배경
          borderRadius: '10px'
        }}>
          감정 생물 만들기
        </div>

        {/* 중간: 도형의 성격 */}
        <div style={{
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: '600',
          color: 'black', // 텍스트 색상을 검은색으로 변경
          marginBottom: '15px',
          padding: '8px',
          background: 'white', // 완전 흰색 배경
          borderRadius: '8px'
        }}>
          도형의 성격
        </div>

        {/* 선택되지 않은 도형들 세로 나열 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          overflowY: 'auto'
        }}>
          {unselectedShapes.map((shapeId) => {
            const shapeInfo = shapeInfoMap[shapeId];
            return (
              <div
                key={shapeId}
                onClick={() => handleShapeClick(shapeId)}
                style={{
                  height: '120px', // 높이를 100px에서 120px로 더 증가
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '10px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 1)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <Canvas camera={{ position: [0, 0, 3], fov: 50 }} style={{ width: '100%', height: '100%' }}>
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[2, 2, 2]} intensity={1} />
                    <FloatingModel
                       url={getShapeModelPathById(shapeId)}
                       position={[0, 0, 0]}
                       rotationSpeed={0.02}
                       floatSpeed={0.05}
                       floatAmplitude={0.1}
                       scale={[1.2, 1.2, 1.2]} // 스케일을 0.8에서 1.2로 증가
                       onClick={handleShapeClick}
                       shapeId={shapeId}
                     />
                  </Suspense>
                </Canvas>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          width: '50px',
          height: '50px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '5px solid #B02B3A',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: '#B02B3A',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 100,
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = '#B02B3A';
          e.target.style.color = 'white';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.9)';
          e.target.style.color = '#B02B3A';
          e.target.style.transform = 'scale(1)';
        }}
              >
          ⬅
        </button>
      
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
          alignItems: 'center',
          marginBottom: '15px'
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
        
        {/* 추가 설명 문구 */}
        <div style={{
          fontSize: '18px',
          color: '#555',
          textAlign: 'center',
          fontWeight: '500',
          lineHeight: '1.4'
        }}>
          도형의 성격을 알아보고 감정 생물 만들기 시작
        </div>
      </div>
      
      {/* 3D 씬 */}
      <Canvas camera={{ position: [0, 3.5, 7], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} color="#FFFFFF" />
          <directionalLight 
            position={[8, 10, 5]} 
            intensity={0.5} 
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight 
            position={[-8, 5, -8]} 
            intensity={0.3}
            color="#E3F2FD"
          />
          
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
            
            {/* 떨어지는 3D 이모티콘들 */}
            {fallingEmojis.map((emoji) => (
              <FallingEmoji
                key={emoji.id}
                emojiId={emoji.emojiId}
                position={emoji.position}
                scale={[4, 4, 4]}
              />
            ))}
            
            {/* 하단의 우세한 이모티콘만 표시 */}
            {(() => {
              const dominantEmojis = getDominantEmojis();
              const emojiIdToChar = {'joy': '😀', 'surprise': '😮', 'neutral': '😐', 'sadness': '😖', 'anger': '😠'};
              
              return dominantEmojis.map((emojiChar, index) => {
                for (const [emojiId, emojiValue] of Object.entries(emojiIdToChar)) {
                  if (emojiValue === emojiChar) {
                    return (
                      <group key={emojiId}>
                        {/* 해당 이모티콘의 3D 모델 표시 */}
                        <Emoji3D
                          emojiId={emojiId}
                          modelPath={`/models/emotion${Object.keys(emojiIdToChar).indexOf(emojiId) + 1}.gltf`}
                          initialPosition={[index * 1.2 - (dominantEmojis.length - 1) * 0.6, 0.3, 4.7]}
                          scale={0.93}
                          onClick={handleEmojiClick}
                        />
                      </group>
                    );
                  }
                }
                return null;
              });
            })()}
            
            {/* 우세한 도형만 중앙에 표시 */}
            {(() => {
              const getShapeModelPath = (shapeId) => {
                const shapeModels = {
                  'box': '/box.gltf',
                  'cylinder': '/clinder.gltf',
                  'circle': '/circle.gltf',
                  'hexagon': '/hexagon.gltf',
                  'star': '/star.gltf'
                };
                return shapeModels[shapeId];
              };

              return (
                <FloatingModel 
                  url={getShapeModelPath(dominantShapeId)} 
                  position={[0, 0, 0]} 
                  rotationSpeed={0.009}
                  floatSpeed={0.016}
                  floatAmplitude={0.38}
                  scale={[1.2, 1.2, 1.2]}
                  onClick={handleShapeClick}
                  shapeId={dominantShapeId}
                />
              );
            })()}
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
  const [selectedEmojiIdForGameModal, setSelectedEmojiIdForGameModal] = useState(null);
  const [isTextInputModalOpen, setIsTextInputModalOpen] = useState(false);
  const [userInputText, setUserInputText] = useState('');
  const [positiveEmojis, setPositiveEmojis] = useState([]); // 긍정 이모티콘들
  const [negativeEmojis, setNegativeEmojis] = useState([]); // 부정 이모티콘들
  const [positiveKeywords, setPositiveKeywords] = useState([]); // 긍정 키워드들
  const [negativeKeywords, setNegativeKeywords] = useState([]); // 부정 키워드들
  const [leftSliderValue, setLeftSliderValue] = useState(0);
  const [rightSliderValue, setRightSliderValue] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isInstructionsFading, setIsInstructionsFading] = useState(false);
  const [isGameCreationModalOpen, setIsGameCreationModalOpen] = useState(false); // 게임 생성 모달 상태
  const [showCreationPage, setShowCreationPage] = useState(false); // 생물 만들기 페이지 상태
  const [showColumns, setShowColumns] = useState(false); // 양쪽 칼럼 표시 상태
  const audioRef = useRef(null); // 배경음악을 위한 ref
  const leftColumnRef = useRef(null);
  const rightColumnRef = useRef(null);
  const [startButtonPos, setStartButtonPos] = useState(null); // { x, y } (viewport px)
  
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

  // 만들기 시작 버튼을 "더 높은 슬라이더 값 쪽 카드 밑"으로 자연스럽게 배치
  useEffect(() => {
    if (!showColumns || (positiveEmojis.length === 0 && negativeEmojis.length === 0)) {
      setStartButtonPos(null);
      return;
    }

    const pickDominantEl = () => {
      // 한쪽만 존재하면 그쪽
      if (positiveEmojis.length === 0 && negativeEmojis.length > 0) return rightColumnRef.current;
      if (negativeEmojis.length === 0 && positiveEmojis.length > 0) return leftColumnRef.current;
      // 둘 다 있으면 슬라이더 값 큰 쪽
      if (rightSliderValue > leftSliderValue) return rightColumnRef.current;
      return leftColumnRef.current; // 같으면 왼쪽
    };

    const update = () => {
      const el = pickDominantEl();
      if (!el || !el.getBoundingClientRect) {
        setStartButtonPos(null);
        return;
      }

      const rect = el.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.bottom + 14;

      const x = Math.max(24, Math.min(window.innerWidth - 24, targetX));
      const y = Math.max(24, Math.min(window.innerHeight - 24, targetY));

      setStartButtonPos({ x, y });
    };

    update();
    window.addEventListener('resize', update);
    // FullScreenContainer 내 스크롤/레이아웃 변화에도 대응
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [
    showColumns,
    leftSliderValue,
    rightSliderValue,
    positiveEmojis.length,
    negativeEmojis.length,
  ]);

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
    // 처음 이모티콘 클릭시 안내 문구 숨기기
    if (showInstructions) {
      setShowInstructions(false);
    }
    
    const emojiChar = emojiIdToChar[emojiId];
    if (emojiChar) {
      setSelectedEmojiForGameModal(emojiChar);
      setSelectedEmojiIdForGameModal(emojiId);
      setIsGameModalOpen(true);
    }
  };

  const closeGameModal = () => {
    setIsGameModalOpen(false);
    setSelectedEmojiForGameModal(null);
    setSelectedEmojiIdForGameModal(null);
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
    setShowLanding(true);
    // 관련 상태들도 초기화
    setShowColumns(false);
    setPositiveEmojis([]);
    setNegativeEmojis([]);
    setPositiveKeywords([]);
    setNegativeKeywords([]);
    setLeftSliderValue(0);
    setRightSliderValue(0);
    
    // 배경음악이 계속 재생되도록 보장
    setTimeout(() => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(error => {
          console.log('뒤로가기 시 오디오 재생 실패:', error);
        });
      }
    }, 100);
  };

  // 배경음악 초기화 및 재생
  useEffect(() => {
    const initializeAudio = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.3; // 볼륨 설정 (0.0 ~ 1.0)
        audioRef.current.loop = true; // 반복 재생
      audioRef.current.preload = 'auto'; // 자동 미리 로드
        
        // 사용자 상호작용 후 재생하기 위한 함수
        const playAudio = () => {
          if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(error => {
              console.log('오디오 재생 실패:', error);
            });
          }
        };

        // 클릭 이벤트 리스너 등록 (한 번만)
        document.addEventListener('click', playAudio, { once: true });
        
        return () => {
          document.removeEventListener('click', playAudio);
        };
      }
    };

    initializeAudio();
  }, []);

  // 페이지 전환 시에도 음악이 계속 재생되도록 보장
  useEffect(() => {
    const ensureAudioPlaying = () => {
      if (audioRef.current) {
        // 음악이 일시정지되어 있으면 다시 재생
        if (audioRef.current.paused && audioRef.current.readyState >= 2) {
          audioRef.current.play().catch(error => {
            console.log('페이지 전환 시 오디오 재생 실패:', error);
          });
        }
      }
    };

    // 약간의 지연을 두고 음악 재생 확인
    const timer = setTimeout(ensureAudioPlaying, 100);
    
    return () => clearTimeout(timer);
  }, [showLanding, showCreationPage]);

  // 안내 문구: 접속 시 4초 유지 후 자연스럽게 사라짐
  useEffect(() => {
    if (showLanding) return;
    if (!showInstructions) return;

    setIsInstructionsFading(false);

    const fadeTimer = setTimeout(() => {
      setIsInstructionsFading(true);
    }, 3600);

    const hideTimer = setTimeout(() => {
      setShowInstructions(false);
      setIsInstructionsFading(false);
    }, 4000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [showLanding, showInstructions]);

  // 우세한 이모티콘들 결정 (슬라이더 값 기반으로 변경)
  const dominantEmojis = leftSliderValue > rightSliderValue ? positiveEmojis : negativeEmojis;
  
  // 우세한 키워드 가져오기 (슬라이더 값 기반으로 변경)
  const dominantKeywords = leftSliderValue > rightSliderValue ? positiveKeywords : negativeKeywords;

  const keywords = ['기쁨', '즐거움', '행복함', '밝음', '신남', '부드러움', '통통튀는', '화창한'];

  // Implementation of showCreationPage
  if (showCreationPage) {
    return (
      <>
      <CreationPage
        onBack={handleBackToMain}
        keyword={userInputText || '감정'}
        dominantEmojis={dominantEmojis}
        dominantKeywords={dominantKeywords}
        positiveEmojis={positiveEmojis}
        negativeEmojis={negativeEmojis}
        leftSliderValue={leftSliderValue}
        rightSliderValue={rightSliderValue}
      />
        
        {/* 배경음악 - 세번째 화면에서도 계속 재생 */}
        <audio 
          ref={audioRef} 
          preload="auto"
          src="/bgm.mp3"
          style={{ display: 'none' }}
          loop
        />
      </>
    );
  }

  if (showLanding) {
    return (
      <>
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
        
        {/* 배경음악 - 모든 페이지에서 공통으로 사용 */}
        <audio 
          ref={audioRef} 
          preload="auto"
          src="/bgm.mp3"
          style={{ display: 'none' }}
          loop
        />
      </>
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
    <>
    {/* Leva 패널 렌더 (기존 useControls들이 실제로 보이도록) */}
    <Leva collapsed={false} />
    <FullScreenContainer>
      {/* GameModal 블러 위에: 클릭된 하단 이모티콘만 선명하게 오버레이 */}
      {isGameModalOpen && selectedEmojiIdForGameModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 8500, pointerEvents: 'none' }}>
          <Canvas
            gl={{ alpha: true }}
            camera={{ position: [0, 3.5, 7], fov: 50 }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.6} color="#FFFFFF" />
              <directionalLight position={[8, 10, 5]} intensity={0.5} />
              <directionalLight position={[-8, 5, -8]} intensity={0.3} color="#E3F2FD" />

              {/* EmojiSelector3D의 기본 배치/회전에 맞춘 클릭 이모티콘 위치 */}
              <group rotation={[(-23 * Math.PI) / 180, 0, 0]}>
                <EmojiPreview3D
                  emojiId={selectedEmojiIdForGameModal}
                  scale={0.93}
                  position={[
                    (['joy', 'surprise', 'neutral', 'sadness', 'anger'].indexOf(selectedEmojiIdForGameModal) - 2) * 0.10,
                    0.3,
                    4.7
                  ]}
                />
              </group>
            </Suspense>
          </Canvas>
        </div>
      )}
      
      {/* 만들기 시작 버튼 - 이모티콘이 있고 슬라이더가 조작되었을 때만 표시 */}
      {showColumns && (positiveEmojis.length > 0 || negativeEmojis.length > 0) && (
        <button
          onClick={handleStartGame}
          style={{
            position: startButtonPos ? 'fixed' : 'absolute',
            ...(startButtonPos
              ? { left: `${startButtonPos.x}px`, top: `${startButtonPos.y}px` }
              : {
                  bottom: '260px', // 기존 위치(폴백)
                  left: '50%',
                }),
            transform: 'translateX(-50%)',
            padding: '14px 22px',
            fontSize: '18px',
            fontWeight: 700,
            background: 'rgba(255, 255, 255, 0.55)',
            color: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.65)',
            borderRadius: '999px',
            boxShadow: '0 14px 32px rgba(17, 24, 39, 0.18)',
            backdropFilter: 'blur(12px) saturate(1.25)',
            WebkitBackdropFilter: 'blur(12px) saturate(1.25)',
            cursor: 'pointer',
            zIndex: 150,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateX(-50%) translateY(-2px) scale(1.04)';
            e.target.style.background = 'rgba(255, 255, 255, 0.68)';
            e.target.style.boxShadow = '0 18px 38px rgba(17, 24, 39, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateX(-50%)';
            e.target.style.background = 'rgba(255, 255, 255, 0.55)';
            e.target.style.boxShadow = '0 14px 32px rgba(17, 24, 39, 0.18)';
          }}
        >
          만들기 시작
        </button>
      )}
      {showColumns && (
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: '48%', left: 0, transform: 'translateY(-50%)', zIndex: 1, padding: '0 26px', gap: '24px' }}>
          <div ref={leftColumnRef} style={{ display: 'flex' }}>
            <EmotionColumn 
              variant="v5"
              emojis={positiveEmojis} 
              keywords={positiveKeywords} 
              sliderValue={leftSliderValue}
              onSliderChange={setLeftSliderValue}
            />
          </div>
          <div ref={rightColumnRef} style={{ display: 'flex' }}>
            <EmotionColumn 
              variant="v5"
              emojis={negativeEmojis} 
              keywords={negativeKeywords} 
              sliderValue={rightSliderValue}
              onSliderChange={setRightSliderValue}
            />
          </div>
        </div>
      )}
      <div style={{ width: '90%', height: '90%', maxWidth: '1200px', maxHeight: '900px', position: 'relative', zIndex: 2 }}>
        <Canvas camera={{ position: [0, 3.5, 7], fov: 50 }}> 
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} color="#FFFFFF" />
            <directionalLight 
              position={[8, 10, 5]} 
              intensity={0.5} 
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <directionalLight 
              position={[-8, 5, -8]} 
              intensity={0.3}
              color="#E3F2FD"
            />
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
                hiddenEmojiId={isGameModalOpen ? selectedEmojiIdForGameModal : null}
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
      {showInstructions && (
        <>
          {/* 배경 블러 오버레이 (기능 영향 없도록 클릭 통과) */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1100,
              opacity: isInstructionsFading ? 0 : 1,
              transition: 'opacity 0.4s ease',
              background: 'rgba(0, 0, 0, 0.10)',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="momoHint"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) ${isInstructionsFading ? 'scale(0.985)' : 'scale(1)'}`,
              opacity: isInstructionsFading ? 0 : 1,
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              padding: '28px 28px 26px',
              background: 'rgba(255, 255, 255, 0.86)',
              color: '#111827',
              borderRadius: '22px',
              zIndex: 1200,
              textAlign: 'center',
              width: 'min(440px, 84vw)',
              // 블랙 그림자 대신 화이트+옐로 글로우
              boxShadow:
                '0 18px 60px rgba(255, 255, 255, 0.35), 0 0 46px rgba(255, 200, 61, 0.40)',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                fontSize: '22px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                lineHeight: 1.35,
              }}
            >
              <div>이모티콘을 클릭하고</div>
              <div style={{ height: '10px' }} />
              <div>오늘의 감정을 입력하세요.</div>
            </div>

            <style jsx>{`
              .momoHint {
                position: relative;
                animation: momoHintPop 180ms ease-out;
              }

              /* 테두리로 갈수록 노란색으로 자연스럽게 블러 */
              .momoHint::before {
                content: '';
                position: absolute;
                inset: -2px;
                border-radius: 24px;
                background: radial-gradient(
                  120% 120% at 50% 50%,
                  rgba(255, 255, 255, 0) 55%,
                  rgba(255, 229, 122, 0.55) 78%,
                  rgba(255, 200, 61, 0.65) 100%
                );
                filter: blur(10px);
                opacity: 0.9;
                z-index: -1;
              }

              @keyframes momoHintPop {
                from {
                  opacity: 0;
                  transform: translate(-50%, -50%) scale(0.98);
                }
                to {
                  opacity: 1;
                  transform: translate(-50%, -50%) scale(1);
                }
              }
            `}</style>
          </div>
        </>
      )}
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
      
      {/* 배경음악 - 모든 페이지에서 공통으로 사용 */}
      <audio 
        ref={audioRef} 
        preload="auto"
        src="/bgm.mp3"
        style={{ display: 'none' }}
        loop
      />
    </>
  );
}