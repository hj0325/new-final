import React, { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

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

  const handleClick = (event) => {
    event.stopPropagation();
    if (onClick) {
      onClick(emojiId);
    }
  };

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="fixed"
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