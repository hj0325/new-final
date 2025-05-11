/*
Ax.jsx 예제를 기반으로 한 마우스 호버 애니메이션입니다.
이 컴포넌트는 정적인 몸체와 애니메이션되는 날개를 가진 저울을 렌더링합니다.
*/

import React, { useRef, useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Scale({
  bodyProps = { position: [0, 0, 0], scale: 1, rotation: [0, 0, 0] },
  wingsLeftProps = { position: [-0.38, 0.2, 0], scale: 1, rotation: [0, 0, 0] },
  wingsRightProps = { position: [0.38, 0.2, 0], scale: 1, rotation: [0, 0, 0] },
  wingsLeftPrimitiveOffset = [0, 0, 0],
  wingsRightPrimitiveOffset = [0, 0, 0],
  tiltAngleLeft = Math.PI / 18,
  tiltAngleRight = Math.PI / 18,
  animationSpeedLeft = 0.08,
  animationSpeedRight = 0.08,
  verticalMovementFactorLeft = 0.05,
  verticalMovementFactorRight = 0.05,
}) {
  const groupRef = useRef();
  const wingsLeftGroupRef = useRef();
  const wingsRightGroupRef = useRef();

  // 내부에서 각 날개별 hover 상태 관리
  const [isHoveredLeft, setIsHoveredLeft] = useState(false);
  const [isHoveredRight, setIsHoveredRight] = useState(false);

  const { scene: bodySceneOriginal } = useGLTF('/Body.gltf');
  const { scene: wingsLeftSceneOriginal } = useGLTF('/Wings left.gltf');
  const { scene: wingsRightSceneOriginal } = useGLTF('/Wings right.gltf');

  const bodyScene = useMemo(() => bodySceneOriginal.clone(true), [bodySceneOriginal]);
  const wingsLeftScene = useMemo(() => wingsLeftSceneOriginal.clone(true), [wingsLeftSceneOriginal]);
  const wingsRightScene = useMemo(() => wingsRightSceneOriginal.clone(true), [wingsRightSceneOriginal]);

  // 날개 각각의 애니메이션 상태
  const targetTiltLeft = useRef(0);
  const currentTiltLeft = useRef(0);
  const initialWingsLeftY = useRef(wingsLeftProps.position[1]);

  const targetTiltRight = useRef(0);
  const currentTiltRight = useRef(0);
  const initialWingsRightY = useRef(wingsRightProps.position[1]);

  useFrame(() => {
    // 왼쪽 날개
    if (isHoveredLeft) {
      targetTiltLeft.current = tiltAngleLeft;
    } else {
      targetTiltLeft.current = 0;
    }
    currentTiltLeft.current = THREE.MathUtils.lerp(
      currentTiltLeft.current,
      targetTiltLeft.current,
      animationSpeedLeft
    );
    if (wingsLeftGroupRef.current) {
      wingsLeftGroupRef.current.rotation.x = currentTiltLeft.current;
      const verticalOffset = Math.abs(currentTiltLeft.current) * verticalMovementFactorLeft;
      wingsLeftGroupRef.current.position.y = initialWingsLeftY.current - verticalOffset;
    }
    // 오른쪽 날개
    if (isHoveredRight) {
      targetTiltRight.current = -tiltAngleRight;
    } else {
      targetTiltRight.current = 0;
    }
    currentTiltRight.current = THREE.MathUtils.lerp(
      currentTiltRight.current,
      targetTiltRight.current,
      animationSpeedRight
    );
    if (wingsRightGroupRef.current) {
      wingsRightGroupRef.current.rotation.x = currentTiltRight.current;
      const verticalOffset = Math.abs(currentTiltRight.current) * verticalMovementFactorRight;
      wingsRightGroupRef.current.position.y = initialWingsRightY.current - verticalOffset;
    }
  });

  return (
    <group
      ref={groupRef}
      position={bodyProps.position}
      scale={bodyProps.scale}
      rotation={bodyProps.rotation}
    >
      {/* 몸체 */}
      <primitive object={bodyScene} />
      {/* 왼쪽 날개 */}
      <group
        ref={wingsLeftGroupRef}
        position={wingsLeftProps.position}
        scale={wingsLeftProps.scale}
        rotation={wingsLeftProps.rotation}
        onPointerEnter={e => { e.stopPropagation(); setIsHoveredLeft(true); }}
        onPointerLeave={e => { e.stopPropagation(); setIsHoveredLeft(false); }}
      >
        <primitive object={wingsLeftScene} position={wingsLeftPrimitiveOffset} />
      </group>
      {/* 오른쪽 날개 */}
      <group
        ref={wingsRightGroupRef}
        position={wingsRightProps.position}
        scale={wingsRightProps.scale}
        rotation={wingsRightProps.rotation}
        onPointerEnter={e => { e.stopPropagation(); setIsHoveredRight(true); }}
        onPointerLeave={e => { e.stopPropagation(); setIsHoveredRight(false); }}
      >
        <primitive object={wingsRightScene} position={wingsRightPrimitiveOffset} />
      </group>
    </group>
  );
}

useGLTF.preload('/Body.gltf');
useGLTF.preload('/Wings left.gltf');
useGLTF.preload('/Wings right.gltf'); 