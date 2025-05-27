import React, { useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useDrag } from '@use-gesture/react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

function Emoji3D({ modelPath, initialPosition = [0, 0, 0], scale = 0.5, onClick, onDrop, emojiId, draggable = true }) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const rigidBodyRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const { size, viewport, camera } = useThree();
  const aspect = size.width / size.height;

  const bind = useDrag(({ active, movement: [mx, my], event, first, last, memo }) => {
    if (!draggable) return;
    
    if (first) {
      console.log('🖱️ 드래그 시작:', emojiId);
    }
    
    setIsDragging(active);
    
    if (active && rigidBodyRef.current) {
      // 첫 드래그 시 초기 위치와 마우스 위치 저장
      if (first) {
        const currentPos = rigidBodyRef.current.translation();
        memo = { 
          initialX: currentPos.x, 
          initialY: currentPos.y, 
          initialZ: currentPos.z
        };
      }

      // 감도 조정 - 더 자연스러운 드래그를 위해 증가
      const scale = viewport.width / size.width * 0.02;
      
      const newX = memo.initialX + mx * scale;
      const newY = memo.initialY - my * scale; // Y축 반전
      const newZ = memo.initialZ; // Z축 고정

      rigidBodyRef.current.setNextKinematicTranslation({ x: newX, y: newY, z: newZ });

    } else if (last && onDrop && isDragging) {
        if (rigidBodyRef.current) {
            const finalPosition = rigidBodyRef.current.translation();
            console.log('🎯 드래그 종료:', emojiId, 'at', finalPosition);
            console.log('📍 저울 영역 참고: 왼쪽 날개 [-0.4~0, 0.1~0.3], 오른쪽 날개 [0~0.4, 0.1~0.3]');
            onDrop(emojiId, finalPosition); 
        }
        setIsDragging(false);
    }
    
    return memo;
  }, {
    enabled: draggable,
  });

  const handleClick = (event) => {
    console.log('🎯 클릭:', emojiId, 'draggable:', draggable);
    event.stopPropagation();
    if (onClick && !isDragging && draggable) {
      console.log('✅ 클릭 핸들러 실행:', emojiId);
      onClick();
    }
  };

  return (
    <RigidBody
      {...(draggable ? bind() : {})}
      ref={rigidBodyRef}
      type={draggable ? "kinematicPosition" : "fixed"}
      position={initialPosition}
      colliders="cuboid"
      scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
      onClick={handleClick} 
      name={`emoji-${emojiId}`} 
    >
      <primitive 
        object={clonedScene} 
        scale={[1,1,1]} // Scale is handled by RigidBody
      />
    </RigidBody>
  );
}

export default Emoji3D; 