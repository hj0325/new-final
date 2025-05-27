/*
Ax.jsx 예제를 기반으로 한 마우스 호버 애니메이션입니다.
이 컴포넌트는 정적인 몸체와 애니메이션되는 날개를 가진 저울을 렌더링합니다.
*/

import React, { useRef, useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

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

  const [isHoveredLeft, setIsHoveredLeft] = useState(false);
  const [isHoveredRight, setIsHoveredRight] = useState(false);

  const { scene: bodySceneOriginal } = useGLTF('/Body.gltf');
  const { scene: wingsLeftSceneOriginal } = useGLTF('/Wings left.gltf');
  const { scene: wingsRightSceneOriginal } = useGLTF('/Wings right.gltf');

  const bodyScene = useMemo(() => bodySceneOriginal.clone(true), [bodySceneOriginal]);
  const wingsLeftScene = useMemo(() => wingsLeftSceneOriginal.clone(true), [wingsLeftSceneOriginal]);
  const wingsRightScene = useMemo(() => wingsRightSceneOriginal.clone(true), [wingsRightSceneOriginal]);

  const bodyColliderArgs = [0.5, 0.75, 0.5];
  const wingColliderArgs = [0.7, 0.1, 0.5];

  return (
    <group
      ref={groupRef}
      position={bodyProps.position}
      scale={bodyProps.scale}
      rotation={bodyProps.rotation}
    >
      <RigidBody 
        type="fixed" 
        colliders={false}
        name="scale-body"
      >
      <primitive object={bodyScene} />
        <CuboidCollider args={bodyColliderArgs} position={[0, 0, 0]} />
      </RigidBody>

      <RigidBody 
        type="fixed" 
        colliders={false} 
        position={wingsLeftProps.position}
        scale={wingsLeftProps.scale}
        rotation={wingsLeftProps.rotation}
        name="scale-wing-left"
        ref={wingsLeftGroupRef}
      >
        <primitive object={wingsLeftScene} position={wingsLeftPrimitiveOffset} />
        <CuboidCollider args={wingColliderArgs} position={[0,0,0]} />
      </RigidBody>

      <RigidBody 
        type="fixed" 
        colliders={false} 
        position={wingsRightProps.position}
        scale={wingsRightProps.scale}
        rotation={wingsRightProps.rotation}
        name="scale-wing-right"
        ref={wingsRightGroupRef}
      >
        <primitive object={wingsRightScene} position={wingsRightPrimitiveOffset} />
        <CuboidCollider args={wingColliderArgs} position={[0,0,0]} />
      </RigidBody>
    </group>
  );
}

useGLTF.preload('/Body.gltf');
useGLTF.preload('/Wings left.gltf');
useGLTF.preload('/Wings right.gltf'); 