import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

const OverflowEmoji3D = ({ emoji, position, initialVelocity, basketSide, scale = 0.15 }) => {
  const rigidBodyRef = useRef();
  
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
  
  // 생성 후 초기 속도 적용
  React.useEffect(() => {
    if (rigidBodyRef.current) {
      // 약간의 지연 후 초기 속도 적용 (물리 객체가 준비된 후)
      setTimeout(() => {
        if (rigidBodyRef.current) {
          rigidBodyRef.current.setLinvel({
            x: initialVelocity.x,
            y: initialVelocity.y,
            z: initialVelocity.z
          }, true);
          
          // 회전 속도도 추가
          rigidBodyRef.current.setAngvel({
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5,
            z: (Math.random() - 0.5) * 5
          }, true);
        }
      }, 50);
    }
  }, [initialVelocity]);

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      mass={0.1}
      restitution={0.6} // 탄성력
      friction={0.7}
      colliders="ball"
    >
      <primitive 
        object={scene.clone()} 
        scale={[scale, scale, scale]}
      />
    </RigidBody>
  );
};

export default OverflowEmoji3D; 