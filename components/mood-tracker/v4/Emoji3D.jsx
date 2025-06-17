import React, { useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';

// Preload models - this helps in reducing initial load time when component mounts
// It's good practice to list all potential models if known beforehand.
const EMOTION_MODEL_PATHS = [
  '/models/emotion1.gltf',
  '/models/emotion2.gltf',
  '/models/emotion3.gltf',
  '/models/emotion4.gltf',
  '/models/emotion5.gltf',
];
EMOTION_MODEL_PATHS.forEach(path => useGLTF.preload(path));

function Emoji3D({ modelPath, initialPosition = [0, 0, 0], scale = 0.5, onClick, emojiId }) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const rigidBodyRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);

  // 호버 시 글로우 애니메이션
  useFrame((state, delta) => {
    if (isHovered) {
      setGlowIntensity(prev => Math.min(prev + delta * 5, 1));
    } else {
      setGlowIntensity(prev => Math.max(prev - delta * 5, 0));
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();
    if (onClick) {
      onClick(emojiId);
    }
  };

  const handlePointerOver = (event) => {
    event.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group>
      {/* 글로우 효과를 위한 포인트 라이트 */}
      {glowIntensity > 0 && (
        <pointLight
          position={initialPosition}
          intensity={glowIntensity * 2}
          distance={3}
          color="#ffff00"
        />
      )}
      <RigidBody
        ref={rigidBodyRef}
        type="fixed"
        position={initialPosition}
        colliders="cuboid"
        scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
        onClick={handleClick} 
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        name={`emoji-${emojiId}`} 
      >
        <primitive 
          object={clonedScene} 
          scale={[1, 1, 1]} // 크기 변화 없음, 빛나는 효과만
        />
      </RigidBody>
    </group>
  );
}

export default Emoji3D; 