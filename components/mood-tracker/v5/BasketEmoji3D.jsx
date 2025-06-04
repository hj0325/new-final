import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

const BasketEmoji3D = ({ 
  emoji, 
  position, 
  basketSide, 
  scale = 0.2, 
  animationSpeed = 0.5, 
  bobAmplitude = 0.03 
}) => {
  const meshRef = useRef();
  
  // 이모티콘에 따른 3D 모델 매핑
  const emojiToModel = useMemo(() => {
    const mapping = {
      '😀': '/models/emotion1.gltf',
      '😮': '/models/emotion2.gltf', 
      '😐': '/models/emotion3.gltf',
      '😖': '/models/emotion4.gltf',
      '😠': '/models/emotion5.gltf'
    };
    return mapping[emoji] || '/models/emotion1.gltf';
  }, [emoji]);
  
  const { scene } = useGLTF(emojiToModel);
  
  // 각 이모티콘별로 고유한 애니메이션 오프셋 생성
  const animationOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const bobSpeed = useMemo(() => animationSpeed + Math.random() * animationSpeed, [animationSpeed]);
  const actualBobAmplitude = useMemo(() => bobAmplitude + Math.random() * bobAmplitude, [bobAmplitude]);
  
  useFrame((state) => {
    if (meshRef.current) {
      // 부드러운 위아래 움직임 (숨쉬는 듯한 효과)
      const bobOffset = Math.sin(state.clock.elapsedTime * bobSpeed + animationOffset) * actualBobAmplitude;
      meshRef.current.position.y = position[1] + bobOffset;
      
      // 미세한 회전 효과
      const rotationOffset = Math.sin(state.clock.elapsedTime * 0.3 + animationOffset) * 0.1;
      meshRef.current.rotation.z = rotationOffset;
    }
  });

  return (
    <primitive 
      ref={meshRef} 
      object={scene.clone()} 
      position={[position[0], position[1], position[2]]}
      scale={[scale, scale, scale]}
    />
  );
};

export default BasketEmoji3D; 