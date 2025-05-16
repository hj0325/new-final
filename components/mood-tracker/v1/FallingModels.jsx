import React, { useState, useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

const EMOTION_MODEL_PATHS = [
  '/models/emotion1.gltf',
  '/models/emotion2.gltf',
  '/models/emotion3.gltf',
  '/models/emotion4.gltf',
  '/models/emotion5.gltf',
];
const NUM_FALLING_MODELS = 100;
const FALLING_MODEL_SCALE = 40;

EMOTION_MODEL_PATHS.forEach(path => useGLTF.preload(path));

function FallingEmotionModel({ modelPath, initialX, initialY, viewportHeight, modelScale }) {
  const ref = React.useRef();
  const { scene } = useGLTF(modelPath);
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  
  const [isHovered, setIsHovered] = useState(false);
  const velocity = useRef({ x: 0, y: 0 });
  const [rotationSpeed] = useState(() => (Math.random() - 0.5) * 0.02);
  const [xPos] = useState(initialX);

  useFrame((state, delta) => {
    if (ref.current) {
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

export function FallingModelsScene() {
  const { viewport } = useThree();
  const models = [];

  for (let i = 0; i < NUM_FALLING_MODELS; i++) {
    const modelPath = EMOTION_MODEL_PATHS[i % EMOTION_MODEL_PATHS.length];
    const initialModelX = (Math.random() - 0.5) * viewport.width * 1.2;
    const initialModelY = viewport.height / 2 + FALLING_MODEL_SCALE + (i % (NUM_FALLING_MODELS / 5)) * (FALLING_MODEL_SCALE * 1.8) + Math.random() * FALLING_MODEL_SCALE;

    models.push(
      <FallingEmotionModel
        key={`${modelPath}-${i}`}
        modelPath={modelPath}
        initialX={initialModelX}
        initialY={initialModelY}
        viewportHeight={viewport.height}
        modelScale={FALLING_MODEL_SCALE}
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