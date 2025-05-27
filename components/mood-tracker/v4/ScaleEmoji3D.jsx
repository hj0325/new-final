import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

// 저울 위 이모티콘용 모델들 프리로드
const EMOTION_MODEL_PATHS = [
  '/models/emotion1.gltf',
  '/models/emotion2.gltf',
  '/models/emotion3.gltf',
  '/models/emotion4.gltf',
  '/models/emotion5.gltf',
];
EMOTION_MODEL_PATHS.forEach(path => useGLTF.preload(path));

// 이모티콘 문자를 모델 경로로 매핑
const getModelPath = (emojiType) => {
  const emojiToModel = {
    '😀': '/models/emotion1.gltf', // joy
    '😮': '/models/emotion2.gltf', // surprise
    '😐': '/models/emotion3.gltf', // neutral
    '😖': '/models/emotion4.gltf', // sadness
    '😠': '/models/emotion5.gltf', // anger
  };
  
  return emojiToModel[emojiType] || '/models/emotion1.gltf'; // 기본값
};

function ScaleEmoji3D({ position = [0, 0, 0], scale = 0.3, emojiType = '😀' }) {
  const modelPath = getModelPath(emojiType);
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return (
    <RigidBody
      type="fixed"
      position={position}
      colliders="cuboid"
      scale={Array.isArray(scale) ? scale : [scale, scale, scale]}
    >
      <primitive 
        object={clonedScene} 
        scale={[1, 1, 1]} // Scale은 RigidBody에서 처리
      />
    </RigidBody>
  );
}

export default ScaleEmoji3D; 