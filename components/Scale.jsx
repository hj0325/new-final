/*
Ax.jsx 예제를 기반으로 한 마우스 호버 애니메이션입니다.
이 컴포넌트는 정적인 몸체와 애니메이션되는 날개를 가진 저울을 렌더링합니다.
*/

import React, { useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Scale({
  isHovered, // 저울에 마우스가 올라왔는지 여부를 나타내는 boolean prop
  onHover,   // 포인터 이벤트 발생 시 호출될 함수 prop (예: onHover(true/false))

  // GLTF 모델의 원점, 원하는 레이아웃, 회전축에 따라 이 prop들을 조정하는 것이 매우 중요합니다.
  bodyProps = { position: [0, 0, 0], scale: 1, rotation: [0, 0, 0] },
  wingsProps = { position: [0, 0.2, 0], scale: 1, rotation: [0, 0, 0] }, // 기본 날개 Y 위치를 약간 조정
  wingsPrimitiveOffset = [0, 0, 0], // 신규: 회전하는 그룹에 대한 날개 모델의 오프셋

  tiltAngle = Math.PI / 18, // 최대 기울기 각도 (기본값 약간 줄임)
  animationSpeed = 0.08, // 애니메이션 속도 약간 줄임
  verticalMovementFactor = 0.05, // 기울기에 따른 수직 움직임 강도
}) {
  const groupRef = useRef();
  const wingsGroupRef = useRef();

  const { scene: bodySceneOriginal } = useGLTF('/Body.gltf');
  const { scene: wingsSceneOriginal } = useGLTF('/Wings.gltf');

  const bodyScene = useMemo(() => bodySceneOriginal.clone(true), [bodySceneOriginal]);
  const wingsScene = useMemo(() => wingsSceneOriginal.clone(true), [wingsSceneOriginal]);

  const targetTilt = useRef(0);
  const currentTilt = useRef(0);
  const initialWingsY = useRef(wingsProps.position[1]); // 날개의 초기 Y 위치 저장

  useFrame(() => {
    if (isHovered) {
      targetTilt.current = tiltAngle;
    } else {
      targetTilt.current = 0;
    }

    currentTilt.current = THREE.MathUtils.lerp(
      currentTilt.current,
      targetTilt.current,
      animationSpeed
    );

    if (wingsGroupRef.current) {
      // X축 회전 (기울기)
      wingsGroupRef.current.rotation.x = currentTilt.current;

      // 기울기에 따른 Y축 위치 변화 (무게감 표현)
      // 기울기가 커질수록 (양수든 음수든) 살짝 아래로 내려가는 효과
      const verticalOffset = Math.abs(currentTilt.current) * verticalMovementFactor;
      wingsGroupRef.current.position.y = initialWingsY.current - verticalOffset;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={(event) => {
        event.stopPropagation();
        if (onHover) onHover(true);
      }}
      onPointerLeave={(event) => {
        event.stopPropagation();
        if (onHover) onHover(false);
      }}
      // 몸체와 날개를 포함하는 전체 저울의 위치는 이 그룹 또는 부모에서 조정 가능
      position={bodyProps.position} // bodyProps의 position을 Scale 전체 그룹의 위치로 사용
      scale={bodyProps.scale}       // bodyProps의 scale을 Scale 전체 그룹의 스케일로 사용
      rotation={bodyProps.rotation} // bodyProps의 rotation을 Scale 전체 그룹의 회전으로 사용
    >
      {/* 몸체 부분: 날개 애니메이션에 대해 정적. 위치는 그룹 내 [0,0,0] 기준 */}
      <primitive
        object={bodyScene}
        // position, scale, rotation은 전체 그룹에서 bodyProps를 통해 적용되므로 여기선 상대적으로 [0,0,0] 또는 필요에 따른 미세조정
      />

      {/* 날개 부분: 이 그룹은 애니메이션됩니다(회전 및 Y축 이동). */}
      <group
        ref={wingsGroupRef}
        // position은 props로 받은 초기 위치에서 useFrame을 통해 Y값이 동적으로 변경됨
        // X, Z는 초기값 유지, Y는 initialWingsY를 기준으로 계산됨
        position={[wingsProps.position[0], initialWingsY.current, wingsProps.position[2]]}
        scale={wingsProps.scale} // 날개 자체의 스케일 (전체 스케일과 별개로 적용 가능)
        rotation={wingsProps.rotation}
      >
        <primitive
          object={wingsScene}
          position={wingsPrimitiveOffset}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/Body.gltf');
useGLTF.preload('/Wings.gltf'); 