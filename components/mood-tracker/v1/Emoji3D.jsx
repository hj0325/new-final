import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

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

function Emoji3D({ modelPath, initialPosition = [0, 0, 0], scale = 0.5, onClick }) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const handleClick = (event) => {
    event.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <primitive 
      object={clonedScene} 
      position={initialPosition} 
      scale={scale} 
      onClick={handleClick}
    />
  );
}

export default Emoji3D; 