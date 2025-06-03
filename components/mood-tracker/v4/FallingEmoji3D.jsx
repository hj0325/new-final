import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useControls } from 'leva';
import { useFrame } from '@react-three/fiber';

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
  const groupRef = useRef();

  // 사라짐 효과를 위한 상태
  const [isDisappearing, setIsDisappearing] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [disappearScale, setDisappearScale] = useState(1);
  const [shouldRemove, setShouldRemove] = useState(false);

  // 물리 시뮬레이션 값들을 실시간으로 조정
  const {
    restitution,
    friction,
    mass,
    gravityScale,
    primitiveScale
  } = useControls('Physics Settings', {
    restitution: { value: 0.05, min: 0, max: 1, step: 0.01 },
    friction: { value: 1.5, min: 0, max: 5, step: 0.1 },
    mass: { value: 3, min: 0.1, max: 10, step: 0.1 },
    gravityScale: { value: 1, min: 0, max: 3, step: 0.1 },
    primitiveScale: { value: 1.5, min: 0.5, max: 3, step: 0.1 }
  });

  // 바구니 충돌 감지 설정
  const {
    leftBasketX,
    rightBasketX,
    basketY,
    basketRadius,
    disappearDuration
  } = useControls('Collision Detection', {
    leftBasketX: { value: -0.38 * 1.9, min: -3, max: 0, step: 0.01 },
    rightBasketX: { value: 0.38 * 1.9, min: 0, max: 3, step: 0.01 },
    basketY: { value: (0.5 + 0.2) * 1.9, min: 0, max: 5, step: 0.01 },
    basketRadius: { value: 0.4, min: 0.1, max: 1, step: 0.01 },
    disappearDuration: { value: 500, min: 200, max: 3000, step: 100 }
  });

  useFrame((state, delta) => {
    if (rigidBodyRef.current && !isDisappearing) {
      const position = rigidBodyRef.current.translation();
      
      // 바구니 충돌 감지
      const isInLeftBasket = Math.abs(position.x - leftBasketX) < basketRadius && 
                            Math.abs(position.z) < basketRadius && 
                            position.y <= basketY + 0.3 && position.y >= basketY - 0.1;
      const isInRightBasket = Math.abs(position.x - rightBasketX) < basketRadius && 
                             Math.abs(position.z) < basketRadius && 
                             position.y <= basketY + 0.3 && position.y >= basketY - 0.1;
      
      if (isInLeftBasket || isInRightBasket) {
        setIsDisappearing(true);
        
        // 콜백 함수 호출 (상위 컴포넌트에 충돌 알림)
        if (onLanded) {
          onLanded({
            emojiType,
            basket: isInLeftBasket ? 'left' : 'right',
            position: [position.x, position.y, position.z]
          });
        }
      }
    }

    // 사라짐 애니메이션
    if (isDisappearing) {
      const deltaTime = delta * 1000; // 밀리초로 변환
      const fadeSpeed = deltaTime / disappearDuration;
      
      setOpacity(prev => Math.max(0, prev - fadeSpeed));
      setDisappearScale(prev => Math.max(0.1, prev - fadeSpeed * 0.5)); // 크기도 점점 작아짐
      
      if (opacity <= 0.1) {
        setShouldRemove(true);
      }
    }
  });

  // 투명도 효과 적용을 위한 material 설정
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child.isMesh && child.material) {
          const material = child.material.clone();
          material.transparent = true;
          material.opacity = opacity;
          child.material = material;
        }
      });
    }
  }, [clonedScene, opacity]);

  // 완전히 사라진 경우 렌더링하지 않음
  if (shouldRemove) {
    return null;
  }

  const baseScale = Array.isArray(scale) ? scale : [scale, scale, scale];
  const finalScale = [
    baseScale[0] * disappearScale, 
    baseScale[1] * disappearScale, 
    baseScale[2] * disappearScale
  ];

  return (
    <group ref={groupRef} scale={finalScale}>
      <RigidBody
        ref={rigidBodyRef}
        type="dynamic"
        position={startPosition}
        colliders="ball"
        restitution={restitution}
        friction={friction}
        scale={baseScale}
        mass={mass}
        gravityScale={gravityScale}
      >
        <primitive 
          object={clonedScene} 
          scale={[primitiveScale, primitiveScale, primitiveScale]}
        />
      </RigidBody>
    </group>
  );
}

export default FallingEmoji3D; 