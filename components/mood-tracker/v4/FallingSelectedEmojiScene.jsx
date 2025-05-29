import React, { useState, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

const NUM_FALLING_MODELS = 100;
const FALLING_MODEL_SCALE = 40;

// 이모티콘 문자를 모델 경로로 매핑
const getModelPath = (emojiType) => {
  const emojiToModel = {
    '😀': '/models/emotion1.gltf', // joy
    '😮': '/models/emotion2.gltf', // surprise
    '😐': '/models/emotion3.gltf', // neutral
    '😖': '/models/emotion4.gltf', // sadness
    '😠': '/models/emotion5.gltf', // anger
  };
  
  return emojiToModel[emojiType] || '/models/emotion1.gltf';
};

// 모든 모델 프리로드
const EMOTION_MODEL_PATHS = [
  '/models/emotion1.gltf',
  '/models/emotion2.gltf',
  '/models/emotion3.gltf',
  '/models/emotion4.gltf',
  '/models/emotion5.gltf',
];
EMOTION_MODEL_PATHS.forEach(path => useGLTF.preload(path));

function FallingEmotionModel({ modelPath, initialX, initialY, viewportHeight, modelScale, delay = 0 }) {
  const ref = React.useRef();
  const { scene } = useGLTF(modelPath);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(delay === 0);
  const velocity = useRef({ x: 0, y: 0 });
  const [rotationSpeed] = useState(() => (Math.random() - 0.5) * 0.02);
  const [xPos] = useState(initialX);
  const startTime = useRef(Date.now());

  useFrame((state, delta) => {
    // 지연 시간 처리
    if (!isVisible && Date.now() - startTime.current > delay) {
      setIsVisible(true);
    }

    if (ref.current && isVisible) {
      const currentVel = velocity.current;
      const G_ACCEL = 0.0003;
      const HOVER_SIDE_STRENGTH = 0.15;
      const HOVER_UP_STRENGTH = 0.0008;
      const X_DAMPING = 0.92;

      currentVel.y += G_ACCEL * 80 * delta;

      if (isHovered) {
        currentVel.x += (Math.random() - 0.5) * HOVER_SIDE_STRENGTH * 60 * delta;
        currentVel.y -= HOVER_UP_STRENGTH * 60 * delta;
      }

      ref.current.position.x += currentVel.x * 60 * delta;
      ref.current.position.y -= currentVel.y * 60 * delta;
      currentVel.x *= X_DAMPING;

      ref.current.rotation.y += rotationSpeed * 60 * delta;
      ref.current.rotation.x += rotationSpeed * 0.5 * 60 * delta;

      if (ref.current.position.y < -viewportHeight / 2 - modelScale * 2) {
        ref.current.position.y = viewportHeight / 2 + modelScale * 2 + Math.random() * viewportHeight * 0.3;
        ref.current.position.x = (Math.random() - 0.5) * state.viewport.width * 0.9;
        currentVel.x = 0;
        currentVel.y = 0;
        setIsHovered(false);
      }
    }
  });

  if (!isVisible) return null;

  return (
    <primitive
      ref={ref}
      object={clonedScene}
      scale={modelScale}
      position={[xPos, initialY, 0]}
      onPointerOver={(event) => { 
        event.stopPropagation(); 
        setIsHovered(true); 
      }}
      onPointerOut={() => setIsHovered(false)}
    />
  );
}

export function FallingSelectedEmojiScene({ dominantEmojis = [] }) {
  const { viewport } = useThree();
  const models = [];
  
  // 선택된 이모티콘들의 모델 경로들 가져오기
  const selectedModelPaths = dominantEmojis.length > 0 
    ? dominantEmojis.map(emoji => getModelPath(emoji))
    : ['/models/emotion1.gltf']; // 기본값

  for (let i = 0; i < NUM_FALLING_MODELS; i++) {
    const initialModelX = (Math.random() - 0.5) * viewport.width * 1.2;
    
    // 랜덤하게 모델 경로 선택
    const randomModelPath = selectedModelPaths[Math.floor(Math.random() * selectedModelPaths.length)];
    
    // 즉시 떨어지는 이모티콘들 (30%)
    let initialModelY, delay;
    if (i < NUM_FALLING_MODELS * 0.3) {
      // 즉시 화면에 보이는 이모티콘들 - 화면 중간~위쪽에서 시작
      initialModelY = (Math.random() * viewport.height * 0.8) + (viewport.height * 0.1);
      delay = 0;
    } else if (i < NUM_FALLING_MODELS * 0.7) {
      // 중간에 많이 떨어지는 이모티콘들 (40%)
      initialModelY = viewport.height / 2 + FALLING_MODEL_SCALE + Math.random() * FALLING_MODEL_SCALE;
      delay = Math.random() * 2000 + 1000; // 1-3초 후 시작
    } else {
      // 나머지 이모티콘들 (30%)
      initialModelY = viewport.height / 2 + FALLING_MODEL_SCALE + Math.random() * FALLING_MODEL_SCALE;
      delay = Math.random() * 4000 + 3000; // 3-7초 후 시작
    }

    models.push(
      <FallingEmotionModel
        key={`${randomModelPath}-${i}`}
        modelPath={randomModelPath}
        initialX={initialModelX}
        initialY={initialModelY}
        viewportHeight={viewport.height}
        modelScale={FALLING_MODEL_SCALE}
        delay={delay}
      />
    );
  }

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[0, 10, 10]} intensity={1} />
      <directionalLight position={[0, -10, -5]} intensity={0.3} />
      {models}
    </>
  );
} 