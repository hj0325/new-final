import React, { useMemo, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

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

function FallingEmoji3D({ 
  startPosition = [0, 5, 0], 
  scale = 0.8, 
  emojiType = '😀',
  onLanded = null 
}) {
  const modelPath = getModelPath(emojiType);
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const rigidBodyRef = useRef();

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic" // 중력을 받아 떨어짐
      position={startPosition}
      colliders="ball" // 구형 충돌체로 자연스러운 굴림
      restitution={0.05} // 탄성을 더욱 줄여서 안정적으로 안착
      friction={1.5} // 마찰력 더 증가로 안정화
      scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
      mass={3} // 큰 이모티콘에 맞는 질량
    >
      <primitive 
        object={clonedScene} 
        scale={[1.5, 1.5, 1.5]} // 저울 크기에 맞는 적절한 크기
      />
    </RigidBody>
  );
}

export default FallingEmoji3D; 